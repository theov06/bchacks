/**
 * Hero fit check for wide/short screens.
 * For each viewport: hero height vs viewport, island fully visible (above the wave),
 * gap between the buttons and the bottom edge, and where the scenery's hills/trees start
 * behind each piece of copy (found by diffing the scenery against a sky-only copy of it).
 * Also reports scenery pixels brighter than the sky inside the header band (stars/sparkles).
 * Usage: node scripts/visual/hero-fit.mjs [route] [WxH ...]
 */
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { launch, BASE_URL } from './browser.mjs';

const args = process.argv.slice(2);
const route = args[0]?.startsWith('/') ? args.shift() : '/?world=off';
const sizes = (args.length ? args : ['1280x720', '1440x900', '1920x990', '2560x1300', '390x844']).map((s) => s.split('x').map(Number));

// Sky-only scenery: drop every landscape layer, keep sky, stars, sun, clouds.
const svg = readFileSync(new URL('../../public/okanagan-dusk.svg', import.meta.url), 'utf8');
const cut = (s, from, to) => s.slice(0, s.indexOf(from)) + s.slice(s.indexOf(to));
const skyOnly = cut(svg, '<g id="far">', '<g id="textcalm">');
const skyUrl = `data:image/svg+xml;base64,${Buffer.from(skyOnly).toString('base64')}`;

const browser = await launch();
let failed = false;
for (const [width, height] of sizes) {
  const page = await (await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'reduce' })).newPage();
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  const m = await page.evaluate(() => {
    const box = (el) => { const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
    const hero = document.getElementById('top');
    const h1 = document.getElementById('hero-title');
    const copy = h1.parentElement;
    const pick = (sel) => [...copy.querySelectorAll(sel)];
    const els = {
      eyebrow: pick('.eyebrow')[0],
      headline: h1,
      lede: pick('p[class*=lede]')[0],
      facts: pick('dl')[0],
      buttons: pick('div[class*=actions]')[0],
    };
    const header = document.querySelector('[data-header]');
    const img = hero.querySelector('[data-world-mark] img');
    const wave = hero.querySelector('svg[class*=wave]');
    return {
      hero: box(hero),
      header: box(header),
      // Logo, nav links and Apply: the things stars must stay out from behind (24px margin).
      headerItems: [...header.querySelectorAll('a, button')].filter((el) => el.getBoundingClientRect().width > 0).map(box),
      island: box(img),
      wave: box(wave),
      els: Object.fromEntries(Object.entries(els).filter(([, e]) => e).map(([k, e]) => {
        // Use the union of the element's children so we measure the text, not the empty width of a block.
        const kids = [...e.querySelectorAll('span, dd, dt, a, button, input')].filter((k) => k.getBoundingClientRect().width > 0);
        const rects = (kids.length ? kids : [e]).map((k) => k.getBoundingClientRect());
        return [k, { l: Math.min(...rects.map((r) => r.left)), r: Math.max(...rects.map((r) => r.right)), t: e.getBoundingClientRect().top, b: e.getBoundingClientRect().bottom }];
      })),
    };
  });

  await page.evaluate(() => document.getElementById('hero-title').parentElement.setAttribute('data-measure-copy', ''));
  // Hide everything except the scenery, screenshot (A), swap in the sky-only scenery, screenshot (B).
  await page.addStyleTag({ content: '[data-header], [data-notice], #top svg, #top [data-world-slot], #hero-title { opacity: 0 !important; } #hero-title + p, #top dl { opacity: 0 !important } #hero-title ~ * , #top .eyebrow { opacity: 0 !important } #top [data-measure-copy]::before { opacity: 0 !important } astro-dev-toolbar { display:none !important }' });
  const clip = { x: 0, y: 0, width, height: Math.min(height, Math.ceil(m.hero.b)) };
  const shotA = await page.screenshot({ clip });
  await page.evaluate((u) => new Promise((res) => { const i = document.querySelector('#top [data-scenery-art]'); i.onload = () => res(); i.src = u; }), skyUrl);
  await page.waitForTimeout(300);
  const shotB = await page.screenshot({ clip });
  if (process.env.DUMP) { await sharp(shotA).toFile(`${process.env.DUMP}/fit-${width}-a.png`); await sharp(shotB).toFile(`${process.env.DUMP}/fit-${width}-b.png`); }
  const [a, b] = await Promise.all([shotA, shotB].map((p) => sharp(p).raw().toBuffer({ resolveWithObject: true })));
  const W = a.info.width, H = a.info.height, C = a.info.channels;
  const fgTop = (l, r) => {
    for (let y = 0; y < H; y++)
      for (let x = Math.max(0, Math.floor(l)); x < Math.min(W, Math.ceil(r)); x++) {
        const i = (y * W + x) * C;
        if (Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]) > 24) return y;
      }
    return H;
  };

  // Header items: a star or sparkle shows up as a pixel well above the sky around it, so
  // compare each pixel with the darkest-to-median sky in the same box (the sky itself
  // is lighter on very wide screens, so a fixed threshold won't do).
  const band = Math.ceil(m.header.b);
  let bandMax = 0, bandAt = null;
  for (const it of m.headerItems) {
    const sums = [];
    const x0 = Math.max(0, Math.floor(it.l - 24)), x1 = Math.min(W, Math.ceil(it.r + 24));
    const y0 = Math.max(0, Math.floor(it.t - 24)), y1 = Math.min(H, Math.ceil(it.b + 24));
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * W + x) * C; sums.push([a.data[i] + a.data[i + 1] + a.data[i + 2], x, y]); }
    const med = [...sums].sort((p, q) => p[0] - q[0])[sums.length >> 1][0];
    for (const [v, x, y] of sums) if (v - med > bandMax) { bandMax = v - med; bandAt = [x, y]; }
  }
  const ok = (c) => (c ? 'ok  ' : 'FAIL');
  const heroH = Math.round(m.hero.b - m.hero.t);
  const desktop = width >= 1024;
  console.log(`\n== ${width}x${height}  hero ${heroH}px ${desktop ? ok(heroH <= height) : '    '}`);
  const islandOk = m.island.t >= m.header.b - 1 && m.island.b <= m.wave.t + 2 && m.island.l >= 0 && m.island.r <= width;
  console.log(`  island  ${Math.round(m.island.r - m.island.l)}x${Math.round(m.island.b - m.island.t)} top ${Math.round(m.island.t)} bottom ${Math.round(m.island.b)} (wave top ${Math.round(m.wave.t)}) ${ok(islandOk)}`);
  if (desktop) {
    const room = Math.round(m.hero.b - m.els.buttons.b);
    console.log(`  buttons bottom ${Math.round(m.els.buttons.b)}, ${room}px above hero bottom ${ok(room >= 96)}`);
  }
  for (const [k, e] of Object.entries(m.els)) {
    const top = fgTop(e.l, e.r);
    const need = k === 'buttons' ? 32 : 0;
    const gap = Math.round(top - e.b);
    const pass = gap >= need;
    if (!pass) failed = true;
    console.log(`  ${k.padEnd(9)} bottom ${String(Math.round(e.b)).padStart(4)}  scene starts ${String(top).padStart(4)}  gap ${String(gap).padStart(4)} ${ok(pass)}`);
  }
  const bandOk = bandMax < 60;
  console.log(`  behind logo/nav/Apply (header 0-${band}px) brightest above local sky ${bandMax}${bandAt ? ` at ${bandAt}` : ''} ${ok(bandOk)}`);
  if (!islandOk || !bandOk || (desktop && heroH > height)) failed = true;
  await page.close();
}
await browser.close();
process.exitCode = failed ? 1 : 0;
