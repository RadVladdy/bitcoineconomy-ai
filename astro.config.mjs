// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkVisuals from './src/lib/remark-visuals.mjs';
import remarkCallouts from './src/lib/remark-callouts.mjs';

const SITE_URL = 'https://bitcoineconomy.ai';

// ⚠️ THE `.md` TWINS ARE DELIBERATELY *NOT* IN THE SITEMAP ANY MORE (2026-08-07).
// A `SURFACE_SLUGS` list used to add 32 clean `.md` routes here as `customPages`, on
// the reasoning that the HTML routes are auto-discovered and the .md ones are not.
// That was the right instinct aimed at the wrong index: a sitemap is a request to a
// SEARCH ENGINE, and `public/_headers` now serves `X-Robots-Tag: noindex` on `/*.md`,
// so keeping them here would advertise to Google exactly the URLs we just asked it
// not to index — a contradiction Google reports as a sitemap error rather than
// splitting the difference. Removing them is the coherent half of that change; do
// not restore this list without also removing the noindex.
//
// AGENT DISCOVERY IS UNAFFECTED, and that is the whole reason this is safe: agents
// reach the .md twins through `/llms.txt` (which indexes every one), through the
// `rel=alternate` link on each HTML page, and by the documented `<url>.md` convention.
// None of those paths is Google's index. See public/_headers for the measurement.

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'never',
  // 2026-06 IA restructure redirects.
  //
  // Astro emits a redirect PAGE for static output — a 200 with a meta-refresh,
  // plus canonical and noindex. That is fine for a browser and fine for search,
  // and useless to a machine: a plain GET gets 200 and no Location header, on a
  // site whose whole pitch is that agents come first. This comment used to say
  // "for a hard 301, mirror these as Cloudflare Redirect Rules too", and that
  // half went undone for two months while the stubs made it look handled.
  //
  // ✅ DONE 2026-08-06. All twelve mappings below are now real 301s at the edge,
  // as seven Single Redirect rules on the zone, sharing the phase with the
  // www→apex rule (which stays FIRST, so every rule after it can assume the
  // apex). Query strings are preserved. Rules are grouped by uniform transform
  // rather than one-per-mapping, and each is gated by an explicit path set —
  // regex `matches` needs a Business plan, and the explicit set is also what
  // keeps /tools/strike out of the /tools→/services group, since it goes to
  // /exchanges instead. Both bare and trailing-slash forms are listed, because
  // the site serves the trailing-slash form.
  //
  // KEEP THIS TABLE AND THE EDGE RULES IN STEP. Adding a line here without the
  // matching rule silently reverts that route to a soft redirect. The stubs stay
  // as the fallback, so a missed rule degrades rather than breaks.
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
  integrations: [sitemap()],
  markdown: {
    // `markdown.remarkPlugins` was deprecated in favour of passing the plugin
    // list to `unified()` and handing the result to `markdown.processor`.
    // Migrated 2026-08-06. This is NOT cosmetic: remarkCallouts renders every
    // `> [!info]` block and remarkVisuals renders every diagram, so when the old
    // option is removed in a future Astro major, both would silently stop
    // rendering site-wide. Verified by diffing the built HTML of five
    // callout- and diagram-heavy pages before and after — byte-identical.
    processor: unified({ remarkPlugins: [remarkCallouts, remarkVisuals] }),
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
