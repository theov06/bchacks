import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { site } from './content/site';

// Static output (T1): every page is pre-rendered to plain HTML at build time.
// React is used only as a build-time template language: components are never
// hydrated (no client:* directives), so no React code ships to the browser.
export default defineConfig({
  site: site.siteUrl,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [react()],
  // v3.1: the sponsor page became the pop-up form on the home page. On Netlify the 301 in
  // netlify.toml answers first; this page is the fallback on any other host.
  redirects: { '/sponsor': '/#sponsors' },
  build: { inlineStylesheets: 'auto' },
  compressHTML: true,
  // 'class' scoping lets a parent's styles reach the class it passes to a child component (e.g. <Logo class="brand__mark">)
  scopedStyleStrategy: 'class',
});
