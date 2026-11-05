# BCHacks website

The website for BCHacks, UBC Okanagan's student hackathon. Theme: **Sky Circuit · Tiny Okanagan**: the Okanagan at night as a glowing blueprint, with a toy-like 3D diorama of the valley floating above it (spec: docs/DESIGN_SPEC.md).

Built with [Astro](https://astro.build) and TypeScript, output as plain static HTML (no framework JavaScript is shipped; about 1.5 KB of small scripts in total).

- Full design spec: [docs/DESIGN_SPEC.md](docs/DESIGN_SPEC.md)
- Research it is based on: [docs/WEB_DESIGN_STUDY.md](docs/WEB_DESIGN_STUDY.md)

## Run it

Needs Node 20 or newer.

```bash
npm install
npm run dev       # http://localhost:4321, reloads on save
npm run build     # static site into dist/
npm run preview   # serve dist/ locally
npm run lint      # type-check (astro check)
npm run assets    # regenerate favicons, social card and sample sponsor logos
```

## Edit content (no layout code needed)

Everything organizers change lives in [content/](content/). Anything marked `// CONFIRM` is sample data. Replace it before launch.

| File | What it holds |
|---|---|
| [content/site.ts](content/site.ts) | **Site state**, event name and year, dates, deadline, venue, apply URL, emails, socials, past editions, MLH flag, land acknowledgement, the dated notice bar |
| [content/about.ts](content/about.ts) | About copy, "You belong here" list, optional event photos |
| [content/stats.ts](content/stats.ts) | Stats badges. Set `visible: false` on any number that isn't confirmed |
| [content/tracks.ts](content/tracks.ts) | Tracks, descriptions, prizes, icons |
| [content/schedule.ts](content/schedule.ts) | Two-day schedule. Leave it empty to show the "Coming soon" placeholder |
| [content/sponsors.ts](content/sponsors.ts) | Sponsors by tier (logos go in `public/sponsors/`) and the tier benefits on /sponsor |
| [content/roles.ts](content/roles.ts) | Mentor / Judge / Volunteer cards and form links |
| [content/faq.ts](content/faq.ts) | FAQ, grouped General / Registration / Day-of. Links use `[label](url)` |
| [content/live.ts](content/live.ts) | Event-day page: Wi-Fi, venue map, rooms, judging, dated announcements |

### Site state

Change one line in `content/site.ts`:

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

The email sign-up posts to `notifyFormAction` (for example a Formspree or Mailchimp endpoint). Left empty, it shows a demo confirmation and sends nothing.

## Pages

- `/`: hero, about, stats, tracks, schedule, sponsors, get involved, FAQ
- `/apply`: "Applications will open soon" + email sign-up while `applyMode` is `soon`; redirects to `applyUrl` when `open`
- `/sponsor`: redirects to `/#sponsors` (sponsors now use the pop-up form on every page)
- `/live`: event-day page (no-indexed unless the state is `live`)
- `/404`: "Lost in the valley"
- `/sitemap.xml` and `/robots.txt`: generated from `siteUrl`

## Brand assets

- The logo is traced from `logo.jpg` into straight 30° polygons in [src/components/ui/Logo.tsx](src/components/ui/Logo.tsx), so its outline can draw itself in. If an official SVG appears, replace the two `points` strings there and in `scripts/generate-assets.mjs`.
- `npm run assets` rebuilds `favicon.svg/.ico`, `apple-touch-icon.png`, `icon-192/512.png`, `site.webmanifest` and the 1200×630 `og-image.png`. The social card is rendered in headless Chrome or Edge so it uses the real fonts (set `CHROME_PATH` if neither is found). Rerun it after changing the dates.
- Design tokens (colours, type, chamfers, spacing, grid) are all in [src/styles/tokens.css](src/styles/tokens.css).
- Components are typed `.tsx` function components in [src/components/](src/components/) (`ui/`, `layout/`, `sections/`), each with a `.module.css` file. Astro renders them to plain HTML at build time; none are hydrated, so no React code reaches the browser. Interactivity lives in small scripts in [src/scripts/](src/scripts/). The layout grid is described in [docs/LAYOUT_SYSTEM.md](docs/LAYOUT_SYSTEM.md).

## Deploy

The site is hosted on **Netlify**. Import the repo; [netlify.toml](netlify.toml) sets the build (`npm run build` → `dist`) and the `/sponsor` redirect, and every pull request gets a preview deploy.

## Forms

### Sponsor form → Google Sheet

The sponsor pop-up (name, company, email) saves each lead as a row in a Google Sheet owned by the CSCU Gmail account and emails the team. No database or server: a small Google Apps Script ([scripts/sponsor-sheet/Code.gs](scripts/sponsor-sheet/Code.gs)) receives the form. The team emails the deck by hand and ticks **Deck sent?** in the sheet.

**One-time setup (signed in as the CSCU Gmail):**

1. Create a Google Sheet, e.g. "BCHacks sponsor leads". *Share* it with the other team members' Gmail addresses as **Editor**.
2. In the sheet: *Extensions → Apps Script*. Replace the editor's contents with [scripts/sponsor-sheet/Code.gs](scripts/sponsor-sheet/Code.gs). Edit `NOTIFY` (who gets an email per lead, comma-separated) and `SITE_URL` at the top. Save.
3. Choose the `setup` function and press *Run*. Approve the permissions (Google warns that the app is unverified because it's your own script: *Advanced → Go to … (unsafe)*). This creates the "Sponsor leads" tab.
4. *Deploy → New deployment → Web app*. Execute as: **Me**. Who has access: **Anyone**. Deploy and copy the web app URL (ends in `/exec`).
5. Paste it into `sponsorForm.sheetUrl` in `content/site.ts`, then rebuild and deploy the site.
6. Send a test from the site, check the new row and the email, then delete the test row.

After changing the script later: *Deploy → Manage deployments → Edit → Version: New version*, so the same URL keeps working. Anyone who can edit the sheet can edit the script, so keep the editor list to the team. Free Gmail sends up to about 100 script emails a day.

Without a `sheetUrl`, the sponsor form falls back to Netlify Forms (below).

### Netlify Forms (sign-up)

The email sign-up on `/apply` and in the hero off-season (`notify`) uses [Netlify Forms](https://docs.netlify.com/forms/setup/), switched on by `netlifyForms: true` in `content/site.ts`. Locally (`npm run dev`) it isn't sent: it waits a moment and shows its success message. (The sponsor form does send in dev once `sheetUrl` is set, so delete test rows.)

**One-time setup:** Netlify → *Forms* → enable form detection, then redeploy. Add *Form notifications → Email notification* if the team wants an email per sign-up. Spam is filtered (honeypot + Netlify's filter).

Set `siteUrl` in `content/site.ts` to the real domain first. Canonical links, social cards and the sitemap use it.

## Before launch

Search the repo for `CONFIRM` and replace every sample value. Also:

- [ ] Real dates, deadline, venue building and apply URL
- [ ] Only confirmed stats visible
- [ ] Real tracks and prizes, sponsors and logos, form links
- [ ] Sponsor Google Sheet set up and `sponsorForm.sheetUrl` filled in (see Forms); Netlify Forms enabled for the sign-up
- [ ] `applyMode` switched to `open` when applications open
- [ ] Sponsorship packet PDF added at `public/bchacks-sponsorship-packet.pdf` (or `sponsorPacketUrl` changed)
- [ ] Code of conduct URL, MLH status, land acknowledgement wording checked with UBCO guidance
- [ ] `siteUrl` set to the real domain; `npm run assets` rerun
