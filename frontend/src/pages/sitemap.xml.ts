import type { APIRoute } from 'astro';
import { site as config } from '@content/site';

// Only list /live while the event is live; it is noindexed otherwise.
// /apply only while applyMode is 'soon' (when 'open' it just redirects to the form).
const paths = ['/', ...(config.applyMode === 'soon' ? ['/apply'] : []), ...(config.state === 'live' ? ['/live'] : [])];

export const GET: APIRoute = ({ site }) => {
  const urls = paths.map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
