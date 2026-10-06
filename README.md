# Albrecht Web Co. — cinematic Astro redesign, clean dark background

Updated October 6, 2026 — version 1.4.1: the original near-black studio background is restored. The city photo, rain, haze, and full-page fallback screenshots are removed. Those screenshots contained the page headline and buttons, producing duplicate lettering behind the real content when motion was reduced or WebGL was unavailable. Every heading and button now comes only from the page HTML.

The 2.5-second logo intro, animated cursor and ribbons, detailed MacBook, automatic graphics quality, optional **4K detail**, playback controls, and stable resizing remain. **Skip intro** and Escape dismiss the intro immediately.

A continuous, reversible journey from pixels and metallic ribbons to a sculptural cursor, an assembling browser, a finished website, a laptop and phone, and the actual portfolio. Three.js renders the objects; GSAP ScrollTrigger controls one pinned scene. The portfolio, pricing, and inquiry form remain ordinary accessible HTML.

## Install in your existing project

1. Unzip this download. In VS Code, open your **existing Albrecht Web Co. project folder**.
2. Keep a copy of your current work or commit it with Git.
3. Merge this download's `src/` into your existing `src/`. The five supplied files in `src/pages/` replace the home, Services, Pricing, Contact, and 404 pages. Keep any other routes, API files, and existing components.
4. Merge this download's `public/` into your existing `public/`. Keep unrelated files. The `portfolio/` folder is needed. The old `journey-poster` and `neon-city` images are no longer referenced and can be removed from your existing `public/` folder.
5. Open **Terminal → New Terminal** in VS Code. Run:

```bash
npm install three@0.186.1 gsap@3.15.0
npm install -D @types/three
npm run dev
```

Open the local URL printed by Astro, usually `http://localhost:4321`. The homepage opens with the short branded intro. Scroll through the journey and select each portfolio project.

**Important:** This update uses several files. Copying only `index.astro` will not install the animation. Merge the entire supplied `src/` and `public/` folders. Restart the terminal’s dev server after installing the packages, then refresh the browser. If a still presentation appears, read the message beside **Play the journey**.

**Keep your existing `package.json`, lockfile, `astro.config.mjs`, Cloudflare adapter, Wrangler configuration, environment variables, and deployment scripts.** Install the new packages into that project; do not replace its configuration with the stand-alone preview configuration supplied here. Other dependencies and integrations should remain in place.

If you already have `robots.txt` or a sitemap covering additional pages, retain those rules and URLs and merge the four agency-page URLs supplied here.

This implementation was rebuilt from the supplied `albrecht-web-co-with-portfolio.astro` page. A full GitHub checkout, Cloudflare configuration, and account environment were not supplied, so repository-only integrations could not be inspected or tested. The source page's email inquiry method is preserved; there was no server form submission endpoint in that file.

## Open this download as a separate project

For a complete isolated preview, open this extracted `albrecht-web-co` folder with **VS Code → File → Open Folder**, then run:

```bash
npm install
npm run dev
```

The included starter uses Astro 7.3.5 and requires Node.js 22.12 or newer. Its configuration builds static pages. This option lets you review the redesign before merging it into your existing deployment.

## Where to edit

| File | What it controls |
| --- | --- |
| `src/data/studio.ts` | Business name, Parker's details, metadata, packages, discount rate, project descriptions, screenshot paths, and live URLs |
| `src/data/device.ts` | MacBook keyboard layout, shared by the 3D scene and portfolio frame |
| `src/components/StartupIntro.astro` | Opening logo, studio name, caption, and Skip intro button |
| `src/scripts/startup-intro.ts` | Intro timing, assembly, blue sweep, dismissal, and reduced-motion support |
| `src/components/Journey.astro` | All five chapter headlines, supporting text, and hero buttons |
| `src/scripts/journey-loader.ts` | Startup, reduced-motion opt-in, visible loading/error messages, and playback button state |
| `src/scripts/journey.ts` | Cursor, ribbons, particles, browser, devices, lighting, camera, chapter timing, and scroll distance |
| `src/components/Portfolio.astro` | Project selector and desktop/mobile presentations |
| `src/components/Services.astro` | Service copy |
| `src/components/Pricing.astro` | Package layout and recommendation controls |
| `src/components/Contact.astro` | Inquiry fields and direct contact links |
| `src/scripts/studio.ts` | Portfolio interaction, keyboard support, veteran pricing, package selection, and email draft generation |
| `src/styles/studio.css` | Typography, spacing, colors, responsive layouts, and fallbacks |
| `src/components/StudioPage.astro` | Shared navigation, footer, canonical tags, Open Graph tags, and structured data |

The main `src/pages/index.astro` is deliberately short: it imports the complete page component. Open the component or the files above to edit the design.

## Business details preserved

| Package | Standard | Veteran |
| --- | --- | --- |
| Basic | $300 one time | $255 one time |
| Professional | $700 one time | $595 one time |
| Deluxe | $1,300 setup + $100/month | $1,105 setup + $85/month |

