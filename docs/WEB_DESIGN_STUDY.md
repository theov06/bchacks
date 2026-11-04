HACKATHON WEB DESIGN STUDY

Web Themes and UI/UX of World-Class University Hackathons

An analysis of TreeHacks, Hack the North, Cal Hacks, PennApps, HackMIT and Hacktech, with lessons for the BCHacks website at UBC Okanagan.

Prepared by Theo Vo

October 30, 2026

Contents

1. Executive summary

2. Scope and method

3. At a glance

4. Hackathon profiles: TreeHacks, Hack the North, Cal Hacks, PennApps, HackMIT, Hacktech

5. Cross-cutting patterns

6. Recommendations for BCHacks

Sources


## 1. Executive summary

The strongest university hackathon sites treat the website as the first experience of the event, not a brochure. Each one picks a single idea and carries it through every section: TreeHacks builds an illustrated world you scroll through, PennApps boots like an old terminal, and HackMIT hides an admissions puzzle inside its site. The sites that feel weaker use a generic template and let content go stale.

Under the visual theme, the information architecture is almost identical everywhere. A visitor must find the date, location and an apply button within one screen, then see proof (stats, photos, testimonials), then get their doubts answered (FAQ). Good theming decorates this structure; it never replaces it.


```text
Key takeaways for BCHacks 1. Pick one concept rooted in a sense of place (the Okanagan) and apply it to every section, including placeholders and the 404 page. 2. Keep the standard skeleton: hero with date, place, deadline and one primary CTA; stats strip; tracks; sponsors; grouped FAQ. 3. Write the FAQ for first-timers. Cost, teams, skill level and code of conduct are the questions every top site answers. 4. Render real content in the HTML so search engines, link previews and slow phones see it. Two of the six sites showed almost nothing without JavaScript. 5. Budget performance and accessibility from day one: lazy-loaded art, reduced-motion support, real alt text, and a skip link.
```


## 2. Scope and method

Six flagship hackathon sites were reviewed on October 30, 2026. They were chosen for size, reputation and range of design approaches:


| Hackathon | University | Edition reviewed | Scale (self-reported) |
|---|---|---|---|
| TreeHacks | Stanford | TreeHacks 2027 (Feb 12–14, 2027) | 1K+ hackers, 505 universities, $1M+ prizes |
| Hack the North | Waterloo | Hack the North 2026 (Sep 18–20, 2026) | 1,000+ hackers; "Canada's biggest hackathon" |
| Cal Hacks | UC Berkeley | Cal Hacks 12.0 (Oct 24–26, 2025) | 2,000+ hackers, $200,000+ prizes |
| PennApps | UPenn | PennApps XXVII (spring semester) | First US student-run hackathon (2009) |
| HackMIT | MIT | HackMIT 2027 (site) / 2026 event | ~1,200 students flown in |
| Hacktech | Caltech | Hacktech 2026 (Apr 24–26, 2026) | 400+ hackers, 60+ universities (2025) |

Method. Each live page was fetched and its structure, text, navigation, image names, alt text and metadata were analyzed, supported by news coverage and the organizers' own posts. nwHacks (UBC Vancouver) and MHacks (Michigan) were used as background context.

Limitation. The review read page code and content, not rendered screenshots. Colours are reported only where the markup exposes them (for example the theme-color meta tag). Visual impressions of illustration style are inferred from asset names and alt text, and are flagged as such. Hack the North and HackMIT render client-side, so their sections are described from metadata and secondary sources.


## 3. At a glance


