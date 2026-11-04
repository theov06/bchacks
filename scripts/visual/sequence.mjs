/**
 * Captures the first-visit hero sequence: 2D reveal → logo flies into the landmark as the island assembles.
 * Logs every data-world state change with its time, and saves frames at the given offsets after 3D starts.
 * Usage: node scripts/visual/sequence.mjs <path> <outDir> [width] [offsetsMs]
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { launch, BASE_URL } from './browser.mjs';

const [, , route = '/?world=high', out = 'shots/sequence', w = '1440', offs = '0,250,500,800,1400'] = process.argv;
const width = Number(w);
await mkdir(out, { recursive: true });
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.addInitScript(() => {
  const t0 = performance.now();
  window.__worldLog = [];
  new MutationObserver(() => {
    const s = document.querySelector('[data-world-slot]');
    const v = s?.dataset.world;
    const last = window.__worldLog.at(-1);
    if (v && (!last || last.v !== v)) window.__worldLog.push({ v, t: Math.round(performance.now() - t0) });
  }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-world'] });
});
await page.goto(`${BASE_URL}${route}`, { waitUntil: 'commit' });
await page.waitForSelector('[data-world-slot]:is([data-world=assemble],[data-world=ready],[data-world=still],[data-world=fallback])', { timeout: 180000 });
const clip = await page.evaluate(() => {
  const r = document.querySelector('[data-world-slot]').getBoundingClientRect();
  return { x: Math.max(0, r.left - 60), y: Math.max(0, r.top - 30), width: Math.min(innerWidth, r.width + 120), height: r.height + 60 };
});
let prev = 0;
for (const o of offs.split(',').map(Number)) {
  await page.waitForTimeout(o - prev);
  prev = o;
  await page.screenshot({ path: path.join(out, `${width}-t${o}.png`), clip });
}
console.log('intro class:', await page.evaluate(() => document.documentElement.classList.contains('logo-intro')));
console.log('states:', JSON.stringify(await page.evaluate(() => window.__worldLog)));
await browser.close();
