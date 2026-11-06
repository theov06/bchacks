/**
 * Pre-deploy checks for the 3D hero (run against a production build: npm run build && astro preview).
 *   1  screenshots at 390 (medium tier) and 1440 (high tier) once the island has assembled
 *   2  reduced motion: a still, finished island and no animation (two frames 1.5 s apart must match)
 *   3  fallbacks: WebGL disabled, a low-power device, and this machine's default (software WebGL)
 *   4  slow network + 4× CPU: hero text and Apply visible before the 3D chunk starts downloading
 *   5  page weight: every response, with and without the 3D
 * Usage: BASE_URL=http://localhost:4400 node scripts/visual/predeploy.mjs <outDir>   (ONLY=3 runs one check)
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { launch, BASE_URL } from './browser.mjs';

const out = process.argv[2] || 'shots/predeploy';
await mkdir(out, { recursive: true });
const WORLD_ON = '[data-world-slot]:is([data-world=assemble],[data-world=ready],[data-world=still])';
const WORLD_ANY = '[data-world-slot]:is([data-world=assemble],[data-world=ready],[data-world=still],[data-world=fallback])';
const stageState = (page) => page.evaluate(() => document.querySelector('[data-world-slot]')?.dataset.world);
const log = (...a) => console.log(...a);
const only = process.env.ONLY;
const run = (n) => !only || only.split(',').includes(String(n));

const browser = await launch();
const ctx = (w, extra = {}) => browser.newContext({ viewport: { width: w, height: w < 600 ? 844 : 900 }, deviceScaleFactor: w < 600 ? 2 : 1, ...extra });

/* 1 — screenshots */
if (run(1)) {
log('\n[1] Screenshots');
for (const [w, tier] of [[1440, 'high'], [390, 'medium']]) {
  const c = await ctx(w);
  const p = await c.newPage();
  await p.goto(`${BASE_URL}/?world=${tier}`, { waitUntil: 'load' });
  await p.waitForSelector(WORLD_ON, { timeout: 180000 });
  await p.waitForTimeout(6000);
  const file = path.join(out, `1-hero-${w}.png`);
  await p.screenshot({ path: file });
  log(`  ${w}px ${tier}: state=${await stageState(p)} → ${file}`);
  await c.close();
}

}

/* 2 — reduced motion */
if (run(2)) {
log('\n[2] Reduced motion');
{
  const c = await ctx(390, { reducedMotion: 'reduce' });
  const p = await c.newPage();
  await p.goto(`${BASE_URL}/?world=medium`, { waitUntil: 'load' });
  await p.waitForSelector(WORLD_ANY, { timeout: 180000 });
  await p.waitForTimeout(3000);
  const a = await p.screenshot();
  await p.waitForTimeout(1500);
  const b = await p.screenshot();
  const [ra, rb] = await Promise.all([sharp(a).raw().toBuffer(), sharp(b).raw().toBuffer()]);
  let diff = 0;
  for (let i = 0; i < ra.length; i++) if (Math.abs(ra[i] - rb[i]) > 2) diff++;
  const running = await p.evaluate(() => document.getAnimations().filter((x) => x.playState === 'running').length);
  await sharp(a).toFile(path.join(out, '2-reduced-motion-390.png'));
  log(`  state=${await stageState(p)}  intro class=${await p.evaluate(() => document.documentElement.classList.contains('logo-intro'))}`);
  log(`  pixels changed between two frames 1.5 s apart: ${diff}  |  running CSS animations: ${running}`);
  await c.close();
}

}

/* 3 — fallbacks */
if (run(3)) {
log('\n[3] Fallbacks');
{
  const noGl = await chromium.launch({ args: ['--disable-webgl', '--disable-webgl2', '--disable-3d-apis'] });
  const c = await noGl.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await c.newPage();
  await p.goto(`${BASE_URL}/`, { waitUntil: 'load' });
  await p.waitForSelector(WORLD_ANY, { timeout: 60000 });
  await p.waitForTimeout(2500); // let the 1.2 s 2D reveal finish
  await p.screenshot({ path: path.join(out, '3a-webgl-off-390.png') });
  log(`  WebGL disabled: state=${await stageState(p)}  2D logo visible=${await p.evaluate(() => { const m = document.querySelector('[data-world-mark]'); return !!m && getComputedStyle(m).opacity === '1' && m.getBoundingClientRect().height > 0; })}`);
  await noGl.close();
}
{
  const c = await ctx(1440);
  await c.addInitScript(() => Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 2 }));
  const p = await c.newPage();
  await p.goto(`${BASE_URL}/`, { waitUntil: 'load' });
  await p.waitForSelector(WORLD_ANY, { timeout: 60000 });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: path.join(out, '3b-low-power-1440.png') });
  log(`  Low-power (2 cores): state=${await stageState(p)}`);
  await c.close();
}
{
  const c = await ctx(1440);
  const p = await c.newPage();
  await p.goto(`${BASE_URL}/`, { waitUntil: 'load' });
  await p.waitForSelector(WORLD_ANY, { timeout: 60000 });
  log(`  Default on this machine (software WebGL, no override): state=${await stageState(p)}`);
  await c.close();
}

}

