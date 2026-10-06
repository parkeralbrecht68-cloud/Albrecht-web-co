# Cinematic redesign verification — October 6, 2026

## Background and duplicate lettering fix — version 1.4.1

- `npm run build`: all five static routes build successfully.
- `npm run check`: 0 errors, 0 warnings, 0 hints across 20 files.
- Eight focused browser checks passed with no unexpected runtime or shader errors.
- The supplied screenshot was inspected. The duplicate headline, description, credit, and buttons came from full-page fallback screenshots placed behind the real HTML. Contrary to the previous verification notes, those poster images did contain text. Their markup, CSS, and files have now been removed entirely.
- The city image, rain, haze, and lighting layers tied to that photo are removed. The homepage again uses the original near-black studio background and subtle electric-blue light; the live 3D journey still transitions into the light studio.
- A 736 × 754 viewport at 2× density, matching the supplied screenshot's layout, was inspected with reduced motion. The headline appears once and there is no background screenshot or street photo. The desktop reduced-motion view was also checked.
- Unavailable WebGL and JavaScript being off retain clean readable content on the same dark background. WebGL failure offers Retry; reduced motion offers Play without presenting a misleading ambient-background control.
- Normal motion still renders the cursor, ribbons, detailed MacBook, and phone. Reverse scrolling restores the dark studio. Explicit Play in reduced motion enables exactly one live scene.
- No tested page requested the removed city or fallback poster images. Keeping old unused images in an existing public folder cannot bring back the duplicate lettering because the new page does not reference them.
- The previous automatic-quality, rendering, and resize fixes remain. Testing used software-rendered Chromium; the user's own hardware was not measured.

Previous sections document earlier deliveries and are superseded by the fixes above where they mention backgrounds or fallback posters.

## Smoother rendering update — version 1.4.0

- `npm run build`: all five static routes build successfully.
- `npm run check`: 0 errors, 0 warnings, 0 hints across 21 files.
- Fourteen focused browser checks passed with no unexpected runtime or shader errors.
- The default desktop budget is at most 2,073,600 pixels, compared with the previous 8,294,400-pixel maximum. At a 1920 × 1080 viewport and 2× density, this cuts the initial drawing budget by 75%. Phones use at most 1,250,000 pixels. Optional **4K detail** still produces an actual 3840 × 2160 drawing buffer; switching back preserves the scroll position.
- A deliberately slowed browser automatically reduced its drawing buffer from 800 × 600 to 600 × 450, while the scene stayed active.
- The device chapter produced 28 drawing calls per frame, versus 68 in the previous build, and no real-time shadow pass. The earlier sample used a 1440 × 900 viewport at 2×; the updated sample used 1920 × 1080 at 2× with automatic resolution. These are rendering-work observations, not a controlled hardware frame-rate comparison.
- The branded intro completes before scene setup; all five chapters, ambient Pause/Resume, Play, manual interruption, and reverse scrolling work. Idle ambient motion no longer rewrites chapter or backdrop styles every frame.
- Hidden city effects pause, the final bounded camera push fades into the HTML portfolio, and the scene issues no further drawing calls after leaving the viewport, including after pointer movement.
- Last Round, RotateIQ, and Wick and their desktop/mobile selectors work after the animated portfolio handoff. This check used the active graphics scene, rather than the still fallback.
- A 1280 × 500 window resizes correctly, preserves the chapter position, and exposes the controls without horizontal overflow. A 390 × 844 touch viewport fits the phone layout; a small height change preserves playback and the drawing buffer and keeps all three controls within the visible screen, while a real orientation change updates the layout.
- Switching reduced motion on disposes the scene; switching it off rebuilds exactly one canvas. The photo remains the supplied source image, and its Pause control freezes it.
- The updated preview image shows automatic quality. Testing used software-rendered Chromium; actual frame rate on the user's Mac or phone has not been measured.

## Detailed MacBook and moving photo update

