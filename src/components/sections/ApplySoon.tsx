import type { CSSProperties } from 'react';
import { site } from '../../../content/site';
import { cx } from '../../lib/ui';
import { Button } from '../ui/Button';
import { Scene } from '../ui/Scene';
import { Highlight } from '../ui/SectionHead';
import { SignupForm } from '../ui/SignupForm';
import styles from './ApplySoon.module.css';

/**
 * /apply while applications aren't open yet (v3.1, spec 0.8.4): the sunset over the
 * valley, "Applications will open soon.", the email sign-up and the event facts.
 * Like the hero, the hills start below the copy and only the plain sky sits behind it.
 */
export function ApplySoon() {
  const { applyPage } = site;
  const facts = [
    { term: 'When', value: site.datesShort, dateTime: site.startDate.slice(0, 10), bar: 'sky' },
    { term: 'Where', value: `${site.venue.name}, ${site.venue.cityLabel}`, bar: 'sun' },
    { term: 'Cost', value: site.costLabel, bar: 'mint' },
  ];
  return (
    <section className={styles.page} aria-labelledby="apply-title">
      <div className={cx('container', styles.inner)}>
        <div className={styles.scene}>
          <Scene name="hero" className={styles.scenery} />
        </div>

        <div className={styles.copy}>
          <h1 id="apply-title" className={cx('title-font', styles.title)}>
            <Highlight text={applyPage.heading} phrase={applyPage.highlight} />
          </h1>
          <p className={styles.lede}>{applyPage.lede}</p>

          <div className={styles.signup}>
            <SignupForm id="apply-signup" label={applyPage.signupLabel} />
          </div>

          <dl className={styles.facts}>
            {facts.map((f) => (
              <div key={f.term} className={cx('data', styles.fact)} style={{ '--bar': `var(--${f.bar})` } as CSSProperties}>
                <dt>{f.term}</dt>
                <dd>{f.dateTime ? <time dateTime={f.dateTime}>{f.value}</time> : f.value}</dd>
              </div>
            ))}
          </dl>

          <div className={styles.back}>
            <Button href="/" variant="secondary">
              Back to the homepage
            </Button>
          </div>
        </div>
      </div>

      {/* Wavy edge into the footer: the lakebed's top colour. */}
      <svg className={styles.wave} viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M0,40 C120,10 240,10 360,34 C480,58 600,58 720,34 C840,10 960,10 1080,34 C1200,58 1320,58 1440,30 L1440,70 L0,70 Z" />
      </svg>
    </section>
  );
}

export default ApplySoon;
