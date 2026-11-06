import { site } from '../../../content/site';
import { applyLink } from '../../lib/apply';
import { cx } from '../../lib/ui';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Logo } from '../ui/Logo';
import { OrganizedBy } from '../ui/OrganizedBy';
import styles from './Header.module.css';

export interface HeaderProps {
  /** Prefix for home-page anchors when the header is used on another page ("/"). */
  base?: string;
}

interface NavLink {
  label: string;
  href: string;
}

/** The phone menu's call to action follows the site state. (The header bar shows "Organized by" instead.) */
function headerAction(base: string) {
  switch (site.state) {
    case 'open':
      return { label: 'Apply', ...applyLink(), primary: true };
    case 'live':
      return { label: 'Live now', href: '/live', external: false, primary: true };
    default:
      return { label: 'Get notified', href: `${base}#top`, external: false, primary: false };
  }
}

/**
 * Sticky header (spec 5 "Nav"): brand · links · "Organized by [CSCU]". Transparent at the top, navy + blur after 40px of scroll.
 * Phones get a native modal <dialog> menu: focus stays inside and Esc closes it.
 * Behaviour: src/scripts/header.ts.
 */
export function Header({ base = '' }: HeaderProps) {
  const links: NavLink[] = [
    { label: 'About', href: `${base}#about` },
    { label: 'Explore', href: `${base}#explore` },
    { label: 'Gallery', href: `${base}#gallery` },
    { label: 'Schedule', href: `${base}#schedule` },
    { label: 'Sponsors', href: `${base}#sponsors` },
    { label: 'FAQ', href: `${base}#faq` },
  ];
  const menuLinks = links;
  const action = headerAction(base);

  return (
    <>
      <header className={styles.header} data-header="">
        <div className={cx('container', styles.bar)}>
          <a href={base || '/'} className={styles.brand} aria-label="BCHacks home">
            <Logo id="header" className={styles.mark} surface="dark" decorative />
            <span className={styles.word} aria-hidden="true">
              BCHacks
            </span>
          </a>

          <nav className={styles.nav} aria-label="Main">
            <ul role="list" className={styles.navList}>
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} data-nav-link="">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <OrganizedBy className={styles.organizer} logoOnlyOnPhones />
            {/* Without JavaScript the dialog can't open, so phones jump to the footer's full nav instead. */}
            <a className={styles.noJsMenu} href="#footer-nav">
              Menu
            </a>
            <button
              type="button"
              className={styles.toggle}
              aria-expanded="false"
              aria-controls="mobile-menu"
              aria-haspopup="dialog"
              data-menu-open=""
            >
              <Icon name="menu" />
              <span className="visually-hidden">Open menu</span>
            </button>
          </div>
        </div>
      </header>

      <dialog id="mobile-menu" className={styles.menu} aria-label="Menu" data-menu="">
        <div className={cx('container', styles.menuTop)}>
          <span className={styles.brand} aria-hidden="true">
            <Logo id="menu" className={styles.mark} surface="dark" decorative />
            <span className={styles.word}>BCHacks</span>
          </span>
          <button type="button" className={styles.toggle} data-menu-close="">
            <Icon name="close" />
            <span className="visually-hidden">Close menu</span>
          </button>
        </div>
        <nav className={cx('container', styles.menuNav)} aria-label="Mobile">
          <ul role="list">
            {menuLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} data-menu-link="">
                  {l.label}
                  <Icon name="arrow" />
                </a>
              </li>
            ))}
          </ul>
          <Button href={action.href} external={action.external} icon="arrow" size="lg" className={styles.menuCta}>
            {action.label}
          </Button>
          <OrganizedBy className={styles.menuOrganizer} />
          <p className={cx('mono', styles.menuMeta)}>
            {site.datesLabel} · {site.venue.cityLabel}
          </p>
        </nav>
      </dialog>
    </>
  );
}

export default Header;
