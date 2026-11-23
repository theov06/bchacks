import { site } from '../../../content/site';
import { formatDate } from '../../lib/richText';
import { applyLink } from '../../lib/apply';
import { cx, externalProps } from '../../lib/ui';
import { NewTab } from '../ui/NewTab';
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
  const link = n.apply ? applyLink() : n.href ? { href: n.href, external: /^https?:\/\//.test(n.href) } : null;
  return (
    <div className={styles.notice} data-notice role="region" aria-label="Announcement">
      <p className={cx('container', styles.inner)}>
        <span className={cx('mono', styles.date)}>{n.label}</span>
        <span>{n.text}</span>
        {link && (
          <a
            href={link.href}
            data-sponsor-open={n.opensSponsorForm ? '' : undefined}
            {...(link.external ? externalProps : {})}
          >
            {n.linkLabel ?? 'Details'}
            {link.external && <NewTab />}
          </a>
        )}
      </p>
    </div>
  );
}

export default NoticeBar;
