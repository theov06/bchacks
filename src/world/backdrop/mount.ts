/**
 * Starts the shared backdrop engine and adds each section's 3D layer (lazy chunk, loaded
 * by src/scripts/backdrop.ts). One renderer for the whole page (spec 0.8.6).
 *
 * A section's art box gets data-backdrop="live" once its first 3D frame is drawn; CSS then
 * fades the 3D layer in and the SVG's own copies of those objects out (Scene.module.css).
 * If the engine stops (slow device), the attribute goes and the SVG is back as it was.
 */
import { BackdropEngine, type Backdrop, type Tier } from './engine';
import { createHeroBackdrop } from './hero';
import { createAboutBackdrop } from './about';
import { createNightSkyBackdrop } from './nightsky';
import { createCanyonBackdrop } from './canyon';
import { createWineriesBackdrop } from './wineries';
import { createLakeBackdrop } from './lake';
import { createUnderwaterBackdrop } from './underwater';
import { createLakebedBackdrop } from './lakebed';

/** Scene name (data-scene) → its backdrop, and how sharp it needs to be. */
type Region = { x0: number; y0: number; x1: number; y1: number };
/**
 * Scene name (data-scene) → its backdrop, how sharp it needs to be, and the band of the art
 * (viewBox units) its objects move in. The layer only covers that band.
 */
const SECTIONS: { scene: string; create: (tier: Tier) => Backdrop; resolution?: number; region?: Region }[] = [
  { scene: 'about', create: createAboutBackdrop, resolution: 0.6, region: { x0: 0, y0: 0, x1: 1440, y1: 245 } },
  { scene: 'tracks', create: createNightSkyBackdrop, region: { x0: 0, y0: 0, x1: 1440, y1: 790 } },
  { scene: 'schedule', create: createCanyonBackdrop, region: { x0: 220, y0: 660, x1: 1220, y1: 770 } },
  { scene: 'sponsors', create: createWineriesBackdrop, region: { x0: 0, y0: 690, x1: 1440, y1: 1100 } },
  { scene: 'involved', create: createLakeBackdrop, region: { x0: 60, y0: 180, x1: 1440, y1: 900 } },
  { scene: 'faq', create: createUnderwaterBackdrop },
  { scene: 'footer', create: createLakebedBackdrop, region: { x0: 0, y0: 560, x1: 1440, y1: 900 } },
];

export function mountBackdrops(tier: Tier, software = false): BackdropEngine | null {
  const heroArt = document.querySelector<HTMLElement>('#top [data-scene="hero"]');
  const engine = new BackdropEngine(tier, software);

  if (heroArt) {
    engine.add(heroArt.closest('section')!, heroArt, createHeroBackdrop(tier), {
      onFirstFrame: () => heroArt.setAttribute('data-backdrop', 'live'),
      onStop: () => heroArt.removeAttribute('data-backdrop'),
    });
  }

  for (const s of SECTIONS) {
    const art = document.querySelector<HTMLElement>(`[data-scene="${s.scene}"]`);
    const svg = art?.querySelector('svg');
    const section = art?.closest<HTMLElement>('section, footer');
    if (!art || !svg || !section) continue;
    engine.add(section, art, s.create(tier), {
      svg,
      resolution: s.resolution,
      region: s.region,
      onFirstFrame: () => art.setAttribute('data-backdrop', 'live'),
      onStop: () => art.removeAttribute('data-backdrop'),
    });
  }

  // The 3D island in About/Explore loads and builds right away, in the background, so it's
  // ready by the time Explore is reached. The engine only draws it while it's on screen.
  const stage = document.querySelector<HTMLElement>('[data-world-slot]');
  if (stage) {
    import('../island/islandLayer')
      .then(({ mountIsland }) => mountIsland(engine, stage))
      .catch((err) => {
        console.warn('[backdrop] 3D island failed to load.', err);
        stage.dataset.world = 'fallback';
      });
  }
  return engine;
}
