/** Logs the hero stage's data-world states over time for one page load. Usage: node scripts/visual/flow.mjs <path> <width> [hideAtMs] [totalMs] */
import { launch, BASE_URL } from './browser.mjs';
const [, , route = '/?gl=any', w = '1440', hideAt = '', total = '14000'] = process.argv;
const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: Number(w), height: 900 } })).newPage();
page.on('console', (m) => /\[world\]/.test(m.text()) && console.log('  console:', m.text().slice(0, 160)));
page.on('pageerror', (e) => console.log('  pageerror:', e.message.slice(0, 200)));
await page.addInitScript((hideAtMs) => {
  const t0 = performance.now();
  window.__log = [];
  new MutationObserver(() => {
    const v = document.querySelector('[data-world-slot]')?.dataset.world;
    if (v && window.__log.at(-1)?.v !== v) window.__log.push({ v, t: Math.round(performance.now() - t0) });
  }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-world'] });
  if (hideAtMs) {
    // Simulate switching to another app/tab while the 3D loads, and coming back 4 s later.
    let hidden = false;
    Object.defineProperty(document, 'hidden', { get: () => hidden });
    setTimeout(() => { hidden = true; document.dispatchEvent(new Event('visibilitychange')); }, hideAtMs);
    setTimeout(() => { hidden = false; document.dispatchEvent(new Event('visibilitychange')); }, hideAtMs + 4000);
  }
}, Number(hideAt) || 0);
await page.goto(`${BASE_URL}${route}`, { waitUntil: 'load' });
await page.waitForTimeout(Number(total));
const st = await page.evaluate(() => {
  const s = document.querySelector('[data-world-slot]');
  const canvas = s.querySelector('.world-canvas');
  const mark = s.querySelector('[data-world-mark]');
  return { log: window.__log, canvasOpacity: canvas && getComputedStyle(canvas).opacity, markOpacity: getComputedStyle(mark).opacity };
});
console.log(`  ${route} @${w}${hideAt ? ` (tab hidden at ${hideAt} ms for 4 s)` : ''}:`, JSON.stringify(st));
await browser.close();
