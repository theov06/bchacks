/** Event-day page (/live). Every announcement is dated. All CONFIRM. */
export interface Announcement {
  date: string; // ISO date-time
  title: string;
  body: string;
}

export const live = {
  wifi: { network: 'ubcvisitor', password: 'No password — accept the terms page', note: 'Eduroam also works if your school supports it.' },
  venueMap: {
    image: '', // e.g. '/live/venue-map.webp' — leave empty to show the placeholder
    alt: 'Floor plan of the EME building showing hacking rooms, food, the quiet room and the hardware desk.',
  },
  rooms: [
    { name: 'Hacking', where: 'EME 1st & 2nd floor' },
    { name: 'Food and help desk', where: 'EME atrium' },
    { name: 'Hardware library', where: 'EME 1162' },
    { name: 'Quiet room', where: 'EME 2181' },
    { name: 'Ceremonies', where: 'EME 050' },
  ],
  judging: [
    'Submit your project on Devpost by 11:00 on Sunday. Late submissions cannot be judged.',
    'Each team gets a table at the expo and about 5 minutes with each judge.',
    'Projects are scored on usefulness, technical work, design and presentation.',
    'Track prizes are judged separately; choose up to two tracks when you submit.',
  ],
  devpostUrl: 'https://bchacks-2027.devpost.com', // CONFIRM
  /** Newest is shown first. Example: { date: '2026-11-27T18:00:00-08:00', title: 'Hacking has started', body: '…' } */
  announcements: [] as Announcement[],
};
