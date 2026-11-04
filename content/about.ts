/**
 * About + Explore copy (v3, docs/bchacks-design-reference-v3). Voice: energetic and bold,
 * short sentences, confirmed facts only. Values in [brackets] are placeholders: CONFIRM.
 */

/** Team size limit. Shown in "You belong here". CONFIRM before launch. */
export const teamSize = '[4]'; // CONFIRM team size

export const about = {
  eyebrow: 'About BCHacks',
  heading: 'Build something real in one weekend.',
  /** Phrase in the heading set in the section accent (mint). */
  highlight: 'one weekend.',
  paragraphs: [
    "BCHacks is UBC Okanagan's student hackathon. For one weekend in November, students team up to turn an idea into something that works: an app, a game, a gadget, a tool.",
    'Bring an idea or find one there. Mentors help you get unstuck, and on Sunday you demo what you built.', // CONFIRM (mentors, Sunday demos)
  ],
  belongHeading: 'You belong here',
  /** Checklist rows; the tick colours cycle aqua, sun, pink, mint. */
  belong: [
    'First hackathon? Perfect. Beginners are welcome.',
    `Come solo or bring a team of up to ${teamSize}.`,
    'Any major, any skill level.', // CONFIRM eligibility wording
    'Free to attend.',
  ],
};

export type HotspotTone = 'sun' | 'pink' | 'sky' | 'mint' | 'coral';

export interface Hotspot {
  label: string;
  href: string;
  tone: HotspotTone;
  /** Dot position over the island picture, in % of its width/height (design reference). */
  x: number;
  y: number;
  /** Which side of the dot the chip sits on. */
  side: 'left' | 'right';
  /** The spot on the island it points at (for the 3D glow in step 2). */
  spot: 'lake' | 'bridge' | 'tent' | 'campfire' | 'quail';
}

export const explore = {
  eyebrow: 'Explore',
  heading: 'Explore the island.',
  highlight: 'the island.',
  lede: 'Each spot is a stop on the journey down this page. Tap one to jump there, drag to tilt the island, and say hi to the quail.',
  islandAlt:
    'The BCHacks island under the northern lights: a lake with a bridge, a pink hack tent, vineyards, a campfire, the quail mascot and the glowing BCHacks logo on the mountain',
  /** Shown only while the interactive 3D island is running (step 2). */
  islandHint: 'Drag to tilt · tap the quail',
  hotspots: [
    { label: 'Gallery · night sky', href: '#gallery', tone: 'sun', x: 49.6, y: 73.5, side: 'right', spot: 'lake' },
    { label: 'Schedule · Myra Canyon', href: '#schedule', tone: 'pink', x: 38, y: 60, side: 'left', spot: 'bridge' },
    { label: 'Sponsors · the wineries', href: '#sponsors', tone: 'sky', x: 63.5, y: 64, side: 'right', spot: 'tent' },
    { label: 'Get involved · the lake', href: '#involved', tone: 'mint', x: 21.4, y: 69, side: 'left', spot: 'campfire' },
    { label: 'FAQ · below the surface', href: '#faq', tone: 'coral', x: 31.5, y: 81, side: 'left', spot: 'quail' },
  ] satisfies Hotspot[],
};
