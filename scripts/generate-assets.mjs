/**
 * Generates brand assets into public/ from the traced logo polygons:
 *   favicon.svg, favicon.ico (32px), apple-touch-icon.png (180px), icon-192/512.png,
 *   site.webmanifest, og-image.png (1200×630) and sample sponsor logos.
 *
 * Run: npm run assets
 * The social card is rendered with headless Chrome/Edge so it uses the real
 * brand fonts. Set CHROME_PATH if the browser is not found automatically.
 */
import sharp from 'sharp';
import { writeFile, mkdir, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = (...p) => path.join(root, 'public', ...p);
await mkdir(pub('sponsors'), { recursive: true });

// Polygons traced from logo.jpg (same as src/components/ui/Logo.tsx)
const B = '282,280 340,245 340,528 405,566 464,531 405,497 405,428 527,497 527,565 405,637 282,565';
const C = '405,207 527,137 527,210 464,247 464,314 527,350 527,420 405,350';
// Sky Circuit logo gradients (spec 6B): dark surfaces and light surfaces.
const gradient = (id, stops) =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="440" y1="137" x2="370" y2="637">` +
  stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('') +
  '</linearGradient>';
const grad = gradient('g', [[0, '#B5ECFF'], [0.45, '#84DBF7'], [1, '#3B82F6']]);
const gradLight = gradient('gl', [[0, '#1E7FB8'], [1, '#1D4ED8']]);
const mark = (fill = 'url(#g)', cls = '') => `<g${cls ? ` class="${cls}"` : ''} fill="${fill}"><polygon points="${B}"/><polygon points="${C}"/></g>`;
// Soft outer glow for dark surfaces (#84DBF7 ~45%, #3B82F6 ~35%)
const glow =
  '<filter id="glow" x="-60%" y="-30%" width="220%" height="160%">' +
  '<feGaussianBlur in="SourceAlpha" stdDeviation="14" result="a"/><feFlood flood-color="#84DBF7" flood-opacity=".45"/><feComposite in2="a" operator="in" result="g1"/>' +
  '<feGaussianBlur in="SourceAlpha" stdDeviation="34" result="b"/><feFlood flood-color="#3B82F6" flood-opacity=".35"/><feComposite in2="b" operator="in" result="g2"/>' +
  '<feMerge><feMergeNode in="g2"/><feMergeNode in="g1"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';

// Square icon: monogram on --navy with a faint blueprint grid and a construction circle
function iconSvg(size, pad = 0.2, detail = true) {
  const box = 500 / (1 - pad * 2); // logo is 245×500 in source units
  const cx = 404.5;
  const cy = 387;
  const x0 = cx - box / 2;
  const y0 = cy - box / 2;
  const step = box / 6;
  let lines = '';
  for (let i = 1; i < 6; i++) {
    lines += `<path d="M${x0 + i * step} ${y0}V${y0 + box}M${x0} ${y0 + i * step}H${x0 + box}"/>`;
  }
  const blueprint = detail
    ? `<g fill="none" stroke="#262C55" stroke-width="${box / 220}">${lines}</g>` +
      `<circle cx="${cx}" cy="${cy}" r="${box * 0.36}" fill="none" stroke="#84DBF7" stroke-opacity=".22" stroke-width="${box / 260}"/>`
    : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${x0} ${y0} ${box} ${box}">` +
    `<defs>${grad}${detail ? glow : ''}</defs><rect x="${x0}" y="${y0}" width="${box}" height="${box}" fill="#0F1539"/>${blueprint}` +
    `<g${detail ? ' filter="url(#glow)"' : ''}>${mark()}</g></svg>`
  );
}

// favicon.svg: transparent; sky gradient in dark tabs, darker gradient in light tabs
await writeFile(
  pub('favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="154.5 137 500 500"><defs>${grad}${gradLight}</defs>` +
    `<style>.m{fill:url(#gl)}@media (prefers-color-scheme:dark){.m{fill:url(#g)}}</style>${mark('url(#gl)', 'm')}</svg>\n`,
);

const png = (svg) => sharp(Buffer.from(svg)).png().toBuffer();
await writeFile(pub('apple-touch-icon.png'), await png(iconSvg(180)));
await writeFile(pub('icon-192.png'), await png(iconSvg(192)));
await writeFile(pub('icon-512.png'), await png(iconSvg(512)));

// favicon.ico: one 32px PNG inside an ICO container
const ico32 = await png(iconSvg(32, 0.06, false));
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6);
header.writeUInt8(32, 7);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(ico32.length, 14);
header.writeUInt32LE(22, 18);
await writeFile(pub('favicon.ico'), Buffer.concat([header, ico32]));

