BCHACKS WEBSITE

v3 · Journey down the valley

Design requirements and Claude Code build prompts

The complete spec for the BCHacks website at UBC Okanagan: concept, brand tokens, page structure, components, the 3D island, technical and accessibility rules, acceptance criteria and build order.

Prepared by Theo Vo · November 2, 2026 · Updated November 4, 2026 for the approved v3 design "Journey down the valley" (docs/bchacks-design-reference-v3/). Section 0 below is the current concept and wins wherever older sections disagree; section 0.8 (v3.1, Nov 4, 2026) lists the changes on top of v3 and wins over the rest of section 0. Earlier themes, kept as history: Okanagan Dusk (Nov 2), Neon Valley, Sky Circuit · Tiny Okanagan (Nov 2–3), first sunset design (Nov 3).

Based on the study "Web Themes and UI/UX of World-Class University Hackathons" (Oct 30, 2026).

Contents

Part A — Requirements

       0. Current concept (v3): Journey down the valley (0.8 = v3.1 changes)
       1. Overview and goals
       2. Design concept
       3. Brand tokens
       4. Page structure
       5. Components
       6. Motion and interaction
       6A. The 3D world: Tiny Okanagan
       6B. Logo
       7. Content requirements
       8. Technical requirements
       9. Accessibility requirements
       10. Acceptance criteria
       11. Build order
Part B — Claude Code prompts (history)
Appendix — Open questions for the team

PART A — REQUIREMENTS


## 0. Current concept (v3): Journey down the valley

Approved Nov 4, 2026. Visual spec: docs/bchacks-design-reference-v3/ (index.html = static mockup with exact colours, sizes, spacing and copy; assets/ = scene SVGs, island.png, logo.png; screenshots/ = per-section targets at 1440 and full pages at 1440 and 390). The mockup is a visual spec only: never ship it or copy the file into the site.

### 0.1 The idea

Scrolling the homepage is a journey down through the Okanagan, one illustrated scene per section. Each scene's bottom colour matches the next section's top colour, so the page reads as one continuous illustration.

