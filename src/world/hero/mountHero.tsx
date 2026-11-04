/**
 * Mounts the hero island into the hero stage (src/scripts/world.ts loads this lazily).
 * Handoff: when the first 3D frame is drawn, the 2D logo flies to the landmark's
 * on-screen position and fades while the island assembles (first visit), or simply
 * cross-fades (repeat visits). Under reduced motion the swap is instant.
 */
import { createRoot } from 'react-dom/client';
import { HeroWorld, type LandmarkOnScreen } from './HeroWorld';
import type { Tier } from '../island/Island';

export interface MountOptions {
  tier: Tier;
  still: boolean;
  intro: boolean;
}

export function mountHero(stage: HTMLElement, opts: MountOptions) {
  const host = document.createElement('div');
  host.className = 'world-canvas';
  host.setAttribute('aria-hidden', 'true');
  stage.append(host);
  const root = createRoot(host);

  const handoff = (lm: LandmarkOnScreen) => {
    const mark = stage.querySelector<SVGElement>('[data-world-mark]');
    if (mark && opts.intro && !opts.still) {
      const s = stage.getBoundingClientRect();
      const m = mark.getBoundingClientRect();
      const fromX = m.left + m.width / 2 - s.left;
      const fromY = m.top + m.height / 2 - s.top;
      stage.style.setProperty('--to-x', `${(lm.x - fromX).toFixed(1)}px`);
      stage.style.setProperty('--to-y', `${(lm.y - fromY).toFixed(1)}px`);
      stage.style.setProperty('--to-s', (lm.h / m.height).toFixed(3));
    }
    stage.dataset.world = opts.still ? 'still' : opts.intro ? 'assemble' : 'ready';
  };

  const render = (still: boolean) =>
    root.render(<HeroWorld tier={opts.tier} still={still} intro={opts.intro} onReady={handoff} onSlow={() => render(true)} />);
  render(opts.still);
}

export default mountHero;
