/**
 * FAQ (v3): the eight questions from the approved design, shown in a grid of <details>.
 * The first `openCount` answers start open. Values in [brackets] are placeholders: CONFIRM.
 * Answers are plain text; wrap a link as [label](url).
 * {contactEmail} and {deadline} are filled in from content/site.ts.
 * The mockup's "[CONFIRM …]" notes are code comments here, not visible text: the visible
 * answer only says what is already true.
 */
import { teamSize } from './about';
export interface FaqItem {
  question: string;
  answer: string;
}

export const faqIntro = {
  eyebrow: 'FAQ',
  heading: 'Questions? Dive in.',
  highlight: 'Dive in.',
  lede: 'Everything below the surface. Something else on your mind? Email [{contactEmail}](mailto:{contactEmail}).',
  openCount: 0, // every answer starts closed
};

export const faq: FaqItem[] = [
  {
    question: 'What is a hackathon?',
    answer: 'A weekend where you team up to build a project from scratch, learn new tools along the way, and show what you made at the end.',
  },
  {
    question: 'How much does it cost?',
    answer: 'Nothing. BCHacks is free to attend, with all meals included.',
  },
  {
    question: 'Who can attend?',
    answer: 'Everyone in the tech community, UBC and non-UBC students alike. All skill levels are welcome.',
  },
  {
    question: 'Do I need a team or an idea?',
    answer: `No. Bring your friends, or come solo and we'll put you on an awesome team. Teams are ${teamSize} people.`,
  },
  {
    question: "I've never coded. Can I still come?",
    answer: 'Yes. Beginners are welcome, and mentors are there to help.',
  },
  {
    question: 'When do applications close?',
    answer: "Applications are open now. We'll announce the closing date soon.", // CONFIRM: put the deadline back as '{deadline}.' once it's set in content/site.ts
  },
  {
    question: 'Where is it?',
    answer: 'UBC Okanagan in Kelowna, BC.', // CONFIRM building, then add it here
  },
  {
    question: 'What should I bring?',
    answer: 'A laptop, a charger and your hype.',
  },
];
