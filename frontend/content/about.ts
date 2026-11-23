/**
 * About + Explore copy (v3, docs/bchacks-design-reference-v3). Voice: energetic and bold,
 * short sentences, confirmed facts only. Values in [brackets] are placeholders: CONFIRM.
 */

/** Team size. Shown in the FAQ. */
export const teamSize = '5–6';

export const about = {
  eyebrow: 'About BCHacks',
  heading: 'Build something real in one weekend.',
  /** Phrase in the heading set in the section accent (mint). */
  highlight: 'one weekend.',
  paragraphs: [
    "BCHacks is UBC Okanagan's student hackathon. For one weekend in November, students team up to turn an idea into something that works: an app, a game, a gadget, a tool.",
    'Bring an idea or find one there. Mentors help you get unstuck, and on Sunday you demo what you built.', // CONFIRM (mentors, Sunday demos)
  ],
  /** "Who it's for": under the intro paragraphs, one row per audience. */
  audienceHeading: "Who it's for",
  audienceLede: 'You! All skill levels are welcome and encouraged.',
  audience: [
    { label: 'CS and Data Science', text: 'Build a full tech project in one weekend and grow your network.' },
    { label: 'Engineering', text: "Compete in engineering tracks run with UBCO's engineering clubs." },
    { label: 'Business', text: 'Learn how tech products are built, and help lead one.' },
  ],
  belongHeading: 'The essentials',
  /** Checklist rows; the tick colours cycle aqua, sun, pink, mint. */
  belong: [
    'Free to attend, with all meals included',
    'Open to everyone in the tech community, UBC and non-UBC students alike',
    '$3,500+ in prizes, plus interviews with sponsors for the winners',
    "Bring your friends, or come solo and we'll put you on an awesome team",
    'Bring a laptop, a charger and your hype',
  ],
};

/** Colour tokens for the hotspot dots, one per place (tokens.css). */
export type HotspotTone = 'sun' | 'wood' | 'vine' | 'sky' | 'faq-edge';

export interface Hotspot {
  /** The place, shown on the chip. */
  label: string;
  /** The section it jumps to; read out by screen readers after the place, not shown. */
  section: string;
  href: string;
  tone: HotspotTone;
  /** Dot position over the island picture, in % of its width/height (design reference). */
  x: number;
  y: number;
  /** Which side of the dot the chip sits on. */
  side: 'left' | 'right';
  /** The spot on the island it points at (for the 3D glow in step 2). */
  spot: 'sky' | 'bridge' | 'vineyard' | 'lake' | 'water';
}

export const explore = {
  eyebrow: 'Explore',
  heading: 'Explore the island.',
  highlight: 'the island.',
  lede: 'Each spot is a stop on the journey down this page. Tap one to jump there, drag to tilt the island, and say hi to the quail.',
  /** Phones show the stops as swipeable postcards instead of the island, so they get their own heading and lede. */
  phone: {
    heading: 'Explore the journey.',
    highlight: 'the journey.',
    lede: 'Swipe through the stops on the way down this page. Tap one to jump there.',
  },
  islandAlt:
    'The BCHacks island under the northern lights: a lake with a bridge, a pink hack tent, vineyards, a campfire, the quail mascot and the glowing BCHacks logo on the mountain',
  hotspots: [
    // Dot colours follow each place: starlight, canyon wood, vines, lake sky blue, deep water.
    // Each dot sits on its place in island.png: the sky above the mountain, the trestle bridge,
    // the vineyard rows, the lake, and the water around the island.
    { label: 'Night sky', section: 'Gallery', href: '#gallery', tone: 'sun', x: 22, y: 4, side: 'right', spot: 'sky' },
    { label: 'Myra Canyon', section: 'Schedule', href: '#schedule', tone: 'wood', x: 36, y: 63, side: 'left', spot: 'bridge' },
    { label: 'The wineries', section: 'Sponsors', href: '#sponsors', tone: 'vine', x: 72, y: 80, side: 'right', spot: 'vineyard' },
    { label: 'Okanagan Lake', section: 'Get involved', href: '#involved', tone: 'sky', x: 45, y: 73, side: 'right', spot: 'lake' },
    { label: 'Below the surface', section: 'FAQ', href: '#faq', tone: 'faq-edge', x: 8, y: 90, side: 'right', spot: 'water' },
  ] satisfies Hotspot[],
};