/* 4 — slow network */
if (run(4)) {
log('\n[4] Slow network (≈ slow 3G: 400 ms RTT, 400 kbit/s) + 4× CPU, 390px, 3D forced on');
{
  const c = await ctx(390);
  const p = await c.newPage();
  const cdp = await c.newCDPSession(p);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: (400 * 1024) / 8, uploadThroughput: (400 * 1024) / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await c.addInitScript(() => {
    window.__marks = {};
    const t0 = performance.now();
    const tick = () => {
      const h1 = document.getElementById('hero-title');
      const apply = [...document.querySelectorAll('#top a')].find((a) => /apply now/i.test(a.textContent || ''));
      const vis = (el) => el && el.getBoundingClientRect().height > 0 && getComputedStyle(el).visibility !== 'hidden';
      if (!window.__marks.text && vis(h1)) window.__marks.text = Math.round(performance.now() - t0);
      if (!window.__marks.apply && vis(apply)) window.__marks.apply = Math.round(performance.now() - t0);
      if (!window.__marks.text || !window.__marks.apply) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  const t0 = Date.now();
  const net = {};
  p.on('request', (r) => {
    if (/mountHero|client\.[\w-]+\.js/.test(r.url()) && !net.start) net.start = Date.now() - t0;
  });
  p.on('requestfinished', (r) => {
    if (/mountHero/.test(r.url())) net.end = Date.now() - t0;
  });
  await p.goto(`${BASE_URL}/?world=medium`, { waitUntil: 'commit' });
  await p.waitForFunction(() => window.__marks?.text && window.__marks?.apply, null, { timeout: 120000 });
  await p.screenshot({ path: path.join(out, '4-slow-network-text-first-390.png') });
  const fcp = await p.evaluate(() => Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? -1));
  const marks = await p.evaluate(() => window.__marks);
  await p.waitForSelector(WORLD_ANY, { timeout: 240000 }).catch(() => {});
  log(`  first contentful paint: ${fcp} ms`);
  log(`  hero headline visible: ${marks.text} ms  |  Apply button visible: ${marks.apply} ms`);
  log(`  3D chunk request started: ${net.start ?? 'never'} ms  |  finished: ${net.end ?? 'not yet'} ms  |  final state: ${await stageState(p)}`);
  await c.close();
}

}

/* 5 — page weight */
if (run(5)) {
log('\n[5] Page weight (uncompressed bytes as served by `astro preview`; a static host adds gzip/brotli)');
for (const q of ['?world=off', '?world=medium', '?world=high']) {
  const c = await ctx(q.endsWith('high') ? 1440 : 390);
  const p = await c.newPage();
  const items = [];
  p.on('requestfinished', async (r) => {
    const s = await r.sizes().catch(() => null);
    items.push({ url: r.url(), type: r.resourceType(), bytes: s?.responseBodySize ?? 0 });
  });
  await p.goto(`${BASE_URL}/${q}`, { waitUntil: 'load' });
  await p.waitForSelector(WORLD_ANY, { timeout: 180000 });
  await p.waitForTimeout(2500);
  const by = {};
  for (const i of items) by[i.type] = (by[i.type] || 0) + i.bytes;
  const total = items.reduce((a, b) => a + b.bytes, 0);
  log(`  ${q.padEnd(14)} requests ${String(items.length).padStart(3)}  total ${(total / 1024).toFixed(0).padStart(5)} KB  ` + Object.entries(by).map(([k, v]) => `${k} ${(v / 1024).toFixed(0)}KB`).join(' · '));
  await c.close();
}

}

await browser.close();
