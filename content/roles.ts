/** Get involved (v3): mentor / judge / volunteer. Form URLs CONFIRM. */
export interface Role {
  title: string;
  description: string;
  formUrl: string;
  cta: string;
  tone: 'aqua' | 'sun' | 'coral';
  icon: 'bulb' | 'star' | 'heart';
}

export const rolesIntro = {
  eyebrow: 'Get involved',
  heading: 'Not hacking? Hop in the boat.',
  highlight: 'Hop in the boat.',
  lede: 'Mentors, judges and volunteers keep the weekend afloat.',
};

export const roles: Role[] = [
  {
    title: 'Mentor',
    description: 'Help teams get unstuck on code, hardware or design.',
    formUrl: 'https://forms.example.com/bchacks-mentor', // CONFIRM
    cta: 'Apply to mentor',
    tone: 'aqua',
    icon: 'bulb',
  },
  {
    title: 'Judge',
    description: "See Sunday's demos first and pick the winners.",
    formUrl: 'https://forms.example.com/bchacks-judge', // CONFIRM
    cta: 'Apply to judge',
    tone: 'sun',
    icon: 'star',
  },
  {
    title: 'Volunteer',
    description: 'Run check-in, food and the help desk.',
    formUrl: 'https://forms.example.com/bchacks-volunteer', // CONFIRM
    cta: 'Volunteer',
    tone: 'coral',
    icon: 'heart',
  },
];
