// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkVisuals from './src/lib/remark-visuals.mjs';
import remarkCallouts from './src/lib/remark-callouts.mjs';

const SITE_URL = 'https://bitcoineconomy.ai';

// Surface slugs whose clean .md routes are added to the sitemap (the HTML routes
// are auto-discovered; the .md routes are not). Human surfaces + For-Agents twins.
const SURFACE_SLUGS = [
  'case', 'the-story', 'agent-economy', 'adoption-asymmetry', 'independence-doctrine',
  'border-skirmishes', 'convergence', 'why-bitcoin-not-a-new-coin',
  'stack', 'marketplace', 'exchange', 'services', 'stablecoin-landscape', 'field-notes', 'about',
  'case-for-agents', 'agent-economy-for-agents', 'adoption-asymmetry-for-agents',
  'independence-doctrine-for-agents', 'border-skirmishes-for-agents', 'convergence-for-agents',
  'why-bitcoin-not-a-new-coin-for-agents', 'stack-for-agents',
  'marketplace-for-agents', 'exchange-for-agents', 'services-for-agents', 'field-notes-for-agents',
];

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'never',
  // 2026-06 IA restructure redirects. Astro emits redirect pages for static
  // output; for a hard 301, mirror these as Cloudflare Redirect Rules too.
  redirects: {
    '/thesis': '/case',
    '/thesis-for-agents': '/case-for-agents',
    '/tools/routstr': '/services/routstr',
    '/tools/ppq-ai': '/services/ppq-ai',
    // Border Zone dissolved → its interface material lives in The Marketplace.
    '/border-zone': '/marketplace',
    '/border-zone-for-agents': '/marketplace-for-agents',
    // Card directories merged into the Exchange / Services surfaces (which now
    // render the tiles themselves).
    '/exchanges': '/exchange',
    '/services/directory': '/services',
  },
  integrations: [
    sitemap({
      customPages: SURFACE_SLUGS.map((s) => `${SITE_URL}/${s}.md`),
    }),
  ],
  markdown: {
    remarkPlugins: [remarkCallouts, remarkVisuals],
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
