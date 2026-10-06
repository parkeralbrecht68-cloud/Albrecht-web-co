import type { JourneyHandle, JourneyMode, JourneyQuality } from "./journey";

/** Controls are available even when the graphics module cannot run. */
export function initJourneyControls(ready: Promise<void> = Promise.resolve()) {
  const root = document.querySelector<HTMLElement>("#journey");
  if (!root) return;
  const play = root.querySelector<HTMLButtonElement>(".journey-play")!;
  const pause = root.querySelector<HTMLButtonElement>(".motion-toggle")!;
  const detail = root.querySelector<HTMLButtonElement>(".quality-toggle")!;
  const status = root.querySelector<HTMLElement>(".journey-status")!;
  const cue = root.querySelector<HTMLElement>("[data-journey-cue]")!;
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  let handle: JourneyHandle | undefined;
  let pending: Promise<JourneyHandle | undefined> | undefined;
  let mode: JourneyMode = "scroll";
  let optedIn = false;
  let quality: JourneyQuality = "auto";
  root.classList.add("journey-controls-ready");
  const setMode = (value: JourneyMode) => {
    mode = value;
    const playing = value === "playing";
    const paused = value === "paused";
    root.dataset.paused = String(paused);
    play.setAttribute("aria-pressed", String(playing));
    play.querySelector("span")!.textContent = playing
      ? "Pause journey"
      : "Play the journey";
    pause.textContent = paused ? "Resume motion" : "Pause motion";
    pause.setAttribute("aria-pressed", String(paused));
    cue.textContent = playing ? "Watch it come together" : "Scroll to create";
    status.textContent = playing
      ? "Scroll any time to take control."
      : paused ? "Motion paused. Scroll to explore." : "";
  };

  const showStill = (reduced: boolean) => {
    detail.hidden = true;
    setMode("scroll");
    document.body.dataset.motion = reduced ? "reduced" : "fallback";
    play.disabled = false;
    root.dataset.paused = String(reduced);
    pause.hidden = true;
    cue.textContent = reduced ? "Your pace. Your choice." : "Explore the work";
    status.textContent = reduced
      ? "Motion is paused. Press play to begin."
      : "The animation couldn’t start on this device. You can retry below.";
    play.querySelector("span")!.textContent = reduced ? "Play the journey" : "Retry animation";
  };

  const start = () => {
    if (handle) return Promise.resolve(handle);
    if (pending) return pending;
    play.disabled = true;
    detail.hidden = true;
    pause.hidden = true;
    status.textContent = "Loading the journey…";
    document.body.dataset.motion = "loading";
    pending = import("./journey")
      .then(async (module) => {
        // Fetch the module during the intro; defer expensive graphics setup.
        await ready;
        if (preference.matches && !optedIn) {
          showStill(true);
          return undefined;
        }
        return module.initJourney({
          onModeChange: setMode,
          onFailure: () => { handle = undefined; showStill(false); },
        });
      })
      .then((scene) => {
        if (!scene) return undefined;
        if (preference.matches && !optedIn) {
          scene.destroy();
          showStill(true);
          return undefined;
        }
        handle = scene;
        play.disabled = false;
        pause.hidden = false;
        detail.hidden = false;
        if (quality === "high") scene.setQuality(quality);
        if (root.dataset.paused === "true") scene.toggleAmbient();
        else setMode("scroll");
        return scene;
      })
      .catch(() => { showStill(false); return undefined; })
      .finally(() => { pending = undefined; });
    return pending;
  };

  play.addEventListener("click", async () => {
    optedIn = true;
    if (mode === "playing" && handle) handle.pauseTour();
    else (await start())?.play();
  });
  pause.addEventListener("click", () => {
    handle?.toggleAmbient();
  });
  detail.addEventListener("click", () => {
    if (!handle) return;
    quality = quality === "auto" ? "high" : "auto";
    detail.setAttribute("aria-pressed", String(quality === "high"));
    handle.setQuality(quality);
  });
  document.addEventListener("visibilitychange", () => {
    if (!handle) {
      const rect = root.querySelector(".journey-stage")!.getBoundingClientRect();
      root.dataset.hidden = String(document.hidden || rect.bottom <= 0 || rect.top >= innerHeight);
    }
  });
  preference.addEventListener("change", () => {
    optedIn = false;
    if (preference.matches) {
      handle?.destroy();
      handle = undefined;
      showStill(true);
    } else void start();
  });
  addEventListener("pagehide", () => {
    handle?.destroy();
    handle = undefined;
  });
  addEventListener("pageshow", (event) => {
    if (event.persisted) {
      if (preference.matches && !optedIn) showStill(true);
      else void start();
    }
  });
  if (preference.matches) showStill(true);
  else void start();
}
