# BCHacks website

The website for BCHacks, UBC Okanagan's student hackathon. Theme: **Sky Circuit · Tiny Okanagan**: the Okanagan at night as a glowing blueprint, with a toy-like 3D diorama of the valley floating above it (spec: docs/DESIGN_SPEC.md).

Built with [Astro](https://astro.build) and TypeScript, output as plain static HTML (no framework JavaScript is shipped; about 1.5 KB of small scripts in total).

- Full design spec: [docs/DESIGN_SPEC.md](docs/DESIGN_SPEC.md)
- Research it is based on: [docs/WEB_DESIGN_STUDY.md](docs/WEB_DESIGN_STUDY.md)

## Folders

| Folder | What's in it |
|---|---|
| [frontend/](frontend/) | The website (Astro): `src/`, `public/`, `content/`, build and check scripts |
| [backend/](backend/) | The Google Apps Script that receives both forms ([backend/sponsor-sheet/Code.gs](backend/sponsor-sheet/Code.gs)) |
| [docs/](docs/) | Design spec, design references, credits, and the team's original photos, logos and documents ([docs/originals/](docs/originals/)) |
| [.github/workflows/](.github/workflows/) | Builds `frontend/` and publishes it to GitHub Pages |

## Run it

Needs Node 22.23 or newer. Run these in `frontend/`:

```bash
cd frontend
npm install
npm run dev       # http://localhost:4321, reloads on save
npm run build     # static site into dist/
npm run preview   # serve dist/ locally
npm run lint      # type-check (astro check)
npm run assets    # regenerate favicons and the social card
```

## Edit content (no layout code needed)

Everything organizers change lives in [frontend/content/](frontend/content/). Anything marked `// CONFIRM` is sample data. Replace it before launch.

| File | What it holds |
|---|---|
| [content/site.ts](frontend/content/site.ts) | **Site state**, apply mode, event name and year, dates, venue, apply URL, emails, socials, the notice bar, the forms' Google Sheet URL |
| [content/about.ts](frontend/content/about.ts) | About copy, "You belong here" list, team size, Explore stops (island hotspots and phone postcards) |
| [content/gallery.ts](frontend/content/gallery.ts) | Past event photos and captions (files in `public/images/past/`) |
| [content/schedule.ts](frontend/content/schedule.ts) | The weekend schedule. Leave it empty to show the "Coming soon" placeholder |
| [content/sponsors.ts](frontend/content/sponsors.ts) | Current and past sponsors (logos in `public/images/sponsors/`) |
| [content/roles.ts](frontend/content/roles.ts) | Mentor / Judge / Volunteer cards and form links |
| [content/faq.ts](frontend/content/faq.ts) | FAQ. Links use `[label](url)` |
| [content/live.ts](frontend/content/live.ts) | Event-day page: Wi-Fi, venue map, rooms, judging, dated announcements |

### Site state

Change one line in `frontend/content/site.ts`:

```ts
state: 'open' as SiteState, // 'offseason' | 'open' | 'closed' | 'live'
```

| State | Hero shows |
|---|---|
| `offseason` | Email sign-up: "Get notified when applications open" |
| `open` | Apply button and the deadline |
| `closed` | "Applications are closed" plus sign-up for next year |
| `live` | "Happening now" and a button to `/live` |

The notice bar only shows in the states listed in `notice.showIn`, so it can't contradict the hero.

The email sign-up saves to the team's Google Sheet (see Forms). `notifyFormAction` can point it somewhere else instead (for example Mailchimp).

## Pages

- `/`: hero, about + explore, gallery (past photos), schedule, sponsors, get involved, FAQ
- `/apply`: "Applications will open soon" + email sign-up while `applyMode` is `soon`; redirects to `applyUrl` when `open`
- `/sponsor`: redirects to `/#sponsors` (sponsors now use the pop-up form on every page)
- `/live`: event-day page (no-indexed unless the state is `live`)
- `/404`: "Lost in the valley"
- `/sitemap.xml` and `/robots.txt`: generated from `siteUrl`

## Brand assets

- The logo is traced from `frontend/logo.jpg` into straight 30° polygons in [Logo.tsx](frontend/src/components/ui/Logo.tsx), so its outline can draw itself in. If an official SVG appears, replace the two `points` strings there and in `frontend/scripts/generate-assets.mjs`.
- `npm run assets` rebuilds `favicon.svg/.ico`, `apple-touch-icon.png`, `icon-192/512.png`, `site.webmanifest` and the 1200×630 `og-image.png`. The social card is rendered in headless Chrome or Edge so it uses the real fonts (set `CHROME_PATH` if neither is found). Rerun it after changing the dates.
- Design tokens (colours, type, chamfers, spacing, grid) are all in [frontend/src/styles/tokens.css](frontend/src/styles/tokens.css).
- Components are typed `.tsx` function components in [frontend/src/components/](frontend/src/components/) (`ui/`, `layout/`, `sections/`), each with a `.module.css` file. Astro renders them to plain HTML at build time; none are hydrated, so no React code reaches the browser. Interactivity lives in small scripts in [frontend/src/scripts/](frontend/src/scripts/). The layout grid is described in [docs/LAYOUT_SYSTEM.md](docs/LAYOUT_SYSTEM.md).

## Deploy

The site is hosted on **GitHub Pages** at https://bchacks.ca. Every push to `main` runs [.github/workflows/pages.yml](.github/workflows/pages.yml), which builds `frontend/` and publishes `frontend/dist`. The domain is registered at GoDaddy, whose DNS points `bchacks.ca` at GitHub Pages (four `A` records `185.199.108–111.153`, and `www` as a `CNAME` to `theov06.github.io`). GitHub issues the HTTPS certificate; keep *Enforce HTTPS* on in the repo's Pages settings.

## Forms

### Sponsor form and sign-up → Google Sheet

The sponsor pop-up (name, company, email) saves each lead as a row in a Google Sheet owned by the CSCU Gmail account and emails the team. No database or server: a small Google Apps Script ([backend/sponsor-sheet/Code.gs](backend/sponsor-sheet/Code.gs)) receives the form. The email sign-up (`/apply`, and the hero off-season) uses the same script and adds each address to a "Notify list" tab. The team emails the deck by hand and ticks **Deck sent?** in the sheet.

**One-time setup (signed in as the CSCU Gmail):**

1. Create a Google Sheet, e.g. "BCHacks sponsor leads". *Share* it with the other team members' Gmail addresses as **Editor**.
2. In the sheet: *Extensions → Apps Script*. Replace the editor's contents with [backend/sponsor-sheet/Code.gs](backend/sponsor-sheet/Code.gs). Edit `NOTIFY` (who gets an email per lead, comma-separated) and `SITE_URL` at the top. Save.
3. Choose the `setup` function and press *Run*. Approve the permissions (Google warns that the app is unverified because it's your own script: *Advanced → Go to … (unsafe)*). This creates the "Sponsor leads" and "Notify list" tabs.
4. *Deploy → New deployment → Web app*. Execute as: **Me**. Who has access: **Anyone**. Deploy and copy the web app URL (ends in `/exec`).
5. Paste it into `sponsorForm.sheetUrl` in `frontend/content/site.ts`, then push to deploy the site.
6. Send a test from the site, check the new row and the email, then delete the test row.

After changing the script later: *Deploy → Manage deployments → Edit → Version: New version*, so the same URL keeps working. Anyone who can edit the sheet can edit the script, so keep the editor list to the team. Free Gmail sends up to about 100 script emails a day.

Both forms send for real from `npm run dev` too, so delete test rows.

`siteUrl` in `frontend/content/site.ts` is the real domain (`https://bchacks.ca`). Canonical links, social cards and the sitemap use it.

## Before launch

Search the repo for `CONFIRM` and replace every sample value. Also:

- [ ] Real dates, deadline, venue building and apply URL
- [ ] Real sponsors and logos, form links
- [ ] Google Sheet script deployed and `sponsorForm.sheetUrl` filled in (see Forms)
- [ ] `applyMode` switched to `open` when applications open
- [ ] Sponsorship packet PDF added at `frontend/public/bchacks-sponsorship-packet.pdf` (or `sponsorPacketUrl` changed)
- [ ] Code of conduct URL, MLH status, land acknowledgement wording checked with UBCO guidance
- [ ] `npm run assets` rerun after the final dates
