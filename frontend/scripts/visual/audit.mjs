/**
 * Accessibility basics: axe (WCAG 2.2 A/AA) + horizontal overflow at 320/390/1440.
 * Usage: node scripts/visual/audit.mjs [/ /apply ...]   (preview server on PORT, default 4321)
 */
import { launch, BASE_URL } from './browser.mjs';
import { AxeBuilder } from '@axe-core/playwright';

const routes = process.argv.slice(2).length ? process.argv.slice(2) : ['/', '/apply/', '/live/', '/404.html'];
const browser = await launch();
let failed = false;
for (const route of routes) {
  for (const width of [320, 390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.getAnimations().forEach((a) => { try { a.finish(); } catch {} }));
    const overflow = await page.evaluate(() => {
      const w = document.documentElement.clientWidth;
      const wide = [...document.querySelectorAll('body *')]
        .filter((el) => el.getBoundingClientRect().right > w + 1 && getComputedStyle(el).position !== 'fixed' && !el.closest('[aria-hidden="true"]'))
        .slice(0, 5)
        .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} → ${Math.round(el.getBoundingClientRect().right)}px`);
      return { scroll: document.documentElement.scrollWidth > w, wide };
    });
    if (overflow.scroll || overflow.wide.length) {
      failed = true;
      console.log(`OVERFLOW ${route} @${width}: page scrolls=${overflow.scroll}`, overflow.wide);
    }
    if (width !== 320) {
      const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      const bad = res.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
      const minor = res.violations.filter((v) => !['serious', 'critical'].includes(v.impact));
      for (const v of bad) {
        failed = true;
        console.log(`AXE ${v.impact} ${route} @${width}: ${v.id} — ${v.help}`);
        v.nodes.slice(0, 4).forEach((n) => console.log('   ', n.target.join(' '), n.failureSummary?.split('\n')[1] ?? ''));
      }
      for (const v of minor) console.log(`axe ${v.impact} ${route} @${width}: ${v.id} (${v.nodes.length})`);
      if (process.env.VERBOSE) for (const v of res.incomplete) console.log(`  needs review: ${v.id} — ${v.nodes.length} node(s): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
      console.log(`checked ${route} @${width}: ${bad.length} serious/critical, ${minor.length} minor, ${res.incomplete.length} needs-review`);
    }
    await context.close();
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
