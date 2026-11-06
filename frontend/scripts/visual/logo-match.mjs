/**
 * Shape check: is the 3D landmark's silhouette exactly the clean 2D SVG logo?
 * Renders /dev/landmark/mask (bare logo, flat white, orthographic camera fitted to the
 * SVG viewBox) at 514 × 1024, rasterises LOGO_B / LOGO_C at the same size, and compares.
 * Reports IoU, mismatched pixels, and how far any mismatch sits from the SVG edge.
 * Writes a diff PNG: white = both, red = 3D only, cyan = SVG only.
 *
 * Usage: node scripts/visual/logo-match.mjs <outDir>   (dev server at BASE_URL)
 */
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { launch, BASE_URL } from './browser.mjs';

const out = process.argv[2] || 'shots/logo-match';
await mkdir(out, { recursive: true });
const W = 514;
const H = 1024;

// Polygons straight from the source module (no copy that could drift).
const src = await readFile(new URL('../../src/lib/logoGeometry.ts', import.meta.url), 'utf8');
const B = src.match(/LOGO_B = '([^']+)'/)[1];
const C = src.match(/LOGO_C = '([^']+)'/)[1];
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="276 131 257 512"><rect x="276" y="131" width="257" height="512" fill="#000"/><g fill="#fff"><polygon points="${B}"/><polygon points="${C}"/></g></svg>`;
const ref = await sharp(Buffer.from(svg)).greyscale().raw().toBuffer();

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(`${BASE_URL}/dev/landmark/mask/`, { waitUntil: 'networkidle' });
await page.waitForSelector('html[data-ready]', { timeout: 120000 });
await page.evaluate(() => document.querySelectorAll('astro-dev-toolbar').forEach((el) => el.remove()));
const png = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H } });
await browser.close();
const got = await sharp(png).greyscale().raw().toBuffer();

const on = (buf, i) => buf[i] >= 128;
let both = 0, union = 0, only3d = 0, onlySvg = 0, worst = 0;
const diff = Buffer.alloc(W * H * 3);
// Distance (in px) from a pixel to the nearest pixel where the SVG mask changes value.
const edgeDist = (x, y) => {
  const v = on(ref, y * W + x);
  for (let r = 1; r <= 12; r++) {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      if (on(ref, ny * W + nx) !== v) return r;
    }
  }
  return 99;
};
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = y * W + x;
  const a = on(got, i), b = on(ref, i);
  if (a || b) union++;
  if (a && b) both++;
  const o = i * 3;
  if (a && b) diff.fill(255, o, o + 3);
  else if (a) { only3d++; diff[o] = 255; worst = Math.max(worst, edgeDist(x, y)); }
  else if (b) { onlySvg++; diff[o + 1] = 220; diff[o + 2] = 255; worst = Math.max(worst, edgeDist(x, y)); }
}
await sharp(diff, { raw: { width: W, height: H, channels: 3 } }).png().toFile(path.join(out, 'diff.png'));
await sharp(png).toFile(path.join(out, 'mask-3d.png'));
const iou = both / union;
console.log(`IoU ${(iou * 100).toFixed(3)}%  |  3D-only px ${only3d}  |  SVG-only px ${onlySvg}  |  logo area ${both} px`);
console.log(`Furthest mismatch from the SVG edge: ${worst} px (at 2 px per SVG unit)`);
console.log(iou > 0.995 && worst <= 1 ? 'MATCH: silhouette equals the clean SVG within 1 px (anti-aliasing).' : 'MISMATCH: see diff.png');
console.log('diff →', path.join(out, 'diff.png'));
