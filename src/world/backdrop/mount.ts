/**
 * Starts the shared backdrop engine and adds each section's 3D layer (lazy chunk, loaded
 * by src/scripts/backdrop.ts). Sections join here one by one (spec 0.8.6 order).
 *
 * A section's art box gets data-backdrop="live" once its first 3D frame is drawn; CSS then
 * fades the 3D layer in and the SVG's own copies of those objects out (Scene.module.css).
 * If the engine stops (slow device), the attribute goes and the SVG is back as it was.
 */
import { BackdropEngine, type Tier } from './engine';
import { createHeroBackdrop } from './hero';

export function mountBackdrops(tier: Tier): BackdropEngine | null {
  const heroArt = document.querySelector<HTMLElement>('#top [data-scene="hero"]');
  if (!heroArt) return null;

  const engine = new BackdropEngine(tier);
  const hero = createHeroBackdrop(tier);
  engine.add(heroArt.closest('section')!, heroArt, hero, () => heroArt.removeAttribute('data-backdrop'));
  // Two frames in: the layer has drawn, so the swap can't show an empty sky.
  requestAnimationFrame(() => requestAnimationFrame(() => heroArt.setAttribute('data-backdrop', 'live')));
  return engine;
}
