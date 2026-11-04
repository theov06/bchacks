/**
 * Optimises the v3 scene SVGs for inlining.
 * In:  src/assets/scenes/source/<name>.svg  (copied from docs/bchacks-design-reference-v3/assets)
 * Out: src/assets/scenes/<name>.svg         (imported ?raw by src/components/ui/Scene.tsx)
 *
 * - Every id is prefixed per scene so eight inlined SVGs can share one page (the hero art
 *   used bare ids like "sky", and reused the same id for a gradient and a layer group).
 * - Ids and classes are kept (step 3 animates them); paths are never merged.
 * - The full-size background rect gets data-bg (phone crops hide it and paint the section).
 * - The root keeps its viewBox; width/height go (CSS sizes the art).
 * Usage: node scripts/scenes/build.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { optimize } from 'svgo';

const dir = new URL('../../src/assets/scenes/', import.meta.url);
const prefix = { hero: 'd', about: 'a', tracks: 'n', schedule: 'm', sponsors: 'w', involved: 'l', faq: 'u', footer: 'f' };

let total = 0;
let totalGz = 0;
for (const file of readdirSync(new URL('source/', dir)).filter((f) => f.endsWith('.svg'))) {
  const name = file.replace('.svg', '');
  const p = prefix[name];
  if (!p) throw new Error(`No id prefix for scene "${name}"`);
  let svg = readFileSync(new URL(`source/${file}`, dir), 'utf8');

  // Prefix ids that aren't prefixed yet. Ids inside <defs> (gradients, filters, clips)
  // and layer ids outside it get different prefixes, because the hero art reuses names.
  const defsEnd = svg.indexOf('</defs>');
  const defIds = new Set([...svg.slice(0, defsEnd).matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
  const refs = new Map(); // old id -> new id, for url(#…) and href="#…"
  svg = svg.replace(/id="([^"]+)"/g, (_m, id, at) => {
    const inDefs = at < defsEnd;
    const base = id.startsWith(`${p}-`) ? id.slice(p.length + 1) : id;
    // Layer ids: <p>-<name>, or <p>-layer-<name> where the art reuses a defs name for a layer.
    const next = inDefs || !defIds.has(id) ? `${p}-${base}` : `${p}-layer-${base}`;
    if (inDefs || !defIds.has(id)) refs.set(id, next);
    return `id="${next}"`;
  });
  svg = svg.replace(/url\(#([^)]+)\)/g, (m, id) => (refs.has(id) ? `url(#${refs.get(id)})` : m));
  svg = svg.replace(/href="#([^"]+)"/g, (m, id) => (refs.has(id) ? `href="#${refs.get(id)}"` : m));
  const dangling = [...svg.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]).filter((id) => !svg.includes(`id="${id}"`));
  if (dangling.length) throw new Error(`${name}: references to missing ids: ${dangling.join(', ')}`);

  // Mark the background: the first full-size rect after </defs>.
  svg = svg.replace(/(<\/defs>\s*)<rect width="100%" height="100%"/, '$1<rect data-bg="1" width="100%" height="100%"');

  const { data } = optimize(svg, {
    multipass: true,
    floatPrecision: 1,
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            cleanupIds: false,
            mergePaths: false,
            collapseGroups: false,
            moveElemsAttrsToGroup: false,
            moveGroupAttrsToElems: false,
            removeUnknownsAndDefaults: { keepDataAttrs: true },
            convertShapeToPath: false,
          },
        },
      },
      { name: 'removeAttrs', params: { attrs: ['svg:width', 'svg:height', 'svg:aria-hidden', 'svg:preserveAspectRatio'] } },
    ],
  });
  if (/ogopogo|n'?ha-?a-?itk|mystery/i.test(data)) throw new Error(`${name}: forbidden name in output`);
  writeFileSync(new URL(`${name}.svg`, dir), data);
  const gz = gzipSync(data).length;
  total += data.length;
  totalGz += gz;
  console.log(`${name.padEnd(9)} ${String(svg.length).padStart(7)} → ${String(data.length).padStart(7)} B  (${(gz / 1024).toFixed(1)} KB gz)`);
}
console.log(`total ${(total / 1024).toFixed(0)} KB, ${(totalGz / 1024).toFixed(1)} KB gz (budget 250 KB gz)`);
if (totalGz > 250 * 1024) process.exitCode = 1;
