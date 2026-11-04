/**
 * Decides whether and how the 3D hero island loads (spec M3, T12, D3).
 * Runs after the page has loaded and gone idle, so the text, dates and Apply button are
 * already on screen; the 3D code is a separate lazy chunk.
 *
 * - No WebGL, Save-Data or a low-power device → keep the 2D logo (fallback).
 * - A software renderer (GPU acceleration off, some embedded previews): desktop gets a still,
 *   finished island (one frame, no ongoing cost); phones keep the 2D logo.
 *   Slow-but-real GPUs are caught at runtime instead: the frame-rate watchdog switches to a still island.
 * - prefers-reduced-motion → a still, finished island (no assembly, no idle motion).
 * - Desktop with a fine pointer → high tier (bloom, outlines). Otherwise → medium.
 * - First visit (the head script set .logo-intro) → the island assembles after the 2D reveal.
 *
 * Testing overrides: ?world=off | still | medium | high (skip all checks); ?gl=any (normal path, any renderer).
 */
const REVEAL_MS = 1200; // keep in sync with Logo.module.css
/**
 * Phones start the 3D later, in idle time: three.js start-up is ~1 s of main-thread work on a
 * mid-range phone, and the first seconds belong to reading the hero and tapping Apply (T5).
 * The 2D logo holds the stage meanwhile, then flies into the island.
 */
const PHONE_DELAY_MS = 3500;

type Choice = 'off' | 'still' | 'medium' | 'high';

/**
 * WebGL check by renderer name. (failIfMajorPerformanceCaveat was too strict: Chrome sets it on
 * many integrated GPUs that run the island fine.) Only true software renderers are ruled out.
 * Creating a context can block for a while, so this runs in idle time right before the 3D would
 * load, and the test context is released at once.
 */
function webgl(): { ok: boolean; renderer: string } {
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return { ok: false, renderer: 'none' };
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return { ok: !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer), renderer };
  } catch {
    return { ok: false, renderer: 'error' };
  }
}

function lowPower(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return !!nav.connection?.saveData || (nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) < 2;
}

export function initWorld(): void {
  const stage = document.querySelector<HTMLElement>('[data-world-slot]');
  if (!stage) return;

  const forced = new URLSearchParams(location.search).get('world') as Choice | null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = matchMedia('(pointer: fine)').matches && innerWidth >= 1024;

  let choice: Choice;
  if (forced) choice = forced;
  else if (lowPower()) choice = 'off';
  else choice = desktop ? 'high' : 'medium';

  // Dev only: say what was detected and decided, so a missing island is easy to explain.
  const debug = (msg: string) => {
    if (import.meta.env.DEV) console.info(`[world] ${msg}`, { choice, forced, reduced, desktop, cores: navigator.hardwareConcurrency, width: innerWidth });
  };
  if (choice === 'off') {
    debug('low-power device or Save-Data: keeping the 2D logo');
    stage.dataset.world = 'fallback';
    return;
  }
  let still = reduced || choice === 'still';
  const tier = choice === 'high' ? 'high' : 'medium';
  const intro = document.documentElement.classList.contains('logo-intro');

  const start = () => {
    // ?gl=any (testing): accept any renderer, but keep the normal tier, delay and handoff path.
    const anyGl = new URLSearchParams(location.search).get('gl') === 'any';
    const gl = forced ? { ok: true, renderer: 'skipped (?world)' } : anyGl ? { ...webgl(), ok: true } : webgl();
    if (!gl.ok) {
      const software = gl.renderer !== 'none' && gl.renderer !== 'error';
      if (!(software && desktop)) {
        debug(`no usable WebGL (renderer: ${gl.renderer}): keeping the 2D logo. Try ?world=high`);
        stage.dataset.world = 'fallback';
        return;
      }
      debug(`software renderer (${gl.renderer}): showing a still island. Turn on graphics acceleration for the animated one.`);
      still = true;
    }
    debug(`loading the 3D island (renderer: ${gl.renderer})`);
    stage.dataset.world = 'loading';
    import('../world/hero/mountHero')
      .then(({ mountHero }) => mountHero(stage, { tier, still, intro }))
      .catch((err) => {
        // The 2D logo stays; the page is complete without the 3D.
        console.warn('[world] 3D hero failed to load, keeping the 2D logo.', err);
        stage.dataset.world = 'fallback';
      });
  };
  // Wait for load + idle; on a first visit also let the 2D reveal finish, so the logo can fly into the island.
  const go = () => {
    const reveal = intro && !still ? Math.max(0, REVEAL_MS - performance.now()) : 0;
    const wait = tier === 'medium' && !forced ? Math.max(reveal, PHONE_DELAY_MS) : reveal;
    const idle = (cb: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 200));
    setTimeout(() => idle(start), wait);
  };
  if (document.readyState === 'complete') go();
  else addEventListener('load', go, { once: true });
}
