import { site } from '../../../content/site';
import { cx, externalProps } from '../../lib/ui';
import { NewTab } from './NewTab';
import styles from './OrganizedBy.module.css';

export interface OrganizedByProps {
  /** sm: header and menu; lg: the band above About. */
  size?: 'sm' | 'lg';
  /** Phones show only the logo (the words stay for screen readers). The header bar uses this. */
  logoOnlyOnPhones?: boolean;
  className?: string;
}

/**
 * "Organized by [CSCU logo]", a link to the organizer (content/site.ts organizer).
 * Screen readers hear "Organized by CSCU (opens in a new tab)".
 */
export function OrganizedBy({ size = 'sm', logoOnlyOnPhones = false, className }: OrganizedByProps) {
  const { organizer } = site;
  // The logo is drawn wide; it's sized by height, so its width follows from its proportions.
  const height = size === 'lg' ? 56 : 34;
  const width = Math.round((organizer.logo.width / organizer.logo.height) * height);
  return (
    <a className={cx(styles.link, styles[size], logoOnlyOnPhones && styles.logoOnly, className)} href={organizer.url} {...externalProps}>
      <span className={styles.label}>Organized by</span>
      <img src={organizer.logo.src} alt={organizer.name} width={width} height={height} decoding="async" />
      <NewTab />
    </a>
  );
}

export default OrganizedBy;
