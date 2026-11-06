import { about, explore } from '../../../content/about';
import { site } from '../../../content/site';
import { cx, type StyleVars } from '../../lib/ui';
import { Icon } from '../ui/Icon';
import { OrganizedBy } from '../ui/OrganizedBy';
import { Scene } from '../ui/Scene';
import { SectionHead } from '../ui/SectionHead';
import styles from './About.module.css';

/** A 1×1 transparent GIF, for the postcard pictures on screens that hide them. */
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/** Tick colours for "You belong here", in order (design reference). */
const ticks = ['aqua', 'sun', 'pink', 'mint'] as const;

/**
 * About + Explore (#about, #explore): northern lights over the island (v3 scene 2).
 * A calm band with the event name and "Organized by [CSCU]" sits above the aurora (v3.1).
 * The aurora fills the top; the About copy and the "You belong here" card start below it.
 * Explore shows the island on an oval of lake water with five hotspot links down the page.
 * Phones skip the island: the five stops become swipeable postcards instead. The 3D island (src/world/island/islandLayer.tsx) draws over
 * the picture once it's running; the picture stays as its fallback.
 */
export function About() {
  return (
    <section className={styles.about} aria-labelledby="about-title">
      {/* Calm band between the hero and the aurora (v3.1): the event name and its organizer. */}
      <div className={styles.band}>
        <div className={cx('container', styles.bandInner)}>
          <p className={cx('title-font', styles.bandTitle)}>{site.edition}</p>
          <OrganizedBy size="lg" />
        </div>
      </div>
      <Scene name="about" />
      <div className="container">
        <div id="about" className={styles.intro}>
          <div className={styles.text}>
            <SectionHead id="about-title" eyebrow={about.eyebrow} title={about.heading} highlight={about.highlight} />
            {about.paragraphs.map((p) => (
              <p key={p} className={styles.para}>
                {p}
              </p>
            ))}
          </div>

          <div className={cx('sticker', styles.belong)}>
            <h3 id="belong-title">{about.belongHeading}</h3>
            <ul role="list" aria-labelledby="belong-title">
              {about.belong.map((item, i) => (
                <li key={item}>
                  <span className={styles.tick} style={{ '--tick': `var(--${ticks[i % ticks.length]})` } as StyleVars} aria-hidden="true">
                    <Icon name="check" size={14} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div id="explore" className={styles.exploreHead}>
          <SectionHead id="explore-title" eyebrow={explore.eyebrow} title={explore.heading} highlight={explore.highlight} className={styles.wideOnly} />
          <p className={cx(styles.exploreLede, styles.wideOnly)}>{explore.lede}</p>
          {/* Phones: no island, so the heading talks about the journey (the trail below). */}
          <SectionHead
            id="explore-title-phone"
            eyebrow={explore.eyebrow}
            title={explore.phone.heading}
            highlight={explore.phone.highlight}
            className={styles.phoneOnly}
          />
          <p className={cx(styles.exploreLede, styles.phoneOnly)}>{explore.phone.lede}</p>
        </div>

        <div className={styles.stage} data-world-slot="">
          <svg className={styles.lake} viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <ellipse cx="500" cy="150" rx="500" ry="150" fill="#2FA7D6" />
            <ellipse cx="500" cy="150" rx="470" ry="132" fill="#4CC3E2" />
            <path
              d="M120,210 q30,-10 60,0 M780,230 q30,-10 60,0 M200,250 q25,-8 50,0 M690,262 q25,-8 50,0 M860,180 q25,-8 50,0 M90,160 q25,-8 50,0"
              stroke="#E8FBFF"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              opacity=".8"
            />
          </svg>
          <picture className={styles.island} data-world-mark="">
            <source type="image/webp" srcSet="/island-760.webp 760w, /island-1200.webp 1200w" sizes="(min-width: 1100px) 1040px, 100vw" />
            <img src="/island.png" alt={explore.islandAlt} width={1200} height={746} loading="lazy" decoding="async" />
          </picture>

          {explore.hotspots.map((h) => (
            <a
              key={h.href}
              className={styles.hotspot}
              href={h.href}
              data-side={h.side}
              data-spot={h.spot}
              aria-label={`${h.label}, ${h.section}`}
              style={{ '--x': `${h.x}%`, '--y': `${h.y}%`, '--tone': `var(--${h.tone})` } as StyleVars}
            >
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.chip}>
                <span className={styles.pip} aria-hidden="true" />
                {h.label}
              </span>
            </a>
          ))}
        </div>

        {/*
          Phones: the island is hidden and the stops become swipeable postcards, each with a
          crop of that stop's scene (public/images/explore/, made by scripts/scenes/postcards.mjs).
          Without JavaScript it's still a scrollable row of links; src/scripts/postcards.ts adds the dots.
        */}
        <nav className={styles.cards} aria-label="Explore the journey" data-postcards="">
          <ol role="list" className={styles.track}>
            {explore.hotspots.map((h, i) => (
              <li key={h.href} style={{ '--tone': `var(--${h.tone})` } as StyleVars}>
                <a className={cx('sticker', styles.card)} href={h.href} aria-label={`${h.label}, ${h.section}`}>
                  <span className={styles.photo}>
                    {/* Only phones show the cards, so only phones get the picture; wider screens get a 1px blank. */}
                    <picture>
                      <source media="(max-width: 759px)" srcSet={`/images/explore/${h.spot}.webp`} type="image/webp" />
                      <img src={BLANK} alt="" width={640} height={427} loading="lazy" decoding="async" />
                    </picture>
                    <span className={styles.stopNo} aria-hidden="true">
                      Stop {i + 1}
                    </span>
                  </span>
                  <span className={styles.caption}>
                    <span className={styles.place}>
                      {h.label}
                      <span className={styles.section} aria-hidden="true">
                        {h.section}
                      </span>
                    </span>
                    <Icon name="arrow" size={20} />
                  </span>
                </a>
              </li>
            ))}
          </ol>
          <div className={styles.dots} aria-hidden="true">
            {explore.hotspots.map((h, i) => (
              <span key={h.href} data-dot="" data-active={i === 0 ? 'true' : undefined} />
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}

export default About;
