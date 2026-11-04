# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro + TypeScript, static output. Confirmed by the user; also the spec's recommendation (docs/DESIGN_SPEC.md, T2). Components are TSX function components rendered at build time (confirmed by the user, Nov 2, 2026); no React runs in the browser.

## Users

In priority order (confirmed):

1. **Prospective student hackers** deciding whether to apply. They need date, place, cost and eligibility fast, usually on a phone.
2. **First-time hackers** who need reassurance that no team, idea or experience is required.
3. **Sponsors** weighing whether to fund the event. They need audience, tiers and a contact.
4. **Mentors, judges and volunteers** looking for a role and a sign-up form.
5. **Accepted hackers on event day**, using the live page on phones in a busy room.

## Product Purpose

The website for BCHacks, UBC Okanagan's student hackathon. It is the first experience of the event, so it should feel designed rather than templated while keeping the structure every top hackathon site shares.

Success: a first-time visitor finds the date, place, deadline and Apply within one phone screen (G1); beginners feel welcome (G3); sponsors and judges have their own clear path (G4).

## Positioning

The Okanagan's own student hackathon: rooted in the valley and in the logo's isometric "bc" monogram. Other hackathons can't credibly claim that sense of place.

## Operating Context

- Most visits come from shared links (Discord, Instagram, iMessage), so the social preview card matters.
- Organizers are students who change dates, sponsors and FAQ between seasons without touching layout code (G6).
- The site runs through four states in a year: offseason, applications open, applications closed, and live during the event.

## Capabilities and Constraints

- One config value switches the site state (offseason / open / closed / live).
- All event content lives in `content/*.ts`.
- Pre-rendered HTML that works without JavaScript; fast on a mid-range phone (G5, T5).
- **Confirmed facts:** the edition is **BCHacks 2026**. It runs **November 27–29, 2026** (Friday to Sunday) at UBC Okanagan in Kelowna, BC. Applications close **November 18, 2026**. It is free to attend. (Dates and deadline confirmed by the user on Nov 2, 2026.)
- **Undecided:** whether students from other schools can attend; whether BCHacks is an MLH member event this season. Also not yet set: start and end times, the deadline's time of day, venue building, schedule, stats (including total hacking hours), tracks, prizes, sponsors, apply platform, domain.

## Brand Commitments

- **Logo:** the isometric "bc" monogram in `logo.jpg` (shape unchanged), recoloured in the Sky Circuit gradient #B5ECFF → #84DBF7 → #3B82F6; on light backgrounds #1E7FB8 → #1D4ED8 (spec 6B).
- **Design concept:** "Sky Circuit · Tiny Okanagan" (confirmed Nov 2, 2026, with desktop and mobile hero mockups as the visual target). The tokens and rules in docs/DESIGN_SPEC.md section 3 are binding. Mascot: a California quail. Never the Ogopogo (Syilx sacred figure).
- **Voice:** energetic and bold (confirmed). Confident and high-energy, but still clear: short sentences, no unconfirmed claims, and still welcoming to first-timers.

## Evidence on Hand

- `logo.jpg` (official logo raster).
- docs/DESIGN_SPEC.md and docs/WEB_DESIGN_STUDY.md (the team's spec and research).
- No confirmed 2026 numbers, sponsors, testimonials or event photos yet. Content values marked `CONFIRM` are samples. Do not invent stats, testimonials or sponsor names.

## Product Principles

1. **Hackers first.** Every page answers the prospective hacker's questions before anyone else's.
2. **Essentials before decoration.** Date, place, cost and Apply are never delayed or hidden by theming.
3. **Bold, but honest.** High energy in tone; only confirmed facts and numbers.
4. **Rooted in the valley.** Identity comes from the Okanagan and the logo, not from generic hackathon tropes.
5. **Organizer-editable.** Content changes never require layout changes.

## Accessibility & Inclusion

WCAG 2.2 AA. Respect reduced motion. A land acknowledgement of the Syilx Okanagan Nation in the footer; confirm the wording with UBCO guidance.
