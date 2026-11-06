/**
 * Decides whether the sections' 3D backdrops load (v3.1 spec 0.8.6), then loads them lazily
 * after the page has loaded and gone idle. The illustrated SVG scenes are complete on their
 * own; the 3D only adds depth and motion on top.
 *
 * Static SVG (nothing loads): prefers-reduced-motion, Save-Data / prefers-reduced-data,
 * a low-power device, no WebGL, or a phone with a software renderer.
 * high: desktop with a fine pointer. medium: everything else.
 * The 3D code starts downloading as soon as the page is parsed and mounts as soon as it arrives.
 * A desktop with a software renderer (GPU acceleration off) gets the lighter medium tier; the
 * engine's frame-time watchdog hands back to the SVG if it can't keep up.
 *
 * Testing: ?backdrop=off | medium | high skips the checks; ?gl=any accepts any renderer.
 */
type Choice = 'off' | 'medium' | 'high';

function hardwareGl(): { ok: boolean; renderer: string } {
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return { ok: false, renderer: 'no WebGL' };
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return { ok: !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer), renderer };
  } catch {
    return { ok: false, renderer: 'error' };
  }
}

/** Dev only: say why the 3D did or didn't load, so a missing backdrop is easy to explain. */
const debug = (msg: string, extra?: object) => {
  if (import.meta.env.DEV) console.info(`[backdrop] ${msg}`, extra ?? '');
};

function lowPower(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (
    !!nav.connection?.saveData ||
    matchMedia('(prefers-reduced-data: reduce)').matches ||
    (nav.hardwareConcurrency ?? 8) <= 2 ||
    (nav.deviceMemory ?? 8) < 2
  );
}

export function initBackdrop(): void {
  if (!document.querySelector('[data-scene]')) return;
  const params = new URLSearchParams(location.search);
  const forced = params.get('backdrop') as Choice | null;
  const desktop = matchMedia('(pointer: fine)').matches && innerWidth >= 1024;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let choice: Choice;
  if (forced) choice = forced;
  else if (reduced || lowPower()) choice = 'off';
  else choice = desktop ? 'high' : 'medium';
  if (choice === 'off') {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    debug(
      reduced
        ? 'off: the browser asks for reduced motion (Windows: Settings > Accessibility > Visual effects > Animation effects). Try ?backdrop=high'
        : 'off: low-power device or Save-Data. Try ?backdrop=high',
      { cores: nav.hardwareConcurrency, memoryGB: nav.deviceMemory, saveData: nav.connection?.saveData },
    );
    return;
  }
  let tier: 'high' | 'medium' = choice;
  let software = false;

  const start = (mod: Promise<typeof import('../world/backdrop/mount')>) => {
    const gl = forced ? { ok: true, renderer: 'skipped (?backdrop)' } : hardwareGl();
    if (!gl.ok && params.get('gl') !== 'any') {
      if (!desktop || gl.renderer === 'no WebGL' || gl.renderer === 'error') {
        debug(`off: no hardware WebGL (renderer: ${gl.renderer}). Turn on graphics acceleration in the browser, or try ?backdrop=high`);
        return;
      }
      debug(`software renderer (${gl.renderer}): using the lighter tier. Turn on graphics acceleration for the full one.`);
      tier = 'medium';
      software = true;
    }
    debug(`loading the ${tier} tier (renderer: ${gl.renderer})`);
    mod
      .then(({ mountBackdrops }) => mountBackdrops(tier, software))
      .catch((err) => console.warn('[backdrop] 3D failed to load; the illustrated scenes stay as they are.', err));
  };
  // Start at once (this runs right after the page is parsed, before images finish): download
  // the 3D code and mount it as soon as it arrives, so the hero comes alive quickly. The 3D
  // starts exactly where the art is drawn, so the hand-off is seamless. The other sections
  // set themselves up later, in idle time (engine.ts).
  const mod = import('../world/backdrop/mount');
  mod.catch(() => {}); // a failed download is reported in start()
  mod.then(() => requestAnimationFrame(() => start(mod))).catch(() => start(mod));
}
