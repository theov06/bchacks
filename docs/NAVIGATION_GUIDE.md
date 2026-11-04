# Website navigation and content guide

Use this guide to find where to change navigation labels, destinations, and the content shown on the BCHacks website. It describes the current implementation; the approved v3 navigation is also in section 0.2 of [DESIGN_SPEC.md](./DESIGN_SPEC.md).

## Quick rule

- To change a **navigation label, link, or order**, edit the relevant component in `src/components/`.
- To change **event facts, section copy, or other editable content**, edit the matching file in `content/`.
- When a link points to a section, its URL fragment must match that section's `id` exactly. For example, `#tracks` must point to an element with `id="tracks"`.

## Main navigation

The shared header is rendered on every page by `src/layouts/Base.astro`. The main and mobile menus use the same list, currently defined in `src/components/layout/Header.tsx`:

| Label | Destination | Section / page |
|---|---|---|
| About | `/#about` | About |
| Explore | `/#explore` | Explore island |
| Tracks | `/#tracks` | Tracks |
| Schedule | `/#schedule` | Schedule |
| Sponsors | `/#sponsors` | Sponsors |
| FAQ | `/#faq` | FAQ |

On the home page these links are section fragments (for example, `#about`). On other pages, the shared header receives `base="/"`, so it sends visitors back to the corresponding home-page section.

### Change header links

Edit the `links` array in `src/components/layout/Header.tsx`. Keep the label and href together, and ensure the fragment matches the destination section's id.

The phone menu is generated from the same `links` array. Do not edit a separate mobile link list. Its open/close behaviour is in `src/scripts/header.ts`.

### Header action

The header's final button is not a fixed link. `headerAction()` in `src/components/layout/Header.tsx` follows the single site state in `content/site.ts`:

| `site.state` | Header action | Destination |
|---|---|---|
| `open` | Apply | `site.applyUrl` |
| `live` | Live now | `/live` |
| `offseason` or `closed` | Get notified | Home-page signup (`#top`) |

Update the button text or behavior in `Header.tsx`; update the application URL in `content/site.ts`. Avoid hard-coding event facts into the component.

## Section destinations and their content

These are the current home-page targets. Section IDs are defined in the named components; copy and event data are generally kept in `content/`.

| Section | Anchor | Where to edit its content |
|---|---|---|
| Hero | `#top` | `content/site.ts` |
| About | `#about` | `content/about.ts` |
| Explore | `#explore` | `content/about.ts` (`explore`, including hotspot labels and hrefs) |
| Tracks | `#tracks` | `content/tracks.ts` |
| Schedule | `#schedule` | `content/schedule.ts`; event dates and venue facts are in `content/site.ts` |
| Sponsors | `#sponsors` | `content/sponsors.ts`; sponsor contact and packet URL are in `content/site.ts` |
| Get involved | `#involved` | `content/roles.ts` |
| FAQ | `#faq` | `content/faq.ts` |

The hero also has state-dependent calls to action. Its sponsor call to action may point to `#sponsors` or `/sponsor`, depending on the state; see `src/components/sections/Hero.tsx`.

## Footer navigation

The footer is shared across pages and is defined in `src/components/layout/Footer.tsx`. Its current link columns are:

- **Event:** About, Tracks, Schedule, FAQ; a Live page link is added when `site.state` is `live`.
- **Get involved:** Sponsor BCHacks (`/sponsor`), Mentor, Judge, Volunteer (`/#involved`), and the external Code of conduct link.
- **Contact:** email address from `content/site.ts`.
- **Footer call to action:** changes with `site.state`; labels and event-specific copy are derived from `content/site.ts`.

To add, remove, reorder, or rename a footer link, edit the `columns` array in `Footer.tsx`. To change the land acknowledgement, contact details, code-of-conduct URL, MLH badge settings, or footer copy, edit `content/site.ts`.

The `#footer-nav` target is the footer link area. It is also the destination for the no-JavaScript phone-menu fallback.

## Other pages and links

| Page / link | Purpose | Main source |
|---|---|---|
| `/sponsor` | Sponsor information and packages | `src/pages/sponsor.astro`, `content/sponsors.ts`, `content/site.ts` |
| `/live` | Event-day information; linked from the hero when the site is live | `src/pages/live.astro`, `content/live.ts`, `content/site.ts` |
| Not-found page | Recovery link back to the home page | `src/pages/404.astro` |
| Island hotspot links | Jump from Explore to page sections | `content/about.ts` (`explore.hotspots`) |
| Dated notice | Optional notice above the header | `content/site.ts` (`notice`) |

## Active section and accessibility behavior

`src/scripts/header.ts` adds `aria-current="true"` to the header link for a section when that section's heading has passed the middle of the viewport. No section is marked current at the top of the page or between sections.

The phone menu uses a native modal `<dialog>`. Its links are the same as the desktop navigation; selecting one closes the menu. If adding a link, check that it works with keyboard navigation and that the menu still closes after selection. Keep the existing skip link in `src/layouts/Base.astro`.

## Editing checklist

1. Change the navigation in `Header.tsx` or `Footer.tsx`, not in a content module, unless the destination/text is specifically data-driven there.
2. If you add or rename an in-page destination, update the section `id` and every link to it. Check header links, footer links, hero buttons, and Explore hotspots.
3. If a link is intended to work from a page other than the home page, use the existing `base` convention (`base="/"`) for home-page anchors.
4. Confirm any event detail marked `CONFIRM` in `content/` before replacing it with a factual claim.
5. Run `npm run lint` and `npm run build`.
6. Manually check the destination on desktop and phone widths, including the phone menu and links from `/sponsor` and `/live`.

