import type { CSSProperties } from 'react';
import { site, type SiteState } from '../../../content/site';
import { applyLink } from '../../lib/apply';
import { cx } from '../../lib/ui';
import { Button } from '../ui/Button';
import { Highlight } from '../ui/SectionHead';
import { Scene } from '../ui/Scene';
import { SignupForm } from '../ui/SignupForm';
import styles from './Hero.module.css';

interface Fact {
  term: string;
  value: string;
  dateTime?: string;
  /** Left-border colour, as in the design reference. */
  bar: 'sky' | 'sun' | 'mint';
}

function heroFacts(state: SiteState): Fact[] {
  const when: Fact = { term: 'When', value: site.datesShort, dateTime: site.startDate.slice(0, 10), bar: 'sky' };
  //const cost: Fact = { term: 'Cost', value: site.costLabel, bar: 'mint' };
  switch (state) {
    case 'open':
      //"Apply by Nov 18, 2026" -> "Nov 18, 2026": the label already says "Apply by".
      return [when, { term: 'Location', value: site.venue.name, bar: 'sun' }];
    case 'closed':
      return [when, { term: 'Applications', value: 'Closed', bar: 'sun' },];// cost];
    case 'live':
      return [when, { term: 'Status', value: 'Happening now', bar: 'sun' },]; // cost];
    case 'offseason':
      return [when];//, cost];
  }
}

function HeroActions({ state }: { state: SiteState }) {
  switch (state) {
    case 'open':
      return (
        <>
          <Button href={applyLink().href} size="lg" icon="arrow" external={applyLink().external}>
            Apply now
          </Button>
          <Button href="#sponsors" variant="secondary" size="lg" sponsorForm>
            Sponsor us
          </Button>
        </>
      );
    case 'live':
      return (
        <>
          <Button href="/live" size="lg" icon="arrow">
            Open the live page
          </Button>
          <Button href={site.discordUrl} variant="secondary" size="lg" external>
            Join Discord
          </Button>
        </>
      );
    case 'offseason':
    case 'closed': {
      const label = state === 'offseason' ? 'Get notified when applications open' : `Get notified about BCHacks ${site.year + 1}`;
      return (
        <>
          <SignupForm id="hero-signup" label={label} />
          <Button href="#sponsors" variant="secondary" size="lg" sponsorForm>
            Sponsor us
          </Button>
        </>
      );
    }
  }
}

/**
 * Hero (#top): sunset over the valley (v3 scene 1). G1: dates, deadline and the primary
 * action fit one phone screen. No island here: it lives in About/Explore (v3).
 */
export function Hero() {
  const { state, hero } = site;
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title" data-state={state}>
      <div className={cx('container', styles.inner)}>
        {/*
         * Scenery row: starts just under the buttons and runs to the hero's bottom. The art
         * sits on the bottom of that row when there's room and slides down when there isn't,
         * so its hills always start below the buttons.
         */}
        <div className={styles.scene}>
          <Scene name="hero" className={styles.scenery} />
        </div>

        <div className={styles.copy}>
          {/*
          <p className="eyebrow" data-rule="">
            {state === 'live' && <span className={styles.liveDot} aria-hidden="true" />}
            {hero.eyebrow}
          </p>
          */}

          <h1 id="hero-title" className={styles.title}>
            <span className="visually-hidden">{site.edition}: </span>
            {hero.headline.map((line, i) => (
              <span key={line} className={styles.line}>
                <Highlight text={line} phrase={hero.highlight} />
                {i < hero.headline.length - 1 && ' '}
              </span>
            ))}
          </h1>

          <p className={styles.lede}>{hero.lede}</p>

          <dl className={styles.facts}>
            {heroFacts(state).map((f) => (
              <div key={f.term} className={cx('data', styles.fact)} style={{ '--bar': `var(--${f.bar})` } as CSSProperties}>
                <dt>{f.term}</dt>
                <dd>{f.dateTime ? <time dateTime={f.dateTime}>{f.value}</time> : f.value}</dd>
              </div>
            ))}
          </dl>

          <div className={styles.actions}>
            <HeroActions state={state} />
          </div>
        </div>

      </div>

      {/* Wavy edge into About: the top colour of the aurora scene. */}
      <svg className={styles.wave} viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M0,40 C120,10 240,10 360,34 C480,58 600,58 720,34 C840,10 960,10 1080,34 C1200,58 1320,58 1440,30 L1440,70 L0,70 Z" />
      </svg>
    </section>
  );
}

export default Hero;
