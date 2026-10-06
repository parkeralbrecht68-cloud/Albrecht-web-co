import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { macbookKeyboard } from "../data/device";

export type JourneyMode = "scroll" | "playing" | "paused";
export type JourneyQuality = "auto" | "high";
export interface JourneyHandle {
  play(): void;
  pauseTour(): void;
  toggleAmbient(): void;
  setQuality(quality: JourneyQuality): void;
  destroy(): void;
}
interface JourneyOptions {
  onModeChange?: (mode: JourneyMode) => void;
  onFailure?: () => void;
}

/** One pinned scene. Every pose is a pure function of scroll progress, including reverse scroll. */
export async function initJourney(options: JourneyOptions = {}): Promise<JourneyHandle> {
  const root = document.querySelector<HTMLElement>("#journey");
  const host = document.querySelector<HTMLElement>("#scene-canvas");
  const stage = root?.querySelector<HTMLElement>(".journey-stage");
  if (!root || !host || !stage) throw new Error("Journey host is missing");
  const useMobile = () => innerWidth <= 800 && innerHeight > innerWidth * 0.78;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    throw new Error("WebGL is unavailable");
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.03;
  // The soft contact texture grounds the objects without a second, costly render pass.
  renderer.shadowMap.enabled = false;
  renderer.setClearColor(0x080a0d, 0);
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0, 15);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  // Long softboxes make the silhouette readable through reflected light, like a product studio.
  for (const [w, h, x, y, z, strength] of [
    [4, 10, -4, 4, 5, 5], [2, 8, 5, 2, 1, 3], [10, 1, 0, -3, 5, 2],
  ]) {
    const card = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(strength, strength, strength), side: THREE.DoubleSide }),
    );
    card.position.set(x, y, z);
    card.lookAt(0, 0, 0);
    room.add(card);
  }
  const env = pmrem.fromScene(room, 0.025);
  scene.environment = env.texture;
  room.dispose();
  pmrem.dispose();
  const key = new THREE.DirectionalLight(0xe9f0ff, 4.5);
  key.position.set(-4, 7, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x729eff, 3);
  rim.position.set(5, 1, -2);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 2);
  fill.position.set(1, -3, 5);
  scene.add(fill);
  const blueLight = new THREE.PointLight(0x386eff, 18, 13);
  blueLight.position.set(3, -1, 3);
  scene.add(blueLight);
  const steel = new THREE.MeshPhysicalMaterial({
    color: 0xc6ccd5,
    metalness: 1,
    roughness: 0.3,
    clearcoat: 0.4,
    clearcoatRoughness: 0.18,
    envMapIntensity: 1.25,
    anisotropy: 0.35,
  });
  const darkSteel = new THREE.MeshPhysicalMaterial({
    color: 0x353c47,
    metalness: 0.95,
    roughness: 0.26,
    envMapIntensity: 1.35,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x080b12,
    metalness: 0.45,
    roughness: 0.14,
    clearcoat: 1,
  });
  const blue = new THREE.MeshBasicMaterial({
    color: 0x588dff,
    transparent: true,
    opacity: 0.8,
    toneMapped: false,
  });
  const materials = new Set<THREE.Material>([steel, darkSteel, glass, blue]);
  const geometries = new Set<THREE.BufferGeometry>();
  const textures = new Set<THREE.Texture>();
  const grainCanvas = document.createElement("canvas");
  grainCanvas.width = grainCanvas.height = 128;
  const grainContext = grainCanvas.getContext("2d")!;
  const grainData = grainContext.createImageData(128, 128);
  for (let i = 0; i < 128 * 128; i++) {
    const value = 186 + ((i * 67 + Math.floor(i / 128) * 23) % 38);
    grainData.data.set([value, value, value, 255], i * 4);
  }
  grainContext.putImageData(grainData, 0, 0);
  const grain = new THREE.CanvasTexture(grainCanvas);
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping;
  grain.repeat.set(2, 12);
  steel.roughnessMap = grain;
  textures.add(grain);
  const track = <T extends THREE.BufferGeometry>(g: T) => {
    geometries.add(g);
    return g;
  };
  const mesh = (g: THREE.BufferGeometry, m: THREE.Material) => {
    const object = new THREE.Mesh(track(g), m);
    object.castShadow = true;
    return object;
  };
  const box = (w: number, h: number, d: number, r: number, m: THREE.Material) =>
    mesh(new RoundedBoxGeometry(w, h, d, 4, r), m);
  const lerp = THREE.MathUtils.lerp;
  const clamp = THREE.MathUtils.clamp;
  const smooth = (a: number, b: number, p: number) => {
    const t = clamp((p - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const state = { progress: 0 };
  let mobile = useMobile();
  let quality: JourneyQuality = "auto";
  let resolutionScale = 1;
  let prepared = false;
  let viewportWidth = innerWidth, viewportHeight = innerHeight;
  let sampleFrames = 0, sampleTime = 0, adaptAfter = performance.now() + 2000;
  let lastProgress = -1;
  let ambientPaused = false,
    visible = true,
    disposed = false,
    activeChapter = -1;
  let frame = 0,
    lastTime = 0,
    elapsed = 0;
  const pointer = new THREE.Vector2(),
    aim = new THREE.Vector2();
  const chapters = [...root.querySelectorAll<HTMLElement>("[data-chapter]")];
  const word = root.querySelector<HTMLElement>(".journey-word")!;
  const index = root.querySelector<HTMLElement>("#chapter-number")!;
  const indexBar = root.querySelector<HTMLElement>("#chapter-progress")!;
  const bottom = root.querySelector<HTMLElement>(".journey-bottom")!;

  // A bevelled, solid-metal cursor. The same edge material later draws the browser grid.
  const cursor = new THREE.Group();
  scene.add(cursor);
  const arrow = new THREE.Shape();
  arrow.moveTo(-0.75, 1.5);
  arrow.lineTo(-0.75, -0.92);
  arrow.lineTo(-0.08, -0.32);
  arrow.lineTo(0.48, -1.52);
  arrow.lineTo(1.03, -1.26);
  arrow.lineTo(0.45, -0.06);
  arrow.lineTo(1.34, -0.02);
  arrow.closePath();
  const cursorGeometry = track(
    new THREE.ExtrudeGeometry(arrow, {
      depth: 0.56,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 1,
      bevelSize: 0.12,
      bevelThickness: 0.12,
      curveSegments: 16,
    }),
  );
  const cursorMetal = steel.clone();
  cursorMetal.color.set(0x9aa8ba);
  cursorMetal.envMapIntensity = 0.95;
  cursorMetal.clearcoat = 0.22;
  const faceCanvas = document.createElement("canvas");
  faceCanvas.width = faceCanvas.height = 256;
  const faceContext = faceCanvas.getContext("2d")!;
  const faceGradient = faceContext.createLinearGradient(0, 0, 256, 230);
  for (const [at, color] of [[0, "#f5f7fa"], [0.35, "#a3afc0"], [0.5, "#e4eaf2"], [0.74, "#7b8ba2"], [1, "#c9d3e0"]] as const)
    faceGradient.addColorStop(at, color);
  faceContext.fillStyle = faceGradient;
  faceContext.fillRect(0, 0, 256, 256);
  const faceTexture = new THREE.CanvasTexture(faceCanvas);
  faceTexture.colorSpace = THREE.SRGBColorSpace;
  cursorMetal.map = faceTexture;
  textures.add(faceTexture);
  cursorMetal.transparent = true;
  materials.add(cursorMetal);
  const cursorSides = darkSteel.clone();
  cursorSides.transparent = true;
  materials.add(cursorSides);
  const cursorBody = new THREE.Mesh(cursorGeometry, [cursorMetal, cursorSides]);
  cursorBody.castShadow = true;
  cursorBody.position.z = -0.28;
  cursor.add(cursorBody);
  const cursorEdgeMaterial = new THREE.LineBasicMaterial({
    color: 0x7aa4ff,
    transparent: true,
    opacity: 0.16,
  });
  materials.add(cursorEdgeMaterial);
  const cursorEdge = new THREE.LineSegments(
    track(new THREE.EdgesGeometry(cursorGeometry, 35)),
    cursorEdgeMaterial,
  );
  cursorEdge.position.z = -0.28;
  cursor.add(cursorEdge);

  // Metallic ribbons follow smooth, related curves into the cursor tip, then along the browser.
  const ribbons = new THREE.Group();
  scene.add(ribbons);
  const ribbonMaterial = steel.clone();
  ribbonMaterial.transparent = true;
  ribbonMaterial.opacity = 0.9;
  materials.add(ribbonMaterial);
  for (let j = 0; j < 5; j++) {
    const points = [];
    for (let i = 0; i < 34; i++) {
      const t = i / 33;
      points.push(
        new THREE.Vector3(
          lerp(-5.4, 4, t),
          -1.5 + Math.sin(t * 6.5 + j * 0.54) * (1 + j * 0.08) + t * 1.6,
          Math.sin(t * 5 + j * 0.6) * 1.55 - 0.65,
        ),
      );
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.BufferGeometry();
    const positions = [],
      uv = [],
      indices = [];
    for (let i = 0; i <= 100; i++) {
      const t = i / 100,
        v = curve.getPoint(t),
        tangent = curve.getTangent(t),
        side = new THREE.Vector3(0, 1, 0.65 * Math.sin(t * 8 + j))
          .cross(tangent)
          .normalize()
          .multiplyScalar(0.075 + j * 0.028),
        thickness = side.clone().cross(tangent).normalize().multiplyScalar(0.018);
      for (const [s, d] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
        const point = v.clone().addScaledVector(side, s).addScaledVector(thickness, d);
        positions.push(point.x, point.y, point.z);
        uv.push(t, s === 1 ? 0 : 1);
      }
      if (i < 100) {
        const k = i * 4;
        indices.push(
          k, k + 1, k + 4, k + 1, k + 5, k + 4,
          k + 2, k + 6, k + 3, k + 3, k + 6, k + 7,
          k, k + 4, k + 2, k + 2, k + 4, k + 6,
          k + 1, k + 3, k + 5, k + 3, k + 7, k + 5,
        );
      }
    }
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const mat = ribbonMaterial.clone();
    mat.side = THREE.DoubleSide;
    materials.add(mat);
    const ribbon = mesh(geometry, mat);
    ribbon.userData.phase = j * 0.65;
    ribbons.add(ribbon);
  }
  // Deterministic particle destinations sampled inside the cursor silhouette.
  const particleCount = mobile ? 440 : 820;
  const origins = new Float32Array(particleCount * 3),
    targets = new Float32Array(particleCount * 3),
    positions = new Float32Array(particleCount * 3),
    colors = new Float32Array(particleCount * 3);
  let seed = 9137;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const polygon = arrow.getPoints();
  const inside = (x: number, y: number) => {
    let result = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i],
        b = polygon[j];
      if (
        a.y > y !== b.y > y &&
        x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x
      )
        result = !result;
    }
    return result;
  };
  for (let i = 0; i < particleCount; i++) {
    const q = i * 3,
      t = random();
    origins[q] = lerp(-6.5, 5, t);
    origins[q + 1] = -1.3 + Math.sin(t * 6.3) * 0.9 + (random() - 0.5) * 1.8;
    origins[q + 2] = (random() - 0.5) * 3;
    let x = 0,
      y = 0;
    do {
      x = lerp(-0.75, 1.34, random());
      y = lerp(-1.52, 1.5, random());
    } while (!inside(x, y));
    targets[q] = x;
    targets[q + 1] = y;
    targets[q + 2] = (random() - 0.5) * 0.3;
    const c = new THREE.Color(i % 5 === 0 ? 0x629bff : 0xc7d8ef);
    colors[q] = c.r;
    colors[q + 1] = c.g;
    colors[q + 2] = c.b;
  }
  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3),
  );
  particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const particleMaterial = new THREE.PointsMaterial({
    size: mobile ? 0.035 : 0.027,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  materials.add(particleMaterial);
  const particles = new THREE.Points(
    track(particlesGeometry),
    particleMaterial,
  );
  scene.add(particles);
  const shardMaterial = steel.clone();
  shardMaterial.transparent = true;
  materials.add(shardMaterial);
  const shards = new THREE.InstancedMesh(
    track(new THREE.BoxGeometry(0.07, 0.07, 0.1)), shardMaterial, mobile ? 36 : 64,
  );
  scene.add(shards);

  // This browser stays in the scene and becomes the laptop display, then the portfolio portal.
  const product = new THREE.Group();
  scene.add(product);
  const browser = new THREE.Group();
  product.add(browser);
  const frameMetal = darkSteel.clone();
  materials.add(frameMetal);
  const frameDark = new THREE.Color(0x353c47);
  const frameSilver = new THREE.Color(0xbfc7d1);
  const browserRim = box(6.55, 4.57, 0.24, 0.10, frameMetal);
  browser.add(browserRim);
  const bezelMaterial = new THREE.MeshStandardMaterial({
    color: 0x07090d, metalness: 0.04, roughness: 0.36, envMapIntensity: 0.3,
  });
  materials.add(bezelMaterial);
  const backing = box(6.4, 4.4, 0.09, 0.1, bezelMaterial);
  // Keep the black glass in front of the metal face; coincident faces flicker.
  backing.position.z = 0.095;
  browser.add(backing);
  const topBar = box(6.28, 0.26, 0.028, 0.04, darkSteel);
  topBar.position.set(0, 2.08, 0.15);
  browser.add(topBar);
  const browserChrome: THREE.Object3D[] = [topBar];
  const dotMaterial = new THREE.MeshBasicMaterial({ color: 0x697483 });
  materials.add(dotMaterial);
  for (let i = 0; i < 3; i++) {
    const dot = mesh(new THREE.SphereGeometry(0.035, 10, 8), dotMaterial);
    dot.position.set(-2.96 + i * 0.14, 2.08, 0.185);
    browser.add(dot);
    browserChrome.push(dot);
  }
  const wireCanvas = document.createElement("canvas");
  wireCanvas.width = 1440;
  wireCanvas.height = 1000;
  const context = wireCanvas.getContext("2d")!;
  context.fillStyle = "#10151e";
  context.fillRect(0, 0, 1440, 1000);
  context.strokeStyle = "#7193c461";
  context.lineWidth = 2;
  context.font = "22px Arial";
  context.fillStyle = "#bdcce3";
  context.fillText("LAST ROUND", 24, 48);
  context.fillStyle = "#8aa1c4";
  context.font = "15px Arial";
  [
    "Tonight",
    "Discover spots",
    "Your people",
    "My profile",
    "For businesses",
  ].forEach((s, i) => context.fillText(s, 28, 154 + i * 67));
  context.beginPath();
  context.moveTo(220, 0);
  context.lineTo(220, 1000);
  context.moveTo(220, 84);
  context.lineTo(1440, 84);
  context.stroke();
  context.font = "bold 47px Arial";
  context.fillStyle = "#dbe5f4";
  context.fillText("Last Round. A better night out.", 265, 176);
  context.font = "19px Arial";
  context.fillStyle = "#92a7c3";
  context.fillText(
    "Your favorite people. A new favorite spot. A pace that’s yours.",
    266,
    220,
  );
  const wireCells = [
    [265, 320, 650, 310],
    [938, 320, 440, 310],
    [265, 655, 265, 145],
    [552, 655, 265, 145],
    [838, 655, 265, 145],
    [1124, 655, 254, 145],
  ];
  wireCells.forEach(([x, y, w, h]) => {
    context.strokeRect(x, y, w, h);
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + w, y + h);
    context.moveTo(x + w, y);
    context.lineTo(x, y + h);
    context.stroke();
  });
  context.fillStyle = "#bed0e9";
  context.font = "34px Arial";
  context.fillText("Good company.", 290, 390);
  context.fillText("Great memories.", 290, 432);
  context.strokeRect(290, 500, 184, 48);
  context.font = "16px Arial";
  context.fillText("Find your next spot", 305, 531);
  const wireTexture = new THREE.CanvasTexture(wireCanvas);
  wireTexture.colorSpace = THREE.SRGBColorSpace;
  textures.add(wireTexture);
  let desktopTexture: THREE.Texture = wireTexture;
  const loader = new THREE.TextureLoader();
  const screenMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uWire: { value: wireTexture },
      uFinal: { value: desktopTexture },
      uReveal: { value: 0 },
      uAssemble: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uWire;
      uniform sampler2D uFinal;
      uniform float uReveal;
      uniform float uAssemble;
      varying vec2 vUv;
      void main() {
        float assembled = smoothstep(1.05-uAssemble*1.12-.05, 1.05-uAssemble*1.12+.05, vUv.y);
        vec4 wire = mix(vec4(0.005, 0.008, 0.015, 1.0), texture2D(uWire, vUv), assembled);
        float polished = smoothstep(1.06-uReveal*1.14-.06, 1.06-uReveal*1.14+.06, vUv.y);
        gl_FragColor = mix(wire, texture2D(uFinal, vUv), polished);
        #include <colorspace_fragment>
      }
    `,
    toneMapped: false,
  });
  materials.add(screenMaterial);
  const screen = mesh(new THREE.PlaneGeometry(6.27, 4.16), screenMaterial);
  screen.position.set(0, -0.13, 0.172);
  browser.add(screen);
  const gridMaterial = new THREE.LineBasicMaterial({
    color: 0x6c98ed,
    transparent: true,
    opacity: 0,
  });
  materials.add(gridMaterial);
  const gridVertices = [];
  for (let i = -6; i <= 6; i++) {
    gridVertices.push(
      i * 0.56,
      -3.4,
      -0.3,
      i * 0.56,
      3.4,
      -0.3,
      -3.4,
      i * 0.56,
      -0.3,
      3.4,
      i * 0.56,
      -0.3,
    );
  }
  const gridGeometry = new THREE.BufferGeometry();
  gridGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(gridVertices, 3),
  );
  const grid = new THREE.LineSegments(track(gridGeometry), gridMaterial);
  product.add(grid);
  const assemblyMaterial = new THREE.LineBasicMaterial({
    color: 0x94b5f2,
    transparent: true,
    opacity: 0.6,
  });
  materials.add(assemblyMaterial);
  const assembly = new THREE.Group();
  browser.add(assembly);
  wireCells.forEach(([x, y, w, h], i) => {
    const width = (w / 1440) * 6.27, height = (h / 1000) * 4.16;
    const piece = new THREE.Group();
    piece.add(box(width + 0.025, height + 0.025, 0.075, 0.035, darkSteel));
    const surface = new THREE.PlaneGeometry(width, height);
    const uv = surface.getAttribute("uv");
    for (let vertex = 0; vertex < uv.count; vertex++)
      uv.setXY(vertex, x / 1440 + uv.getX(vertex) * w / 1440,
        1 - (y + h) / 1000 + uv.getY(vertex) * h / 1000);
    const tile = mesh(surface, screenMaterial);
    tile.position.z = 0.042;
    piece.add(tile);
    const guideGeometry = track(new THREE.PlaneGeometry(width, height));
    const guide = new THREE.LineSegments(track(new THREE.EdgesGeometry(guideGeometry)), assemblyMaterial);
    guide.position.z = 0.045;
    piece.add(guide);
    piece.userData = {
      x: ((x + w / 2) / 1440) * 6.27 - 3.135,
      y: 2.08 - ((y + h / 2) / 1000) * 4.16 - 0.13,
      index: i,
    };
    assembly.add(piece);
  });
  const touchMaterial = new THREE.MeshBasicMaterial({
    color: 0x83adff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  materials.add(touchMaterial);
  const touch = mesh(new THREE.RingGeometry(0.09, 0.115, 48), touchMaterial);
  touch.position.set(0, 0, 0.25);
  product.add(touch);

  // Machined aluminum, a full keyboard, etched trackpad, and fine speaker perforations.
  // The browser remains the same mesh as it becomes the physical laptop display.
  const laptop = new THREE.Group();
  product.add(laptop);
  const aluminum = steel.clone();
  aluminum.color.set(0xcbd0d8);
  aluminum.roughness = 0.39;
  aluminum.clearcoat = 0.18;
  aluminum.envMapIntensity = 1.05;
  aluminum.anisotropy = 0.65;
  materials.add(aluminum);
  const edgeMetal = aluminum.clone();
  edgeMetal.color.set(0x9da6b3);
  edgeMetal.roughness = 0.3;
  materials.add(edgeMetal);
  const base = box(6.95, 0.17, 4.2, 0.075, aluminum);
  base.position.set(0, -2.45, 1.44);
  laptop.add(base);
  const baseEdge = box(6.91, 0.045, 4.15, 0.022, edgeMetal);
  baseEdge.position.set(0, -2.535, 1.43);
  laptop.add(baseEdge);
  const hinge = mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 6.28, 32),
    darkSteel,
  );
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, -2.37, -0.37);
  laptop.add(hinge);
  const keyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x04060a, metalness: 0.02, roughness: 0.67,
    clearcoat: 0.06, clearcoatRoughness: 0.5, envMapIntensity: 0.22,
  });
  materials.add(keyMaterial);
  const keyboard = box(5.9, 0.015, 1.92, 0.04, edgeMetal);
  keyboard.position.set(0, -2.363, 0.73);
  laptop.add(keyboard);
  const keyGeometry = track(new RoundedBoxGeometry(1, 0.046, 0.265, 3, 0.019));
  const keyLayout: { label: string; x: number; z: number; width: number; depth: number }[] = [];
  let rowZ = -0.15;
  macbookKeyboard.forEach((row, rowIndex) => {
    const depth = rowIndex === 0 ? 0.19 : 0.265;
    const unit = (5.68 - (row.length - 1) * 0.04) / row.reduce((sum, key) => sum + key.width, 0);
    let x = -2.84;
    row.forEach((key) => {
      const width = key.width * unit;
      keyLayout.push({ label: key.label, x: x + width / 2, z: rowZ + depth / 2, width, depth });
      x += width + 0.04;
    });
    rowZ += depth + 0.047;
  });
  const keys = new THREE.InstancedMesh(keyGeometry, keyMaterial, keyLayout.length);
  keys.castShadow = true;
  const dummy = new THREE.Object3D();
  keyLayout.forEach((key, i) => {
    dummy.position.set(key.x, -2.326, key.z);
    dummy.scale.set(key.width, 1, key.depth / 0.265);
    dummy.updateMatrix();
    keys.setMatrixAt(i, dummy.matrix);
  });
  laptop.add(keys);
  const legendCanvas = document.createElement("canvas");
  legendCanvas.width = 2048;
  legendCanvas.height = 768;
  const lc = legendCanvas.getContext("2d")!;
  lc.textAlign = "center";
  lc.textBaseline = "middle";
  lc.fillStyle = "#e7ebf2";
  keyLayout.forEach((key) => {
    lc.font = `${key.label.length > 2 ? 16 : 27}px Arial, sans-serif`;
    lc.fillText(key.label, (key.x + 2.9) / 5.8 * 2048, (key.z + 0.2) / 1.84 * 768);
  });
  const legends = new THREE.CanvasTexture(legendCanvas);
  legends.colorSpace = THREE.SRGBColorSpace;
  legends.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  textures.add(legends);
  const legendMaterial = new THREE.MeshBasicMaterial({ map: legends, transparent: true, depthWrite: false, toneMapped: false });
  materials.add(legendMaterial);
  const keyLegends = mesh(new THREE.PlaneGeometry(5.8, 1.84), legendMaterial);
  keyLegends.rotation.x = -Math.PI / 2;
  keyLegends.position.set(0, -2.301, 0.72);
  keyLegends.castShadow = false;
  laptop.add(keyLegends);
  const etchedMetal = aluminum.clone();
  etchedMetal.color.set(0x7f8998);
  etchedMetal.roughness = 0.48;
  materials.add(etchedMetal);
  const trackpadRim = box(2.68, 0.013, 1.44, 0.055, etchedMetal);
  trackpadRim.position.set(0, -2.357, 2.49);
  laptop.add(trackpadRim);
  const trackpadMetal = aluminum.clone();
  trackpadMetal.color.set(0xbfc6d1);
  trackpadMetal.roughness = 0.53;
  materials.add(trackpadMetal);
  const trackpad = box(2.65, 0.009, 1.41, 0.05, trackpadMetal);
  trackpad.position.set(0, -2.353, 2.49);
  laptop.add(trackpad);
  const notch = box(0.85, 0.023, 0.055, 0.011, etchedMetal);
  notch.position.set(0, -2.373, 3.533);
  laptop.add(notch);
  const perforationMaterial = new THREE.MeshBasicMaterial({ color: 0x424b58 });
  materials.add(perforationMaterial);
  const speakerHoles = new THREE.InstancedMesh(track(new THREE.CircleGeometry(0.009, 8)), perforationMaterial, 248);
  let hole = 0;
  for (const side of [-1, 1]) {
    for (let row = 0; row < 31; row++) for (let column = 0; column < 4; column++) {
      dummy.position.set(side * (3.12 + (column - 1.5) * 0.042), -2.36, -0.10 + row * 0.055);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      speakerHoles.setMatrixAt(hole++, dummy.matrix);
    }
  }
  laptop.add(speakerHoles);
  const lidDetails = new THREE.Group();
  browser.add(lidDetails);
  const lensMaterial = new THREE.MeshPhysicalMaterial({ color: 0x102638, roughness: 0.1, metalness: 0.4, clearcoat: 1 });
  materials.add(lensMaterial);
  const cameraLens = mesh(new THREE.SphereGeometry(0.026, 16, 12), lensMaterial);
  cameraLens.position.set(0, 2.17, 0.171);
  cameraLens.scale.z = 0.3;
  lidDetails.add(cameraLens);
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 1024;
  labelCanvas.height = 80;
  const labelContext = labelCanvas.getContext("2d")!;
  labelContext.font = "38px Arial";
  labelContext.fillStyle = "#a0a5af";
  labelContext.textAlign = "center";
  labelContext.fillText("MacBook Pro", 512, 54);
  const labelTexture = new THREE.CanvasTexture(labelCanvas);
  labelTexture.colorSpace = THREE.SRGBColorSpace;
  textures.add(labelTexture);
  const labelMaterial = new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true, depthWrite: false, toneMapped: false });
  materials.add(labelMaterial);
  const wordmark = mesh(new THREE.PlaneGeometry(0.95, 0.074), labelMaterial);
  wordmark.position.set(0, -2.247, 0.175);
  wordmark.castShadow = false;
  lidDetails.add(wordmark);
  const reflectionCanvas = document.createElement("canvas");
  reflectionCanvas.width = reflectionCanvas.height = 256;
  const reflectionContext = reflectionCanvas.getContext("2d")!;
  const reflectionGradient = reflectionContext.createLinearGradient(0, 210, 256, 20);
  reflectionGradient.addColorStop(0, "#ffffff00");
  reflectionGradient.addColorStop(0.48, "#ffffff00");
  reflectionGradient.addColorStop(0.52, "#ffffff66");
  reflectionGradient.addColorStop(1, "#ffffff08");
  reflectionContext.fillStyle = reflectionGradient;
  reflectionContext.fillRect(0, 0, 256, 256);
  const reflectionTexture = new THREE.CanvasTexture(reflectionCanvas);
  textures.add(reflectionTexture);
  const reflectionMaterial = new THREE.MeshBasicMaterial({ map: reflectionTexture, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  materials.add(reflectionMaterial);
  const reflection = mesh(new THREE.PlaneGeometry(6.27, 4.16), reflectionMaterial);
  reflection.position.set(0, -0.13, 0.177);
  reflection.castShadow = false;
  browser.add(reflection);
  const portMaterial = new THREE.MeshStandardMaterial({color: 0x080a0f, roughness: 0.4});
  materials.add(portMaterial);
  for (let i = 0; i < 2; i++) {
    const port = box(0.014, 0.056, 0.3, 0.009, portMaterial);
    port.position.set(-3.477, -2.443, 0.1 + i * 0.47);
    laptop.add(port);
  }
  const phone = new THREE.Group();
  product.add(phone);
  const phoneBody = box(1.77, 3.55, 0.21, 0.2, darkSteel);
  phone.add(phoneBody);
  const phoneFace = box(1.69, 3.45, 0.05, 0.18, glass);
  phoneFace.position.z = 0.11;
  phone.add(phoneFace);
  const phoneMaterial = new THREE.MeshBasicMaterial({
    map: wireTexture,
    toneMapped: false,
  });
  materials.add(phoneMaterial);
  const phoneScreen = mesh(new THREE.PlaneGeometry(1.52, 3.21), phoneMaterial);
  phoneScreen.position.set(0, -0.015, 0.14);
  phone.add(phoneScreen);
  const phoneIsland = box(0.43, 0.1, 0.035, 0.045, glass);
  phoneIsland.position.set(0, 1.53, 0.17);
  phone.add(phoneIsland);
  const homeIndicator = box(
    0.43,
    0.018,
    0.005,
    0.008,
    new THREE.MeshBasicMaterial({ color: 0xc4ccd6 }),
  );
  materials.add(homeIndicator.material);
  homeIndicator.position.set(0, -1.59, 0.152);
  phone.add(homeIndicator);
  for (let i = 0; i < 3; i++) {
    const button = box(0.03, i === 0 ? 0.13 : 0.29, 0.06, 0.015, steel);
    button.position.set(-0.89, 1.1 - i * 0.35, 0);
    phone.add(button);
  }
  const powerButton = box(0.03, 0.38, 0.06, 0.015, steel);
  powerButton.position.set(0.89, 0.53, 0);
  phone.add(powerButton);
  // First render never waits for image requests. Each screen upgrades independently.
  const loadScreen = (url: string, apply: (texture: THREE.Texture) => void) => {
    void loader.loadAsync(url).then((texture) => {
      if (disposed) { texture.dispose(); return; }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      textures.add(texture);
      apply(texture);
      requestRender();
    }).catch(() => { /* Keep the working wireframe if that capture is unavailable. */ });
  };
  loadScreen("/portfolio/last-round-desktop.webp", (texture) => {
    desktopTexture = texture;
    screenMaterial.uniforms.uFinal.value = desktopTexture;
  });
  loadScreen("/portfolio/last-round-mobile.webp", (texture) => {
    phoneMaterial.map = texture;
    phoneMaterial.needsUpdate = true;
  });
  // A few shared pixels visibly rearrange from the wide composition into the phone.
  const layoutPixels = new THREE.InstancedMesh(
    track(new THREE.BoxGeometry(0.022, 0.022, 0.022)),
    blue,
    56,
  );
  product.add(layoutPixels);
  const floorMaterial = new THREE.MeshBasicMaterial({
    color: 0x647c9e,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
  });
  materials.add(floorMaterial);
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const sc = shadowCanvas.getContext("2d")!;
  const gradient = sc.createRadialGradient(128, 128, 0, 128, 128, 125);
  gradient.addColorStop(0, "rgba(0,0,0,.45)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  sc.fillStyle = gradient;
  sc.fillRect(0, 0, 256, 256);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  textures.add(shadowTexture);
  floorMaterial.map = shadowTexture;
  const floor = mesh(new THREE.PlaneGeometry(12, 8), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.63;
  floor.castShadow = false;
  scene.add(floor);
  const targetVector = new THREE.Vector3();
  const originVector = new THREE.Vector3();
  const tipVector = new THREE.Vector3();
  const darkBackground = new THREE.Color(0x080a0d);
  const lightBackground = new THREE.Color(0xeef0f3);
  const background = new THREE.Color();

  const updateChapter = (p: number) => {
    const bounds = [0, 0.19, 0.4, 0.64, 0.86, 1.001];
    let current = 0;
    for (let i = 0; i < 5; i++) if (p >= bounds[i]) current = i;
    if (current !== activeChapter) {
      activeChapter = current;
      root.dataset.chapter = String(current);
      index.textContent = String(current + 1).padStart(2, "0");
      word.textContent = ["IDEA", "CREATE", "DESIGN", "EVERYWHERE", "WORK"][
        current
      ];
      chapters.forEach((el, i) => {
        // Inactive text never traps keyboard focus while pinned.
        el.inert = i !== current;
        el.setAttribute("aria-hidden", String(i !== current));
      });
    }
    chapters.forEach((el, i) => {
      const start = bounds[i],
        end = bounds[i + 1];
      const opacity =
        i === 0
          ? 1 - smooth(end - 0.055, end, p)
          : smooth(start, start + 0.045, p) *
            (i === 4
              ? 1 - smooth(0.925, 0.975, p)
              : 1 - smooth(end - 0.045, end, p));
      el.style.opacity = String(opacity);
      el.style.visibility = opacity > 0.001 ? "visible" : "hidden";
      el.style.transform = `translateY(${(1 - opacity) * 14}px)`;
    });
    indexBar.style.transform = `scaleX(${p})`;
    stage.classList.toggle("scene-light", p > 0.735);
    root.dataset.progress = p.toFixed(4);
  };

  const render = (time: number) => {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    // Avoid doing a full graphics pass at 120/144 Hz while keeping scroll responsive.
    const interval = lastTime ? time - lastTime : 0;
    if (lastTime && interval < 1000 / 60 - 0.5) { requestRender(); return; }
    const dt = Math.min(interval / 1000, 0.05) || 0;
    lastTime = time;
    if (!ambientPaused) elapsed += dt;
    const p = state.progress;
    if (!ambientPaused) aim.lerp(pointer, 0.06);
    const formation = smooth(0, 0.14, p),
      create = smooth(0.16, 0.32, p),
      assemble = smooth(0.24, 0.4, p),
      polish = smooth(0.4, 0.61, p),
      devices = smooth(0.61, 0.77, p),
      studioLight = smooth(0.7, 0.84, p),
      portal = smooth(0.86, 1, p);
    background.copy(darkBackground).lerp(lightBackground, studioLight);
    renderer.setClearColor(background, 0);
    if (p !== lastProgress) {
      stage.style.setProperty("--scene-veil", background.getStyle());
      stage.style.setProperty("--scene-opacity", String(1 - smooth(0.95, 1, p)));
      updateChapter(p);
      lastProgress = p;
    }
    rim.intensity = lerp(3, 1.8, studioLight);
    key.intensity = lerp(4.5, 3, studioLight);
    blueLight.intensity = lerp(18, 1, studioLight);
    const x = mobile ? -0.2 * devices : 2.85,
      y = mobile ? (viewportHeight < 700 ? -1.8 : -2.2) : 0.1;
    cursor.rotation.set(
      -0.19 + Math.sin(elapsed * 0.48) * 0.035 + aim.y * 0.08,
      lerp(-0.61, 0.08, formation) + Math.sin(elapsed * 0.38) * 0.11 + aim.x * 0.16,
      -0.14 + Math.sin(elapsed * 0.36) * 0.06,
    );
    const cursorScale = (mobile ? 1.02 : 1.5) * (1 - smooth(0.26, 0.35, p));
    cursor.scale.setScalar(Math.max(0.001, cursorScale));
    cursor.visible = p < 0.35;
    const tip = tipVector.set(-0.75, 1.5, 0.03)
      .applyEuler(cursor.rotation)
      .multiplyScalar(cursorScale);
    const approach = smooth(0.13, 0.215, p);
    cursor.position.set(
      lerp(x, x - tip.x, approach),
      lerp(y + Math.sin(elapsed * 0.45) * 0.1, y - tip.y, approach),
      lerp(0, -0.05 - tip.z, approach),
    );
    cursorMetal.opacity =
      (1 - smooth(0.27, 0.35, p));
    cursorSides.opacity = cursorMetal.opacity;
    cursorEdgeMaterial.opacity = 0.12 * cursorMetal.opacity;
    ribbons.position.set(mobile ? -0.15 : 0.9, mobile ? -2.35 : -0.65, -0.4);
    ribbons.visible = p < 0.4;
    ribbons.scale.setScalar((mobile ? 0.65 : 1) * lerp(1, 0.6, create));
    ribbons.rotation.z = -0.09 + Math.sin(elapsed * 0.24) * 0.045;
    ribbons.children.forEach((child, i) => {
      child.rotation.x = Math.sin(elapsed * 0.36 + i * 0.6) * 0.05;
      child.rotation.y = Math.sin(elapsed * 0.24 + i * 0.6) * 0.035;
      (
        child as THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>
      ).material.opacity = (0.72 + i * 0.035) * (1 - smooth(0.16, 0.4, p));
    });
    cursor.updateMatrixWorld();
    const particleGather = formation * 0.85;
    particles.visible = p < 0.43;
    if (particles.visible) {
      for (let i = 0; i < particleCount; i++) {
        const q = i * 3;
        originVector.set(
          origins[q] + x * 0.3,
          origins[q + 1] +
            (mobile ? -1.7 : 0) +
            Math.sin(elapsed * 0.55 + i * 0.2) * 0.1,
          origins[q + 2],
        );
        targetVector
          .set(targets[q], targets[q + 1], targets[q + 2])
          .applyMatrix4(cursor.matrixWorld);
        let tx = targetVector.x,
          ty = targetVector.y,
          tz = targetVector.z;
        if (create > 0.001) {
          const col = i % 29,
            row = Math.floor(i / 29) % 20;
          tx = lerp(tx, x + (col / 28 - 0.5) * 6.4, create);
          ty = lerp(ty, y + (row / 19 - 0.5) * 4.4, create);
          tz = lerp(tz, -0.2, create);
        }
        positions[q] = lerp(
          originVector.x,
          tx,
          particleGather + (1 - particleGather) * create,
        );
        positions[q + 1] = lerp(
          originVector.y,
          ty,
          particleGather + (1 - particleGather) * create,
        );
        positions[q + 2] = lerp(
          originVector.z,
          tz,
          particleGather + (1 - particleGather) * create,
        );
      }
      particlesGeometry.attributes.position.needsUpdate = true;
    }
    particleMaterial.opacity = 0.7 * (1 - smooth(0.3, 0.43, p));
    shards.visible = p < 0.4;
    shardMaterial.opacity = 0.85 * (1 - smooth(0.19, 0.39, p));
    if (shards.visible) {
      for (let i = 0; i < shards.count; i++) {
        const q = ((i * 11) % particleCount) * 3;
        dummy.position.set(positions[q], positions[q + 1], positions[q + 2]);
        dummy.rotation.set(elapsed * 0.24 + i, elapsed * 0.18 + i * 0.4, i * 0.13);
        dummy.scale.setScalar(0.5 + (i % 5) * 0.25);
        dummy.updateMatrix();
        shards.setMatrixAt(i, dummy.matrix);
      }
      shards.instanceMatrix.needsUpdate = true;
    }
    const productScale = lerp(
      mobile ? 0.52 : 0.72,
      mobile ? 0.54 : 0.9,
      devices,
    );
    product.position.set(
      lerp(x, 0, portal),
      lerp(y, 0, portal),
      // Keep the base and bezel clear of the near plane, then blend into the portfolio.
      lerp(-0.3, mobile ? 10.8 : 9.3, portal),
    );
    product.rotation.set(
      lerp(-0.08, 0.31, devices) * (1 - portal) +
        Math.sin(elapsed * 0.3) * 0.018 * (1 - portal),
      (lerp(-0.66, -0.12, polish) - devices * 0.17) * (1 - portal) + aim.x * 0.025 * (1 - portal),
      lerp(-0.07, -0.025, devices) * (1 - portal),
    );
    product.scale.setScalar(productScale * lerp(0.04, 1, create));
    product.visible = p > 0.16;
    // Frame stays physically identical while the screen surface changes from guides to the product.
    browser.rotation.x = lerp(0, -0.07, devices);
    browser.position.y = lerp(0.0, 0.12, devices);
    frameMetal.color.copy(frameDark).lerp(frameSilver, devices);
    lidDetails.visible = devices > 0.1;
    browserChrome.forEach((part) => { part.visible = devices < 0.45; });
    reflectionMaterial.opacity = devices * 0.075;
    screenMaterial.uniforms.uReveal.value = polish;
    screenMaterial.uniforms.uAssemble.value = assemble;
    grid.scale.setScalar(lerp(0.015, 1, smooth(0.17, 0.25, p)));
    grid.visible = p > 0.16 && p < 0.4;
    gridMaterial.opacity =
      0.26 * smooth(0.17, 0.23, p) * (1 - smooth(0.29, 0.4, p));
    grid.rotation.z = lerp(-0.1, 0, assemble);
    assembly.visible = p > 0.22 && p < 0.61;
    assemblyMaterial.opacity = 0.6 * (1 - polish);
    if (assembly.visible) assembly.children.forEach((child, i) => {
      const d = child.userData,
        arrival = smooth(0.26 + i * 0.011, 0.37 + i * 0.015, p);
      child.position.set(
        d.x + (1 - arrival) * (i % 2 ? 1.9 : -1.9),
        d.y + (1 - arrival) * (i % 2 ? -2.5 : 2.5),
        0.2 + (1 - arrival) * (3.5 + i * 0.15),
      );
      child.rotation.set((1 - arrival) * 0.25, (1 - arrival) * (i % 2 ? -0.5 : 0.5), 0);
      child.scale.setScalar(lerp(0.6, 1, arrival));
    });
    touch.visible = p > 0.17 && p < 0.33;
    touch.scale.setScalar(lerp(1, 24, smooth(0.18, 0.33, p)));
    touchMaterial.opacity =
      0.8 * smooth(0.17, 0.19, p) * (1 - smooth(0.23, 0.33, p));
    laptop.visible = devices > 0.001;
    laptop.scale.set(1, Math.max(0.001, devices), Math.max(0.001, devices));
    phone.visible = devices > 0.01;
    phone.position.set(
      lerp(5.3, 3.44, devices),
      lerp(-2, -0.88, devices),
      lerp(-1, 1.35, devices),
    );
    phone.rotation.set(
      -0.045,
      -0.19 + Math.sin(elapsed * 0.32) * 0.04,
      0.06,
    );
    phone.scale.setScalar(lerp(0.2, 1, devices) * (1 - smooth(0.9, 0.97, p)));
    layoutPixels.visible = p > 0.62 && p < 0.78;
    layoutPixels.material.opacity = Math.sin(devices * Math.PI) * 0.75;
    if (layoutPixels.visible) {
      for (let i = 0; i < 56; i++) {
        const t = smooth(0.62 + (i % 8) * 0.008, 0.77, p);
        dummy.position.set(
          lerp(-2.7 + (i % 8) * 0.75, 2.78 + (i % 4) * 0.38, t),
          lerp(
            -0.2 + Math.floor(i / 8) * 0.2,
            -2.2 + Math.floor(i / 4) * 0.19,
            t,
          ),
          lerp(0.25, 1.5, t) + Math.sin(t * Math.PI),
        );
        dummy.scale.setScalar(1);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        layoutPixels.setMatrixAt(i, dummy.matrix);
      }
      layoutPixels.instanceMatrix.needsUpdate = true;
    }
    floor.position.x = lerp(x, 0, portal);
    floor.position.y = lerp(-3.4, y - 3.5 * productScale, devices);
    floorMaterial.opacity = lerp(0.11, 0.3, studioLight) * (1 - portal);
    floor.visible = floorMaterial.opacity > 0.001;
    // A bounded push and fade lets the HTML portfolio take over without crossing the camera.
    const cameraPush = smooth(0.08, 0.19, p) * (1 - smooth(0.25, 0.41, p));
    const cameraPull = devices * (1 - smooth(0.84, 0.9, p));
    camera.position.set(
      mobile ? 0 : (cameraPush * 0.85 - cameraPull * 0.35) * (1 - portal),
      cameraPull * 0.58 * (1 - portal),
      15 - cameraPush * 1.6 + cameraPull * 0.8,
    );
    camera.lookAt(0, 0, -0.1);
    if (p < 1) renderer.render(scene, camera);
    // Auto quality only steps down during sustained slow rendering; it never oscillates.
    if (quality === "auto" && !ambientPaused && interval && time > adaptAfter && p < 0.95) {
      sampleTime += interval;
      sampleFrames++;
      if (sampleFrames >= 20 || (sampleFrames >= 8 && sampleTime >= 900)) {
        if (sampleTime / sampleFrames > 30 && resolutionScale > 0.55) {
          resolutionScale = Math.max(0.55, resolutionScale * 0.75);
          resize();
        }
        sampleFrames = sampleTime = 0;
        adaptAfter = time + 2500;
      }
    }
    if (!ambientPaused && p < 1) requestRender();
  };
  const requestRender = () => {
    if (!frame && prepared && !disposed && visible && !document.hidden)
      frame = requestAnimationFrame(render);
  };
  const syncViewportInset = () => {
    // Keep controls on the visible screen even when the pin retains a stable height.
    const screenHeight = Math.min(innerHeight, window.visualViewport?.height ?? innerHeight);
    stage.style.setProperty("--viewport-inset", `${Math.max(0, stage.clientHeight - screenHeight)}px`);
  };
  const resize = () => {
    mobile = useMobile();
    const width = stage.clientWidth,
      height = stage.clientHeight;
    // Start with a sharp, manageable buffer. 4K is an explicit opt-in, not the default load.
    const maxPixels = quality === "high" ? (mobile ? 2_800_000 : 8_294_400) : (mobile ? 1_250_000 : 2_073_600);
    const ratio = Math.min(devicePixelRatio, quality === "high" ? 2 : 1.5, Math.sqrt(maxPixels / (width * height)))
      * (quality === "auto" ? resolutionScale : 1);
    renderer.setDrawingBufferSize(width, height, ratio);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // Increase vertical framing on tall phones; text stays in the HTML layer above the object.
    camera.fov = mobile ? 43 : Math.min(42, THREE.MathUtils.radToDeg(2 * Math.atan(7.8 / camera.aspect / 15)));
    camera.updateProjectionMatrix();
    syncViewportInset();
    requestRender();
  };
  root.classList.add("journey-enhanced");
  resize();
  // Compile all phases before scrolling can expose a previously unseen material.
  await renderer.compileAsync(scene, camera);
  prepared = true;
  adaptAfter = performance.now() + 2000;
  const setQuality = (value: JourneyQuality) => {
    quality = value;
    resolutionScale = 1;
    sampleFrames = sampleTime = 0;
    adaptAfter = performance.now() + 2000;
    resize();
  };
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const tween = gsap.to(state, {
    progress: 1,
    ease: "none",
    onUpdate: requestRender,
    scrollTrigger: {
      trigger: root,
      start: "top top",
      end: () => `+=${stage.clientHeight * (mobile ? 5.8 : 6.8)}`,
      pin: stage,
      scrub: 0.65,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      root.dataset.hidden = String(!visible || document.hidden);
      if (visible) { lastTime = 0; requestRender(); }
      else { cancelAnimationFrame(frame); frame = 0; }
    },
    { threshold: 0 },
  );
  // Observe the actual screen, not its many-screen-tall pin spacer.
  observer.observe(stage);
  const onPointer = (event: PointerEvent) => {
    if (event.pointerType === "mouse" && !ambientPaused && visible) {
      pointer.set(
        (event.clientX / innerWidth - 0.5) * 2,
        (event.clientY / innerHeight - 0.5) * 2,
      );
      requestRender();
    }
  };
  let tour: gsap.core.Tween | undefined;
  const pauseTour = () => {
    if (!tour) return;
    tour.kill();
    tour = undefined;
    root.dataset.playing = "false";
    options.onModeChange?.(ambientPaused ? "paused" : "scroll");
  };
  const play = () => {
    if (disposed) return;
    pauseTour();
    ambientPaused = false;
    root.dataset.paused = "false";
    const trigger = tween.scrollTrigger!;
    if (state.progress > 0.98 || scrollY < trigger.start || scrollY > trigger.end) {
      window.scrollTo({ top: trigger.start, behavior: "instant" });
      ScrollTrigger.update();
    }
    const travel = { y: Math.max(trigger.start, scrollY) };
    root.dataset.playing = "true";
    options.onModeChange?.("playing");
    tour = gsap.to(travel, {
      y: trigger.end,
      duration: Math.max(4, (1 - (travel.y - trigger.start) / (trigger.end - trigger.start)) * 34),
      ease: "none",
      onUpdate: () => window.scrollTo({ top: travel.y, behavior: "instant" }),
      onComplete: () => {
        tour = undefined;
        root.dataset.playing = "false";
        options.onModeChange?.("scroll");
      },
    });
    requestRender();
  };
  const toggleAmbient = () => {
    pauseTour();
    ambientPaused = !ambientPaused;
    root.dataset.paused = String(ambientPaused);
    options.onModeChange?.(ambientPaused ? "paused" : "scroll");
    requestRender();
  };
  const onManual = (event: Event) => {
    if (event.type === "touchstart" && (event.target as Element).closest(".journey-controls")) return;
    pauseTour();
  };
  const onKey = (event: KeyboardEvent) => {
    if ((event.target as Element).closest("button, input, select, textarea, a")) return;
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) pauseTour();
  };
  const onNavigate = (event: MouseEvent) => {
    if ((event.target as Element).closest("a[href]")) pauseTour();
  };
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  let resizeProgress: number | undefined;
  const onResize = () => {
    // Mobile browser chrome changes height while scrolling; it must not restart the tour.
    syncViewportInset();
    if (ScrollTrigger.isTouch === 1 && innerWidth === viewportWidth && Math.abs(innerHeight - viewportHeight) < viewportHeight * 0.25) return;
    // Capture the displayed pose before ScrollTrigger's resize refresh changes its range.
    if (resizeTimer === undefined) resizeProgress = visible && lastProgress >= 0 && lastProgress < 1 ? lastProgress : undefined;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (disposed) return;
      const trigger = tween.scrollTrigger!;
      const progress = resizeProgress;
      resizeTimer = resizeProgress = undefined;
      viewportWidth = innerWidth;
      viewportHeight = innerHeight;
      mobile = useMobile();
      pauseTour();
      ScrollTrigger.refresh();
      resize();
      if (progress !== undefined) {
        window.scrollTo({ top: trigger.start + progress * (trigger.end - trigger.start), behavior: "instant" });
        ScrollTrigger.update();
      }
    }, 160);
  };
  const onVisibility = () => {
    root.dataset.hidden = String(document.hidden || !visible);
    if (document.hidden) pauseTour();
    lastTime = performance.now();
    if (!document.hidden) requestRender();
  };
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    pauseTour();
    cancelAnimationFrame(frame);
    clearTimeout(resizeTimer);
    observer.disconnect();
    tween.scrollTrigger?.kill(true);
    tween.kill();
    motionContext.revert();
    removeEventListener("resize", onResize);
    window.visualViewport?.removeEventListener("resize", syncViewportInset);
    removeEventListener("wheel", onManual);
    removeEventListener("touchstart", onManual);
    document.removeEventListener("pointermove", onPointer);
    document.removeEventListener("visibilitychange", onVisibility);
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("click", onNavigate);
    renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
    root.classList.remove("journey-enhanced");
    stage.classList.remove("scene-light");
    stage.style.removeProperty("--scene-veil");
    stage.style.removeProperty("--scene-opacity");
    stage.style.removeProperty("--viewport-inset");
    bottom.removeAttribute("style");
    bottom.inert = false;
    chapters.forEach((el) => {
      el.inert = false;
      el.removeAttribute("aria-hidden");
      el.removeAttribute("style");
    });
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
    env.dispose();
    key.shadow.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    root.removeAttribute("data-progress");
    root.removeAttribute("data-chapter");
    root.removeAttribute("data-playing");
    root.removeAttribute("data-paused");
    root.removeAttribute("data-hidden");
    word.textContent = "IDEA";
  };
  const onContextLost = (event: Event) => {
    event.preventDefault();
    cleanup();
    options.onFailure?.();
  };
  addEventListener("resize", onResize, { passive: true });
  window.visualViewport?.addEventListener("resize", syncViewportInset, { passive: true });
  addEventListener("wheel", onManual, { passive: true });
  addEventListener("touchstart", onManual, { passive: true });
  document.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  document.addEventListener("keydown", onKey);
  document.addEventListener("click", onNavigate);
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);
  document.body.dataset.motion = "webgl";
  requestRender();
  document.fonts.ready.then(() => {
    if (disposed) return;
    resize();
    ScrollTrigger.refresh();
  });
  // The product panels settle into the business sections as the visitor continues.
  const serviceRows = [
    ...document.querySelectorAll<HTMLElement>(".service-row"),
  ];
  const priceCards = [...document.querySelectorAll<HTMLElement>(".price-card")];
  const secondaryTweens: gsap.core.Tween[] = [];
  const motionContext = gsap.matchMedia();
  motionContext.add("(prefers-reduced-motion: no-preference)", () => {
    serviceRows.forEach((row) =>
      secondaryTweens.push(
        gsap.from(row, {
          y: 22,
          opacity: 0.65,
          ease: "none",
          scrollTrigger: {
            trigger: row,
            start: "top 92%",
            end: "top 65%",
            scrub: 0.4,
          },
        }),
      ),
    );
    priceCards.forEach((card, i) =>
      secondaryTweens.push(
        gsap.from(card, {
          y: 24 + i * 9,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top 95%",
            end: "top 70%",
            scrub: 0.4,
          },
        }),
      ),
    );
    return () => {
      secondaryTweens.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
    };
  });
  return { play, pauseTour, toggleAmbient, setQuality, destroy: cleanup };
}
