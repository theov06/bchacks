import { site, type SiteState } from '../../../content/site';
import { applyLink } from '../../lib/apply';
import { cx } from '../../lib/ui';
import { Button } from '../ui/Button';
import { Highlight } from '../ui/SectionHead';
import { Logo } from '../ui/Logo';
import styles from './Nightfall.module.css';

interface Closing {
  title: string;
  /** Phrase in the title set in the sky gradient. */
  highlight?: string;
  /** Emphasised mono line under the facts (the deadline while applications are open). */
  urgent?: string;
  action: { label: string; href: string; external: boolean };
}

/** A visible middot; screen readers hear a comma pause instead. */
function Sep() {
  return (
    <>
      <span aria-hidden="true"> · </span>
      <span className="visually-hidden">, </span>
    </>
  );
}

/** What the last screen says and asks for, per site state. Facts come from content/site.ts. */
function closing(state: SiteState): Closing {
  switch (state) {
    case 'open':
      return {
        title: 'See you in the valley.',
        highlight: 'valley',
        urgent: site.deadlineLabel,
        action: { label: `Apply to BCHacks ${site.year}`, ...applyLink() },
      };
    case 'live':
      return {
        title: 'It’s happening now.',
        highlight: 'now',
        action: { label: 'Open the live page', href: '/live', external: false },
      };
    case 'closed':
      return {
        title: `Applications for ${site.year} are closed.`,
        action: { label: `Get notified about ${site.year + 1}`, href: '#top', external: false },
      };
    case 'offseason':
      return {
        title: 'See you in the valley.',
        highlight: 'valley',
        action: { label: 'Get notified when applications open', href: '#top', external: false },
      };
  }
}

/**
 * Closing beat above the footer. Mirrors the hero: the logo on its construction
 * circles, the facts as data blocks, and the one primary action on this screen.
 */
export function Nightfall() {
  const c = closing(site.state);
  return (
    <section className={styles.nightfall} aria-labelledby="nightfall-title">
      <div className={cx('container', 'grid', styles.inner)}>
        <div className={styles.art} aria-hidden="true">
          <svg className={styles.rings} viewBox="-200 -200 400 400" focusable="false">
            <circle r="196" />
            <circle r="138" />
          </svg>
          <Logo id="nightfall" className={styles.mark} surface="dark" decorative />
        </div>

        <div className={styles.head}>
          <p className="eyebrow" aria-hidden="true">
            {site.edition}
          </p>
          <h2 id="nightfall-title" className={styles.title}>
            <Highlight text={c.title} phrase={c.highlight} />
          </h2>
        </div>

        <div className={styles.body}>
          <dl className={styles.facts}>
            <div className="data">
              <dt className="label">Dates</dt>
              <dd>
                <time dateTime={site.startDate.slice(0, 10)}>{site.datesShort}</time>
              </dd>
            </div>
            <div className="data">
              <dt className="label">Where</dt>
              <dd>
                {site.venue.name}
                <Sep />
                {site.venue.cityLabel}
              </dd>
            </div>
            <div className="data">
              <dt className="label">Cost</dt>
              <dd>{site.costLabel}</dd>
            </div>
            {c.urgent && (
              <div className="data">
                <dt className="label">Apply by</dt>
                <dd>
                  <time dateTime={site.deadline.slice(0, 10)}>{c.urgent.replace(/^apply by\s*/i, '')}</time>
                </dd>
              </div>
            )}
          </dl>
          <Button href={c.action.href} external={c.action.external} icon="arrow" className={styles.cta}>
            {c.action.label}
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Nightfall;
