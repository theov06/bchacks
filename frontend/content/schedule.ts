/**
 * Schedule (v3): three days, one card each.
 */
export interface ScheduleItem {
  time: string;
  title: string;
  location?: string;
}
export interface ScheduleDay {
  /** Short weekday shown in the pill, e.g. 'Fri'. */
  day: string;
  date: string;
  /** ISO date for <time>. */
  iso: string;
  title: string;
  tone: 'coral' | 'sun' | 'aqua';
  items: ScheduleItem[];
}

export const scheduleIntro = {
  eyebrow: 'Schedule',
  heading: 'One weekend, three days on the trail.',
  highlight: 'three days on the trail.',
  lede: 'Friday to Sunday, November 27–29 at UBC Okanagan.',
};

// Confirmed by the team, Nov 22, 2026.
export const schedule: ScheduleDay[] = [
  {
    day: 'Fri',
    date: 'Nov 27',
    iso: '2026-11-27',
    title: 'Kick-off',
    tone: 'coral',
    items: [
      { time: '6:00 pm', title: 'Doors open + team formation' },
      { time: '6:30 pm', title: 'Kick-off presentation' },
      { time: '7:15 pm', title: 'Team registration' },
      { time: '7:15–8:15 pm', title: 'Dinner' },
      { time: '8:30 pm', title: 'Team bonding challenge + wrap-up' },
    ],
  },
  {
    day: 'Sat',
    date: 'Nov 28',
    iso: '2026-11-28',
    title: 'Build day',
    tone: 'sun',
    items: [
      { time: 'All day', title: 'Build day' },
      { time: 'All day', title: 'Snack drops' },
      { time: '10:00 am', title: 'Breakfast' },
      { time: '6:00 pm', title: 'Dinner' },
    ],
  },
  {
    day: 'Sun',
    date: 'Nov 29',
    iso: '2026-11-29',
    title: 'Demo day',
    tone: 'aqua',
    items: [
      { time: '12:00–12:30 pm', title: 'Submission deadline' },
      { time: '12:45 pm', title: 'First-round demos (all teams)' },
      { time: '2:00 pm', title: 'Second-round demos (finalists)' },
      { time: '3:30 pm', title: 'Closing ceremony' },
    ],
  },
];
