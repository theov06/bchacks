import { cx } from '../../lib/ui';
import { Icon } from './Icon';
import styles from './Placeholder.module.css';

export interface PlaceholderProps {
  title: string;
  text?: string;
  href?: string;
  linkLabel?: string;
}

/** Themed "Coming soon" card: a dashed hexagon with a moon on the blueprint. Never a grey box or "TBD". */
export function Placeholder({ title, text, href, linkLabel = 'Learn more' }: PlaceholderProps) {
  return (
    <div className={cx('card', styles.placeholder)}>
      <span className={styles.mark} aria-hidden="true">
        <svg viewBox="0 0 100 115" className={styles.hex}>
          <polygon points="50,1 99,29 99,86 50,114 1,86 1,29" />
        </svg>
        <Icon name="moon" size={30} />
      </span>
      <div>
        <p className={styles.title}>{title}</p>
        {text && <p className={styles.text}>{text}</p>}
        {href && (
          <a className={styles.link} href={href}>
            {linkLabel}
          </a>
        )}
      </div>
    </div>
  );
}

export default Placeholder;
