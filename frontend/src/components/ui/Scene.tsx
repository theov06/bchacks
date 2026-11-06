import hero from '../../assets/scenes/hero.svg?raw';
import about from '../../assets/scenes/about.svg?raw';
import tracks from '../../assets/scenes/tracks.svg?raw';
import schedule from '../../assets/scenes/schedule.svg?raw';
import sponsors from '../../assets/scenes/sponsors.svg?raw';
import involved from '../../assets/scenes/involved.svg?raw';
import faq from '../../assets/scenes/faq.svg?raw';
import footer from '../../assets/scenes/footer.svg?raw';
import { cx } from '../../lib/ui';
import styles from './Scene.module.css';

const art = { hero, about, tracks, schedule, sponsors, involved, faq, footer };
export type SceneName = keyof typeof art;

/** Scenes pinned to the top of their section; the rest sit on the section's bottom edge. */
const topAnchored: SceneName[] = ['about'];
/** Scenes whose phone crop is a band at the top of the section (their key feature is in the sky). */
const phoneTop: SceneName[] = ['about', 'tracks'];

export interface SceneProps {
  name: SceneName;
  className?: string;
}

/**
 * One section's illustrated scene (v3 "Journey down the valley"), inlined so its parts can
 * animate (step 3). Decoration only: aria-hidden, no pointer events, never holds information.
 * The art comes from src/assets/scenes/ (optimised by scripts/scenes/build.mjs). Sizing and
 * the phone crops live in Scene.module.css, keyed by data-scene.
 */
export function Scene({ name, className }: SceneProps) {
  const anchor = topAnchored.includes(name) ? 'top' : 'bottom';
  const svg = art[name].replace(
    '<svg ',
    `<svg preserveAspectRatio="xMidY${anchor === 'top' ? 'Min' : 'Max'} slice" aria-hidden="true" focusable="false" `,
  );
  return (
    <div
      className={cx(styles.scene, className)}
      data-scene={name}
      data-anchor={anchor}
      data-phone={phoneTop.includes(name) ? 'top' : 'bottom'}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export default Scene;
