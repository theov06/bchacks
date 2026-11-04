/**
 * Contact sheet: crops the same region from several screenshots and lays them out in a grid with captions.
 * Usage: node scripts/visual/sheet.mjs <out.png> <cols> <cropX,cropY,w,h> <file:caption> ...
 */
import sharp from 'sharp';

const [, , out, colsArg, cropArg, ...items] = process.argv;
const cols = Number(colsArg);
const [cx, cy, cw, ch] = cropArg.split(',').map(Number);
const capH = 34;
const tiles = await Promise.all(
  items.map(async (it) => {
    const i = it.lastIndexOf(':');
    const file = it.slice(0, i);
    const caption = it.slice(i + 1);
    const img = await sharp(file).extract({ left: cx, top: cy, width: cw, height: ch }).png().toBuffer();
    const cap = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${capH}"><rect width="100%" height="100%" fill="#0F1539"/><text x="14" y="23" font-family="Consolas, monospace" font-size="15" letter-spacing="1.5" fill="#84DBF7">${caption}</text></svg>`,
    );
    return sharp({ create: { width: cw, height: ch + capH, channels: 3, background: '#0F1539' } })
      .composite([{ input: img, top: 0, left: 0 }, { input: cap, top: ch, left: 0 }])
      .png()
      .toBuffer();
  }),
);
const rows = Math.ceil(tiles.length / cols);
const gap = 6;
await sharp({ create: { width: cols * cw + (cols - 1) * gap, height: rows * (ch + capH) + (rows - 1) * gap, channels: 3, background: '#262C55' } })
  .composite(tiles.map((input, i) => ({ input, left: (i % cols) * (cw + gap), top: Math.floor(i / cols) * (ch + capH + gap) })))
  .png()
  .toFile(out);
console.log('sheet →', out);
