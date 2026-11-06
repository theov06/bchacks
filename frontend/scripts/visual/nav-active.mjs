/**
 * Nav active state: nothing underlined at the top; a link is underlined only after its
 * section's heading passes the middle of the screen. Usage: node scripts/visual/nav-active.mjs [WxH]
 */
import { launch, BASE_URL } from './browser.mjs';
const [w, h] = (process.argv[2] || '1920x990').split('x').map(Number);
const browser = await launch();
const page = await browser.newPage({ viewport: { width: w, height: h } });
await page.goto(`${BASE_URL}/?world=off`, { waitUntil: 'load' });
await page.waitForTimeout(500);
const current = () => page.evaluate(() => [...document.querySelectorAll('[data-nav-link][aria-current="true"]')].map((a) => a.hash).join(',') || '(none)');
const scrollTo = async (y) => { await page.evaluate((y) => scrollTo(0, y), y); await page.waitForTimeout(150); };
let fails = 0;
const expect = async (label, want) => { const got = await current(); const ok = got === want; if (!ok) fails++; console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}: ${got}${ok ? '' : ` (want ${want})`}`); };
await expect('top of page', '(none)');
for (const id of ['about', 'tracks', 'schedule', 'sponsors', 'faq']) {
  const top = await page.evaluate((id) => document.querySelector(`#${id} h2`).getBoundingClientRect().top + scrollY, id);
  await scrollTo(top - h / 2 - 40);
  await expect(`#${id} heading 40px below middle`, id === 'about' ? '(none)' : await current());
  await scrollTo(top - h / 2 + 40);
  await expect(`#${id} heading 40px above middle`, `#${id}`);
}
await scrollTo(0);
await expect('back at top', '(none)');
await browser.close();
process.exitCode = fails ? 1 : 0;
