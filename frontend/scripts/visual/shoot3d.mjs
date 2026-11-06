/**
 * 3D screenshots: opens a page on the dev server (npm run dev) at 390px and 1440px,
 * checks that WebGL is really on, waits for the scene, and saves viewport PNGs.
 *
 * Usage: node scripts/visual/shoot3d.mjs <path> <outDir> [--wait=ms] [--full]
 *   (npm run shots -- <path> <outDir>). BASE_URL defaults to http://localhost:4321.
 *   The page can set <html data-ready> when its first frames are drawn; otherwise
 *   the script waits --wait ms (default 1500). Exit code 1 if WebGL is unavailable.
 *   --ready=<css> waits for another element instead (e.g. the hero stage's data-world state);
 *   --settle=ms waits a bit longer after that (e.g. for the assembly to finish).
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { launch, BASE_URL } from './browser.mjs';

const [, , route = '/', out = 'shots'] = process.argv;
const wait = Number((process.argv.find((a) => a.startsWith('--wait=')) || '--wait=1500').slice(7));
const full = process.argv.includes('--full');
// --ready=<css selector> waits for that element instead of html[data-ready]; --settle=ms waits after it.
const readySel = (process.argv.find((a) => a.startsWith('--ready=')) || '--ready=html[data-ready]').slice(8);
const settle = Number((process.argv.find((a) => a.startsWith('--settle=')) || '--settle=0').slice(9));
await mkdir(out, { recursive: true });

const browser = await launch();
let ok = true;
for (const width of (process.env.WIDTHS || '390,1440').split(',').map(Number)) {
  const mobile = width < 600;
  const context = await browser.newContext({ viewport: { width, height: mobile ? 844 : 900 }, deviceScaleFactor: mobile ? 2 : 1 });
  const page = await context.newPage();
  page.on('console', (m) => m.type() === 'error' && console.log(`  [console ${width}] ${m.text()}`));
  page.on('pageerror', (e) => console.log(`  [pageerror ${width}] ${e.message}`));
  page.on('response', (r) => r.status() >= 400 && console.log(`  [http ${r.status()} ${width}] ${r.url()}`));
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });

  const renderer = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
    if (!gl) return null;
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    return dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  });
  if (!renderer) ok = false;

  const ready = await page
    .waitForSelector(readySel, { timeout: wait, state: 'attached' })
    .then(() => true)
    .catch(() => false);
  if (!ready) await page.waitForTimeout(100);
  if (settle) await page.waitForTimeout(settle);

  // Astro's dev toolbar is not part of the site.
  await page.evaluate(() => document.querySelectorAll('astro-dev-toolbar').forEach((el) => el.remove()));
  const file = path.join(out, `${width}${full ? '-full' : ''}.png`);
  await page.screenshot({ path: file, fullPage: full });
  console.log(`${width}px  WebGL: ${renderer ?? 'UNAVAILABLE'}  ready-flag: ${ready}  → ${file}`);
  await context.close();
}
await browser.close();
process.exit(ok ? 0 : 1);