| Site | Theme concept | First screen | Signature interaction | Main UX risk |
|---|---|---|---|---|
| TreeHacks | Illustrated "overgrown future" world: landscapes, caves, a hidden door, a white city | Logo, dates, "Apply Now" over layered scenery | Tracks wheel (hover or tap); scroll journey through scenes | Dozens of image layers; heavy page |
| Hack the North | Layered night scene; "dream big" tone | Parallax layers (glow, background, midground, foreground) | Parallax depth; hacker testimonials | Content invisible without JavaScript |
| Cal Hacks | Bold, typographic "world's largest" energy | Dates, CTA, priority and regular deadlines | Scrolling 12-year history timeline | Generic photo alt text |
| PennApps | Retro terminal / CRT boot | ASCII-art logo, "BOOTING PENNAPPS" cursor | Skippable boot sequence | Intro delays content; ASCII needs a label |
| HackMIT | Theme extended into an admissions puzzle | Client-rendered app (no server content) | Hidden puzzle; top 50 solvers auto-admitted | No-JS / SEO blind spot |
| Hacktech | Clean single-page template | Logo, dates, "Hacker Live Site!" CTA | Role-select modal (sponsor / judge) | Stale, contradictory updates |


## 4. Hackathon profiles


### 4.1 TreeHacks (Stanford)

treehacks.com · TreeHacks 2027 · Next.js site


#### Theme and visual language

- Concept: an illustrated world that feels like a rewilded, hopeful future. Asset names and alt text describe layered landscapes, grass, rocks, a cave, an overgrown car resting in grass, a sealed round door behind a waterfall, and a white city of towers and domes hung with greenery (visual style inferred from these).
- The theme reaches every section. Speakers sit inside glowing orbs, a jet tows a banner for the speakers heading, and sponsors appear on a billboard. Even the "Coming soon" placeholders are in-world objects.
- Stats are planted among bushes: 36 hours, 1K+ hackers, 505 universities, 36 sponsors, $1M+ prizes, 378 projects.

#### UI/UX

- Navigation: home, about, tracks, speakers, sponsors, FAQ, plus a link to the 2026 archive site. Short lowercase labels that match the page order.
- Primary CTA: "Apply Now" in the hero, linking to a separate application portal (trunk.treehacks.com).
- Tracks: eight tracks (AI, Cloud AI, Edge AI, Education, Healthcare, Flourishing, Inference, Sustainability) on a wheel. The page tells users to hover or tap, so it works on touch screens.
- FAQ: eight questions written for nervous first-timers: what a hackathon is, who can come, cost (free), code of conduct, "what if I don't know how to code", "what if I don't have a team".
- Accessibility: some meaningful images have descriptive alt text; most decorative layers have empty alt, which is correct if intentional.

#### What works

- One concept, applied everywhere, gives the site a strong identity and rewards scrolling.
- Hover-or-tap wording on the wheel avoids the classic hover-only trap on phones.
- Archive link keeps past editions reachable without cluttering the current page.

#### Watch-outs

- Image weight. The page loads dozens of WebP layers and animation frames. On a phone or slow network this risks slow first paint.
- An illustration-led page needs a reduced-motion mode and careful focus order for keyboard users.

### 4.2 Hack the North (Waterloo)

hackthenorth.com · Hack the North 2026 · client-rendered


#### Theme and visual language

