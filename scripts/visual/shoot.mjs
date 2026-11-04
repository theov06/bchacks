/**
 * Visual check helper (CLAUDE.md: screenshots at 390px and 1440px).
 * Usage: node scripts/visual/shoot.mjs <path> <outDir> [selector] [--frames=0.4,0.9,1.1]
 * Needs `npm run preview` (or dev) on PORT (default 4321). Uses scripts/visual/browser.mjs (bundled Chromium, WebGL on).
 */
import { launch, BASE_URL } from './browser.mjs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const [, , route = '/', out = 'shots', selector] = process.argv;
const frames = (process.argv.find((a) => a.startsWith('--frames=')) || '').slice(9).split(',').filter(Boolean).map(Number);
await mkdir(out, { recursive: true });

const browser = await launch();
for (const width of (process.env.WIDTHS || "390,1440").split(",").map(Number)) {
  const page = await browser.newPage({ viewport: { width, height: width < 600 ? 812 : 900 }, deviceScaleFactor: width < 600 ? 2 : 1 });
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.querySelectorAll('astro-dev-toolbar').forEach((el) => el.remove()));
  const target = selector ? page.locator(selector).first() : page;
  for (const t of frames) {
    // Freeze every CSS animation at time t (seconds) to inspect a reveal frame.
    await page.evaluate((ms) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ms; }), t * 1000);
    await target.screenshot({ path: path.join(out, `${width}-t${t}.png`) });
  }
  await page.evaluate(() => document.getAnimations().forEach((a) => { try { a.finish(); } catch {} }));
  await target.screenshot({ path: path.join(out, `${width}-final.png`), ...(selector ? {} : { fullPage: true }) });
  await page.close();
}
await browser.close();
console.log('saved to', out);
