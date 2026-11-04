/**
 * Stats strip. Only show confirmed numbers: set `visible: false` on anything
 * not confirmed. If no stat is visible, the whole section is hidden.
 */
export interface Stat {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  visible: boolean;
}

export const stats: Stat[] = [
  // Hidden until confirmed (Nov 2, 2026). Flip `visible` to true once a number is real.
  { label: 'hours of building', value: 24, visible: false }, // CONFIRM — the event runs Fri–Sun
  { label: 'hackers expected', value: 200, suffix: '+', visible: false }, // CONFIRM
  { label: 'in prizes', value: 5000, prefix: '$', suffix: '+', visible: false }, // CONFIRM
  // "$0 to attend" is not shown here: the hero already says "Cost: Free".
  { label: 'cost to attend', value: 0, prefix: '$', visible: false },
];
