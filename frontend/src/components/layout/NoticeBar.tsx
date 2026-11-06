import { site } from '../../../content/site';
import { formatDate } from '../../lib/richText';
import { cx } from '../../lib/ui';
import styles from './NoticeBar.module.css';

export interface NoticeBarProps {
  /** On the home page a notice that only points at the hero (#top) repeats what the hero already says. */
  isHome?: boolean;
}

/** Dated status notice above the header (every notice is dated, spec 7). Renders nothing when off. */
export function NoticeBar({ isHome = false }: NoticeBarProps) {
  const n = site.notice && site.notice.showIn.includes(site.state) ? site.notice : null;
  if (!n) return null;
  if (isHome && n.href && /(^|\/)#top$/.test(n.href)) return null;
  return (
    <div className={styles.notice} data-notice role="region" aria-label="Announcement">
      <p className={cx('container', styles.inner)}>
        <span className={cx('mono', styles.date)}>{n.label}</span>
        <span>{n.text}</span>
        {n.href && (
          <a href={n.href} data-sponsor-open={n.opensSponsorForm ? '' : undefined}>
            {n.linkLabel ?? 'Details'}
          </a>
        )}
      </p>
    </div>
  );
}

export default NoticeBar;
