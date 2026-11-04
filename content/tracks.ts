// v3.1 (spec 0.8.2): not rendered. The night-sky section shows past photos (content/gallery.ts) instead.
/**
 * Tracks (v3). Tracks and prizes are not announced yet, so every card is a placeholder:
 * CONFIRM each name, line and prize before launch. Never invent tracks.
 */
export type TrackTone = 'coral' | 'sun' | 'aqua' | 'mint';

export interface Track {
  name: string;
  summary: string;
  prize: string;
  tone: TrackTone;
}

export const tracksIntro = {
  eyebrow: 'Tracks',
  heading: 'Pick a star. Build anything.',
  highlight: 'Build anything.',
  lede: 'Every project can enter a track. Tracks and prizes are announced soon.',
};

export const tracks: Track[] = [
  { name: '[Track name]', summary: '[One line on what to build in this track.]', prize: '[TBA]', tone: 'coral' }, // CONFIRM
  { name: '[Track name]', summary: '[One line on what to build in this track.]', prize: '[TBA]', tone: 'sun' }, // CONFIRM
  { name: '[Track name]', summary: '[One line on what to build in this track.]', prize: '[TBA]', tone: 'aqua' }, // CONFIRM
  { name: '[Track name]', summary: '[One line on what to build in this track.]', prize: '[TBA]', tone: 'mint' }, // CONFIRM
];
