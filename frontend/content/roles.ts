/** Get involved (v3): mentor / judge / volunteer. Leave formUrl empty until that role's form exists (the card shows "Coming soon"); then put the form's URL here. */
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
  // {contactEmail} and [label](url) are filled in by src/lib/richText.ts. Drop the second sentence once the mentor and judge forms are live.
  lede: "Mentors, judges and volunteers keep the weekend afloat. Applications for mentors and judges open soon. Until then, if you'd like to mentor or judge, kindly email us at [{contactEmail}](mailto:{contactEmail}).",
};

export const roles: Role[] = [
  {
    title: 'Mentor',
    description: 'Help teams get unstuck on code, hardware or design.',
    formUrl: '', // empty = "Coming soon" until the mentor form is ready (CONFIRM)
    cta: 'Apply to mentor',
    tone: 'aqua',
    icon: 'bulb',
  },
  {
    title: 'Judge',
    description: "See Sunday's demos first and pick the winners.",
    formUrl: '', // empty = "Coming soon" until the judge form is ready (CONFIRM)
    cta: 'Apply to judge',
    tone: 'sun',
    icon: 'star',
  },
  {
    title: 'Volunteer',
    description: 'Run check-in, food and the help desk.',
    formUrl: '', // empty = "Coming soon" until the volunteer form is ready (CONFIRM)
    cta: 'Volunteer',
    tone: 'coral',
    icon: 'heart',
  },
];
