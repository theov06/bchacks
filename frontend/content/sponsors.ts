/**
 * Sponsors on the home page (v3.1, spec 0.8.3): "Current sponsors" (large cream sign
 * panels) and "Past sponsors" (smaller panels, grayscale until hover / focus).
 * Logo files: public/images/sponsors/current/ and public/images/sponsors/past/
 * (SVG preferred; raster trimmed to the logo's edges). width/height are the file's
 * pixel size: they set the logo's proportions and keep the layout from shifting.
 */
export type SponsorStatus = 'current' | 'past';
/** Current sponsors are grouped into these rows, in this order (labels in sponsorsIntro.tiers). */
export type SponsorTier = 'title' | 'silver' | 'swag' | 'club';

export interface Sponsor {
  name: string;
  logo: { src: string; width: number; height: number };
  url: string;
  status: SponsorStatus;
  /** Row for a current sponsor. */
  tier?: SponsorTier;
  /** Years they sponsored BCHacks, shown under past logos. Leave empty if unknown. */
  years: number[];
  /** Optional size nudge for logos that look small at the same area (thin lines, lots of air). 1 = default. */
  scale?: number;
  /** Dark artwork: show the logo on a small cream badge so it reads on the dark sponsor board. */
  chip?: boolean;
}

/** Home page sponsors section (v3). */
export const sponsorsIntro = {
  eyebrow: 'Sponsors',
  heading: 'Grown in the valley, backed by builders.',
  highlight: 'backed by builders.',
  currentLabel: 'Current sponsors',
  tiers: [
    { id: 'title', label: 'Title sponsor' },
    { id: 'silver', label: 'Silver sponsor' },
    { id: 'swag', label: 'Swag sponsor' },
    { id: 'club', label: 'Partnering clubs' },
  ] as { id: SponsorTier; label: string }[],
  pastLabel: 'Past sponsors',
  /** The one current-sponsor panel while none is confirmed; opens the sponsor form. */
  firstSponsorLabel: 'Be our 2026 sponsor',
  pitchHeading: 'Want your logo here?',
  pitch: 'Meet student builders from across the Okanagan, run a challenge, and recruit for co-op and new-grad roles.', // CONFIRM
  becomeLabel: 'Become a sponsor',
  packetLabel: 'Sponsor packet (PDF)',
};

/**
 * Confirmed sponsors only. Example current entry:
 *   { name: 'Company', status: 'current', logo: { src: '/images/sponsors/current/company.svg', width: 240, height: 80 }, url: 'https://company.com', years: [2026] },
 */
export const sponsors: Sponsor[] = [
  // 2026 sponsors and partnering clubs (Nov 21, 2026), original colours on the night-sky board.
  { name: 'VaultDrive', status: 'current', tier: 'title', logo: { src: '/images/sponsors/current/vaultdrive.webp', width: 498, height: 47 }, url: 'https://vaultdrive.io', years: [2026] },
  { name: 'SLNGSHOT Growth Studio', status: 'current', tier: 'silver', logo: { src: '/images/sponsors/current/slngshot.webp', width: 168, height: 46 }, url: 'https://slngshot.io/', years: [2026] },
  { name: 'Accuro', status: 'current', tier: 'swag', logo: { src: '/images/sponsors/current/accuro.webp', width: 718, height: 97 }, url: 'https://accuroemr.com/', years: [2026] },
  { name: 'UBCO AI Club', status: 'current', tier: 'club', logo: { src: '/images/sponsors/current/ai-club.webp', width: 356, height: 356 }, url: 'https://www.instagram.com/aiclub.suo/', years: [2026] },
  { name: 'UBCO Motorsports', status: 'current', tier: 'club', logo: { src: '/images/sponsors/current/ubco-motorsports.webp', width: 112, height: 42 }, url: 'https://www.instagram.com/ubcomotorsports/', years: [2026] },
  { name: 'HEAT Robotics', status: 'current', tier: 'club', logo: { src: '/images/sponsors/current/heat-robotics.webp', width: 154, height: 45 }, url: 'https://www.instagram.com/heat.robotics/', years: [2026] },
  // Past sponsors, logos supplied by the team (Nov 4, 2026). CONFIRM years for each.
  { name: 'RBC', status: 'past', logo: { src: '/images/sponsors/past/rbc.webp', width: 443, height: 160 }, url: 'https://www.rbc.com', years: [] },
  { name: 'Cisco', status: 'past', logo: { src: '/images/sponsors/past/cisco.webp', width: 303, height: 160 }, url: 'https://www.cisco.com', years: [] },
  { name: 'TikTok', status: 'past', logo: { src: '/images/sponsors/past/tiktok.webp', width: 114, height: 160 }, url: 'https://www.tiktok.com', years: [] },
  { name: 'Geotab', status: 'past', logo: { src: '/images/sponsors/past/geotab.webp', width: 388, height: 50 }, url: 'https://www.geotab.com', years: [] },
  { name: 'Osler, Hoskin & Harcourt', status: 'past', logo: { src: '/images/sponsors/past/osler.webp', width: 480, height: 135 }, url: 'https://www.osler.com', years: [] },
  { name: 'Accelerate Okanagan', status: 'past', logo: { src: '/images/sponsors/past/accelerate-okanagan.webp', width: 362, height: 160 }, url: 'https://www.accelerateokanagan.com', years: [], scale: 1.35 },
];

/** Benefits per tier (was on the removed /sponsor page; not rendered, kept for the deck). All CONFIRM. */
export const tierBenefits: { tier: string; price: string; perks: string[] }[] = [
  {
    tier: 'Community',
    price: 'In-kind',
    perks: ['Logo on the website', 'Shout-out at the closing ceremony'],
  },
  {
    tier: 'Silver',
    price: '$1,000',
    perks: ['Everything in Community', 'Logo on event T-shirt', 'Distribute swag', 'Send one mentor'],
  },
  {
    tier: 'Gold',
    price: '$2,500',
    perks: ['Everything in Silver', 'Sponsor a track prize', 'Opt-in résumé book', 'Run a workshop'],
  },
  {
    tier: 'Platinum',
    price: '$5,000',
    perks: ['Everything in Gold', 'Speaking slot at opening', 'Booth at the judging expo', 'Judge the finals'],
  },
];
