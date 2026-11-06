import { site } from '../../../content/site';
import { sponsors, sponsorsIntro, type Sponsor } from '../../../content/sponsors';
import { cx, externalProps } from '../../lib/ui';
import { Button } from '../ui/Button';
import { NewTab } from '../ui/NewTab';
import { Scene } from '../ui/Scene';
import { SectionHead } from '../ui/SectionHead';
import styles from './Sponsors.module.css';

/**
 * Logo box with the same visual weight for every logo: each gets the same area (px²)
 * at its own proportions, so a long wordmark and a tall emblem look equally big.
 * CSS caps it to the panel (object-fit: contain keeps the proportions).
 */
function logoSize({ logo, scale = 1 }: Sponsor, base: number) {
  const area = base * scale * scale;
  const ratio = logo.width / logo.height;
  return { width: Math.round(Math.sqrt(area * ratio)), height: Math.round(Math.sqrt(area / ratio)) };
}

function Logo({ sponsor, area }: { sponsor: Sponsor; area: number }) {
  return <img src={sponsor.logo.src} alt={sponsor.name} loading="lazy" decoding="async" {...logoSize(sponsor, area)} />;
}

/**
 * Sponsors (#sponsors): valley wineries in the afternoon (v3 scene 5, v3.1 spec 0.8.3).
 * "Current sponsors" on large cream sign panels (or one "Be our first 2026 sponsor"
 * panel that opens the sponsor form), "Past sponsors" on smaller panels in grayscale
 * until hover / focus, then the "Want your logo here?" card. The barn and orchard stay
 * in the open hills below the content.
 */
export function Sponsors() {
  const current = sponsors.filter((s) => s.status === 'current');
  const past = sponsors.filter((s) => s.status === 'past');
  return (
    <section id="sponsors" className={cx('scene-section', styles.sponsors)} aria-labelledby="sponsors-title">
      <Scene name="sponsors" />
      <div className="container">
        <SectionHead id="sponsors-title" eyebrow={sponsorsIntro.eyebrow} title={sponsorsIntro.heading} highlight={sponsorsIntro.highlight} />

        <section className={styles.tier} data-tier="current" aria-labelledby="tier-current">
          <h3 id="tier-current" className={styles.tierName}>
            {sponsorsIntro.currentLabel}
          </h3>
          <ul role="list" className={styles.slots}>
            {current.length > 0 ? (
              current.map((s) => (
                <li key={s.name}>
                  <a className={cx(styles.slot, styles.sign)} href={s.url} {...externalProps}>
                    <Logo sponsor={s} area={9000} />
                    <NewTab />
                  </a>
                </li>
              ))
            ) : (
              <li className={styles.firstItem}>
                <a className={cx(styles.slot, styles.sign, styles.first)} href={`mailto:${site.sponsorEmail}`} data-sponsor-open="">
                  <span className={styles.open}>{sponsorsIntro.firstSponsorLabel}</span>
                </a>
              </li>
            )}
          </ul>
        </section>

        {past.length > 0 && (
          <section className={styles.tier} data-tier="past" aria-labelledby="tier-past">
            <h3 id="tier-past" className={styles.tierName}>
              {sponsorsIntro.pastLabel}
            </h3>
            <ul role="list" className={styles.slots}>
              {past.map((s) => (
                <li key={s.name} className={styles.pastItem}>
                  <a className={cx(styles.slot, styles.past)} href={s.url} {...externalProps}>
                    <Logo sponsor={s} area={5200} />
                    <NewTab />
                  </a>
                  {s.years.length > 0 && <span className={cx('mono', styles.years)}>{s.years.join(' · ')}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className={cx('sticker', styles.pitch)}>
          <div className={styles.pitchText}>
            <h3>{sponsorsIntro.pitchHeading}</h3>
            <p>{sponsorsIntro.pitch}</p>
          </div>
          <div className={styles.actions}>
            <Button href={`mailto:${site.sponsorEmail}`} tone="sun" sponsorForm>
              {sponsorsIntro.becomeLabel}
            </Button>
            
          </div>
        </div>
      </div>
    </section>
  );
}

export default Sponsors;
