/** Debug probe: opens a page, collects console/page errors and failed requests, prints an expression after a wait. Usage: node scripts/visual/probe.mjs <path> <expr> [waitMs] */
import { launch, BASE_URL } from './browser.mjs';
const [, , route = '/', expr = 'document.title', waitArg = '15000'] = process.argv;
const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && !/unmount a root/.test(m.text()) && console.log(`[${m.type()}] ${m.text().slice(0, 300)}`));
page.on('pageerror', (e) => console.log('[pageerror]', e.message.slice(0, 300)));
page.on('response', (r) => r.status() >= 400 && console.log(`[http ${r.status()}] ${r.url()}`));
await page.goto(`${BASE_URL}${route}`, { waitUntil: 'load' });
await page.waitForTimeout(Number(waitArg));
console.log('→', await page.evaluate(expr));
await browser.close();
