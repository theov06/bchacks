import { tracks, tracksIntro } from '../../../content/tracks';
import { cx, type StyleVars } from '../../lib/ui';
import { Scene } from '../ui/Scene';
import { SectionHead } from '../ui/SectionHead';
import styles from './Tracks.module.css';

/**
 * Tracks (#tracks): the night sky (v3 scene 3). Four track cards with a star each,
 * colour-coded coral / sun / aqua / mint. The distant ridge at the bottom of the scene
 * rises into the canyon section below.
 */
export function Tracks() {
  return (
    <section id="tracks" className={cx('scene-section', styles.tracks)} aria-labelledby="tracks-title">
      <Scene name="tracks" />
      <div className="container">
        <SectionHead
          id="tracks-title"
          eyebrow={tracksIntro.eyebrow}
          title={tracksIntro.heading}
          highlight={tracksIntro.highlight}
          lede={tracksIntro.lede}
        />
        <ul role="list" className={styles.cards}>
          {tracks.map((t, i) => (
            <li key={i} className={cx('sticker', styles.card)} style={{ '--tone': `var(--${t.tone})` } as StyleVars}>
              <div className={styles.band} aria-hidden="true">
                <svg width="56" height="56" viewBox="0 0 56 56" focusable="false">
                  <path d="M28 6 l5 10 11 1.5 -8 7.5 2 11 -10 -5.5 -10 5.5 2 -11 -8 -7.5 11 -1.5z" />
                </svg>
              </div>
              <div className={styles.body}>
                <h3>{t.name}</h3>
                <p>{t.summary}</p>
                <p className={styles.prize}>Prize: {t.prize}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Tracks;