- Brand colours exposed in metadata: a dark navy theme colour (#141425) and a coral tile colour (#f3675a). A dark base with a warm accent.
- The home page uses named depth layers (background glow, background, midground, foreground), which points to a parallax night-scene hero. Earlier Hack the North branding used geometric shapes, stars and trees (designer portfolio, past years).
- Tone: "dream big". The meta description stresses 36 hours of building, mentorship and resources.

#### UI/UX

- Social proof: testimonials with a headshot, name, role and quote from past hackers, plus a partner note from Waterloo Engineering (partner since 2014).
- FAQ: standard accordion starting with "What is Hack the North?".
- Link previews: complete Open Graph and Twitter card tags with a preview image and alt text, so shared links look good.
- Rendering: a plain request returns only metadata; the page content is built in the browser.

#### What works

- Testimonials with faces make the event feel human and lower the barrier for first-timers.
- Careful sharing metadata: most traffic arrives through shared links, and those previews are polished.
- The organizers treat the site as a product. Their design team owns the brand across web, mobile and social.

#### Watch-outs

- Client-only rendering hides content from crawlers, some link unfurlers and very slow connections. Pre-rendering would fix this.

### 4.3 Cal Hacks (UC Berkeley)

calhacks.io · Cal Hacks 12.0 · single long page


#### Theme and visual language

- Concept: scale and confidence. The hero headline claims the "world's largest collegiate hackathon" in big stacked type.
- A gold-framed history timeline ("Our Story – Twelve Years of Hacking") adds a sense of tradition.
- Photography carries the mood: an eight-image strip of real event photos.

#### UI/UX

- Hero: dates (Oct 24–26), a "BECOME A HACKER" CTA, and both the priority and regular deadlines visible on the first screen.
- Belonging message: "You Belong At Cal Hacks" speaks directly to beginners and under-represented hackers before any stats.
- Stats strip: 36 hours, $200,000+ in prizes, 400+ projects, 2,000+ hackers.
- Venue card: venue name, street address and a "Get directions" link.
- Sponsors: a large logo wall, then a separate "partners" row.
- FAQ: grouped into General, Registration and In-Person Logistics, which shortens scanning.

#### What works

- Deadlines in the hero remove the most common question before it is asked.
- Grouped FAQ categories scale well when the FAQ grows past ten questions.
- The venue card with directions is simple and practical.

#### Watch-outs

- Photo alt text is generic ("Event photo 1"). Descriptive alt text would help screen-reader users and image search.
- A very long sponsor wall pushes the FAQ far down the page on mobile.

### 4.4 PennApps (UPenn)

pennapps.com · PennApps XXVII · off-season page


#### Theme and visual language

- Concept: a retro computer booting up. The page opens with an ASCII-art "PENNAPPS" logo and a "BOOTING PENNAPPS" line with a block cursor.
- The theme colour is near-black with a green tint (#0a0f0a), matching a phosphor-screen look.
- This fits PennApps' identity as the original US college hackathon (2009): the theme says "heritage hacker culture".

#### UI/UX

- Skippable intro: "PRESS ANY KEY OR CLICK TO SKIP" gives control to impatient visitors.
- Off-season state: the page states the event is in spring semester and asks for an email to notify visitors when applications open in October.
- Archive: each past edition lives on its own subdomain (for example 2022f.pennapps.com); retired sites point back to the main page.

#### What works

- A cheap, memorable theme: text and a cursor, no heavy assets.
- The off-season email capture turns visitors into a launch-day audience.

#### Watch-outs

- Any intro animation delays content. It should play once per visit and be skipped for users with reduced-motion settings.
- ASCII art reads as noise to screen readers; wrap it with an accessible label such as "PennApps logo".

### 4.5 HackMIT (MIT)

hackmit.org · HackMIT 2027 · client-rendered


#### Theme and visual language

- Concept: the theme becomes a game. Since 2014 HackMIT has released an annual admissions puzzle, and the top solvers (top 50) are admitted automatically.
- Puzzles follow the year's theme. The 2020 "Hack to the Future" puzzle used reverse engineering, CAPTCHAs, secret codes and neural networks; 2018 used a travel theme ("Let's go on a trip!").
- The puzzle is hidden on the site itself, so visitors must explore to find the entry point.

#### UI/UX

- Application: handled on separate portals (past examples: my.hackmit.org, plume.hackmit.org).
- Community: a Discord for puzzle hints and a newsletter with countdown emails ("one week left", "24 hours left").
- Open source: HackMIT publishes its internal tools (judging, help queue, registration) at code.hackmit.org.
- Rendering: a plain request returns only the title "HackMIT 2027"; all content is client-side.

#### What works

- The site creates engagement, not just information: people return and talk about it.
- The puzzle filters for curious, persistent hackers and markets the event at the same time.

#### Watch-outs

- Same no-JS / SEO issue as Hack the North.
- A puzzle must never block basic information. Date, eligibility and the normal application path must stay one click away.

### 4.6 Hacktech (Caltech)

hack.caltech.edu · Hacktech 2026 · static single page (public GitHub repo)


#### Theme and visual language

- Concept: no strong theme. A clean, conventional single page with a hero banner, recap stats and a screenshot gallery.
- Useful as a baseline: it shows what a solid but unthemed hackathon page looks like.

#### UI/UX

- Accessibility: a "Skip to content" link is present, which most flashier sites lack.
- Audience routing: a dismissible modal asks visitors to pick a role (Sponsor or Judge) and shows a tailored pitch and a sponsorship packet link.
- Status banner: a dated "Hacker Updates" notice at the top.
- Navigation: home, about, speakers, sponsors, faq; hero CTA "Hacker Live Site!" for the day-of page.
- Sponsors: tiered (gold, silver), each with logo, link and a one-line description.
- Footer: MLH code of conduct, sponsor packet, application form, organizer interest form, socials, and the MLH trust badge.

#### What works

- Separate paths for hackers, sponsors and judges serve three audiences without clutter.
- A dedicated live site for event day keeps schedules out of the marketing page.

#### Watch-outs

- Stale content: updates dated March 2025 and an FAQ "last updated March 14th, 2025" sit on the 2026 page, alongside "TBD" speaker cards. Stale text erodes trust quickly.
- The application is a Google Form, which breaks the visual experience at the most important step.

## 5. Cross-cutting patterns


### 5.1 Five theme archetypes


| Archetype | Examples | Strength | Cost / risk |
|---|---|---|---|
| Narrative world | TreeHacks, Hack the North | Memorable; rewards scrolling; strong brand | High illustration and dev effort; page weight |
| Retro-tech / terminal | PennApps | Cheap; instantly "hacker" | Can feel cliché; intro delay |
| Puzzle / game | HackMIT | Engagement and word of mouth | Needs puzzle designers; must not block info |
| Bold type + photos | Cal Hacks | Fast to build; real people build trust | Needs good event photos |
| Clean template | Hacktech | Quick, accessible, easy to maintain | Forgettable; no identity |


### 5.2 The shared skeleton

Despite different looks, the section order is nearly the same on every site:


| Section | TreeHacks | HtN | Cal Hacks | PennApps* | HackMIT | Hacktech |
|---|---|---|---|---|---|---|
| Hero: date + CTA | Yes | Yes | Yes | Email form | n/a | Yes |
| Stats strip | Yes | – | Yes | – | n/a | Yes |
| Tracks / themes | Yes | – | – | – | n/a | Yes |
| Speakers | Yes | – | – | – | n/a | Yes |
| Testimonials / photos | – | Yes | Yes | – | n/a | Gallery |
| Sponsors (tiered) | Yes | Yes | Yes | – | n/a | Yes |
| FAQ | Yes | Yes | Grouped | – | n/a | Yes |
| Past-year archive | Yes | – | Timeline | Subdomains | Yes | GitHub |

* PennApps was in its off-season state. "–" means not seen in the content reviewed; "n/a" means the page could not be read without JavaScript.


### 5.3 UI/UX practices worth copying

- Everything critical above the fold. Date, place, deadline and one primary CTA (Cal Hacks does this best).
- Numbers as proof. A short stats strip (hours, hackers, prizes, projects) appears on almost every site.
- Beginner-first FAQ. All sites answer cost, eligibility, team formation, skill level and code of conduct.
- Themed empty states. TreeHacks turns "Coming soon" into part of the world instead of a grey box.
- Audience routing. Hacktech separates hacker, sponsor and judge paths.
- Touch-aware interactions. TreeHacks' wheel works with hover or tap.
- Off-season capture. PennApps collects emails while applications are closed.
- Shareable links. Open Graph and Twitter card images are set up on every major site.

### 5.4 Common pitfalls

- Client-only rendering (Hack the North, HackMIT): crawlers and slow devices see an empty page.
- Heavy illustration payloads without a clear performance budget.
- Generic or missing alt text on meaningful images.
- Stale or contradictory status text, and "TBD" placeholders left for months.
- Leaving the brand at the most important moment: a plain Google Form for applications.

## 6. Recommendations for BCHacks


### 6.1 Three theme directions

Each direction is rooted in UBC Okanagan's setting, the way TreeHacks draws on Stanford's tree and PennApps on its history.


| Direction | Idea | Signature interaction | Effort |
|---|---|---|---|
| A. Valley Layers | Parallax Okanagan landscape: lake, hills, orchards and vineyards, shifting from day to night as you scroll. Stats on buoys or trail markers; sponsors on a lakeside sign. | Time-of-day scroll; tracks as trail markers on a map | High (needs an illustrator) |
| B. Valley OS | Lightweight terminal / desktop metaphor: BCHacks "boots" and each section is a window or app. | Skippable boot; a hidden command for a small easter egg | Low to medium |
| C. Departures | Travel theme: the event is a "flight" from Kelowna. Hero is a departures board; applying is "check-in"; acceptance is a boarding pass. | Split-flap board animation; shareable boarding-pass graphic | Medium |

Whichever direction is chosen, apply it to every section, including the FAQ styling, placeholders, the 404 page and social preview images. UBC Okanagan is on the traditional, ancestral and unceded territory of the Syilx Okanagan Nation; a land acknowledgement in the footer is standard practice for UBCO sites, and any place-based imagery should be handled respectfully.


### 6.2 Must-have UX checklist

- Hero: event name, dates, location (UBC Okanagan, Kelowna), application deadline and one primary button.
- Stats strip (hours, expected hackers, prizes) once numbers are confirmed. Avoid inflated figures.
- Tracks section that works on tap, not just hover.
- FAQ grouped into General, Registration and Day-of logistics, written for first-timers.
- Separate paths for hackers, sponsors (with a sponsorship packet) and volunteers or mentors.
- Sponsors in tiers with logos that link out.
- Code of conduct link in the FAQ and footer.
- Off-season mode: an email sign-up when applications are closed.
- A separate "live" page for event day (schedule, maps, Discord, announcements).
- Archive of past editions, linked from the nav or footer.

### 6.3 Technical and accessibility checklist

- Pre-render content (static export or server rendering) so text and metadata exist in the HTML.
- Set Open Graph and Twitter card tags with a themed preview image.
- Performance budget: compressed WebP/AVIF art, lazy-load anything below the fold, aim for a fast first paint on a mid-range phone.
- Respect prefers-reduced-motion: turn parallax and intro animations off for those users.
- Skip-to-content link, visible focus states, semantic headings, and keyboard-operable accordions.
- Descriptive alt text for meaningful images; empty alt for decoration.
- Colour contrast that meets WCAG AA, especially on illustrated or dark backgrounds.
- Mobile-first layout: test the full page at phone width before desktop.
- Date every status notice and remove "TBD" items before launch.

### 6.4 Suggested next steps

- Choose a direction (A, B or C) with the organizing team.
- Build a one-page mood board and a mobile wireframe of the full skeleton.
- Prototype the hero and one themed section, then test it on a real phone.
- Fill the rest of the sections, then run an accessibility and performance check before launch.

## Sources

- TreeHacks 2027 website
- Hack the North website
- Hack the North 2026 organizer applications
- Cal Hacks website (mirror of calhacks.io)
- PennApps XXVII website
- HackMIT website
- HackMIT open source projects
- HackMIT 2024 admissions puzzle announcement
- HackMIT (Wikipedia)
- Hacktech by Caltech website
- Jenny Wen – Hack the North design work (Dribbble)
- nwHacks coverage, The Ubyssey
- MHacks (Wikipedia)
