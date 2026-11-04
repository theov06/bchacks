import { schedule, scheduleIntro } from '../../../content/schedule';
import { site } from '../../../content/site';
import { cx, type StyleVars } from '../../lib/ui';
import { Scene } from '../ui/Scene';
import { SectionHead } from '../ui/SectionHead';
import styles from './ScheduleSection.module.css';

/**
 * Schedule (#schedule): Myra Canyon at first light (v3 scene 4). Three day cards; the
 * trestle's three lanterns stand directly below the three card columns. From 1100px the
 * lanterns are drawn here, in a row that shares the cards' grid, so they line up at every
 * width (the art's own lanterns hide); below that the art's lanterns show.
 */
export function ScheduleSection() {
  const lede = (
    <>
      {scheduleIntro.lede}
      {site.state === 'live' && (
        <>
          {' '}
          Changes are posted on the <a href="/live">live page</a>.
        </>
      )}
    </>
  );
  return (
    <section id="schedule" className={cx('scene-section', styles.schedule)} aria-labelledby="schedule-title">
      <Scene name="schedule" />
      <div className="container">
        <SectionHead
          id="schedule-title"
          eyebrow={scheduleIntro.eyebrow}
          title={scheduleIntro.heading}
          highlight={scheduleIntro.highlight}
          lede={lede}
        />
        <ol role="list" className={styles.days}>
          {schedule.map((d, i) => (
            <li key={d.iso} className={cx('sticker', styles.day)} style={{ '--tone': `var(--${d.tone})` } as StyleVars} data-day={i}>
              <p className={styles.pill}>
                <time dateTime={d.iso}>
                  {d.day} · {d.date}
                </time>
              </p>
              <h3>{d.title}</h3>
              <ul role="list">
                {d.items.map((it) => (
                  <li key={it.title}>
                    <span className={styles.time}>{it.time}</span>
                    {it.title}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.lanterns} aria-hidden="true">
        <div className={cx('container', styles.lanternRow)}>
          {schedule.map((d, i) => (
            <svg key={d.iso} className={styles.lantern} viewBox="-26 -82 52 82" focusable="false" style={{ '--tone': `var(--${d.tone})` } as StyleVars} data-lantern={i}>
              <line x1="0" y1="0" x2="0" y2="-42" />
              <circle className={styles.glow} cx="0" cy="-56" r="26" />
              <rect x="-11" y="-68" width="22" height="26" rx="6" />
            </svg>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ScheduleSection;
