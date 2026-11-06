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
    answer: 'Nothing. BCHacks is free to attend.',
  },
  {
    question: 'Who can attend?',
    answer: 'Beginners are welcome.', // CONFIRM eligibility: UBC Okanagan students only, or students from any school? Add it here.
  },
  {
    question: 'Do I need a team or an idea?',
    answer: `No. Come solo and team up at the event, or bring friends. Teams of up to ${teamSize}.`,
  },
  {
    question: "I've never coded. Can I still come?",
    answer: 'Yes. Beginners are welcome, and mentors are there to help.',
  },
  {
    question: 'When do applications close?',
    answer: '{deadline}.',
  },
  {
    question: 'Where is it?',
    answer: 'UBC Okanagan in Kelowna, BC.', // CONFIRM building, then add it here
  },
  {
    question: 'What should I bring?',
    answer: 'A laptop, a charger and your student ID.', // CONFIRM full list
  },
];