- `npm run build`: all five routes build successfully.
- `npm run check`: 0 errors, 0 warnings, 0 hints across 21 files.
- Ten focused browser checks passed with no unexpected runtime or shader errors.
- A 1920 × 1080 viewport at 2× device pixel density produces an actual 3840 × 2160 WebGL drawing buffer. The supplied city photo remains its original 1920 × 1199 source size.
- Camera drift, pulsing neon, haze, and both rain layers move. Pause freezes the photo animation and physical scene; scroll still controls chapter transitions.
- The detailed MacBook reaches the light studio, while the street fades out. Reverse scrolling restores the neon homepage.
- All three portfolio projects work in the new laptop frame and phone view. This HTML control check used reduced motion to isolate the portfolio from software-rendered graphics.
- The 390 × 844 phone layout fits without horizontal overflow, and both the homepage and device scene were visually inspected.
- Reduced motion stops the city animation and removes the pinned graphics scene while retaining Play. Missing WebGL retains independent Pause and Resume for the photo. With JavaScript off, the photo and page remain readable and still.
- A final native 4K close-up confirmed a clean bezel after separating its coincident metal and glass faces.
- The updated scene was captured at native 4K. Performance has not been measured on the user's Mac or phone; software rendering made capture of the final graphics-to-portfolio transition slow in this test environment.

## New opening animation

- `npm run build`: all five routes build successfully.
- `npm run check`: 0 errors, 0 warnings, 0 hints across 19 files.
- Eleven focused browser checks passed with no unexpected runtime errors.
- The homepage assembles the logo and reveals the name, then dismisses automatically after approximately 2.5 seconds. A working 3D scene and playback controls become available after dismissal.
- Reload replays the intro. Skip, Escape, touch input, and keyboard focus work; wheel and Page Down do not scroll the background while the dialog is open.
- Reduced-motion preferences bypass the intro. Enabling the preference during playback closes it. Direct anchor links and Services, Pricing, and Contact open directly.
- The phone layout fits without horizontal overflow. Without JavaScript, the dialog stays closed and the page remains readable.
- A simulated animation API failure closes the intro and preserves graphics startup. A deliberately stalled exit animation is dismissed by the safety timeout.
- The graphics module downloads during the intro, but renderer setup waits for dismissal so it cannot interrupt the opening animation.

## Previous motion update — October 6, 2026

This update was checked with Astro 7.3.5, Node.js 24, and software-rendered Chromium.

- `npm run build`: all five routes build successfully.
- `npm run check`: 0 errors, 0 warnings, 0 hints across 17 files.
- Seventeen browser checks passed with no unexpected runtime or shader errors.
- Ambient geometry moves while scrolling is idle. Play advances the full journey, and manual scrolling interrupts playback. Pause freezes the ambient geometry while scroll-controlled transformations remain available.
- All five chapters render in both scroll directions. Returning to the opening pose matches the earlier render within pixel rounding.
- Changing the motion preference removes the pin and graphics scene, then rebuilds exactly one scene when motion is enabled again.
- Canvas height and accessible playback controls were checked at 1440 × 900, 1280 × 500, 667 × 375, 390 × 844, and 390 × 600. The tested layouts have no horizontal page overflow.
- A visitor with reduced motion enabled starts with still content. Selecting Play explicitly enables the animated journey, including both playback and ambient-motion controls.
- Unavailable WebGL and a failed graphics-module request expose a readable still presentation, an explanation, and Retry animation. Missing screen captures do not block startup; the wireframe remains usable.
- Last Round, RotateIQ, and Wick portfolio selection and mobile presentation work. Package prices, veteran discounts, and the Services, Pricing, and Contact routes remain intact.
- Updated fallback posters were captured from the new scene, without page text or controls baked into them.

The Three.js/GSAP graphics chunk still produces the build tool's size advisory. It loads separately from the essential site controls. Rendering resolution is capped, and ambient rendering stops when the scene is offscreen or the tab is hidden. Device performance has not been measured on the user's Mac or phone.

The inquiry form retains the existing email-draft workflow. No email was sent, and nothing was deployed to the live agency website during this update. Existing Cloudflare configuration and repository-only integrations must be kept when merging the supplied source.