| # | Section (id) | Scene (asset) | Base colour (top of scene) |
|---|---|---|---|
| 1 | Hero (#top) | Sunset over the valley (okanagan-dusk.svg). No island. Bottom wave #13205A. | #1B2470 |
| 2 | About + Explore (#about, #explore) | Northern lights over the 3D island (scene-about-aurora.svg, anchored to the top) | #13205A → #1A2E78 |
| 3 | Tracks (#tracks) | Night sky: moon, milky way, constellations, a quail constellation (scene-tracks-nightsky.svg) | #1A2E78 |
| 4 | Schedule (#schedule) | Myra Canyon at first light: wooden trestle, tunnel, cyclist, three day lanterns (scene-schedule-myra.svg) | #0C1036 |
| 5 | Sponsors (#sponsors) | Valley wineries in the afternoon: vine rows, winery barn, orchard (scene-sponsors-wineries.svg) | #23503F |
| 6 | Get involved (#involved) | Out on the lake: sailboats, paddleboarder, buoys, the quail on a dock (scene-involved-lake.svg) | #4CC3E2 |
| 7 | FAQ (#faq) | Underwater: light rays, kokanee, bubbles, lake weeds, a faint deep shadow (scene-faq-underwater.svg) | #1E6FB0 |
| 8 | Footer | The lakebed: rocks, weeds, the quail in a diving helmet (scene-footer-lakebed.svg) | #0A1A4A |

### 0.2 Interface

- Sticker UI (unchanged from the first sunset design): cream cards #FFF8EC, 3px #0E1446 ink border, rounded 14–24px corners, solid offset shadows with no blur. Buttons the same: coloured fill, ink text, offset shadow; secondary buttons are a 3px light outline on dark scenes and an ink outline on cream.
- Type (v3.1: titles in Geist Pixel, see 0.8.1): Inter 800 headings (-0.03em, line height ~1.05) with one highlighted phrase per heading in the section's accent; Inter 400/500 body; JetBrains Mono 500 uppercase eyebrows, labels and data.
- Accents per section: hero sun #FFD08A, About mint #7FE0A8, Explore aqua #5FD6E8, Tracks sun, Schedule pink #F2A6C2, Sponsors sun, Get involved #3B2A9A on the light lake (dark ink text), FAQ ice #B5ECFF, footer sun.
- Track cards: coral / sun / aqua / mint headers with star icons. Day cards: Fri coral, Sat sun, Sun aqua. Sponsor slots: solid cream (Gold, Silver) plus the "Want your logo here?" card. FAQ: native <details> on dark translucent panels rgba(10,26,74,.92), first two open.
- Nav: About, Explore, Tracks (v3.1: Gallery), Schedule, Sponsors, FAQ + Apply. No item is underlined at the top of the page; a link underlines only once its section's heading has passed the middle of the screen. Phones: a menu button opens the existing dialog menu.

### 0.3 Scenes

- Each scene is a component that inlines its SVG (not <img> or a CSS background) so its parts can animate. Scenes are decoration: aria-hidden, pointer-events none, never hold information.
- Scene SVGs are optimised with SVGO into src/assets/scenes/ (ids kept, every id prefixed per scene). Budget: all scene SVGs together ≤ 250KB gzipped.
- Desktop: the art keeps its exact colours, layout and proportions. It scales with the page width (1440px = design size) and is pinned to the section bottom (About: top), so text never sits on the busy part. Each section reserves room for its busy art at the bottom, growing with the art on wide screens.
- Phones: never just the shrunk 1440 art. Each scene has a phone crop that keeps its key feature in view (aurora, moon, trestle, barn, boats, deep shadow, diving quail) and keeps text off busy areas.
- Hero: fits one screen on desktop (min(100svh, …)); nothing bright behind the copy; the nearest hills start ≥ 32px below the buttons; no stars or sparkles behind the logo, nav links or header Apply button.
- Schedule: the three lanterns on the trestle sit directly below the three day-card columns at desktop widths.
- Sponsors: the barn and orchard stay in the open hills below the content; nothing busy behind the slots.
- Get involved: dark ink text on the turquoise water; the three role cards stay in the left ~820px so the boats stay visible on the right.
- FAQ: the deep shadow stays visible below the FAQ. It is a faint, faceless, unnamed abstract shape (no eyes, face, horns or cartoon features). It is never named after any figure in copy, alt text, ids, class names, comments or file names; in code it is "deep-shadow". The Syilx Okanagan Nation, whose land the footer acknowledges, holds the lake's figure as sacred.
- Footer: nothing important overlaps the lakebed art.

### 0.4 The 3D island (About / Explore)

- The 3D island moves out of the hero into the Explore block: centred and large on an oval of lake water, matching assets/island.png (sits in water: sand beach, white foam line, no slab sides; teal-green hills, violet upper slopes with pink-white snow, pink tent, turquoise inner lake, warm sunset light from the right, the sky-blue glowing logo landmark as the brightest thing, a quail that reads as a quail).
- Under the aurora it gets a soft teal/violet rim light from above.
- Five hotspot chips are real links, keyboard focusable: lake → #tracks "Tracks · night sky"; bridge → #schedule "Schedule · Myra Canyon"; pink tent → #sponsors "Sponsors · the wineries"; campfire → #involved "Get involved · the lake"; quail → #faq "FAQ · below the surface". Hover/focus makes the matching spot glow in 3D. On phones they become a list of buttons below the island.
- Lazy-load the 3D only when Explore approaches the viewport. island.png is the fallback (no WebGL, low power, reduced motion) with the same hotspot links over it.
- Keep drag-to-tilt (springs back), tap reactions, sound off by default with a visible toggle, and the easter eggs. One-finger scrolling on phones always scrolls the page. No 3D code in the hero.

### 0.5 Motion

All of it is off under prefers-reduced-motion. CSS keyframes on transform and opacity only; no layout changes. A scene's animations pause when it is off-screen (IntersectionObserver toggles a class) and when the tab is hidden. Subtle parallax between layers on scroll (and mouse on desktop), far layers slowest. Loops are staggered so nothing moves in sync. Calm, slow motion.

- Hero: clouds drift (40–90s loops, wrapping), birds flap and glide, stars twinkle, sun glow pulses (~6s), lake shimmer lines slide and fade, sun reflection glints, sailboat bobs and rocks, pines sway a few degrees, fireflies drift and blink.
- About: aurora bands flow and shimmer (20–40s), curtain rays fade in and out, stars twinkle.
- Tracks: stars and milky-way dots twinkle; a shooting star every ~8–12s; the quail constellation's lines draw in when the section enters; moon glow breathes.
- Schedule: lanterns glow; the cyclist rides back and forth on the trestle; a lantern brightens when its day card is hovered/focused; dawn glow brightens as you scroll in.
- Sponsors: vine rows shimmer (dash offset drift); orchard trees sway; the barn's round window flickers; a few birds cross.
- Get involved: ripples slide; boats bob and drift; the paddleboarder paddles; buoys bob; the dock quail bobs its head; bubbles rise below the waterline.
- FAQ: light rays sway and fade; bubbles rise and wobble; kokanee swim across and turn; weeds sway; the deep shadow glides very slowly (60–90s) and stays faint.
- Footer: weeds sway; bubbles rise from the diving quail's helmet; the quail waves every few seconds.

### 0.6 Quality gates

WCAG 2.2 AA contrast for every text/background pair on every scene (ratios listed per section); touch targets ≥ 44px; visible focus on every link, chip, accordion and button; skip link works; reduced motion = every scene still and island.png for the island; Lighthouse mobile ≥ 90 performance and ≥ 95 accessibility, LCP < 2.5s, CLS < 0.1; no animation jank at 60fps desktop / 30fps mid-range phone; 3D loads only near Explore; no [bracketed] placeholder on the live site without a CONFIRM entry in content files; no horizontal scroll at 320px.

### 0.7 Build order (v3)

Stop for review after each step. Every step: Playwright screenshots at 390, 1440 and 1920 side by side with the design screenshots; list and fix every difference before showing.

1. Hero fixes + scene components with static art for all sections + phone layout. Deployable on its own.
2. The 3D island moved into About/Explore with hotspots.
3. Animations, section by section, with reduced-motion and off-screen pause checks.
4. Quality gates, then deploy, then screenshots of the live site at 390 and 1440.

If time runs short: step 1, then hero and About animations, then the 3D island, then the rest of the animations.

### 0.8 v3.1 changes (Nov 4, 2026)

Changes on top of the v3 build. Everything not listed here stays as v3 describes it. Stop for review after each of the three steps (0.8.7).

0.8.1 Title font
- Geist Pixel (OFL-1.1, self-hosted from @fontsource/geist-pixel, weight 400) for the hero headline, every section h2, the footer headline and page h1s. It replaces the Brick Sans of the original v3.1 brief (the team chose Geist Pixel; no Brick Sans files were supplied). Body, labels and buttons keep Inter / JetBrains Mono.
- font-display: swap; only the latin file is preloaded. Fallback stack: "Geist Pixel", a metric-matched Inter 800 face (size-adjust + ascent/descent overrides), Inter, system-ui, sans-serif, so the swap shifts nothing (CLS < 0.1).
- No negative letter-spacing on pixel type. Heading sizes re-checked at 390, 1440 and 1920: no overflow, no orphaned word.

0.8.2 Tracks -> Past photos (#gallery, night sky)
- Eyebrow "Past BCHacks", heading "Memories under the stars." (highlight "under the stars." in sun #FFD08A), lede "A look back at past BCHacks weekends." The night-sky scene and its animation stay.
- Polaroids (cream frame, 3px ink border, offset shadow, tilt -4deg to 4deg) hang with small wooden clips from a softly glowing string of fairy lights sagging across the sky: two strings of 4-5 photos on desktop, one on phones (horizontal scroll-snap row or 2-column grid). Caption in the frame's bottom strip ("[Year] · [what's happening]"). Photos sway gently (off with reduced motion).
- Click / Enter opens a lightbox: native <dialog>, focus kept inside, Esc closes, arrow keys and swipe for previous / next, visible close button, caption shown.
- Data: content/gallery.ts (src, alt, caption, year). Responsive images (srcset/sizes, AVIF/WebP, width/height, lazy). Meaningful alt on every photo; the team confirms people in photos agree to be shown. Until photos exist: themed "Photo coming soon" frames with a camera icon, never stock photos. Files: public/images/past/.
- Nav "Tracks" -> "Gallery" (#gallery); island hotspot "Tracks · night sky" -> "Gallery · night sky"; footer link too. content/tracks.ts stays in the repo, not rendered.

0.8.3 Sponsors
- "Gold" -> "Current sponsors", "Silver" -> "Past sponsors". Heading, wineries scene and the "Want your logo here?" card unchanged.
- Current: the larger cream "wooden sign" panels, each a real logo linking to the sponsor's site (new tab, accessible label, alt = company name). None confirmed -> one panel "Be our first 2026 sponsor" that opens the sponsor form.
- Past: smaller panels, logos grayscale at rest and full colour on hover / focus, optional year label.
- content/sponsors.ts: name, logo, url, status ("current" | "past"), years. Logos keep their proportions (object-fit: contain, same visual size); SVG preferred. Files: public/images/sponsors/current/ and public/images/sponsors/past/.

0.8.4 /apply ("Applications will open soon")
- content/site.ts applyMode: "soon" | "open". "soon": every Apply button (header, mobile menu, hero, footer) goes to /apply. "open": they go straight to applyUrl and /apply redirects there.
- /apply: hero-style sunset scene, same header and footer, h1 "Applications will open soon.", "Leave your email and we'll tell you the moment they open.", the existing SignupForm, the event facts (dates, place, Free) and a link back home.

0.8.5 Sponsor pop-up form (replaces the /sponsor page)
- /sponsor is deleted and redirects to /#sponsors. "Become a sponsor", the hero's "Sponsor us", the footer "Sponsor BCHacks" link, the sponsor notice and the "Be our first 2026 sponsor" panel all open the same pop-up. Without JavaScript they are plain links (to #sponsors or the sponsor email).
- Native <dialog> with a backdrop, sticker style, title "Sponsor BCHacks 2026"; focus moves in and stays in; Esc and a visible close button close it; focus returns to the opener; the page doesn't jump; full-height sheet on phones.
- Fields with visible labels, autocomplete, required and inline errors tied by aria-describedby: Name (name), Company (organization), Email (email). Hidden honeypot. Note: "We'll only use this to send you our sponsorship deck and follow up." Submit "Send me the deck" with a loading state.
- Success replaces the form: "Thanks, {name}! We'll email you our sponsorship deck shortly." + Close. Failure: a clear error with the sponsor email as fallback. Nothing stored in the browser beyond form state.
- Delivery (decided Nov 5, 2026; replaces the Netlify Function + Resend auto-email): the form posts to a Google Apps Script web app (scripts/sponsor-sheet/Code.gs) that adds the lead to a Google Sheet owned by the CSCU Gmail and shared with the team, and emails the team. The team sends the deck by hand and ticks "Deck sent?". The web app URL is site.sponsorForm.sheetUrl; without it the form falls back to Netlify Forms. Setup: README "Sponsor form → Google Sheet".

0.8.5b Organizer (Nov 4, 2026)
- The header's right side is "Organized by [CSCU logo]" (links to https://www.instagram.com/cscu.ok/, new tab) instead of the Apply button; phones show only the logo. The phone menu keeps its Apply button and adds "Organized by [CSCU]". Apply stays in the hero, the footer and the menu.
- Between the hero and the aurora, About opens with a calm band in the aurora's top colour: "BCHacks 2026" (title font) and "Organized by [CSCU logo]". The aurora art starts below the band, unchanged.
- Logo: public/images/brand/cscu-logo.webp (from the team's file in bchacks-design-reference/assets/); data in content/site.ts organizer.

0.8.6 3D animation (one shared renderer)
- Keep the SVG scenes as the backdrop; add toon-shaded, low-poly 3D on top: clouds, birds and their shadows, aurora curtain, stars with depth, cyclist(s) on the trestle, boats and paddleboarder on 3D waves, kokanee schools with flocking, bubbles, the deep shadow as a soft faceless dark volume far behind, plus the existing island.
- One WebGL context for the whole page (scissor per section in view, or one fixed canvas switching scenes). Built in code or CC0 (docs/CREDITS.md). Scroll and pointer parallax, slow and calm.
- Text stays crisp HTML above all 3D; nothing behind text gets brighter than the scene already is. Lazy after page content; tiers high (desktop) / medium (phone) / static SVG + CSS (low power, no WebGL, reduced data); pause off-screen and in hidden tabs; reduced motion = static. Budget <= 600KB gz of 3D JS + models beyond the island; 60fps desktop, 30+fps mid-range phone, measured and reported.
- Order: hero (clouds, birds; stop for review) -> About (aurora) -> lake -> underwater -> canyon -> night sky -> wineries -> footer.

0.8.7 Order (stop for review after each)
1. Title font + /apply + sponsor pop-up and /sponsor removal.
2. Sponsors redesign + past photos gallery.
3. 3D animation, section by section.
Each step: screenshots at 390, 1440 and 1920; keyboard-only test of every new control; contrast check; list of what is still CONFIRM or waiting on files.

Sections 1–11 below are the original requirements. Their IDs (G1, D2, T5, A3, M5…) still apply; where they describe the Sky Circuit look (blueprint grid, chamfers, --cta-gradient, the island in the hero, the camera journey), section 0 replaces them.



## 1. Overview and goals

BCHacks is UBC Okanagan's hackathon. The website is the first experience of the event, so it should feel designed rather than templated, while keeping the information structure every top hackathon site shares. The bar is TreeHacks, Hack the North and Bruno Simon's portfolio: a site people play with, not just read.


### Goals

- G1  A first-time visitor finds the date, place, deadline and Apply button within one screen on a phone.
- G2  The site has one clear identity tied to the logo and to the Okanagan.
- G3  Beginners feel welcome: the FAQ answers cost, skill level, teams and code of conduct.
- G4  Sponsors and judges have their own clear path and a sponsorship packet.
- G5  Fast and accessible on a mid-range phone; content readable without JavaScript.
- G6  Easy for organizers to update content (dates, sponsors, FAQ) without touching layout code.
- G7  Delight: the 3D world rewards scrolling, poking and exploring, without ever standing between a visitor and the information.

### Audiences


| Audience | What they need | Primary action |
|---|---|---|
| Prospective hackers | Date, place, cost, eligibility, what it's like | Apply / join mailing list |
| First-time hackers | Reassurance: no team, no experience needed | Read FAQ, then apply |
| Sponsors | Audience size, tiers, benefits, contact | Download packet / email team |
| Mentors, judges, volunteers | Role description and sign-up | Fill interest form |
| Accepted hackers (event day) | Schedule, map, Discord, announcements | Use the live page |


## 2. Design concept: Sky Circuit · Tiny Okanagan

The Okanagan Valley at night. Sky blue is Okanagan Lake and the summer sky; navy is night over the valley. The site is dark-first.

The hero mockups (desktop and mobile) supplied with the brief are the target for layout, colours, type and UI. The 3D island takes the place of the big logo in the mockup: right side on desktop, above the text on mobile.


### 2.1 Two layers, two jobs

- INTERFACE: a glowing blueprint. A faint construction grid with circles (like the CSCU logo) runs through the whole site; all text, buttons and cards sit on it. Sharp shapes: one chamfered top-right corner, 30° angles, pointy-top hexagons.
- WORLD: "Tiny Okanagan", a toy-like 3D diorama of the valley floating above the blueprint, as if it was drafted on the grid and then came to life. Decoration and delight only.
All real information and actions live in semantic HTML on top of the world. Nothing is only in the 3D.


### Design principles

- D1  One concept applied everywhere, including placeholders, the 404 page and the social preview image.
- D2  Gradients: --cta-gradient for the primary CTA; the sky text gradient for a few key words in headings; the logo's own gradients. Everything else is flat colour and glow.
- D3  Decoration never blocks or delays information. The HTML text, Apply button and 2D logo are visible before any 3D loads.
- D4  Mobile is designed first; desktop is an enhancement.
- D5  The world is mostly cool (navy, sky, ice, electric). Warm accents (--lantern, --vine) are small, sparing touches that make it feel alive, and they exist only in 3D.
- D6  Polished game, not tech demo: every visual step is checked at 390px and 1440px and critiqued at least twice (section 11).

## 3. Brand tokens


### 3.1 Colour


|  | Token | Hex | Use |
|---|---|---|---|
|  | --navy | #0F1539 | Page background |
|  | --deep | #151B45 | Cards, panels (at ~70% opacity over the page) |
|  | --grid | #262C55 | Blueprint grid lines, borders (decorative: 1.33:1 on --navy) |
|  | --sky | #84DBF7 | Main accent: links, highlighted headings, outlines |
|  | --ice | #B5ECFF | Highlights, glow |
|  | --electric | #3B82F6 | Secondary accent, gradient end, data-block borders |
|  | --text | #E6EBFF | Body text and headings |
|  | --text-muted | #B8C2EA | Secondary text (lifted from #9AA6D6 on Nov 3, 2026 for the brighter twilight hero) |
|  | --ink | #06102E | Text on the CTA gradient and other light fills |
|  | --sky-dark | #1E7FB8 | Accent on light backgrounds (large text, icons, UI edges only) |
|  | --lantern | #FFD27A | 3D only: warm lights (tent, string lights, lanterns) |
|  | --vine | #4ADE80 | 3D only: vines and foliage, desaturated in the scene |

- --cta-gradient: linear-gradient(135deg, #B5ECFF, #84DBF7 45%, #3B82F6). Primary CTA, with --ink text.
- Sky text gradient (key words in headings): --ice → --sky → --electric. Headings only (large text).
- No purple tokens. The Okanagan Dusk / Neon Valley palettes are retired.

Contrast ratios (WCAG 2.x). AA needs 4.5:1 for body text and 3:1 for large text (≥24px, or ≥18.66px bold) and UI edges.

| Text \ Background | --navy | --deep | card (--deep 70% on --navy) | --grid | white |
|---|---|---|---|---|---|
| --text | 14.91 ✓ | 13.88 ✓ | 14.23 ✓ | 11.24 ✓ | — |
| --text-muted | 10.06 ✓ | 9.37 ✓ | 9.61 ✓ | 7.59 ✓ | — |
| --sky | 11.34 ✓ | 10.56 ✓ | 10.83 ✓ | 8.55 ✓ | 1.56 ✗ |
| --ice | 13.83 ✓ | 12.87 ✓ | — | 10.42 ✓ | — |
| --electric | 4.81 ✓ | 4.48 large only | — | 3.63 large only | 3.68 large only |
| --sky-dark | 4.03 large only | 3.75 large only | — | 3.04 large only | 4.39 large only |

| --ink on --cta-gradient | #B5ECFF | #84DBF7 | midpoint | #3B82F6 |
|---|---|---|---|---|
| ratio | 14.63 ✓ | 12.00 ✓ | 8.00 ✓ | 5.09 ✓ |

Rules that follow from the table:
- Body text is --text or --text-muted. --sky and --ice are fine for links and small text on every dark surface.
- --electric is body-text safe only on --navy; on cards and --grid use it for large text, borders and icons.
- --sky-dark fails 4.5:1 on white (4.39). On light backgrounds it is for large text, icons and UI edges; small text on light uses #1D4ED8 (6.70:1, the dark end of the light-background logo gradient).
- The sky text gradient's darkest stop (--electric) is 4.48–4.81:1 on dark surfaces, so it is used on headings only.
- --grid is never the only edge of a control (1.33:1). Inputs and secondary buttons use a --sky or --text-muted edge (≥7:1).
- Focus ring: 2px --sky (11.34:1 on --navy).
- Hero twilight scenery (public/okanagan-night.svg): --text-muted is 9.22 / 7.11 / 4.64:1 on the sky stops #121B4F / #1B2E72 / #2A4A9E. Over the scenery the copy column sits on a soft navy calm zone; every hero text element is measured against the rendered pixels behind it by scripts/visual/hero-contrast.mjs (worst case 6.37:1 for body-size text at 390 / 1440 / 1920).

### 3.2 Typography


| Role | Font | Notes |
|---|---|---|
| Headings | Inter 800 | Letter-spacing -0.03em, line height ~1.05. Key words in the sky text gradient. |
| Body | Inter 400/500 | 16px minimum on mobile; line height 1.5–1.6. |
| Labels, dates, stats | JetBrains Mono 500 | Uppercase, wide letter-spacing (~0.12em). |

Fluid type scale with clamp(), e.g. H1 clamp(2.5rem, 6vw, 4.5rem). Self-host via @fontsource, preload above-the-fold weights, font-display: swap.


### 3.3 Shape, spacing and surfaces

- Blueprint background (site-wide): an 80px grid in --grid, fading toward the edges with a radial vignette, plus soft blue radial glows. Construction circles (CSCU-style) appear in the grid behind key moments.
- Chamfer: buttons and cards have one cut corner on the top-right, built with clip-path. Token: --chamfer: 12px.
- Angle: dividers and decorative lines use 30° (the logo's isometric angle). Hexagon: stat signs and badges are pointy-top hexagons.
- Primary button: --cta-gradient, --ink text, soft sky glow. Secondary: 1px --sky outline, --text label.
- Cards: --deep at ~70% opacity with a light backdrop blur, 1px --grid border; on hover/focus-within the border lights up --sky.
- Eyebrows: small mono uppercase label above headings, with a short --sky line before it.
- Data blocks (dates, deadline): 2px --electric left border.
- Scrims: soft --navy scrims behind any text that sits over a bright part of the 3D scene, so text keeps its AA ratio.
- Spacing: 4px base scale (4, 8, 12, 16, 24, 32, 48, 64, 96). Section padding 64px mobile, 96–128px desktop. Max content width 1200px; 16px side gutter on mobile; no horizontal scroll at any width.

## 4. Page structure

Single home page in this order. Each section has an id for anchor links and a matching camera stop in the 3D world (6A).


| # | Section (id) | World stop | Content and behaviour |
|---|---|---|---|
| 1 | Header / nav | — | Logo, links (About, Tracks, Sponsors, FAQ), Apply button. Collapses to a menu button on mobile. Sticky; navy + blur after scroll. |
| 2 | Hero (#top) | Wide shot of the island | Eyebrow, "BCHacks 2027" with key words in the sky gradient, dates and deadline in a data block, "UBC Okanagan · Kelowna, BC", primary Apply button, secondary "Sponsor us". Island on the right (desktop) / above the text (mobile). |
| 3 | About (#about) | Vineyard hillside | Two short paragraphs, "You belong here" message, 3–6 event photos (if available). |
| 4 | Stats | Hack tent | Hexagon stat signs: hours, hackers, prizes, projects. Only confirmed numbers; hide the section if none are confirmed. |
| 5 | Tracks (#tracks) | The lake | Track tiles; each expands to show description and prize. |
| 6 | Schedule (#schedule) | Bennett Bridge | Two-day timeline (themed "Coming soon" state until confirmed). |
| 7 | Sponsors (#sponsors) | Night market by the dock | Tiered rows on light panels so logos stay readable. "Become a sponsor" CTA + packet link. |
| 8 | Get involved | Beach campfire | Cards: Mentor, Judge, Volunteer, each with a form link. |
| 9 | FAQ (#faq) | Quiet zoomed-out view | Grouped accordions: General, Registration, Day-of. |
| 10 | Footer | Above the island, northern lights | Land acknowledgement, code of conduct, contact email, socials, past editions, MLH badge if applicable. |


### Other pages

- /live event-day page: schedule, venue map, Discord link, Wi-Fi info, announcements, judging info. Linked from the hero only during the event.
- /404 themed "lost in the valley" page with a link home.
- /sponsor (optional) longer sponsor pitch and packet download.

### Site states

- Pre-launch / off-season: Apply button replaced by an email sign-up ("Get notified when applications open").
- Applications open: Apply button live; deadline shown in the hero.
- Applications closed: hero says so; email sign-up for next year.
- Event live: hero shows a "Live now" link to /live.
The state is controlled by one config value, not by editing markup.


## 5. Components


| Component | Requirements |
|---|---|
| Button (primary) | --cta-gradient, --ink text, chamfered top-right corner, soft sky glow, 48px min height. Hover: brightness lift. Focus: 2px --sky ring offset 2px. One per screen. |
| Button (secondary) | 1px --sky outline, --text label. Same shape and size as primary. |
| Card | --deep ~70% + backdrop blur, 1px --grid border, chamfered corner. Hover/focus-within: --sky border. No equal-card rows. |
| Eyebrow | Mono uppercase label with a short --sky line before it. |
| Data block | Mono dates/deadline with a 2px --electric left border. |
| Nav | Sticky; background appears after 40px scroll. Mobile menu is a full-height panel with focus trap and Esc to close. |
| Blueprint background | Fixed 80px grid + radial vignette + soft glows; CSS only, aria-hidden. |
| World canvas | aria-hidden, pointer-events none on the page layer (interactions are hit-tested on the canvas without blocking text or links), never traps scroll. |
| Logo | Inline SVG with accessible name "BCHacks"; dark and light variants (6B). |
| Stat sign | Pointy-top hexagon; number in JetBrains Mono; label below. Counts up once when visible (off under reduced motion). |
| Track tile | A real <button> that toggles details; tap, hover and keyboard; aria-expanded set. Also triggers its buoy/boat in the world. |
| Sponsor row | Grouped by tier with a heading. Logos on white panels, linked, alt = company name. Larger tiers get larger logos. |
| Role card | Card with title, one-line description and a link button. |
| FAQ accordion | Native <details>/<summary> or button + region with aria-expanded. Chamfered header. Grouped under h3 category headings. |
| Sound toggle | Visible button, off by default, aria-pressed. Only affects world sounds. |
| Placeholder ("Coming soon") | Themed card (faint hexagon outline on the blueprint), never a grey box. |


## 6. Motion and interaction

- M1  First-visit reveal (≤1.8s, once per visit): faint construction lines and circles draw on the grid → the logo strokes trace along them in --sky → the gradient fill powers on → the 3D island assembles up out of the blueprint lines around it. Text and the Apply button are visible from the start and never wait for this.
- M2  GSAP ScrollTrigger drives the world camera between section stops (6A). Seamless, no hard cuts.
- M3  Quality tiers, chosen automatically: high (desktop GPU: outlines, bloom, full counts), medium (phones: fewer objects, no outlines or bloom) and static (a pre-rendered image of the island, for no WebGL, low power or Save-Data). Pixel ratio capped at 2.
- M4  Rendering pauses when the canvas is off-screen or the tab is hidden. Targets: 60fps desktop, 30+fps on a mid-range phone; real numbers are reported.
- M5  prefers-reduced-motion: no camera flights, idle animation or particle motion; each section shows a still render of its stop. Stat numbers appear without counting.
- M6  DOM animation uses transform and opacity only; no layout shift. IntersectionObserver over scroll listeners where possible.
- M7  Hover effects always have a matching focus and tap equivalent.
- M8  Stat numbers count up once when they enter the viewport.
- M9  On mobile, one-finger vertical scrolling always scrolls the page; the world never traps it.


## 6A. The 3D world: Tiny Okanagan

Style: a stylized low-poly diorama of the Okanagan at night, floating above the blueprint grid (the grid lines visibly continue underneath it). Toy-like, rounded, chunky shapes; toon (cel) shading; soft outlines; subtle bloom on lights. Colours: navy shadows, --deep/--grid mid-tones, sky/ice/electric for lights, water and glows, small warm touches of --lantern and --vine.

Contents:
- Rolling hills and mountain ridges around Okanagan Lake: stylized water with gentle waves and reflections, blueprint grid faintly visible under the water.
- A simplified, recognizable Bennett Bridge across the lake, with light trails.
- Vineyard rows on a hillside, pine trees, an orchard.
- A floating dock with a paddleboard and a houseboat.
- The hack tent: glowing tent, tiny laptops, string lights, a big screen showing the BCHacks logo.
- The 3D BCHacks logo on a hill as a glowing landmark.
- Stars, fireflies, and a faint aurora in ice/sky/electric.

Mascot: a California quail (common around Kelowna). Round body, curly topknot feather, big friendly eyes, a tiny laptop or headset. Built from simple primitives, toon-shaded. Idle: bobbing, blinking, topknot bounce, occasional typing. Do not use the Ogopogo: it comes from a Syilx sacred figure (n'ha-a-itk).

Scroll journey (one stop per section):

| Section | Stop |
|---|---|
| Hero | Wide shot of the whole island; the logo landmark glows; the quail waves; blueprint construction circles slowly rotate around the island. |
| About | Camera glides down to the vineyard hillside; blueprint lines trace the vine rows; the quail walks along them. |
| Stats | The hack tent: numbers appear on the big screen and on floating holographic hexagon signs; light pulses run along circuit lines into them as they count up. |
| Tracks | The lake: each track is a buoy or boat. Opening a track (HTML tile or in the scene) makes it bob and sends a ring of sky-blue light across the water. |
| Schedule | The camera follows light trails across the Bennett Bridge; each schedule item is a glowing stop along it, joined by a circuit trace. |
| Sponsors | The night market by the dock: sponsor logos on lit signs (crisp textures) under a deep star field with a slowly rotating node network. |
| Get involved | Beach campfire: quails in mentor, judge and volunteer outfits sit around it; ice-blue embers drift and react to the cursor/touch. |
| FAQ | Quiet zoomed-out view, very slow motion only, so text stays readable. |
| Footer | The camera rises above the island into flowing northern lights (shader curtains in ice, sky, electric) over a wireframe ridge. |

Interactions (optional decoration; everything also exists in HTML):
- Drag/swipe to rotate the island slightly; it springs back gently. Horizontal drags only on touch, so vertical swipes always scroll the page.
- Hover/tap objects to make them react: trees sway, lights switch on, boats bob, the quail jumps and chirps (sound off by default, visible toggle).
- A soft light follows the cursor/touch across the scene.
- 2–3 hidden easter eggs, e.g. click the logo landmark 5 times → fireworks; Konami code → the quail puts on sunglasses.


## 6B. Logo

- Shape: unchanged from the traced logo (straight 30° polygons). Swap in an official SVG when one exists.
- Sky Circuit gradient: #B5ECFF (top) → #84DBF7 → #3B82F6 (bottom), mostly top to bottom with a slight diagonal.
- Dark-background variant: soft outer glow, #84DBF7 at ~45% and #3B82F6 at ~35%. Stops are 13.8 / 11.3 / 4.8:1 on --navy.
- Light-background variant: no glow; darker gradient #1E7FB8 → #1D4ED8 (4.39–6.70:1 on white, above the 3:1 needed for graphics), because sky blue nearly disappears on white.
- 3D version: the logo extruded as a chunky object, used as the glowing landmark on a hill.
- Assets: favicon, apple-touch-icon and the 1200×630 social image. The social image shows the 2D logo on the blueprint grid until the 3D island exists, then a render of the island with the landmark.

## 7. Content requirements

All editable content lives in data files (e.g. content/*.json or *.ts), separate from components.


| File | Contains |
|---|---|
| site config | Event name, year, dates, venue, deadline, site state (offseason / open / closed / live), apply URL, contact email, social links. |
| stats | Label, value, suffix (e.g. "+"), visible flag. |
| tracks | Name, short description, prize, icon. |
| schedule | Day, time, title, location. |
| sponsors | Name, tier, logo path, URL. |
| faq | Category, question, answer. |
| roles | Mentor / judge / volunteer: title, description, form URL. |


### Minimum FAQ

- What is a hackathon?
- Who can attend? (eligibility, age, students from other schools)
- How much does it cost?
- Do I need a team or an idea?
- I've never coded / never been to a hackathon. Can I come?
- What should I bring?
- Will there be food? Dietary needs?
- Where do I sleep / is it overnight?
- What can I build? Hardware allowed?
- What is the code of conduct?
- How do I sponsor, mentor or judge?
- Who do I contact with questions?

### Copy rules

- Plain, friendly language. Short sentences.
- No unconfirmed numbers. No "TBD" left on the live site — use a themed placeholder or hide the section.
- Every status notice is dated.
- Footer includes a land acknowledgement: UBC Okanagan is on the traditional, ancestral and unceded territory of the Syilx Okanagan Nation (check the team's preferred wording with UBCO guidance).

## 8. Technical requirements

- T1  Content is pre-rendered (static output). Viewing the page source shows real text, headings and links.
- T2  Keep the existing framework: Astro + TypeScript, static output, components rendered by @astrojs/react at build time.
- T3  Styling via CSS variables for all tokens, defined once in src/styles/tokens.css.
- T4  Metadata: title, description, canonical URL, Open Graph and Twitter card tags, a themed 1200×630 preview image, favicon and apple-touch-icon from the logo, theme-color #0F1539.
- T5  First load: Lighthouse performance ≥ 90 on mobile; LCP < 2.5s; CLS < 0.1; JS needed for the first paint < 100KB gzipped. The 3D world is not part of the first load (T12).
- T6  Images: WebP/AVIF, explicit width/height, lazy-loaded below the fold. Decorative 2D art as inline SVG or CSS.
- T7  Works in the latest two versions of Chrome, Safari (incl. iOS), Firefox and Edge.
- T8  No horizontal scroll at 320px width.
- T9  Hosting on a static host (Vercel, Netlify or GitHub Pages). Deploy previews for pull requests if possible.
- T10  README explains how to run, build, deploy, and edit content files.
- T11  3D stack: React Three Fiber + drei (the project already uses React), three.js, GSAP + ScrollTrigger for the camera, GLSL shaders for water, sky and aurora, toon materials with outline and bloom postprocessing. The world is mounted from a script in src/scripts with createRoot after the page is interactive. No client:* directives; the static HTML never depends on React in the browser.
- T12  3D budget: bundle + assets ≤ 3MB, loaded lazily AFTER the HTML text, Apply button and 2D logo are visible. A small themed loader (the quail typing) appears only inside the 3D area.
- T13  Models built in code or CC0 assets only (Kenney, Quaternius, Poly Pizza). glTF with Draco or meshopt; textures as KTX2 or WebP; repeated objects (vines, trees, stars, grid lines) instanced. Every asset and its licence is listed in docs/CREDITS.md.
- T14  Visual checks: Playwright screenshots at 390px and 1440px after every step (scripts/visual/shoot.mjs).

## 9. Accessibility requirements

Target: WCAG 2.2 AA.

- A1  Skip-to-content link as the first focusable element.
- A2  One h1 per page; headings in order; landmarks (header, nav, main, footer).
- A3  All interactive elements reachable and usable by keyboard, with a visible focus ring.
- A4  Colour contrast meets AA for all text and UI states on --navy, --deep, cards and --grid, including text over the 3D world (scrims where needed). Ratios in 3.1.
- A5  Meaningful images have descriptive alt text; decorative SVGs and the world canvas are aria-hidden.
- A6  Accordions and track tiles expose aria-expanded and are announced correctly by screen readers.
- A7  Motion respects prefers-reduced-motion (see M5).
- A8  Touch targets at least 44×44px.
- A9  Page is usable at 200% zoom with no loss of content.
- A10  Automated check (axe or Lighthouse) shows no serious or critical issues.
- A11  The world never blocks clicks or traps scrolling; sound is off by default.

## 10. Acceptance criteria

The site is ready to launch when all of these pass:

- ☐  On a 390px-wide phone, the hero shows the logo, dates, location, deadline and Apply button without scrolling.
- ☐  Changing the site state in config switches the hero between off-season, open, closed and live without code edits elsewhere.
- ☐  View-source of the home page contains the FAQ questions and section headings as text.
- ☐  Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- ☐  axe reports no serious or critical violations.
- ☐  With reduced motion turned on, nothing animates, each section shows a still of its stop and all content is visible.
- ☐  Keyboard-only: every link, button, tile and accordion can be reached and used; focus is always visible.
- ☐  Pasting the URL into Discord, Slack or iMessage shows the themed preview card.
- ☐  No "TBD", lorem ipsum or unconfirmed numbers anywhere on the live site.
- ☐  Footer contains land acknowledgement, code of conduct and contact email.
- ☐  3D bundle + assets ≤ 3MB and loaded after first paint; measured fps reported for desktop and a mid-range phone.
- ☐  Without WebGL (or with Save-Data / low power), the static island image shows and nothing breaks.
- ☐  docs/CREDITS.md lists every 3D asset and its licence.

## 11. Build order

Stop for review after each step. After every step: Playwright screenshots at 390px and 1440px, compare with the mockups, list what looks cheap or flat, fix, and repeat at least twice before showing. On phones the logo landmark and the quail must stay clearly readable: check this in every 390px screenshot. Sections without a finished scene keep their 2D blueprint background, so the site is always deployable.

1. Logo (2D variants) + tokens + type. Screenshots.
2. Full HTML page in the Sky Circuit UI with the blueprint background, no 3D yet. Must match the mockups and pass the accessibility basics.
3. 3D art direction: style, quail design and island layout, plus a grey-shape blockout screenshot. (Approved Nov 2, 2026.)
4. The quail alone, at final quality: 3 angles + idle animation.
5. The 3D logo landmark alone: the logo extruded from the clean SVG (shape identical to the 2D logo), Sky Circuit gradient, emissive glow + bloom, glowing hexagonal pedestal. Front, 3/4 and close-up screenshots.
6. The hero island + logo reveal flowing into the island assembling, at final quality, mounted in the hero stage. Deploy after this step.
7. Scroll stops: Tracks (lake + light ripples), Stats (hack tent + holographic signs), Footer (northern lights), one at a time; then About, Schedule, Sponsors, Get involved, FAQ.
8. Final pass: performance numbers, reduced-motion check, real-phone check, static fallback images, social preview image, docs/CREDITS.md.

PART B — CLAUDE CODE PROMPTS

Note: these prompts were written for the original "Okanagan Dusk" theme and are kept as build history. Where they mention lavender, hills, dusk colours or purple, Part A (Sky Circuit · Tiny Okanagan) wins.


## How to use the prompts

- Run them in order, one per session or one after another in the same session. Each builds on the last.
- Put this document (or Part A as a Markdown file) in the repo as docs/DESIGN_SPEC.md first — Prompt 0 does this. Later prompts refer to it by requirement IDs (G1, D2, T5…).
- Review and commit after each prompt. Ask for a branch per phase if your team uses pull requests.
- Replace anything in [square brackets] with real values before sending.
- If Claude Code asks a question, answer it rather than letting it guess; dates, URLs and sponsor names must be real.

### Prompt 0 — Set up the spec and project memory

Goal: Give Claude Code the full spec and a CLAUDE.md so every later session follows the same rules.


```text
I'm building the website for BCHacks, UBC Okanagan's hackathon. I'll paste our design spec below.  1. Save it as docs/DESIGN_SPEC.md exactly as written. 2. Create (or update) CLAUDE.md at the repo root with a short summary of the rules every session must follow: - concept "Okanagan Dusk": light lavender at the top, darkening to night at the bottom - soft blobs only for backgrounds; sharp 30° chamfered shapes for anything interactive - gradient only on the logo and the primary CTA - all tokens as CSS variables; all editable content in content/ data files - accessibility target WCAG 2.2 AA; respect prefers-reduced-motion - pre-rendered HTML; performance budget from requirement T5 - always refer to requirement IDs (G1, D2, T5, A3...) from the spec 3. Look at the current repo and tell me: framework, styling approach, folder structure, and anything that conflicts with the spec. Don't change code yet.  [PASTE PART A OF THE SPEC HERE]
```


### Prompt 1 — Scaffold the project

Goal: Get a working, pre-rendered skeleton with the right structure.


```text
Read docs/DESIGN_SPEC.md and CLAUDE.md.  If the repo already has a framework, keep it. If it's empty, scaffold an Astro + TypeScript project (static output). Explain your choice in one paragraph before starting.  Set up: - src/styles/tokens.css with every token from spec section 3 (colours, gradient, chamfer, spacing, type scale with clamp()) - fonts: Space Grotesk, Inter, JetBrains Mono with font-display: swap - a base layout with header, main, footer landmarks and a skip link (A1) - content/ folder with typed data files for: site config, stats, tracks, schedule, sponsors, faq, roles (spec section 7). Fill them with clearly marked sample data. - npm scripts: dev, build, preview, lint - a README with run/build/deploy steps and how to edit content (T10)  Run the build and confirm the output HTML contains real text. Show me the folder tree when done.
```


### Prompt 2 — Logo as inline SVG + brand assets

Goal: Turn the logo into an animatable SVG and generate the icon set.


```text
The BCHacks logo is at [path/to/logo.png or .svg]. It's a "b" and "c" monogram built from thick strokes at 30° isometric angles, filled with a gradient from #3B358D (top-left) through #2A006E (top-right) to #7F4D96 (bottom).  1. If we only have a PNG, recreate it as a clean SVG using straight polygon paths that match the original shape as closely as possible. Show me the SVG next to the original so I can compare. If an official SVG exists at [path], use that instead. 2. Make a Logo component that renders it inline with the accessible name "BCHacks". 3. Generate favicon.svg, favicon.ico (32px), apple-touch-icon.png (180px) and a 512px PNG from it. 4. Set theme-color to #2A006E.  Don't change the logo's proportions or colours.
```


### Prompt 3 — Hero section

Goal: Build the most important screen first.


```text
Build the hero per spec section 4 (row 2), sections 5 and 6, and goal G1.  - Background --mist with 3–4 inline SVG "hill" blob layers in --hill/--mist shades, aria-hidden, each under ~2KB. - Content: Logo, h1 "BCHacks [YEAR]", dates and deadline in JetBrains Mono, "UBC Okanagan · Kelowna, BC", primary gradient Apply button, secondary "Sponsor us" link. - All text comes from the site config file. - Hero changes by site state (offseason / open / closed / live) as described in section 4 "Site states". Off-season shows an email sign-up form posting to [form endpoint or placeholder]. - Primary button: gradient, chamfered top-right corner via clip-path, 48px min height, visible focus ring. - Logo stroke draw-in once on load (M1) and subtle hill parallax (M2) using transform only; both disabled under prefers-reduced-motion (M5).  Check at 320px, 375px, 768px and 1280px widths. At 375px, the logo, dates, location, deadline and Apply button must all be visible without scrolling. Tell me the result for each width.
```


### Prompt 4 — Navigation and dusk background

Goal: Add the sticky nav and the day-to-night colour progression.


```text
Add: 1. Sticky header nav (spec section 5 "Nav"): logo, links About / Tracks / Sponsors / FAQ, Apply button. Transparent at top, --mist background after 40px scroll. On mobile, a menu button opens a full-height panel with focus trap, Esc to close, and aria-expanded on the button. 2. The dusk progression (M3): each section's background steps from --mist toward --night down the page. Use the order in spec section 4. Text colours must switch to keep WCAG AA contrast on every step (A4). List each background/text pair and its contrast ratio. 3. Angled 30° section dividers (decorative, aria-hidden).  Make sure the nav doesn't cover anchor targets (use scroll-margin-top).
```


### Prompt 5 — About, stats and tracks

Goal: Build the middle sections with the hexagon motif.


```text
Build these sections from spec sections 4 and 5:  About (#about): two short paragraphs from content, a "You belong here" beginner message, and an optional photo grid (hidden if no photos). Photos need descriptive alt text.  Stats: pointy-top hexagon badges from the stats data file. Numbers in JetBrains Mono, count up once when visible (M4), off under reduced motion. Hide any stat with visible: false, and hide the whole section if none are visible.  Tracks (#tracks): grid of hexagon or chamfered tiles from the tracks data. Each tile is a real <button> that expands to show description and prize; works with tap, hover and keyboard; aria-expanded set (A6, M7). 1 column on mobile, 2 on tablet, 3–4 on desktop.  Use only tokens from tokens.css. No new colours.
```


### Prompt 6 — Schedule, sponsors and get involved

Goal: Build the sponsor-facing and logistics sections.


```text
Build from spec sections 4 and 5:  Schedule (#schedule): two-day timeline from the schedule data. If the data is empty, show the themed "Coming soon" placeholder component (hexagon outline + moon icon), never a grey box or "TBD".  Sponsors (#sponsors): grouped by tier with a heading per tier, logos on light panels so they stay readable on --night, larger logos for higher tiers, each linked with alt = company name. End with a "Become a sponsor" button and a link to [sponsor packet URL].  Get involved: three chamfered role cards (Mentor, Judge, Volunteer) from the roles data, each with a link button.  Create the reusable Placeholder component and use it anywhere data is missing.
```


### Prompt 7 — FAQ and footer

Goal: Finish the page.


```text
Build:  FAQ (#faq): grouped under h3 headings General / Registration / Day-of from the faq data. Use accessible accordions (native details/summary or button + region with aria-expanded) with chamfered headers. Fill the faq data file with the minimum question list from spec section 7, writing short, friendly draft answers and marking any I need to confirm with "// CONFIRM".  Footer (darkest --night): land acknowledgement ("UBC Okanagan is on the traditional, ancestral and unceded territory of the Syilx Okanagan Nation" — keep it in the config so we can edit wording), code of conduct link, contact email, social links, past editions list, and MLH badge slot (hidden unless enabled in config).  Also add a themed 404 page ("Lost in the valley") with a link home.
```


### Prompt 8 — Live page and SEO

Goal: Add the event-day page and all metadata.


```text
1. Create /live: schedule (reusing the schedule component), venue map image or embed placeholder, Discord link, Wi-Fi info, announcements list, judging info. All from content files. The hero links here only when site state is "live".  2. Metadata (T4): title, description, canonical, Open Graph and Twitter card tags on every page from config.  3. Create a themed 1200×630 social preview image: --mist background with hill shapes, the logo, "BCHacks [YEAR]", dates and "UBC Okanagan · Kelowna". Generate it at build time or as a static file.  4. Add sitemap.xml and robots.txt.  Then view the built HTML for / and /live and confirm the headings, FAQ text and meta tags are present without JavaScript.
```


### Prompt 9 — Accessibility and performance pass

Goal: Check the build against spec sections 8–9 and fix what fails.


```text
Audit the built site against docs/DESIGN_SPEC.md sections 8 and 9.  1. Run Lighthouse (mobile) and axe on / , /live and /404. Report scores and every serious or critical issue. 2. Check: skip link, heading order, landmarks, focus visibility, keyboard use of nav menu / track tiles / accordions, touch target sizes, 200% zoom, and no horizontal scroll at 320px. 3. Check contrast for every text/background pair on every dusk step. 4. Check reduced motion: with prefers-reduced-motion on, confirm nothing animates. 5. Check the performance budget (T5): LCP, CLS, JS size. Compress or lazy-load anything over budget.  Fix all issues you find, then rerun and show me a before/after table.
```


### Prompt 10 — Deploy and launch checklist

Goal: Ship it and verify the acceptance criteria.


```text
1. Set up deployment to [Vercel / Netlify / GitHub Pages] with preview deploys for pull requests. Add any config files needed and document the steps in the README. 2. Go through every acceptance criterion in spec section 10 and mark each pass or fail with evidence (a score, a screenshot description, or the relevant HTML). 3. Search the repo for "TBD", "lorem", "CONFIRM", "placeholder" and sample data, and list everything that still needs real content before launch.  Don't mark anything as passing unless you've actually checked it.
```


### Handy follow-up prompts


```text
• "Switch the site state to [open] and set the deadline to [date]. Show me the hero." • "Add these sponsors to the sponsors data: [list with tier and URL]. Optimize the logos." • "Review the whole site against D1–D4 and tell me anything that breaks the Okanagan Dusk concept." • "Something looks off at [width] on [page]. Take a screenshot and fix the layout." • "Check the contrast of [component] on the [section] background and fix it if below AA."
```


## Appendix — Open questions for the team


| Question | Needed for |
|---|---|
| Event dates, venue building and application deadline | Hero, config, schedule |
| Official logo file (SVG) and exact brand colours | Tokens, Prompt 2 |
| Hero mockups (desktop + mobile) for Sky Circuit | Step 2 layout |
| Real event photos with permission | About section, sponsor night market |
| Does a repo / framework already exist? | Prompt 0–1 |
| Application platform (own form, Devpost, Google Form, MLH) | Apply button URL |
| Confirmed stats (hackers, prizes, hours) | Stats section |
| Track list and prizes | Tracks section |
| Sponsor list, tiers and packet | Sponsors section |
| Is BCHacks an MLH member event this season? | Footer badge, code of conduct |
| Preferred land acknowledgement wording | Footer |
| Hosting platform and domain | Prompt 10 |
| Event photos with permission to use | About section |

