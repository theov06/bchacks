import { site } from '../../content/site';

/**
 * Where an Apply button points (v3.1, content/site.ts applyMode):
 * "soon" → the /apply page on this site, "open" → the external application form.
 */
export function applyLink(): { href: string; external: boolean } {
  return site.applyMode === 'open' ? { href: site.applyUrl, external: true } : { href: '/apply', external: false };
}
