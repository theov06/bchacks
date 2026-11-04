/**
 * Section-by-section comparison with the v3 design.
 * Renders the design mockup (docs/bchacks-design-reference-v3/index.html, file://) and our
 * page at the same widths, crops each section and saves them side by side:
 *   <outDir>/<width>-<section>.png   (DESIGN left, LIVE BUILD right)
 * Usage: node scripts/visual/sections.mjs <outDir> [widths=390,1440,1920] [sections=all]
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { launch, BASE_URL } from './browser.mjs';

const [, , out = 'shots/sections', widthArg = '390,1440,1920', only = ''] = process.argv;
const widths = widthArg.split(',').map(Number);
const sections = {
  hero: '#top',
  about: 'section[aria-labelledby="about-title"]',
  tracks: '#tracks',
  schedule: '#schedule',
  sponsors: '#sponsors',
  involved: '#involved',
  faq: '#faq',
  footer: 'footer',
};
const pick = only ? only.split(',') : Object.keys(sections);
const designUrl = pathToFileURL(path.resolve('docs/bchacks-design-reference-v3/index.html')).href;
await mkdir(out, { recursive: true });

/*
 * One screenshot per section. Full-page captures taller than the GPU texture limit
 * (~8192px with SwiftShader) repeat from the top, so each section is shot on its own:
 * the hero at the normal viewport, every other section with the viewport resized to the
 * section's height and scrolled to it (nothing below the hero depends on the viewport
 * height). The sticky header is hidden for those so it doesn't cover the section's top.
 */
async function capture(browser, url, width) {
  const height = width < 600 ? 844 : 900;
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.querySelectorAll('astro-dev-toolbar').forEach((el) => el.remove()));
  await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager')));
  await page.waitForTimeout(600);
  const shots = {};
  for (const name of pick) {
    const sel = sections[name];
    if (name !== 'hero') {
      await page.addStyleTag({ content: '[data-header], header[style*="absolute"] { visibility: hidden !important; }' });
    }
    const box = await page.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { top: Math.round(b.top + scrollY), height: Math.round(b.height) };
    }, sel);
    if (!box) continue;
    if (name === 'hero') {
      await page.evaluate(() => scrollTo(0, 0));
      shots[name] = { png: await page.screenshot({ clip: { x: 0, y: 0, width, height: Math.min(box.height, height) } }), height: box.height };
      continue;
    }
    await page.setViewportSize({ width, height: Math.min(box.height, 8000) });
    const top = await page.evaluate((s) => {
      const el = document.querySelector(s);
      return Math.round(el.getBoundingClientRect().top + scrollY);
    }, sel);
    await page.evaluate((y) => scrollTo(0, y), top);
    await page.waitForTimeout(250);
    shots[name] = { png: await page.screenshot(), height: box.height };
  }
  await page.close();
  return shots;
}

const label = (t, w) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="30"><rect width="100%" height="100%" fill="#0E1446"/><text x="10" y="21" font-family="Consolas, monospace" font-size="15" fill="#FFD08A">${t}</text></svg>`);

const browser = await launch();
for (const width of widths) {
  const [design, ours] = [await capture(browser, designUrl, width), await capture(browser, `${BASE_URL}/?world=off`, width)];
  for (const name of pick) {
    const d = design[name];
    const o = ours[name];
    if (!d || !o) {
      console.log(`${width} ${name}: missing in ${!d ? 'design' : 'ours'}`);
      continue;
    }
    const [dm, om] = await Promise.all([sharp(d.png).metadata(), sharp(o.png).metadata()]);
    const h = Math.max(dm.height, om.height) + 30;
    const gap = 12;
    await sharp({ create: { width: width * 2 + gap, height: h, channels: 3, background: '#FFD08A' } })
      .composite([
        { input: label(`DESIGN ${width} · ${name} · ${d.height}px`, width), left: 0, top: 0 },
        { input: label(`LIVE ${width} · ${name} · ${o.height}px`, width), left: width + gap, top: 0 },
        { input: d.png, left: 0, top: 30 },
        { input: o.png, left: width + gap, top: 30 },
      ])
      .png()
      .toFile(path.join(out, `${width}-${name}.png`));
    console.log(`${width} ${name.padEnd(9)} design ${String(d.height).padStart(5)}px  live ${String(o.height).padStart(5)}px`);
  }
}
await browser.close();
console.log('saved to', out);
