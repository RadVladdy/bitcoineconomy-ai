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
  'border-skirmishes', 'convergence', 'why-bitcoin-not-a-new-coin', 'why-lightning-not-a-fast-chain',
  'stack', 'marketplace', 'exchange', 'services', 'treasury', 'stablecoin-landscape', 'field-notes', 'field-notes-log', 'about',
  'case-for-agents', 'agent-economy-for-agents', 'adoption-asymmetry-for-agents',
  'independence-doctrine-for-agents', 'border-skirmishes-for-agents', 'convergence-for-agents',
  'why-bitcoin-not-a-new-coin-for-agents', 'why-lightning-not-a-fast-chain-for-agents', 'stack-for-agents',
  'treasury-for-agents', 'exchange-for-agents', 'services-for-agents', 'field-notes-for-agents', 'field-notes-log-for-agents',
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
    // Strike is exchange-only (not infrastructure); its Tools card was retired.
    '/tools/strike': '/exchanges/strike',
    // Magma (Amboss) re-homed to The Market 2026-06-27: buying/selling channel
    // liquidity is a marketplace transaction, not software you run.
    '/tools/amboss': '/services/amboss',
    // Reflex re-homed to The Market 2026-08-06, for the same reason and after the
    // same mistake. It sat in Tools as a node-automation product; Amboss now sells
    // it as compliance and sanctions screening, which is a service you CALL rather
    // than equipment you run — and it had been filed under the `node-toolkits`
    // toolbox group only because none of the four groups fit, the same least-wrong
    // bucketing that put LN Markets under `swap`.
    '/tools/reflex': '/services/reflex',
    // Border Zone → its treasury/compliance/boundary material now lives in Treasury & the Boundary.
    '/border-zone': '/treasury',
    '/border-zone-for-agents': '/treasury-for-agents',
    // The Marketplace-FA twin was renamed Treasury-FA in the 2026-06-13 IA fix.
    '/marketplace-for-agents': '/treasury-for-agents',
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
