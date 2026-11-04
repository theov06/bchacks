import type { ReactNode } from 'react';
import { cx } from '../../lib/ui';
import styles from './SectionHead.module.css';

export interface SectionHeadProps {
  /** id of the h2, referenced by the section's aria-labelledby. */
  id: string;
  /** Small mono label above the heading. */
  eyebrow?: string;
  title: string;
  /** A word or phrase inside `title` to set in the section's accent colour. */
  highlight?: string;
  lede?: ReactNode;
  className?: string;
}

/** Splits a heading around its highlighted phrase. Exported for other headings (hero, closing). */
export function Highlight({ text, phrase }: { text: string; phrase?: string }) {
  const at = phrase ? text.indexOf(phrase) : -1;
  if (!phrase || at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="sky-text">{phrase}</span>
      {text.slice(at + phrase.length)}
    </>
  );
}

/**
 * The page's heading rhythm (v3), used by every section: mono eyebrow, h2 with one
 * highlighted phrase in the section's --accent, then the lede.
 */
export function SectionHead({ id, eyebrow, title, highlight, lede, className }: SectionHeadProps) {
  return (
    <>
      <div className={cx(styles.head, className)}>
        {eyebrow && (
          <p className="eyebrow" aria-hidden="true">
            {eyebrow}
          </p>
        )}
        <h2 id={id} className={styles.title}>
          <Highlight text={title} phrase={highlight} />
        </h2>
      </div>
      {lede && <p className={styles.lede}>{lede}</p>}
    </>
  );
}

export default SectionHead;
