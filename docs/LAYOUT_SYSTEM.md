# Layout system: the ridge grid

How every section on the BCHacks site is laid out. Tokens live in `src/styles/tokens.css`; the `.grid` utility lives in `src/styles/global.css`.

## Typography scale

About 1.25× per step at 375px, widening to about 1.333× at 1280px. All sizes are `clamp()` tokens.

| Token | 375px → 1280px | Face | Use |
|---|---|---|---|
| `--display` | 52 → 76px | Inter 800, -0.035em | Hero headline only |
| `--h1` | 40 → 72px | Inter 800, -0.03em | Page titles (/sponsor, /404, /live), closing section |
| `--h2` | 32 → 52px | Inter 800, -0.03em | Section headings (key words in `.sky-text`) |
| `--h3`, `--text-xl` | 20 → 24px | Inter 700 | Track names, day names, role titles |
| `--text-lg` | 17 → 20px | Inter 400 | Ledes and story copy |
| `--text-base` | 16px | Inter 400, line height 1.6 | Body |
| `--text-sm` / `--text-xs` | 15 / 13px | JetBrains Mono 500, labels uppercase + `--label-tracking` | Data and labels: eyebrows, dates, times, prices, tier names |

Monospace is used only for data, never as decoration.

## The grid

Phones get one column. From 900px up there are 12 columns with three named areas:

```
| ridge (1–3) | read (4–9)             | tail (10–12) |
  headings      body copy, lists,        prizes, times,
  and labels    controls                 secondary actions
```

- **Ridge edge (column 1):** every h2, the hero wordmark, tier names, day names, role titles and the FAQ intro.
- **Reading edge (column 4):** ledes, paragraphs, hero facts, the Apply button, logos and track summaries. Body text stays around 60–70 characters per line.
- **Tail:** information you scan after the main point, such as prizes, time commitments and sign-up buttons.

Place children with `grid-column: ridge | read | tail | full`, or spans such as `ridge-start / read-end`. Rows that repeat (tracks, tiers, roles) use `grid-template-columns: subgrid` so their columns line up down the page. Use `row-gap` on a subgrid, never `gap`, because `gap` would override the page's column gap.

`SectionHead` (`src/components/ui/SectionHead.tsx`) sets the standard rhythm: the h2 on the ridge edge, then the lede stepped in to the reading edge.

## The 30° step

`--iso` (cot 30° ≈ 1.732) turns a vertical pitch into the horizontal run along the logo's angle. The "You belong here" list steps right by `pitch × --iso` per line, so its markers sit on one 30° line.

## The hero is the exception

The hero follows the Sky Circuit mockup instead of the ridge/reading edges: one left-aligned copy column (eyebrow, headline, lede, data blocks, actions) and the stage on the right, where the 3D island mounts (above the copy on phones). Every other section uses the ridge grid.

## Interface patterns (global.css)

- `.eyebrow`: mono uppercase label with a short --sky line, above a heading.
- `.sky-text`: the sky text gradient for a few key words in a heading. Headings only.
- `.label` / `.data`: mono uppercase label; data block with a 2px --electric left border.
- `.card`: --deep 70% + blur, 1px border, chamfered top-right; the border lights --sky on hover, focus-within or when open. The shape is drawn on pseudo-elements so focus rings and glows are never clipped.
- Hero scenery: public/okanagan-night.svg behind the copy and the island (full-bleed from 700px; a 440px band below the buttons on phones), animated by src/scripts/scenery.ts, with light blueprint lines (--grid-light) on top.
- `WireRidge`: the wireframe ridge along the bottom of the closing section, /sponsor and /404 (no longer in the hero).

## Template patterns we don't use

- Rows of three equal cards (icon, heading, text). Tracks, sponsor tiers on the home page and roles are ruled rows on the grid. (The /sponsor tier comparison and the hero stat chips from the mockup are the deliberate exceptions.)
- Numbered sections (01/02/03).
- Gradient text outside headings, or more than one highlighted phrase per heading.
- Glass blur on anything that isn't a card over the blueprint or the 3D world.
