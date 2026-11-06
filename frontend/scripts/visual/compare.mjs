/**
 * Side-by-side: design screenshot (left) vs our screenshot (right), cropped to the same height.
 * Usage: node scripts/visual/compare.mjs <design.png> <ours.png> <out.png> [height]
 */
import sharp from 'sharp';
const [, , design, ours, out, hArg] = process.argv;
const [a, b] = await Promise.all([sharp(design).metadata(), sharp(ours).metadata()]);
// Normalise both to the design's width (our 390 shots are 2× DPR).
const w = a.width;
const bh = Math.round((b.height * w) / b.width);
const h = Math.min(Number(hArg) || Infinity, a.height, bh);
const left = await sharp(design).extract({ left: 0, top: 0, width: w, height: h }).toBuffer();
const right = await sharp(await sharp(ours).resize(w).toBuffer()).extract({ left: 0, top: 0, width: w, height: h }).toBuffer();
const label = (t) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="34"><rect width="100%" height="100%" fill="#0E1446"/><text x="12" y="23" font-family="Consolas, monospace" font-size="16" fill="#FFD08A">${t}</text></svg>`);
const gap = 8;
await sharp({ create: { width: w * 2 + gap, height: h + 34, channels: 3, background: '#FFD08A' } })
  .composite([
    { input: label('DESIGN'), left: 0, top: 0 },
    { input: label('LIVE BUILD'), left: w + gap, top: 0 },
    { input: left, left: 0, top: 34 },
    { input: right, left: w + gap, top: 34 },
  ])
  .png()
  .toFile(out);
console.log('compare →', out);
