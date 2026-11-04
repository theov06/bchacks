# Tiny Okanagan — 3D art direction

The 3D world for the BCHacks site (spec 6A). Visual target: the island concept render shared with the Sky Circuit brief. This document fixes the style, the layout of the island and the budgets before any final art is made.

## 1. Style in one line

A toy diorama of the Okanagan at night: one chunky, rounded slab of land floating over the blueprint grid, lit like a model railway under blue moonlight, with a few warm lights that make it feel lived in.

## 2. Look

| Element | Decision |
|---|---|
| Form | Low-poly but soft. Big, simple, rounded volumes (hills as smooth domes, trees as 2–3 stacked cones, boulders as squashed spheres). Bevels on every box so nothing has a razor edge. No small detail that reads as noise at hero size. |
| Island slab | A bean-shaped slab about 1.4 units thick, with straight vertical sides and a bevelled top edge. The side wall is darker navy; its top rim catches a thin --sky rim light (the glowing edge in the concept). |
| Shading | Toon (cel) shading with 3 bands: shadow, mid, lit. Shadows are navy, never black. |
| Outlines | Soft, thin, dark-navy outlines on hero objects (quail, tent, bridge, landmark) on the high tier only. Terrain and trees get no outline (they would turn into noise). |
| Palette | Navy #0F1539 shadows; --deep #151B45 / --grid #262C55 mid-tones; terrain base a desaturated blue-slate; water --electric deepening to navy; lights in --sky / --ice; warm accents --lantern (fire, string lights, tent glow) and --vine desaturated ~40% (vines, orchard). Warm colour stays under ~8% of the scene. |
| Light | Twilight (Nov 3, 2026): moonlight key from the upper right, matching the moon in the hero scenery; bright blue ambient; sky rim from back-left; local point lights: logo landmark (ice), tent (lantern), campfire (lantern), bridge lamps (lantern dots). The island must read clearly brighter than the scenery's mountains, never as a dark cutout. |
| Glow | Bloom only on emissive things: landmark, light trails, lamps, fire, fireflies, aurora. Threshold high so terrain never blooms. |
| Water | Flat stylised water: navy-to-electric gradient by depth, gentle vertex waves, soft reflection of lights (fake, via emissive streaks), blueprint grid lines faintly visible under the surface. |
| Blueprint | The 80px page grid continues under the island as a 3D ground grid (--grid lines), with construction circles around the island. The island floats about 0.8 units above it and casts a soft contact shadow. |

## 3. Island layout (top-down)

Units: 1 unit ≈ the quail's height × 3. Island footprint about 14 × 9 units. +x is right, +z is toward the camera.

```
                 back (z −4.5)
     ┌─ hill ── hill ──── knoll+LANDMARK ── HILL ── hill ─┐
     │  pines    pines      (logo on plinth)  pines        │
 W   │ VINEYARD     ════════ BENNETT BRIDGE ═══════  ORCHARD │  E
     │ (slope)     ~~~~~~~~~ LAKE ~~~~~~~~~   HACK TENT    │
     │           houseboat  dock  ripples        + screen  │
     │ CAMPFIRE   NIGHT MARKET     QUAIL     VINEYARD (2)  │
     └──────────────── beach / front rim ──────────────────┘
                 front (z +4.5)
```

| Zone | Position (x, z) | Scroll stop |
|---|---|---|
| Logo landmark on a knoll | (1.8, −2.4) | Hero (glows) |
| Back ridge, 5 hills + 2 side hills | back arc | Hero backdrop, Footer (aurora above) |
| Vineyard slope (west) | (−5.2, 0.4) | About |
| Second vineyard (south-east) | (3.8, 2.9) | About (secondary) |
| Hack tent + big screen | (3.2, 0.8) | Stats |
| Okanagan Lake | centre-left, (−1, 0.4) | Tracks (buoys/boats per track) |
| Bennett Bridge (floating deck + lift-span arch) | across the lake, west → east | Schedule |
| Dock, houseboat, paddleboard | (−3, 1.6) | Sponsors (night market next to it) |
| Night market stalls | (−1, 3.2) | Sponsors |
| Campfire on the beach | (−4.6, 2.6) | Get involved |
| Quail (home spot) | (0.4, 2.7) | Hero (waves), walks between stops |
| Orchard | (5.4, −0.2) | decoration |

Why this layout: the hero camera looks from the south-east at about 30° down, as in the concept. The landmark sits high and centre-right where the 2D logo sits in the hero stage, the lake gives the composition a calm centre, and every scroll stop is a different corner, so the camera travels a loop around the island instead of zooming back and forth.

## 4. Camera

- Hero: perspective, ~30° FOV, ~32° down, framed so the whole island fits about 90% of the stage width (desktop stage ~760 × 680; phone stage ~390 × 380).
- Scroll stops: one camera pose per section (position + target), eased with GSAP ScrollTrigger along a smooth path. Drag rotates the island up to ±18° and springs back. Touch: horizontal drags only.
- Reduced motion: each section shows a still render of its stop.

## 5. Mascot: California quail

- Proportions: an egg-shaped body (wider at the bottom), a head about 55% of body width sitting directly on it (no neck), tiny legs. Height ≈ 0.35 units.
- Signature: the forward-curling black topknot (a teardrop plume on a short stalk), white eyebrow and chin stripes on a dark face, scaled belly pattern (a few flat chevrons), slate-blue chest, warm brown flanks.
- Face: big friendly eyes (white with large dark pupils and a highlight), small dark beak.
- Props: a tiny laptop (opened, screen glowing --sky) or a headset; outfits for mentor / judge / volunteer at the campfire (lanyard, rosette, hi-vis vest).
- Idle: bob (0.8 s), blink (every 3–5 s), topknot bounce lagging the bob, occasional typing. Wave in the hero.
- Colour: the one place the scene gets a little warmer (brown flanks), kept muted so it sits in the night palette.
- Scale on the island: toy-diorama exaggeration with the wide hero camera kept (approved Nov 2, 2026). Measured in the real hero: 1.6× the blockout stand-in came out ~25 CSS px tall at 390px, too small to read, so it's ~2.4× (QUAIL_HEIGHT 1.75 in src/world/island/Island.tsx) for ~38 px. Pending sign-off.
- Standing out at night: its slate-blue and brown sit close to the terrain's navy, so on the island it gets a soft --sky rim light from behind and a small warm (--lantern-tinted) light from its laptop screen on its face. Check in every 390px hero screenshot that its silhouette reads clearly against the terrain.

## 6. Performance budget (spec T12, M3)

| | High (desktop) | Medium (phones) | Static |
|---|---|---|---|
| Triangles | ≤ 250k | ≤ 90k | — |
| Draw calls | ≤ 120 | ≤ 60 | — |
| Outlines / bloom | on | off | — |
| Pixel ratio | ≤ 2 | ≤ 1.5 | — |
| Shadows | 1 soft directional (1024²) | baked/blob shadows | — |
| Fallback | | | pre-rendered WebP of the hero view |

- Everything is built in code (no downloaded models yet). Repeated objects (trees, vines, stalls, grid lines, stars) are instanced.
- JS: three + R3F + drei (tree-shaken) + scene code, loaded after first paint; target ≤ 350 KB gz for the hero, well inside the 3 MB total.
- Rendering pauses off-screen and in hidden tabs.

## 7. Fallback rule

The 2D logo on construction circles stays in the hero stage until the 3D has drawn its first frame, then cross-fades out. Any section without a finished scene keeps its 2D blueprint background, so the site is always shippable.