const manifest = {
  name: 'BCHacks',
  short_name: 'BCHacks',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
  theme_color: '#0F1539',
  background_color: '#0F1539',
  display: 'browser',
};
await writeFile(pub('site.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');

// Sample sponsor logos — neutral placeholders, replace with real files
function sample(label, shape) {
  const x = shape ? 92 : 120;
  const anchor = shape ? 'start' : 'middle';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 96" width="240" height="96">` +
    `<g fill="#06102E">${shape}</g>` +
    `<text x="${x}" y="58" text-anchor="${anchor}" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="24" font-weight="700" fill="#06102E">${label}</text></svg>\n`
  );
}
await writeFile(pub('sponsors', 'sample-a.svg'), sample('Sample A', '<polygon points="54,22 76,35 76,61 54,74 32,61 32,35"/>'));
await writeFile(pub('sponsors', 'sample-b.svg'), sample('Sample B', '<rect x="34" y="28" width="40" height="40"/>'));
await writeFile(pub('sponsors', 'sample-c.svg'), sample('Sample C', '<circle cx="54" cy="48" r="21"/>'));
await writeFile(pub('sponsors', 'sample-ubco.svg'), sample('UBC Okanagan', ''));

// Social preview card (1200×630) through headless Chrome so the brand fonts render
const siteSrc = await readFile(path.join(root, 'content', 'site.ts'), 'utf8');
const pick = (key) => siteSrc.match(new RegExp(key + ":\\s*'([^']+)'"))?.[1] ?? '';
const year = siteSrc.match(/year:\s*(\d+)/)?.[1] ?? '';
const fontUrl = (pkg, file) => pathToFileURL(path.join(root, 'node_modules', '@fontsource', pkg, 'files', file)).href;

// Until the 3D island exists: the 2D logo on the blueprint grid (spec 6B)
const card = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:IN;font-weight:800;src:url(${fontUrl('inter', 'inter-latin-800-normal.woff2')})}
@font-face{font-family:JB;src:url(${fontUrl('jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff2')})}
*{margin:0}html,body{width:1200px;height:630px;overflow:hidden}
body{background:#0F1539;color:#E6EBFF;position:relative;font-family:IN}
.grid{position:absolute;inset:0;background-image:linear-gradient(#262C55 1px,transparent 1px),linear-gradient(90deg,#262C55 1px,transparent 1px);background-size:80px 80px;background-position:-1px -1px;
 -webkit-mask:radial-gradient(ellipse 75% 85% at 62% 50%,#000 30%,transparent 100%)}
.glow{position:absolute;inset:0;background:radial-gradient(520px 420px at 900px 300px,rgba(59,130,246,.30),transparent 70%),radial-gradient(420px 320px at 160px 560px,rgba(132,219,247,.10),transparent 70%)}
.rings{position:absolute;left:640px;top:-10px;width:520px;height:650px}
.mark{position:absolute;right:198px;top:118px;width:200px}
.copy{position:absolute;left:88px;top:118px}
.eyebrow{font-family:JB;font-size:22px;letter-spacing:.14em;text-transform:uppercase;color:#84DBF7;display:flex;align-items:center;gap:16px}
.eyebrow:before{content:"";width:40px;height:2px;background:#84DBF7}
h1{font-size:132px;font-weight:800;letter-spacing:-.03em;line-height:.95;margin-top:26px}
h1 span{background:linear-gradient(180deg,#B5ECFF,#84DBF7 55%,#3B82F6);-webkit-background-clip:text;background-clip:text;color:transparent}
.data{font-family:JB;font-size:26px;letter-spacing:.1em;text-transform:uppercase;margin-top:34px;padding-left:20px;border-left:3px solid #3B82F6;line-height:1.6;color:#E6EBFF}
.data b{font-weight:500;color:#9AA6D6}
</style></head><body>
<div class="grid"></div><div class="glow"></div>
<svg class="rings" viewBox="0 0 520 650" fill="none"><g stroke="#84DBF7" stroke-opacity=".22" stroke-width="1.5"><circle cx="260" cy="325" r="190"/><circle cx="260" cy="325" r="270"/></g><g stroke="#84DBF7" stroke-opacity=".14"><path d="M260 0V650M0 175L520 475M0 475L520 175"/></g></svg>
<svg class="mark" viewBox="276 131 257 512" overflow="visible"><defs>${grad}${glow}</defs><g filter="url(#glow)">${mark()}</g></svg>
<div class="copy"><p class="eyebrow">UBC Okanagan's hackathon</p><h1>BCHacks<br><span>${year}</span></h1><p class="data">${pick('datesLabel')}<br><b>Kelowna, BC</b></p></div>
</body></html>`;

const browsers = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const browser = browsers.find((b) => existsSync(b));
if (browser) {
  const tmp = path.join(os.tmpdir(), `bch-og-${Date.now()}.html`);
  await writeFile(tmp, card);
  execFileSync(
    browser,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--allow-file-access-from-files',
      '--force-device-scale-factor=1',
      '--window-size=1200,630',
      `--screenshot=${pub('og-image.png')}`,
      pathToFileURL(tmp).href,
    ],
    { stdio: 'ignore' },
  );
  await rm(tmp, { force: true });
  console.log('og-image.png rendered with', path.basename(browser));
} else {
  console.warn('No Chrome/Edge found: og-image.png not regenerated. Set CHROME_PATH.');
}
console.log('Assets written to public/');
