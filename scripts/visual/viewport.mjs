/**
 * Viewport-only screenshots (what a visitor sees without scrolling), with animations finished.
 * Usage: node scripts/visual/viewport.mjs <path> <outDir>   (WIDTHS=390,1440; heights 844 / 900, or SIZES=1280x720,1920x990)
 */
import { launch, BASE_URL } from './browser.mjs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const [, , route = '/', out = 'shots'] = process.argv;
await mkdir(out, { recursive: true });
const browser = await launch();
const sizes = process.env.SIZES
  ? process.env.SIZES.split(',').map((s) => s.split('x').map(Number))
  : (process.env.WIDTHS || '390,1440').split(',').map(Number).map((w) => [w, w < 600 ? 844 : 900]);
for (const [width, height] of sizes) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: width < 600 ? 2 : 1 });
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.getAnimations().forEach((a) => { try { a.finish(); } catch {} }));
  await page.evaluate(() => document.querySelectorAll('astro-dev-toolbar').forEach((el) => el.remove()));
  await page.screenshot({ path: path.join(out, process.env.SIZES ? `${width}x${height}.png` : `${width}-viewport.png`) });
  await page.close();
}
await browser.close();
console.log('saved to', out);
