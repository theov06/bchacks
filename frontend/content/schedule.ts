/**
 * Schedule (v3): three days, one card each. Times are not confirmed yet: every '[Time]'
 * is a placeholder. CONFIRM all times (and the items) before launch.
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
  lede: 'Friday to Sunday, November 27–29 at UBC Okanagan. Exact times are coming soon.',
};

export const schedule: ScheduleDay[] = [
  {
    day: 'Fri',
    date: 'Nov 27',
    iso: '2026-11-27',
    title: 'Kick-off',
    tone: 'coral',
    items: [
      { time: 'All day', title: 'Coming Soon' }, // CONFIRM
      //{ time: '[Time]', title: 'Sponsor welcome' }, // CONFIRM
      //{ time: '[Time]', title: 'Hacking starts' }, // CONFIRM
    ],
  },
  {
    day: 'Sat',
    date: 'Nov 28',
    iso: '2026-11-28',
    title: 'Build day',
    tone: 'sun',
    items: [
      { time: 'All day', title: 'Coming Soon' }, // CONFIRM
      //{ time: 'All day', title: 'Mentor hours' }, // CONFIRM
      //{ time: '[Time]', title: 'Evening activity' }, // CONFIRM
    ],
  },
  {
    day: 'Sun',
    date: 'Nov 29',
    iso: '2026-11-29',
    title: 'Demo day',
    tone: 'aqua',
    items: [
      { time: 'All day', title: 'Coming Soon' }, // CONFIRM
      //{ time: '[Time]', title: 'Demos and judging' }, // CONFIRM
      //{ time: '[Time]', title: 'Closing and awards' }, // CONFIRM
    ],
  },
];
