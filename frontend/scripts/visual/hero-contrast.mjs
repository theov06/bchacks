/**
 * Measures WCAG contrast of every hero text element against the rendered pixels behind it.
 * Hides the text, screenshots, then takes the worst-case (closest-to-text) background pixel in each box.
 * Usage: node scripts/visual/hero-contrast.mjs <path> <width>
 */
import sharp from 'sharp';
import { launch, BASE_URL } from './browser.mjs';
const [, , route = '/?world=off', w = '1440'] = process.argv;
const width = Number(w);
const lin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const L = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const cr = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const browser = await launch();
const page = await (await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })).newPage();
await page.goto(`${BASE_URL}${route}`, { waitUntil: 'load' });
await page.waitForTimeout(2500);
const items = await page.evaluate(() => {
  const sel = '#top .eyebrow, #hero-title > span, #top p[class*=lede], #top dt, #top dd';
  return [...document.querySelectorAll(sel)].filter((el) => !el.classList.contains('visually-hidden')).map((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return { text: el.textContent.trim().slice(0, 28), x: r.left, y: r.top, w: r.width, h: r.height, color: cs.color, size: parseFloat(cs.fontSize), weight: +cs.fontWeight, grad: cs.backgroundClip === 'text' || !!el.querySelector('.sky-text') };
  });
});
// Hide the copy column's text (CSS-module class names are hashed, so find it from the h1).
await page.evaluate(() => {
  const copy = document.getElementById('hero-title').parentElement;
  copy.setAttribute('data-measure', '');
});
await page.addStyleTag({ content: '[data-measure] * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; } [data-measure] .sky-text { background: none !important; } [data-measure] .eyebrow::before { opacity: 0 }' });
await page.waitForTimeout(300);
const png = await page.screenshot();
const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
let worstAll = 99;
for (const it of items) {
  const fg = it.color.match(/\d+/g).slice(0, 3).map(Number);
  let worst = 99, worstPx = null;
  for (let y = Math.max(0, Math.floor(it.y)); y < Math.min(info.height, it.y + it.h); y += 2)
    for (let x = Math.max(0, Math.floor(it.x)); x < Math.min(info.width, it.x + it.w); x += 2) {
      const i = (y * info.width + x) * info.channels;
      const px = [data[i], data[i + 1], data[i + 2]];
      const c = cr(fg, px);
      if (c < worst) { worst = c; worstPx = px; }
    }
  const large = it.size >= 24 || (it.size >= 18.66 && it.weight >= 700);
  const need = large ? 3 : 4.5;
  if (!it.grad) worstAll = Math.min(worstAll, worst / need);
  console.log(`${(worst >= need ? 'PASS' : 'FAIL').padEnd(5)} ${worst.toFixed(2).padStart(5)}:1 (needs ${need}) ${it.grad ? '[gradient] ' : ''}"${it.text}"  bg worst #${worstPx.map((v) => v.toString(16).padStart(2, '0')).join('')}`);
}
await browser.close();
