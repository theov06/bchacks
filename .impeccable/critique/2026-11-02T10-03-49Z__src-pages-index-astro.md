---
target: home page
total_score: 25
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\vovan\\OneDrive\\Desktop\\BCHacks\\src\\pages\\index.astro"
target_fingerprint: "sha256:7a97f1775c78a5b33b6e2444e88dc3fd2374ad9146cf8a76533fe022bcd0f922"
target_path: "C:\\Users\\vovan\\OneDrive\\Desktop\\BCHacks\\src\\pages\\index.astro"
timestamp: 2026-11-02T10-03-49Z
slug: src-pages-index-astro
closed: true
---
Method: dual-agent (A: design review · B: detector + browser evidence)

## Design Health Score (25/36, Good; heuristic 7 n/a)
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Dated notice, deadline row, active nav; no countdown |
| 2 | Match with the real world | 3 | Schedule lede "Two days" contradicts Nov 27–29 |
| 3 | User control and freedom | 3 | Apply leaves site with no expectation set |
| 4 | Consistency and standards | 3 | Notice says applications open but links to FAQ |
| 5 | Error prevention | 2 | Eligibility buried; unconfirmed stats; demo sign-up fakes success |
| 6 | Recognition rather than recall | 3 | Track summaries vague; prizes hidden behind toggles |
| 7 | Flexibility and efficiency | n/a | Persuade landing page |
| 8 | Aesthetic and minimalist design | 3 | Bottom half visually flat; placeholder sponsor tiers |
| 9 | Error recovery | 2 | Demo sign-up confirmation claims success when nothing was sent |
| 10 | Help and documentation | 3 | Real 12-question FAQ, contact email |

## Design Specificity Verdict
Hero → Stats is authored for BCHacks (ridge/reading edges, monogram behind hills, 30° ladder, honeycomb). Schedule → Footer loses the landscape: flat night panels, chamfer is the only identity; the dusk stalls ~55% down. Detector: 33 findings across scans, 1 confirmed tension (section tonal gradients vs D2 "flat colours" wording); the rest pinned by the brief or static-engine misreads. Overlay not run (no mutable browser automation).

## Priority Issues
- [P1] No closing call to action; the dusk ends flat. Fix: closing night-ridge band with deadline + Apply, state-driven. /impeccable bolder
- [P1] Unconfirmed facts shown as fact: CONFIRM stats visible; "Two days" hard-coded in ScheduleSection.tsx; sample sponsor logos. /impeccable harden
- [P2] Tracks hide prizes and real descriptions behind six toggles; slogans as summaries. /impeccable clarify
- [P2] Header Apply hidden below 380px; notice link goes to FAQ; phone "Sponsor us" nearly as heavy as Apply. /impeccable adapt
- [P3] Hero monogram cropped into slabs by the front hill. /impeccable polish

## Persona Red Flags
- Jordan: eligibility not visible; "24 hours" vs Fri–Sun dates; no Apply after FAQ.
- Riley: demo sign-up fakes success; stats "expected" after event; long track names vs toggle; stat labels wrap to 3 lines; FAQ jump links orphan "Day-of".
- Casey: no header Apply at 375px; 7-item menu top-right; one tap per track for prizes.
- Priya (sponsor lead): "Sample A/B/C" and "Your logo here" read as no sponsors; audience numbers unconfirmed; no sponsor email near the CTA.

## Minor Observations
Hero tagline column narrow on desktop; mono uppercase labels drift toward eyebrows; schedule key moments unmarked; FAQ starfield nearly invisible; About paragraph 2 long for the voice.

## Questions to Consider
- What is the moment of nightfall, and could the footer be the payoff?
- Should the sponsor wall exist before any sponsor is confirmed?
- Does the full hour-by-hour schedule earn ~900px on a persuasion page?
- Why is the monogram half-buried instead of being the anchor?
