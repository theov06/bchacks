/** Keyboard check: tab order + focus styles on the home page, and the phone menu (open, focus inside, Esc). Usage: node scripts/visual/keyboard.mjs <outDir> */
import { launch, BASE_URL } from './browser.mjs';
const out = process.argv[2];
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.getAnimations().forEach((a) => { try { a.finish(); } catch {} }));
const seen = [];
for (let i = 0; i < 9; i++) {
  await page.keyboard.press('Tab');
  const label = await page.evaluate(() => { const a = document.activeElement; return `${a.tagName} "${(a.textContent || '').trim().slice(0, 30)}" outline=${getComputedStyle(a).outlineStyle}/${getComputedStyle(a).outlineColor}`; });
  seen.push(label);
  if (label.includes('Apply now') || label.includes('Sponsor us')) await page.screenshot({ path: `${out}/focus-${i}.png`, clip: { x: 80, y: 560, width: 420, height: 160 } });
}
console.log(seen.join('\n'));
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const mp = await m.newPage();
await mp.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
await mp.click('[data-menu-open]');
await mp.waitForTimeout(400);
await mp.screenshot({ path: `${out}/menu-390.png` });
console.log('menu open:', await mp.evaluate(() => document.querySelector('[data-menu]').open), 'focus in menu:', await mp.evaluate(() => !!document.activeElement.closest('[data-menu]')));
await mp.keyboard.press('Escape');
console.log('after Esc open:', await mp.evaluate(() => document.querySelector('[data-menu]').open));
await browser.close();
