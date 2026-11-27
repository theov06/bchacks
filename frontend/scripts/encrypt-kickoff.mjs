/**
 * Encrypts the kick-off deck for /kickoff.
 *
 * Reads the plain deck from kickoff-src/ (git-ignored: deck.html + img/), inlines every
 * /kickoff/img/… file as a data URI, and writes one encrypted file to
 * public/kickoff/deck.enc. Only that encrypted file is committed and published;
 * the page at /kickoff asks for the password and decrypts it in the browser.
 *
 * Run from frontend/:
 *   bash:        KICKOFF_PASSWORD='…' npm run kickoff:encrypt
 *   PowerShell:  $env:KICKOFF_PASSWORD = '…'; npm run kickoff:encrypt; Remove-Item Env:KICKOFF_PASSWORD
 *
 * Crypto: PBKDF2-SHA256 (600k iterations, random salt) → AES-256-GCM (random IV).
 * File layout: 4-byte iteration count (big-endian) · 16-byte salt · 12-byte IV · ciphertext.
 * Must match the decrypt code in src/pages/kickoff.astro.
 */
import { webcrypto as crypto } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'kickoff-src');
const OUT = path.join(ROOT, 'public', 'kickoff', 'deck.enc');
const ITERATIONS = 600_000;

const password = process.env.KICKOFF_PASSWORD;
if (!password) {
  console.error(
    'Set KICKOFF_PASSWORD first. From frontend/:\n' +
      "  bash:        KICKOFF_PASSWORD='…' npm run kickoff:encrypt\n" +
      "  PowerShell:  $env:KICKOFF_PASSWORD = '…'; npm run kickoff:encrypt; Remove-Item Env:KICKOFF_PASSWORD",
  );
  process.exit(1);
}
if (!fs.existsSync(path.join(SRC, 'deck.html'))) {
  console.error(`Missing ${path.join(SRC, 'deck.html')} (the plain deck is kept locally, not in git).`);
  process.exit(1);
}

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

let html = fs.readFileSync(path.join(SRC, 'deck.html'), 'utf8');
const used = new Set(html.match(/\/kickoff\/img\/[\w.-]+/g) ?? []);
for (const ref of used) {
  const file = path.join(SRC, 'img', path.basename(ref));
  if (!fs.existsSync(file)) {
    console.error(`Deck references ${ref}, but ${file} does not exist.`);
    process.exit(1);
  }
  const uri = `data:${MIME[path.extname(file).toLowerCase()]};base64,${fs.readFileSync(file).toString('base64')}`;
  html = html.split(ref).join(uri);
}
if (/\/kickoff\/img\//.test(html)) {
  console.error('Some /kickoff/img/ paths were not inlined (built dynamically?). Make them literal in deck.html.');
  process.exit(1);
}

const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS },
  base,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt'],
);
const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(html)));

const head = Buffer.alloc(4);
head.writeUInt32BE(ITERATIONS);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, Buffer.concat([head, salt, iv, data]));
console.log(`Encrypted ${used.size} images + deck → ${path.relative(ROOT, OUT)} (${(fs.statSync(OUT).size / 1e6).toFixed(2)} MB)`);
