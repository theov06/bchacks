import { site, type SiteState } from '../../../content/site';
import { applyLink } from '../../lib/apply';
import { cx, externalProps } from '../../lib/ui';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';
import { NewTab } from '../ui/NewTab';
import { Scene } from '../ui/Scene';
import { Highlight } from '../ui/SectionHead';
import styles from './Footer.module.css';

export interface FooterProps {
  base?: string;
}

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
  /** Opens the sponsor pop-up form (the href is the no-JS fallback). */
  sponsorForm?: boolean;
}

/** The closing call to action, per site state. Facts come from content/site.ts. */
function closing(state: SiteState) {
  switch (state) {
    case 'open':
      return { note: site.footer.closesLabel, action: { label: 'Apply now', ...applyLink() } };
    case 'live':
      return { note: 'BCHacks is coming soon.', action: { label: 'Open the live page', href: '/live', external: false } };
    case 'closed':
      return { note: `Applications for ${site.year} are closed.`, action: { label: `Get notified about ${site.year + 1}`, href: '/#top', external: false } };
    case 'offseason':
      return { note: 'Applications open soon.', action: { label: 'Get notified', href: '/#top', external: false } };
  }
}

/**
 * Footer: the lakebed (v3 scene 8), on every page. "You made it to the bottom" + the
 * state's action, then the land acknowledgement, link columns, contact and copyright.
 * The diving quail sits on the lakebed below all of it.
 */
export function Footer({ base = '' }: FooterProps) {
  const { note, action } = closing(site.state);
  const columns: { id: string; title: string; links: FooterLink[] }[] = [
    {
      id: 'ft-event',
      title: 'Event',
      links: [
        { label: 'About', href: `${base}#about` },
        { label: 'Gallery', href: `${base}#gallery` },
        { label: 'Schedule', href: `${base}#schedule` },
        { label: 'FAQ', href: `${base}#faq` },
        ...(site.state === 'live' ? [{ label: 'Live page', href: '/live' }] : []),
      ],
    },
    {
      id: 'ft-involved',
      title: 'Get involved',
      links: [
        { label: 'Sponsor BCHacks', href: `${base}#sponsors`, sponsorForm: true },
        { label: 'Mentor, Judge, Volunteer', href: `${base}#involved` },
        { label: 'Code of conduct', href: site.codeOfConductUrl, external: true },
      ],
    },
  ];

  return (
    <footer className={cx('scene-section', styles.footer)}>
      <Scene name="footer" />
      <div className="container">
        <div className={styles.closing}>
          <h2 className={styles.title}>
            <Highlight text={site.footer.heading} phrase={site.footer.highlight} />
          </h2>
          <p className={styles.note}>{note}</p>
          <Button href={action.href} size="lg" external={action.external} className={styles.apply}>
            {action.label}
          </Button>
        </div>

        <div className={styles.info} id="footer-nav">
          <div className={styles.brand}>
            <a href={base || '/'} className={styles.logo} aria-label="BCHacks home">
              <Logo id="footer" surface="dark" decorative />
              <span aria-hidden="true">BCHacks</span>
            </a>
            <p className={styles.land}>{site.landAcknowledgement}</p>
          </div>

          {columns.map((col) => (
            <nav key={col.id} className={styles.col} aria-labelledby={col.id}>
              <h3 id={col.id} className={styles.colTitle}>
                {col.title}
              </h3>
              <ul role="list">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <a href={l.href} {...(l.external ? externalProps : {})} data-sponsor-open={l.sponsorForm ? '' : undefined}>
                      {l.label}
                      {l.external && <NewTab />}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className={styles.col}>
            <h3 id="ft-contact" className={styles.colTitle}>
              Contact
            </h3>
            <ul role="list" aria-labelledby="ft-contact">
              <li>
                <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
              </li>
            </ul>
          </div>
        </div>

        {site.mlhMember && (
          <a className={styles.mlh} href={site.mlhBadgeUrl} {...externalProps}>
            Official Major League Hacking member event
            <NewTab />
          </a>
        )}
        <p className={styles.legal}>
          © {site.year} BCHacks · {site.footer.credit}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
