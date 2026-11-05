/**
 * Site config — the one file organizers edit for event facts and site state.
 * Anything marked CONFIRM is sample data. Replace it before launch.
 */

/**
 * Site state controls the hero, the nav button and the /live link.
 * - offseason: email sign-up instead of Apply ("Get notified when applications open")
 * - open:      Apply button live, deadline shown
 * - closed:    hero says applications are closed, sign-up for next year
 * - live:      hero shows a "Live now" link to /live
 */
export type SiteState = 'offseason' | 'open' | 'closed' | 'live';

/**
 * Where Apply buttons go while site.state is 'open' (v3.1).
 * - soon: every Apply button goes to /apply ("Applications will open soon" + email sign-up)
 * - open: buttons go straight to applyUrl, and /apply redirects there
 */
export type ApplyMode = 'soon' | 'open';

export interface Notice {
  /** ISO date, shown next to the notice (every status notice is dated). */
  date: string;
  label: string;
  text: string;
  href?: string;
  linkLabel?: string;
  opensSponsorForm?: boolean;
  /** Only show the notice in these site states (so it can't contradict the hero). */
  showIn: SiteState[];
}

export const site = {
  state: 'open' as SiteState,
  applyMode: 'soon' as ApplyMode,

  name: 'BCHacks',
  year: 2026,
  edition: 'BCHacks 2026',
  tagline: 'One weekend. One idea. Build it in the Okanagan.',

  /** Hero copy (docs/bchacks-design-reference). Each line is one visual line of the h1; `highlight` is set in sun yellow. */
  hero: {
    //eyebrow: '',
    headline: ['Define the', "valley's next", 'big idea.'],
    highlight: "valley's next",
    lede: "Introducing BC Hacks '26, the 7th edition of the annual student hackathon run by our Computer Science Course Union (CSCU)", // CONFIRM wording ("from across the Okanagan and beyond")
  },
  /** /apply while applyMode is 'soon' (v3.1). `highlight` is set in sun yellow. */
  applyPage: {
    heading: 'Applications will open soon.',
    highlight: 'open soon.',
    lede: "Leave your email and we'll tell you the moment they open.",
    signupLabel: 'Your email',
  },
  description:
    "BCHacks is UBC Okanagan's student hackathon: one weekend to build something real in Kelowna, BC. Free to attend. Beginners welcome.",

  // Dates confirmed Nov 2, 2026: Nov 27–29, 2026; applications close Nov 18, 2026.
  startDate: '2026-11-27T10:00:00-08:00', // CONFIRM start time
  endDate: '2026-11-29T17:00:00-08:00', // CONFIRM end time
  datesLabel: 'November 27–29, 2026',
  /** Short form for tight spots (hero data blocks on phones). */
  datesShort: 'Nov 27–29, 2026',
  deadline: '2026-11-18T23:59:00-08:00', // CONFIRM time of day
  deadlineLabel: 'Apply by Nov 18, 2026',
  /** Long form for sentences (FAQ). */
  deadlineLong: 'November 18, 2026',
  /** Shown in the hero facts. Confirmed: BCHacks is free to attend. */
  costLabel: 'Free',

  venue: {
    name: 'UBC Okanagan', // CONFIRM building
    building: 'Engineering, Management & Education Building (EME)', // CONFIRM
    address: '1137 Alumni Ave, Kelowna, BC V1V 1V7',
    cityLabel: 'Kelowna, BC',
    mapsUrl: 'https://maps.google.com/?q=UBC+Okanagan+EME+Building',
  },

  // Links — CONFIRM
  siteUrl: 'https://bchacks.ca', // used for canonical + social cards
  applyUrl: 'https://forms.example.com/bchacks-2026-apply', // CONFIRM
  /** Form endpoint for the "Get notified" email sign-up. While empty, the form asks visitors to email contactEmail instead. */
  notifyFormAction: '',
  sponsorPacketUrl: '/bchacks-sponsorship-packet.pdf', // CONFIRM — add the PDF to public/
  codeOfConductUrl: 'https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md', // CONFIRM
  contactEmail: 'cscu.okanagan@gmail.com',
  sponsorEmail: 'cscu.okanagan@gmail.com',

  /**
   * Forms go through Netlify Forms (the site is hosted on Netlify; setup in README "Forms").
   * Off: the forms say they're not switched on yet and point to the contact emails.
   */
  netlifyForms: true,
  /** Sponsor pop-up form (v3.1). */
  sponsorForm: {
    /**
     * The Google Apps Script web app that saves each lead to the team's Google Sheet and
     * emails the team (scripts/sponsor-sheet/Code.gs; setup in README "Sponsor form").
     * The team sends the deck by hand. Empty: the form falls back to Netlify Forms.
     */
    sheetUrl: 'https://script.google.com/macros/s/AKfycbx3pkRc8aVfjEtDBtDJQgXlZ9Xw7RYHSPhziHmqUhlzRDYFpwGUwTEsJ44Q8QfGCoxtgg/exec',
  },
  discordUrl: 'https://discord.gg/bchacks', // CONFIRM

  social: [
    { label: 'Instagram', href: 'https://www.instagram.com/bchacks/', icon: 'instagram' }, // CONFIRM
    // LinkedIn and Discord removed for now.
  ] as const,

  pastEditions: [
    // CONFIRM — add archived sites here, newest first
    { label: 'BCHacks 2025', href: 'https://2025.bchacks.ca' },
  ],

  /** Show the MLH trust badge + code of conduct wording. CONFIRM membership this season. */
  mlhMember: false,
  mlhBadgeUrl: 'https://mlh.io/seasons/2027/events',

  /**
   * The organizing club: "Organized by [logo]" in the header and the band above About.
   * Logo: the CSCU mark (light blue with ".ok" cut out), made for dark backgrounds.
   */
  organizer: {
    name: 'CSCU',
    fullName: 'Computer Science Course Union',
    url: 'https://www.instagram.com/cscu.ok/',
    linkName: 'CSCU on Instagram',
    logo: { src: '/images/brand/cscu-logo.webp', width: 290, height: 160 },
  },

  /** Footer (v3): the lakebed. */
  footer: {
    heading: 'You made it to the bottom. Now come build.',
    highlight: 'Now come build.',
    /** Shown under the heading while applications are open. */
    closesLabel: 'Applications are opening soon!',
    credit: 'Run by Computer Science Course Union (CSCU) at UBC Okanagan.',
  },

  landAcknowledgement:
    'UBC Okanagan is on the traditional, ancestral and unceded territory of the Syilx Okanagan Nation.', // CONFIRM wording with UBCO guidance

  /** Optional dated banner above the header. Set to null to hide. */
  notice: {
    date: '',
    label: '',
    text: 'Sponsor us for BCHacks 2026. Contact us to get involved.',
    href: '/#sponsors', // opens the sponsor pop-up form; without JS, the home page's sponsors section
    opensSponsorForm: true,
    linkLabel: 'Learn more',
    showIn: ['open'],
  } as Notice | null,
};

export type Site = typeof site;
