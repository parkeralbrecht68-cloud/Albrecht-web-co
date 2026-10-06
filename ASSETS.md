# Asset sources and open items

## Original scene assets

The cursor, ribbons, particle positions, grid, browser frame, keyboard, laptop base, phone, environment lighting, and contact monogram are authored in code. They do not require a downloaded 3D model, paid stock asset, font subscription, or API key. The previous fallback posters contained page text and controls. They and their markup were removed in version 1.4.1 to prevent a second copy of the page content.

The opening animation splits the same A mark into three SVG pieces, with a code-authored metallic gradient and CSS blue-light sweep. It adds no external image, video, font, or model dependency.

The type uses installed system fonts. The supplied agency's A mark is preserved in navigation; its new favicon uses the same simple geometry and electric-blue color.

## Supplied photo and device reference

- The user-supplied street photo is no longer embedded or included in the website. The original upload is preserved.
- The supplied `rp0ej9sfq0c71.jpg` is a visual reference for the MacBook proportions, silver body, keyboard, speaker grilles, and trackpad. It is not embedded in the website. The animated laptop and HTML portfolio frame are authored in code.
- Apple/MacBook names retain their owners’ rights. The project does not imply a relationship with those companies.

## Real project captures

| Files in `public/portfolio/` | Source | Presentation status |
| --- | --- | --- |
| `last-round-desktop.webp` | Actual public Last Round page at `https://lastroundllc.com/`, captured October 5, 2026 in the user's timezone | Live URL verified |
| `last-round-mobile.webp` | Supplied `Pasted text(2).txt` Astro source, updated October 1, 2026, rendered at 390 × 844 | Source capture |
| `rotateiq-desktop.webp`, `rotateiq-mobile.webp` | Supplied `index16.astro`, updated September 16, 2026 | Source preview; public URL not supplied |
| `wick-desktop.webp`, `wick-mobile.webp` | Existing built files in supplied `wick-vscode 2.zip`, dated October 1, 2026 | Source preview; public URL not supplied |

The fixture renderer changed no product design. A minimal head component replaced the unavailable Last Round SEO component for image rendering only. Its existing restaurant photo was retrieved from the live page so the mobile source capture could include the same image. That fixture and the source products are not included in the delivered agency website.

The Last Round restaurant photo is embedded within the project screenshots. Its original source, already used by that project, is `https://images.unsplash.com/photo-1514933651103-005eec06c04b`. The agency does not hotlink or separately distribute that photograph. Project logos, interfaces, game-map artwork, and embedded photography retain their original ownership and licenses; these are screenshots of the supplied products, not new stock illustrations.

## Not available or not verified

- The actual GitHub repository tree, existing `package.json`, Cloudflare adapter/configuration, production environment variables, and repository-only integrations were not supplied. Keep those files when merging this implementation.
- No public URL for RotateIQ or Wick was present in the agency source or source projects inspected. Their cards deliberately show no visit-live button.
- Wick's production AI coach endpoint and credentials were not verified. The portfolio describes its coach interface rather than promising a working hosted coach.
- No server contact endpoint was configured in the agency source. The existing email-draft method is preserved, including a copy fallback.
- A WebGL texture load failure retains the wireframe screen. A missing portfolio image shows a clear preview fallback and a contact link. Missing graphics support uses the original dark background and readable static content.

## Software licenses

Three.js and Astro are MIT-licensed; the included dependency packages retain their notices. A copy of Three.js's license is provided in `licenses/THREE-LICENSE.txt`, and Astro's license in `licenses/ASTRO-LICENSE.txt`.

GSAP and ScrollTrigger use GSAP's Standard No Charge License, rather than MIT. The official license covers commercial website use: `https://gsap.com/community/standard-license/`. Retain the proprietary notices in the installed package and bundled output. A reference notice is included in `licenses/GSAP-NOTICE.txt`.
