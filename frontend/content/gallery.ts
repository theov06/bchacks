/**
 * Past photos (#gallery, v3.1 spec 0.8.2): polaroids on strings of fairy lights.
 *
 * Files live in public/images/past/ as <name>-<width>.avif / .webp (made from the team's
 * originals in docs/originals/Past photos/). `widths` lists the sizes that exist; the largest is the
 * full photo shown in the lightbox. `width`/`height` are the largest file's pixel size.
 *
 * The team confirms everyone shown agrees to be on the site. Every photo needs alt text
 * that says what's happening (not "photo of…"). Set `src: null` for a "Photo coming soon"
 * frame. Captions read "[year] · [what's happening]"; the year is left out while null.
 */
export interface GalleryPhoto {
  /** Base name in public/images/past/, or null for a "Photo coming soon" frame. */
  src: string | null;
  widths: number[];
  width: number;
  height: number;
  alt: string;
  caption: string;
  year: number | null;
  /** Which part stays in the polaroid's 4:3 crop (CSS object-position). The lightbox shows the whole photo. */
  focus?: string;
}

export const galleryIntro = {
  eyebrow: 'Past BCHacks',
  heading: 'Memories under the stars.',
  highlight: 'under the stars.',
  lede: 'A look back at past BCHacks weekends.',
};

/** In order along the strings: the first half hangs on the top string on desktop. CONFIRM every year and caption. */
export const gallery: GalleryPhoto[] = [
  {
    src: 'demo-showcase',
    widths: [480, 960, 1154],
    width: 1154,
    height: 769,
    alt: 'A presenter on stage in a lecture hall, with project ideas on the big screen, while students watch from rows of desks with their laptops open.',
    caption: 'Ideas on the big screen',
    year: null,
  },
  {
    src: 'certificates',
    widths: [480, 960, 1412],
    width: 1412,
    height: 769,
    alt: 'Four students hold up certificates and smile, with a host on each side, in front of Coding Club and IDS banners.',
    caption: 'Certificates in hand',
    year: null,
  },
  {
    src: 'hosts',
    widths: [480, 513],
    width: 513,
    height: 769,
    alt: 'Two hosts with microphones address the room, one reading from a sheet of paper, under the projector screen.',
    caption: 'Hosts on the mic',
    year: null,
    focus: '50% 30%',
  },
  {
    src: 'group-lift',
    widths: [480, 960, 1368],
    width: 1368,
    height: 769,
    alt: 'A laughing group of students lifts one friend sideways across their arms for a photo in front of the event banners.',
    caption: 'One way to pose',
    year: null,
  },
  {
    src: 'fast-track',
    widths: [480, 960, 1368],
    width: 1368,
    height: 750,
    alt: 'Three smiling participants hold up Fast Track Interview certificates and prize cups in a lecture hall.',
    caption: 'Fast Track interviews won',
    year: null,
  },
  {
    src: 'group',
    widths: [480, 960, 1440],
    width: 1440,
    height: 567,
    alt: 'A big group of students and organizers stands together for a group photo in front of the Coding Club and IDS banners.',
    caption: 'The whole crew',
    year: null,
  },
];