These are the values in the supplied agency source, including **Professional at $700**. The discount applies to Deluxe setup and monthly care. The Professional package keeps two update rounds per year. Domain, hosting, paid tools, and expanded scope remain separate costs to confirm before work begins.

The contact area uses **Parker Albrecht**, **Albrechtp919@gmail.com**, and **(816) 738-6774**. The form prepares an email draft to review and send. It also displays a copyable draft if an email application is unavailable. It does not claim to send a message through a backend. Email and phone links work without JavaScript.

## Portfolio assets and links

Last Round's desktop screenshot and public URL were checked against the live site. Its mobile presentation is a source capture. RotateIQ and Wick use real screenshots rendered from the available source files. They are labeled **Source preview**, with no invented public links or claim that their backend services are connected.

To add a verified public URL, edit that project's `url`, `domain`, `live`, `status`, and `source` fields in `src/data/studio.ts`. Replace its two WebP files in `public/portfolio/` when updating screenshots. `ASSETS.md` records the exact sources and missing information.

## Motion, fallback, and performance

- The homepage opens against the original dark studio background, with subtle electric-blue lighting. The live 3D scene provides the cursor, ribbons, particles, and devices. Reduced motion, loading, missing WebGL, and JavaScript being off use the same clean background with ordinary readable text. No full-page screenshot sits behind that text.
- **Automatic quality is the default.** Desktop starts with at most 2,073,600 drawing pixels, and phones use at most 1,250,000. Sustained slow frames reduce resolution gradually without changing the geometry or chapter positions. The render loop is capped at 60 frames per second. **4K detail** enables extra resolution up to 8,294,400 pixels on desktop (3840 × 2160 in a 1920 × 1080 window at 2× density). It is off initially; leave it off if your device stutters. Switching modes does not reset your scroll position.
- Labeled keys, speaker grilles, the recessed trackpad, aluminum materials, environment reflections, and screen textures remain. Soft contact textures replace the full real-time shadow pass. Materials compile before the journey becomes ready, hidden particles and assembly pieces stop updating, The city effects and poster images have been removed entirely.
- The final camera push stays clear of the objects and fades into the HTML portfolio. Rendering stops when the visible stage leaves the viewport, when the tab is hidden, or when the finished scene is fully faded. Reverse scrolling restores the scene. Small mobile browser-bar height changes leave playback and the pin distance intact and keep the controls on the visible screen. A real resize or orientation change updates the layout while preserving your chapter position.

- A fresh homepage load plays a **2.5-second branded intro**, while the graphics module downloads. The 3D scene starts after the intro to keep the logo animation smooth. **Skip intro** or Escape opens the page immediately. Reloading the homepage replays the intro. Reduced-motion preferences, direct anchor links, browser back/forward restoration, and secondary pages bypass it. It never waits for a graphics download; if an animation fails or stalls, the dialog closes. Without JavaScript, the intro stays closed.

- Desktop uses approximately 6.8 viewport heights for the pinned sequence; touch layouts use 5.8. Change these values at the end of `journey.ts` to adjust pacing.
- The same browser mesh becomes the laptop display. A shader progressively reveals the actual Last Round screenshot over a wireframe. Shared particles connect the cursor to the grid and device layouts.
- **Play the journey** moves through the entire pinned experience in about 34 seconds. It continues from the current position; at the end it can replay from the beginning. Wheel, touch, keyboard scrolling, and navigation interrupt playback so the visitor can take control.
- **Pause journey** stops automatic travel. **Pause motion** also freezes the ambient objects; manual scrolling still controls the transformations. **Resume motion** restores idle movement.
- Short windows remain animated. The canvas fits the actual viewport, including a 500-pixel desktop window and a 375-pixel landscape phone window.
- Reduced-motion visitors start with readable unpinned content on the dark background, plus a visible **Play the journey** choice. Selecting it explicitly enables the animation for that visit. Changes to the system preference restore the still presentation; disabling that preference starts the scene again.
- Missing WebGL, a failed graphics-module request, or a lost graphics context keeps the readable content and explains why the animation could not start. **Retry animation** is available. Screen-capture requests do not block the initial frame; failed captures retain a wireframe. Without JavaScript, all projects and both screenshot sizes remain available.
- The 3D module loads separately from the essential controls. Rendering resolution and particle counts are capped on phones. The render loop pauses outside the journey and when the tab is hidden.
- The device screens are portfolio screenshots, not embedded live apps. The working project and device controls sit in the HTML portfolio below.

## Build and deploy

```bash
npm run build
```

The stand-alone project also supports `npm run check` and `npm run preview`. Keep your existing Cloudflare deployment workflow when merging this implementation. Do not change your production build output or adapter just to match the preview starter.

Check the three project tabs, desktop/mobile controls, veteran prices, package recommendation, email draft, navigation, and the light studio scene on your own phone before deploying. `VERIFICATION.md` records the checks performed for this delivery.
