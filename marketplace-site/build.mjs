#!/usr/bin/env node
// build.mjs — generates the marketplace directory's static artifacts.
//
// Reads the main site's card files (src/_raw/{services,exchanges,tools}) — the
// single source of truth for names, links, KYC, custody, and verification dates —
// merges directory-overlay.json (category, what-an-agent-buys, payment methods,
// automatability tier), and writes:
//
//   directory.json     the curated registry core (the agent-readable registry)
//   tools.json         the tool catalog (what an agent EQUIPS, vs BUYS)
//   entries/{slug}.md  one clean Markdown route per entry
//   llms.txt           the agent manifest for the subdomain
//   openapi.json       OpenAPI 3.0 description of the GET routes (non-MCP agents)
//   .well-known/ai-plugin.json   the OpenAI-plugin-era discovery manifest
//
// Run from marketplace-site/:  node build.mjs
// Regenerate + commit whenever cards or the overlay change.

import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KIND_ANNOUNCE, KIND_REQUEST, RELAYS } from './snapshot-lib.mjs';
import { CATEGORIES, CATEGORY_ORDER, isValidPair, vocabularyDoc } from './taxonomy.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const RAW = join(HERE, '..', 'src', '_raw');
const BASE = 'https://marketplace.bitcoineconomy.ai';
const MAIN = 'https://bitcoineconomy.ai';

// One-line gloss for an mcp_endpoint object (markdown/llms.txt). The directory
// only *points* at a provider's own MCP — connect there to act; nothing runs here.
function fmtMcp(m) {
  if (!m) return '';
  const where = m.transport === 'http' ? m.url : (m.run || m.package);
  const tools = (m.tools || []).length ? ` — tools: ${m.tools.join(', ')}` : '';
  return `${m.transport}${m.kind ? ` (${m.kind})` : ''} · ${where}${tools}`;
}

// --- minimal frontmatter parser (covers the card files' shapes only) ---------
function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new Error('no frontmatter');
  const fm = {};
  let nest = null;
  for (const line of m[1].split('\n')) {
    if (/^\s*-\s/.test(line)) continue; // list items (tags, bridges) — not needed
    const indented = /^\s{2,}\S/.test(line);
    const mm = line.match(/^(\s*)([\w-]+):\s*(.*)$/);
    if (!mm) continue;
    const [, , key, rawVal] = mm;
    let val = rawVal.trim();
    if (/^".*"$/.test(val) || /^'.*'$/.test(val)) val = val.slice(1, -1);
    if (indented && nest) { fm[nest][key] = val; continue; }
    if (val === '') { nest = key; fm[key] = {}; continue; }
    nest = null;
    fm[key] = val;
  }
  return { fm, body: text.slice(m[0].length) };
}

// --- load + merge -------------------------------------------------------------
const overlay = JSON.parse(readFileSync(join(HERE, 'directory-overlay.json'), 'utf8'));

const entries = overlay.entries.map((ov) => {
  const { fm } = parseFrontmatter(readFileSync(join(RAW, ov.source), 'utf8'));
  const collection = ov.source.split('/')[0];
  const links = {};
  if (fm.site || fm.links?.site) links.site = fm.site || fm.links.site;
  if (fm.docs || fm.links?.['api-docs']) links.docs = fm.docs || fm.links['api-docs'];
  if (fm.repo) links.repo = fm.repo;
  const verified = (fm['last-verified'] || fm['links-verified'] || '').slice(0, 10);
  return {
    slug: ov.slug,
    name: fm.name || fm.title,
    category: ov.category,
    subcategory: ov.subcategory || undefined,
    summary: ov.summary || fm.tagline,
    what_an_agent_buys: ov.what_an_agent_buys,
    payment_methods: ov.payment_methods,
    payment_detail: fm.payment || undefined,
    kyc: ov.kyc || fm.kyc || undefined,
    custody: ov.custody || fm.custody || undefined,
    automatability: ov.automatability,
    auth: ov.auth || undefined,
    api_base: ov.api_base || undefined,
    pricing_url: ov.pricing_url || undefined,
    quickstart: ov.quickstart || undefined,
    mcp_endpoint: ov.mcp_endpoint || undefined,
    two_sided: fm['two-sided'] || undefined,
    maintainer: fm.maintainer || undefined,
    links,
    card_url: `${MAIN}/${collection}/${ov.slug}`,
    entry_md: `${BASE}/entries/${ov.slug}.md`,
    provenance: 'curated',
    last_verified: verified || undefined,
    note: ov.note || undefined,
  };
});

const categories = [...new Set(entries.map((e) => e.category))];

// Validate against the shared vocabulary (taxonomy.mjs) — the same one the
// external tiers are crosswalked into. Curated entries are the reference points
// the merged directory sorts first, so a typo here silently splits a filter
// across the whole table. Fail the build instead.
for (const e of entries) {
  if (!isValidPair(e.category, e.subcategory)) {
    throw new Error(`directory-overlay.json: "${e.slug}" has category/subcategory "${e.category}/${e.subcategory ?? ''}" which is not in the shared vocabulary (taxonomy.mjs). Valid subcategories for ${e.category}: ${(CATEGORIES[e.category]?.subcategories || ['(unknown category)']).join(', ')}`);
  }
}

// Unified MCP-endpoint registry, keyed by slug: directory service entries that
// run their own MCP server + tool-catalog cards mapped in _tool_mcp_endpoints.
// A slug that is both a service entry and a tool card (e.g. amboss) is defined
// once — on the service entry — and reused for the tool card below.
const mcpBySlug = {};
for (const e of entries) if (e.mcp_endpoint) mcpBySlug[e.slug] = e.mcp_endpoint;
for (const [slug, ep] of Object.entries(overlay._tool_mcp_endpoints || {})) {
  if (slug.startsWith('_')) continue;
  mcpBySlug[slug] ??= ep;
}

const directory = {
  $schema_note:
    'Curated registry of agentic + Bitcoin-payable services an autonomous agent can consume. ' +
    'provenance "curated" = maintained by the editors and verified against primary sources on last_verified; ' +
    'live Nostr-announced inventory (Routstr providers, NIP-87 mints) is served separately at /live/snapshot.json ' +
    '(providers carry probe status: alive | unreachable | unverified-tor-only | unroutable, plus network: clearnet | tor | both | unroutable) ' +
    'and the cross-provider inference price index at /live/models.json — both with committed static fallbacks at ' +
    '/snapshot.json and /models.json. Per-entry machine fields where verified: auth (how the credential works), ' +
    'api_base, pricing_url, quickstart (the first call, one line), and mcp_endpoint where the provider runs its own MCP server (connect there to act). ' +
    'An MCP server at /mcp exposes both the service registry and the tool catalog as Model Context Protocol tools (find_service, get_service, price_model, list_categories, get_quote, find_tool, get_tool, list_mcp_servers, find_l402_endpoints, get_uptime) for agents that call rather than fetch. ' +
    'The tool catalog (equipment an agent installs/runs to transact: wallets, node toolkits, ecash, bridges, protocol primitives) is at /tools.json. ' +
    'list_mcp_servers / the mcp_endpoint field make this directory a registry of OTHER services\' MCP servers (Amboss, Bitrefill, Alby NWC): discover here, connect there to act — no funds and no provider calls run through this server. ' +
    'For agents that do not speak MCP: an OpenAPI 3.0 description of the GET routes is at /openapi.json, with the OpenAI-plugin-era manifest at /.well-known/ai-plugin.json. ' +
    'Part of https://bitcoineconomy.ai — thesis at /case, methodology at /services-for-agents.',
  name: 'The Marketplace directory — bitcoineconomy.ai',
  url: BASE + '/',
  generated_at: new Date().toISOString(),
  entry_count: entries.length,
  categories,
  // The shared two-level vocabulary, published here as well as on the merged
  // directory: an agent reading only /directory.json still gets the scheme the
  // `subcategory` field on every entry belongs to.
  vocabulary: vocabularyDoc(),
  live_routes: {
    mcp: BASE + '/mcp',
    master: BASE + '/live/master.json',
    tools_catalog: BASE + '/tools.json',
    snapshot: BASE + '/live/snapshot.json',
    models_price_index: BASE + '/live/models.json',
    external_index: BASE + '/live/l402index.json',
    gateway_observed: BASE + '/live/l402space.json',
    announced: BASE + '/live/announced.json',
    uptime: BASE + '/live/uptime.json',
    announce_spec: BASE + '/spec/agent-payable-service-announcement.md',
    openapi: BASE + '/openapi.json',
    ai_plugin: BASE + '/.well-known/ai-plugin.json',
  },
  sell_side: {
    note: 'This directory is two-sided. To LIST a service an agent can pay for, publish a signed Nostr "agent-payable service announcement" (kind ' + KIND_ANNOUNCE + ') — no account, no UI, no fee. It appears in the announced tier (/live/announced.json) on the next 6-hourly refresh, with probe status + trust signals, and graduates to the curated registry via verification. How: ' + BASE + '/spec/agent-payable-service-announcement.md',
    announcement_kind: KIND_ANNOUNCE,
    spec: BASE + '/spec/agent-payable-service-announcement.md',
    schema: BASE + '/spec/agent-payable-service-announcement.schema.json',
    announced_route: BASE + '/live/announced.json',
  },
  automatability_tiers: overlay._automatability_tiers,
  payment_method_vocabulary: {
    lightning: 'Lightning Network (BOLT11/BOLT12 invoices or Lightning address)',
    l402: 'L402 — HTTP 402 payment protocol over Lightning; the payment is the API credential',
    cashu: 'Cashu bearer ecash (Bitcoin-denominated); the token is the API key',
    nwc: 'Nostr Wallet Connect (NIP-47) — remote, scoped wallet control',
    zaps: 'NIP-57 Lightning zaps',
    onchain: 'Bitcoin L1 on-chain',
    liquid: 'Liquid Network (L-BTC)',
    spark: 'Spark (Bitcoin L2)',
    fiat: 'Bank/fiat leg (custodial venue)',
  },
  entries,
};

writeFileSync(join(HERE, 'directory.json'), JSON.stringify(directory, null, 2) + '\n');

// --- per-entry markdown routes -------------------------------------------------
rmSync(join(HERE, 'entries'), { recursive: true, force: true });
mkdirSync(join(HERE, 'entries'), { recursive: true });

for (const e of entries) {
  const tier = overlay._automatability_tiers[e.automatability];
  const lines = [
    `# ${e.name}`,
    '',
    `> ${e.what_an_agent_buys}`,
    '',
    e.summary,
    '',
    `- Category: ${e.category}${e.subcategory ? ` / ${e.subcategory}` : ''}`,
    `- Payment methods: ${e.payment_methods.join(', ')}`,
    e.payment_detail ? `- Payment detail: ${e.payment_detail}` : null,
    e.kyc ? `- KYC: ${e.kyc}` : null,
    e.custody ? `- Custody: ${e.custody}` : null,
    `- Automatability: ${e.automatability} — ${tier}`,
    e.auth ? `- Auth: ${e.auth}` : null,
    e.api_base ? `- API base: ${e.api_base}` : null,
    e.pricing_url ? `- Pricing: ${e.pricing_url}` : null,
    e.quickstart ? `- Quickstart: ${e.quickstart}` : null,
    e.mcp_endpoint ? `- MCP server (connect to act): ${fmtMcp(e.mcp_endpoint)}` : null,
    e.two_sided ? `- Direction: ${e.two_sided}` : null,
    e.maintainer ? `- Maintainer: ${e.maintainer}` : null,
    e.links.site ? `- Site: ${e.links.site}` : null,
    e.links.docs ? `- Docs/API: ${e.links.docs}` : null,
    e.links.repo ? `- Repo: ${e.links.repo}` : null,
    `- Full card (verified detail, gotchas): ${e.card_url}`,
    `- Provenance: curated${e.last_verified ? ` (last verified ${e.last_verified})` : ''}`,
    e.note ? `` : null,
    e.note ? `${e.note}` : null,
    '',
    `---`,
    '',
    `Part of [The Marketplace directory](${BASE}/) · registry JSON: ${BASE}/directory.json · full thesis: ${MAIN}/case`,
    '',
  ].filter((l) => l !== null);
  writeFileSync(join(HERE, 'entries', `${e.slug}.md`), lines.join('\n'));
}

// --- tools.json (the tool catalog) ---------------------------------------------
// Every tool card in src/_raw/tools/ — the equipment an agent installs/runs to
// transact (wallets, node toolkits, ecash, bridges, protocol primitives). Distinct
// from the service registry (what an agent buys). Machine fields come straight from
// the card frontmatter; mcp_endpoint is merged from the unified registry above.
const TOOLBOX_TITLES = {
  wallets: 'Wallets & treasuries',
  'node-toolkits': 'Node toolkits',
  ecash: 'Ecash software',
  bridges: 'Bridges & swaps',
  primitive: 'Protocol primitives',
};
const tools = readdirSync(join(RAW, 'tools'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const { fm } = parseFrontmatter(readFileSync(join(RAW, 'tools', f), 'utf8'));
    const slug = fm.slug || f.replace(/\.md$/, '');
    const links = {};
    if (fm.site) links.site = fm.site;
    if (fm.docs) links.docs = fm.docs;
    if (fm.repo) links.repo = fm.repo;
    return {
      slug,
      name: fm.name,
      toolbox_group: fm['toolbox-group'],
      tool_type: fm['tool-type'],
      layer: fm.layer,
      tagline: fm.tagline,
      maintainer: fm.maintainer || undefined,
      prereq_tier: fm['prereq-tier'] || undefined,
      stack_section: fm['stack-section'] || undefined,
      license: fm.license || undefined,
      latest_release: fm['latest-release'] || undefined,
      two_sided: fm['two-sided'] || undefined,
      links,
      card_url: `${MAIN}/tools/${slug}`,
      mcp_endpoint: mcpBySlug[slug] || undefined,
      last_verified: (fm['last-verified'] || '').slice(0, 10) || undefined,
      _order: Number(fm.order) || 999,
    };
  })
  .sort((a, b) => a._order - b._order)
  .map(({ _order, ...t }) => t);

const toolboxGroups = [...new Set(tools.map((t) => t.toolbox_group))];
const toolsDoc = {
  $schema_note:
    'The tool catalog for the bitcoineconomy.ai marketplace: equipment an autonomous agent installs or runs to transact in Bitcoin — ' +
    'wallets & treasuries, node toolkits, ecash software, bridges & swaps, and the protocol primitives (L402, NWC, BOLT12, LNURL, MCP). ' +
    'Distinct from the service registry at /directory.json (what an agent BUYS); this is what it EQUIPS. ' +
    'Each tool: toolbox_group, tool_type, layer (where it sits in the stack), prereq_tier (what must be in place first), maintainer, repo/docs/site links, ' +
    'and mcp_endpoint where the tool ships its own MCP server (connect there to act). Full per-tool detail (gotchas, dependencies, verified specs) at card_url. ' +
    'Reference facts, not endorsements. Queryable via the /mcp server: find_tool, get_tool, list_mcp_servers.',
  name: 'The Marketplace tool catalog — bitcoineconomy.ai',
  url: BASE + '/tools.json',
  generated_at: new Date().toISOString(),
  tool_count: tools.length,
  toolbox_groups: toolboxGroups,
  toolbox_group_titles: TOOLBOX_TITLES,
  prereq_tiers: {
    'keys-only': 'A keypair is enough — no node, no wallet, no funds',
    account: 'A hosted account (no identity check, but a human signs up first)',
    wallet: 'A funded wallet (custodial or self-custodial)',
    'bitcoin-node': 'Your own Bitcoin Core node (L1)',
    'lightning-node': 'A funded Lightning node with channels (e.g. LND/CLN)',
    'l2-network': 'Access to an L2/L3 network (Liquid, Spark, a federation)',
  },
  tools,
};
writeFileSync(join(HERE, 'tools.json'), JSON.stringify(toolsDoc, null, 2) + '\n');

// --- llms.txt -------------------------------------------------------------------
const byCat = {};
for (const e of entries) (byCat[e.category] ??= []).push(e);

const llms = [
  '# The Marketplace directory — marketplace.bitcoineconomy.ai',
  '',
  '> The agent-readable directory of every service autonomous AI agents can pay for —',
  '> inference, data, compute, machine work, verification, commerce, swaps, liquidity, payments, fiat ramps.',
  '> Four sources merged into ONE row shape and ONE two-level category vocabulary, each row stating where it',
  '> came from and whether an agent pays it in sats directly or only through an intermediary.',
  '',
  '## Start here: one fetch',
  '',
  `${BASE}/live/master.json — THE MASTERED DIRECTORY. Every service from every source, one schema, one`,
  '  vocabulary. Each row carries:',
  '    - source: curated | announced | external-index | gateway-observed (see "Provenance" below)',
  '    - category + subcategory, in the shared two-level vocabulary, PLUS source_category (the upstream\'s own',
  '      raw string) and classification_confidence (exact | top-level | inferred) so our mapping is checkable',
  '    - rail: bitcoin-native (pay directly in sats) | via-gateway (settles in USDC/Tempo upstream; sats-payable',
  '      only through links.gateway_url, which means an intermediary holds the sats leg) | fiat-only (no Bitcoin',
  '      payment path at all)',
  '    - trust: status, reliability + its DENOMINATOR + the formula, uptime, latency — never a bare score',
  '    - observed: real settlement counters where a source has them (tx_count, volume_usd, deliveries)',
  '  A `facets` block gives every filter value with counts, so you can target a query without scanning.',
  `  Static fallback: ${BASE}/master.json.`,
  '',
  '## Provenance — what each source is worth',
  '',
  '  curated          Editor-verified against primary sources on last_verified. The ONLY rows a human checked.',
  '  announced        Self-listed by the service itself (signed Nostr kind-38555 announcement). Permissionless,',
  '                   probed for liveness, NOT endorsed. Announced ≠ curated.',
  "  external-index   402index.io's verified feed (Ryan Gentry, ex-Lightning Labs), selectively passed through",
  '                   WITH ATTRIBUTION. Third-party-indexed AND third-party-verified — not our endorsement.',
  "  gateway-observed Hosts seen settling through Alby's l402.space gateway. The only source whose figures come",
  '                   from real payments rather than probes (deliveries / payments_received is a genuine',
  '                   paid-and-got-the-goods rate) — but still a third party\'s observations, not ours.',
  '',
  '## Single sources, unmixed',
  '',
  `1. ${BASE}/directory.json — the curated registry alone. Filter on category, subcategory, payment_methods,`,
  '   automatability (api-no-account | api-account | api-kyc), and kyc. Entries carry auth, quickstart,',
  '   and (where verified) api_base + pricing_url — enough to make the first call.',
  `2. ${BASE}/live/announced.json — the self-listed sell side (kind 38555), with probe status + trust signals.`,
  `3. ${BASE}/live/l402index.json — the external-index tier. Since 2026-07-29 it spans all three protocols`,
  '   (L402 + x402 + MPP), not just L402: the gateway makes x402 endpoints sats-payable, so they belong here',
  '   too, carried with rail="via-gateway" and a ready-made gateway_url. Rows must have a real name and',
  '   description and must classify into the vocabulary to be ingested, and a per-host cap keeps one host from',
  `   flooding the table. Static fallback at ${BASE}/l402index.json.`,
  `4. ${BASE}/live/l402space.json — the gateway-observed tier, with the gateway's own aggregate stats in-band.`,
  `   Static fallback at ${BASE}/l402space.json.`,
  '',
  '## Supporting live data',
  '',
  `${BASE}/live/snapshot.json — what announces itself on Nostr right now (Routstr kind-38421 inference`,
  '   providers, NIP-87 ecash mints, kind-38000 reviews). Each provider carries probe status',
  '   (alive | unreachable | unverified-tor-only | unroutable — announcements outlive nodes; filter status === "alive"',
  '   unless you can reach Tor, where network: tor | both endpoints are yours to verify) plus latency_ms,',
  '   model_count, and accepted mints.',
  // The buy side. Deliberately placed in "supporting live data" next to the
  // snapshot it rides in, not in "single sources" — it is not a fifth source of
  // services, it is the other side of the market.
  `${BASE}/live/snapshot.json#modules.requests — THE BUY SIDE. Signed offers to pay an agent in sats to do a`,
  `   job (kind ${KIND_REQUEST}, our work-request microstandard). Every other document here helps you SPEND; this is`,
  '   how you EARN. Each request carries an `acceptance` string — a public, checkable definition of done — plus',
  '   amount (MILLISATS, NIP-57 units) and pay methods. WE NEVER TOUCH THE MONEY: no escrow, no custody, no fee,',
  '   no arbitration, no account. `sats_offered_open` is OFFERED, not held; `status` is what the poster published,',
  '   not something we verified. Claims/deliveries are NIP-22 comments (kind 1111) scoped to the request address;',
  '   payment proof is a NIP-57 zap receipt, checkable by any third party without us. Filter to the cohort you can',
  '   act on: status === "open" && !expired && !malformed. MCP: find_work. To post one, or to answer one, see',
  `   ${BASE}/spec/agent-payable-work-request.md`,
  `${BASE}/live/models.json — the cross-provider inference price index: model id → every alive provider`,
  '   serving it, cheapest first, in sats per token (+ max_cost per request, the budgeting ceiling).',
  '   One fetch answers "who serves model X cheapest right now".',
  `${BASE}/live/uptime.json — rolling uptime history for every probed target, INCLUDING the marketplace's own`,
  '   surfaces (self:* rows — no green by assertion). RECOMPUTABLE, NOT A SCORE: the doc carries the raw per-run',
  '   observations (runs[]), the exact formula, and explicit denominators — recompute any stat rather than trust it.',
  '   Snapshot digests are Nostr-signed + Bitcoin-anchored nightly (OpenTimestamps) — anchor records at /anchors/index.json.',
  '',
  `## The tool catalog (what an agent EQUIPS, vs the registry above of what it BUYS)`,
  '',
  `${BASE}/tools.json — the equipment an agent installs or runs to transact: wallets & treasuries, node`,
  'toolkits, ecash software, bridges & swaps, and the protocol primitives (L402, NWC, BOLT12, LNURL, MCP).',
  'Each tool carries toolbox_group, tool_type, prereq_tier (what must be in place first), repo/docs links, and',
  'mcp_endpoint where it ships its own MCP server. Full per-tool detail (gotchas, dependencies) at its card_url.',
  '',
  '## Or call the directory as tools (MCP)',
  '',
  `An MCP server at ${BASE}/mcp exposes the merged directory and the tool catalog as Model Context Protocol`,
  'tools, so an agent can call instead of fetch: find_service (searches ALL sources at once — filter by source,',
  'rail, category, subcategory, payment_method), get_service, list_categories (call this FIRST for the exact',
  'vocabulary and counts), price_model, get_quote (a ready-to-pay payment plan — a live L402 invoice or live sats',
  'price where the provider supports it), get_uptime, find_tool, get_tool, list_mcp_servers, and',
  'find_l402_endpoints (the external-index source alone). find_work is the ODD ONE OUT and the one to read twice:',
  'every other tool here helps you SPEND, that one is how you EARN — signed offers to pay an agent in sats to do a',
  'job, each with a checkable acceptance test. list_mcp_servers lists the providers here that run their',
  'OWN MCP server (Amboss, Bitrefill, Alby NWC) — discover here, connect there to act. Stateless Streamable HTTP:',
  'POST one JSON-RPC request, get one JSON response. No funds move through it; you pay providers directly.',
  '',
  '## List your service (the directory is two-sided)',
  '',
  `Run a service an agent can pay for in Bitcoin? List it yourself — no account, no UI, no fee. Publish a`,
  `signed Nostr "agent-payable service announcement" (kind ${KIND_ANNOUNCE}, our microstandard; reuse Routstr`,
  `kind 38421 if the service is inference). It appears in the announced tier at ${BASE}/live/announced.json on`,
  'the next 6-hourly refresh — with a liveness probe + trust signals (announcement age, accepted-mint health) —',
  'and graduates to the curated registry above via editor verification. Announced is permissionless and labeled:',
  `taken as published, not endorsed. Field schema + a copyable example event: ${BASE}/spec/agent-payable-service-announcement.md`,
  `(JSON schema: ${BASE}/spec/agent-payable-service-announcement.schema.json).`,
  '',
  '## Legacy / non-MCP agents',
  '',
  `An OpenAPI 3.0 description of the GET routes above is at ${BASE}/openapi.json (operationIds:`,
  'getDirectory, getToolCatalog, getLiveSnapshot, getPriceIndex, getUptimeHistory, getEntry), with the OpenAI-plugin-era',
  `manifest at ${BASE}/.well-known/ai-plugin.json. Read-only, no auth; you pay each provider directly.`,
  '',
  `Static fallbacks (work without the worker): ${BASE}/snapshot.json + ${BASE}/models.json + ${BASE}/l402index.json`,
  `Part of: ${MAIN} — the case for a Bitcoin-centric AI agent economy (manifest: ${MAIN}/llms.txt)`,
  '',
  'Every entry below has a clean Markdown route. provenance: curated = editor-verified against primary',
  'sources on the date shown; the live snapshot carries provenance live-from-relay (signed Nostr events,',
  'taken as published — verify before trusting); the price index carries provenance',
  'probed-from-provider-endpoints (the providers’ own published numbers, not endorsements).',
  'Note honestly: the kind-38000 reviews on the relays today target ecash mints, not inference providers.',
  '',
];
const CAT_TITLES = {
  inference: 'Inference (LLM/API calls an agent pays for per request)',
  compute: 'Compute (servers an agent provisions and pays for in sats)',
  'machine-work': 'Machine work (agents buying and selling work)',
  verification: 'Verification (independent pre-action verdicts + signed proofs an agent pays per call)',
  commerce: 'Commerce bridge (paying non-Bitcoin merchants with sats)',
  privacy: 'Privacy / connectivity',
  swap: 'Swaps (non-custodial, no-KYC asset conversion)',
  liquidity: 'Liquidity (Lightning channel/balance management)',
  'fiat-ramp': 'Fiat ramps (custodial venues at the border; KYC noted per entry)',
};
for (const cat of categories) {
  llms.push(`## ${CAT_TITLES[cat] ?? cat}`, '');
  for (const e of byCat[cat]) {
    llms.push(`- [${e.name}](${BASE}/entries/${e.slug}.md): ${e.what_an_agent_buys}. Payment: ${e.payment_methods.join('/')}; KYC: ${e.kyc ?? 'n/a'}; automatability: ${e.automatability}.`);
  }
  llms.push('');
}
writeFileSync(join(HERE, 'llms.txt'), llms.join('\n'));

// --- openapi.json + /.well-known/ai-plugin.json (10b breadth manifests) --------
// For agents that DON'T speak MCP — the OpenAI-plugin-era discovery pair. An
// OpenAPI 3.0 description of the fetchable GET routes (the same data an MCP-
// capable agent would reach via /mcp), plus the /.well-known/ai-plugin.json
// manifest that points at it. Read-only, no auth: the agent pays each provider
// directly over Lightning/L402/Cashu — nothing moves through this API.
const jsonResp = (desc) => ({
  description: desc,
  content: { 'application/json': { schema: { type: 'object' } } },
});

const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'The Marketplace directory — bitcoineconomy.ai',
    description:
      'Read-only discovery API for services and tools an autonomous AI agent can pay for: '
      + 'inference, data, compute, machine work, verification, commerce, swaps, liquidity, payments, fiat ramps. '
      + 'START WITH /live/master.json — every service from all four sources in one row shape and one category '
      + 'vocabulary, each row stating its provenance and its payment rail. Fetch and filter locally — no auth, and '
      + 'no funds move through this API; the agent pays each provider directly over Lightning / L402 / Cashu, or '
      + 'through the l402.space gateway where a row says rail="via-gateway". MCP-capable agents should use the '
      + `richer Model Context Protocol server at ${BASE}/mcp instead (find_service, get_service, list_categories, `
      + 'get_quote, find_tool, get_tool, list_mcp_servers).',
    version: '2.0.0',
    contact: { email: 'hello@bitcoineconomy.ai', url: MAIN },
  },
  servers: [{ url: BASE }],
  paths: {
    '/live/master.json': {
      get: {
        operationId: 'getMasterDirectory',
        summary: 'THE MASTERED DIRECTORY — every service, all sources, one schema',
        description:
          'Every service an agent can pay for, merged from four sources into one row shape and one two-level '
          + 'category vocabulary. Each row carries: source (curated = editor-verified, the only rows a human '
          + 'checked | announced = permissionless Nostr self-listing | external-index = 402index.io\'s verified '
          + 'feed passed through with attribution | gateway-observed = seen settling through Alby\'s l402.space, '
          + 'figures from real payments rather than probes); category + subcategory plus the upstream\'s own '
          + 'source_category and our classification_confidence, so the mapping is checkable; rail (bitcoin-native '
          + '= pay directly in sats | via-gateway = sats-payable only through links.gateway_url, an intermediary '
          + 'holding the sats leg | fiat-only = no Bitcoin path at all); and trust figures that always ship with '
          + 'their denominator and formula. A facets block gives every filter value with counts. '
          + `Static fallback at ${BASE}/master.json.`,
        responses: { 200: jsonResp('The mastered directory document.') },
      },
    },
    '/directory.json': {
      get: {
        operationId: 'getDirectory',
        summary: 'The curated registry of Bitcoin-payable services an agent buys',
        description:
          `The full curated registry (${entries.length} entries across ${categories.length} categories: ${categories.join(', ')}). `
          + 'Each entry carries category, what_an_agent_buys, payment_methods, automatability '
          + '(api-no-account | api-account | api-kyc), kyc, auth, api_base, pricing_url, quickstart, and mcp_endpoint '
          + 'where the provider runs its own MCP server. One fetch returns everything; filter locally.',
        responses: { 200: jsonResp('The curated registry document.') },
      },
    },
    '/tools.json': {
      get: {
        operationId: 'getToolCatalog',
        summary: 'The tool catalog — what an agent installs/runs to transact',
        description:
          `The ${tools.length}-tool catalog of equipment an agent EQUIPS (vs the registry of what it BUYS): `
          + 'wallets & treasuries, node toolkits, ecash software, bridges & swaps, and the protocol primitives '
          + '(L402, NWC, BOLT12, LNURL, MCP). Each tool carries toolbox_group, tool_type, layer, prereq_tier, and links.',
        responses: { 200: jsonResp('The tool catalog document.') },
      },
    },
    '/live/snapshot.json': {
      get: {
        operationId: 'getLiveSnapshot',
        summary: 'Live Nostr-announced inventory (Routstr providers, ecash mints)',
        description:
          'What announces itself on Nostr right now: Routstr kind-38421 inference providers, NIP-87 ecash mints, '
          + 'kind-38000 reviews. Each provider carries a probe status (alive | unreachable | unverified-tor-only | '
          + 'unroutable — filter status === "alive" unless you can reach Tor), latency_ms, model_count, and accepted mints. '
          + 'KV-backed, refreshed every 6h; static fallback at /snapshot.json.',
        responses: { 200: jsonResp('The live snapshot document.') },
      },
    },
    '/live/models.json': {
      get: {
        operationId: 'getPriceIndex',
        summary: 'Cross-provider inference price index (cheapest provider per model)',
        description:
          'model id -> every alive provider serving it, cheapest first, in sats per token (+ max_cost per request, '
          + 'the budgeting ceiling). One fetch answers "who serves model X cheapest right now". Static fallback at /models.json.',
        responses: { 200: jsonResp('The price index document.') },
      },
    },
    '/live/l402index.json': {
      get: {
        operationId: 'getExternalIndex',
        summary: "External-index source — a selective, attributed pass over 402index.io's verified feed",
        description:
          'Payable endpoints beyond the curated registry, taken selectively from 402index.io (Ryan Gentry) — '
          + 'health-filtered, reliability-capped, per-host-capped, each with a source_page back to its 402index '
          + 'record. Spans all three protocols (L402 + x402 + MPP) since 2026-07-29: rows carry rail="bitcoin-native" '
          + 'where an agent pays directly in sats, or rail="via-gateway" with a ready-made gateway_url where the '
          + 'endpoint settles in USDC/Tempo and is sats-payable only through l402.space. provenance: external-index '
          + '(third-party-indexed + verified, NOT a bitcoineconomy.ai endorsement). KV-backed, refreshed every 6h; '
          + 'static fallback at /l402index.json.',
        responses: { 200: jsonResp('The external-index document.') },
      },
    },
    '/live/l402space.json': {
      get: {
        operationId: 'getGatewayObserved',
        summary: "Gateway-observed source — hosts seen settling through Alby's l402.space",
        description:
          'Paid API hosts observed settling through l402.space, the Universal 402 Gateway. Unlike every other '
          + 'source here these figures are OBSERVED SETTLEMENT rather than external probing: the gateway made the '
          + 'payments itself, so deliveries / payments_received is a real paid-and-got-the-goods rate and volume_usd '
          + 'is money that actually moved. Reliability is published only where deliveries >= 5 and always with its '
          + 'denominator. The gateway\'s own aggregate stats ride in-band — check them before reading anything into '
          + 'a row count. provenance: gateway-observed (a third party\'s observations, NOT a bitcoineconomy.ai '
          + 'endorsement and not our own measurement). KV-backed, refreshed every 6h; static fallback at /l402space.json.',
        responses: { 200: jsonResp('The gateway-observed document.') },
      },
    },
    '/live/uptime.json': {
      get: {
        operationId: 'getUptimeHistory',
        summary: 'Rolling uptime history for every probed target — recomputable, self-inclusive, Bitcoin-anchored',
        description:
          'Per-target rolling uptime over the 6-hourly probe cron, including the marketplace\'s own surfaces '
          + '(self:* rows). Recomputable, not a score: carries the raw per-run observations (runs[]), the exact '
          + 'formula, and explicit denominators (unprobeable observations are excluded and counted separately). '
          + 'Nightly anchor runs sign snapshot digests to Nostr and stamp them into Bitcoin via OpenTimestamps '
          + '(records at /anchors/), making the history tamper-evident. KV-backed; static placeholder at /uptime.json '
          + 'until the first cron.',
        responses: { 200: jsonResp('The uptime history document.') },
      },
    },
    '/entries/{slug}.md': {
      get: {
        operationId: 'getEntry',
        summary: 'One clean Markdown record for a single service',
        description:
          'The agent-readable Markdown route for one registry entry — the machine path (payment, auth, api_base, '
          + 'quickstart, mcp_endpoint) plus a link to the full verified card.',
        parameters: [{
          name: 'slug',
          in: 'path',
          required: true,
          description: 'The service slug (from directory.json entries[].slug).',
          schema: { type: 'string', enum: entries.map((e) => e.slug) },
        }],
        responses: {
          200: { description: 'The entry as Markdown.', content: { 'text/markdown': { schema: { type: 'string' } } } },
        },
      },
    },
  },
};
writeFileSync(join(HERE, 'openapi.json'), JSON.stringify(openapi, null, 2) + '\n');

const aiPlugin = {
  schema_version: 'v1',
  name_for_human: 'Bitcoin Economy Marketplace',
  name_for_model: 'bitcoin_marketplace',
  description_for_human:
    'Discover services and tools an autonomous AI agent can buy and sell for Bitcoin — inference, compute, '
    + 'machine work, verification, commerce bridges, swaps, liquidity, and fiat ramps.',
  description_for_model:
    'Use to discover Bitcoin-payable services and tools an autonomous agent can consume. '
    + 'getDirectory returns the curated registry (filter on category, payment_methods, automatability, kyc); '
    + 'getToolCatalog returns equipment an agent installs/runs; getLiveSnapshot returns Nostr-announced live '
    + 'inventory (filter status === "alive"); getPriceIndex returns the cross-provider inference price index '
    + '(cheapest provider per model, sats per token); getEntry returns one clean record per service. '
    + 'No funds move through this API — the agent pays each provider directly over Lightning, L402, or Cashu. '
    + `MCP-capable agents should use the richer Model Context Protocol server at ${BASE}/mcp instead.`,
  auth: { type: 'none' },
  api: { type: 'openapi', url: BASE + '/openapi.json' },
  logo_url: MAIN + '/favicon.svg',
  contact_email: 'hello@bitcoineconomy.ai',
  legal_info_url: MAIN + '/about',
};
mkdirSync(join(HERE, '.well-known'), { recursive: true });
writeFileSync(join(HERE, '.well-known', 'ai-plugin.json'), JSON.stringify(aiPlugin, null, 2) + '\n');

// --- the microstandard spec (10d-ii sell-side) ---------------------------------
// Publishes our "agent-payable service announcement" microstandard so an agent can
// LIST a service it runs, headlessly — no UI, no account. Generated (single source:
// KIND_ANNOUNCE + RELAYS come from snapshot-lib, the same code that parses them).
const exampleEvent = {
  kind: KIND_ANNOUNCE,
  created_at: 1782000000,
  pubkey: '<32-byte hex public key of the service operator>',
  tags: [
    ['d', 'acme-gpu'],
    ['k', 'compute'],
    ['u', 'https://api.acme-gpu.example/v1'],
    ['u', 'http://acmegpuxxxxxxxxxx.onion/v1'],
    ['pay', 'lightning'],
    ['pay', 'l402'],
    ['mint', 'https://mint.minibits.cash/Bitcoin'],
    ['auth', 'none'],
    ['pricing', 'https://api.acme-gpu.example/v1/pricing'],
    ['version', '1.0.0'],
  ],
  content: JSON.stringify({
    name: 'Acme GPU',
    summary: 'On-demand GPU compute an agent rents by the minute, paid in sats over L402 — no account, no KYC.',
    what_an_agent_buys: 'GPU compute time (containers), billed per minute over Lightning/L402',
    quickstart: 'GET the api_base; pay the returned L402 invoice; retry with the preimage in the Authorization header to provision a container.',
    links: { site: 'https://acme-gpu.example', docs: 'https://acme-gpu.example/docs', repo: 'https://github.com/acme/gpu' },
  }, null, 2),
  id: '<32-byte hex event id — computed by your Nostr library>',
  sig: '<64-byte hex schnorr signature — computed by your Nostr library>',
};

const specMd = [
  '# Agent-payable service announcement — a microstandard',
  '',
  `**Nostr event kind \`${KIND_ANNOUNCE}\`** · parameterized-replaceable · published by [bitcoineconomy.ai](${MAIN}) · machine spec, free to implement.`,
  '',
  'A small, honest standard for **announcing a service an autonomous AI agent can pay for in Bitcoin** — so it',
  `appears in the [Marketplace directory](${BASE}/)'s **announced tier** without a form, an account, or a fee.`,
  'You publish a signed Nostr event; the directory reads it off public relays on its next refresh, probes it for',
  'liveness, and lists it with trust signals. **Announced ≠ curated:** announcements are taken *as published, not',
  'endorsed*, and graduate to the curated registry only via editor verification.',
  '',
  '## Why a new kind',
  '',
  'The NIP-90 (DVM) spec is marked *unrecommended* by its own maintainers — *"prefer use-case-specific',
  'microstandards."* This is one. It is **hybrid**: where the service is **inference**, reuse Routstr\'s established',
  '**kind `38421`** (the directory already reads it). For **everything else** —',
  // Generated from the shared vocabulary for the same reason the `k` table below
  // is: this sentence was hand-listed and had ALREADY gone stale twice, missing
  // `data` and `payments` (added 2026-07-29) and then `trading` (2026-08-04). A
  // publisher who reads only this paragraph must not be told a shorter list of
  // what we accept than the table 20 lines down.
  `${CATEGORY_ORDER.filter((c) => c !== 'inference').map((c) => CATEGORIES[c].title.toLowerCase()).join(', ')} — publish **kind \`${KIND_ANNOUNCE}\`**, defined here. It deliberately`,
  'reuses Routstr\'s tag grammar (`d`, `u`, `mint`, `version`) and adds the directory\'s machine-actionable fields.',
  '',
  `\`${KIND_ANNOUNCE}\` is in the parameterized-replaceable range (30000–39999): the newest event per \`(kind, pubkey, d)\``,
  'replaces older ones, so you re-announce to update, and an empty/deletion supersedes. (Verified clear of the NIP',
  'kind registry and of Routstr\'s 38421 before allocation.)',
  '',
  '## Tags',
  '',
  '| tag | required | meaning |',
  '|---|---|---|',
  '| `d` | **yes** | Stable service id. The replaceability key — keep it constant across re-announcements. Becomes the directory slug `announced:{d}`. |',
  // Generated from the shared vocabulary, never hand-listed. This table was
  // hardcoded to the pre-merge nine categories and silently went stale when
  // `data` and `payments` were added (2026-07-29) — which meant the single
  // largest cluster in the directory, data services, had no category it could
  // legally announce under. A publisher reading the spec is being told what we
  // will actually accept, so it has to come from the same source as the parser.
  `| \`k\` | **yes** | Category — one of: ${CATEGORY_ORDER.map((c) => (c === 'inference' ? '`inference` (prefer kind 38421 instead)' : `\`${c}\``)).join(', ')}. |`,
  `| \`sub\` | no | Subcategory, for finer placement — e.g. ${['llm', 'search', 'vps', 'gift-cards'].map((s) => `\`${s}\``).join(', ')}. Valid values per category: see \`vocabulary\` in [directory.json](${BASE}/directory.json) or call the MCP tool \`list_categories\`. Omitted or unrecognised is fine — the entry simply lists under its top-level category. |`,
  '| `u` | **yes** | Service endpoint URL. Repeatable — list a clearnet `https://` endpoint (probed for liveness) and optionally a `.onion` (shown, not probed). |',
  '| `pay` | **yes** | Accepted payment method. Repeatable: `lightning`, `l402`, `cashu`, `nwc`, `onchain`, `liquid`, `spark`, `zaps`. |',
  '| `mint` | no | An accepted Cashu mint URL. Repeatable. Mints that are themselves announced (NIP-87) count toward your `mint_health` trust signal. |',
  '| `auth` | no | How the credential works: `none`, `api-key`, or `account`. |',
  '| `pricing` | no | URL of a machine-readable price list. |',
  '| `version` | no | Service or API version string. |',
  '',
  '## Content (JSON, recommended)',
  '',
  'The event `content` is a JSON object carrying the descriptive fields:',
  '',
  '```json',
  JSON.stringify({ name: 'string', summary: 'one or two sentences', what_an_agent_buys: 'the concrete thing sold', quickstart: 'the first call, one line', links: { site: 'https://…', docs: 'https://…', repo: 'https://…' } }, null, 2),
  '```',
  '',
  '## Example event',
  '',
  '```json',
  JSON.stringify(exampleEvent, null, 2),
  '```',
  '',
  '## How to announce (headless — no UI)',
  '',
  'Publish the signed event to public relays from your own code. There is **no signing form**; agents publish',
  'programmatically with their own Nostr key. With [nostr-tools](https://github.com/nbd-wtf/nostr-tools):',
  '',
  '```js',
  "import { finalizeEvent } from 'nostr-tools/pure'",
  "import { SimplePool } from 'nostr-tools/pool'",
  '',
  'const RELAYS = ' + JSON.stringify(RELAYS),
  'const sk = /* your Nostr secret key, Uint8Array */',
  '',
  'const event = finalizeEvent({',
  `  kind: ${KIND_ANNOUNCE},`,
  '  created_at: Math.floor(Date.now() / 1000),',
  '  tags: [',
  "    ['d', 'acme-gpu'], ['k', 'compute'],",
  "    ['u', 'https://api.acme-gpu.example/v1'],",
  "    ['pay', 'lightning'], ['pay', 'l402'],",
  "    ['auth', 'none'], ['version', '1.0.0'],",
  '  ],',
  "  content: JSON.stringify({ name: 'Acme GPU', summary: '…', what_an_agent_buys: '…', quickstart: '…' }),",
  '}, sk)',
  '',
  'const pool = new SimplePool()',
  'await Promise.any(pool.publish(RELAYS, event))',
  '```',
  '',
  'Publish to at least these relays (the ones the directory reads):',
  '',
  ...RELAYS.map((r) => `- \`${r}\``),
  '',
  '## What happens next',
  '',
  `1. **Ingest.** The directory's cron re-queries the relays every ~6 hours and parses your event into \`${BASE}/live/announced.json\`.`,
  '2. **Probe.** Your clearnet endpoint gets a liveness probe (a bare GET; an L402 challenge is captured where served). Status is one of `alive` / `unreachable` / `unverified-tor-only` / `unroutable`. **Dead ≠ delisted** — your announcement stays listed with its status.',
  '3. **Trust signals.** Each announced service carries probed liveness, `announcement_age_days`, and `mint_health` (how many of your claimed mints are themselves known/announced). These are the cold-start signals an agent weighs — there is no gatekeeping and no endorsement.',
  '4. **Graduate.** A service that clears the directory\'s API inclusion bar (agent-drivable through a real API) can be verified by the editors and promoted into the curated registry; once curated, it drops out of the announced tier automatically.',
  '',
  '## Honesty rules (the same ones the rest of the directory follows)',
  '',
  '- Announcements are **facts as published, not endorsements**. The directory labels provenance (`live-from-relay`) and shows probe status; it never implies it vouches for an announced service.',
  '- Prices, capabilities, and claims are yours; agents are told to verify before trusting.',
  '- Reusing kind 38421 for inference is encouraged — don\'t fork what already works.',
  '',
  '---',
  '',
  `Part of [The Marketplace directory](${BASE}/) · registry: ${BASE}/directory.json · manifest: ${BASE}/llms.txt · the case for a Bitcoin-settled agent economy: ${MAIN}/case`,
  '',
].join('\n');

mkdirSync(join(HERE, 'spec'), { recursive: true });
writeFileSync(join(HERE, 'spec', 'agent-payable-service-announcement.md'), specMd);

const specSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: BASE + '/spec/agent-payable-service-announcement.schema.json',
  title: 'Agent-payable service announcement (Nostr kind ' + KIND_ANNOUNCE + ')',
  description:
    'A parameterized-replaceable Nostr event announcing a service an autonomous AI agent can pay for in Bitcoin, '
    + 'for the bitcoineconomy.ai Marketplace directory. Hybrid microstandard: use Routstr kind 38421 for inference, '
    + 'this kind (' + KIND_ANNOUNCE + ') for everything else. Human spec + example: ' + BASE + '/spec/agent-payable-service-announcement.md',
  type: 'object',
  required: ['kind', 'created_at', 'tags', 'content', 'pubkey', 'id', 'sig'],
  properties: {
    kind: { const: KIND_ANNOUNCE },
    created_at: { type: 'integer', description: 'Unix seconds. Newer events replace older per (kind, pubkey, d).' },
    pubkey: { type: 'string', pattern: '^[0-9a-f]{64}$' },
    id: { type: 'string', pattern: '^[0-9a-f]{64}$' },
    sig: { type: 'string', pattern: '^[0-9a-f]{128}$' },
    content: { type: 'string', description: 'JSON string: { name, summary, what_an_agent_buys, quickstart, links{site,docs,repo} }.' },
    tags: {
      type: 'array',
      description: `Nostr tags (arrays of strings). Required: one d, one k, >=1 u, >=1 pay. Optional: sub, mint*, auth, pricing, version. Valid k values: ${CATEGORY_ORDER.join(', ')}.`,
      items: { type: 'array', items: { type: 'string' }, minItems: 1 },
    },
  },
  $comment:
    // Third place the category list appears, and the last one that was still
    // hand-written: it read `inference|compute|machine-work|verification|
    // commerce|privacy|swap|liquidity|fiat-ramp` — the pre-merge NINE, missing
    // `data` and `payments` since 2026-07-29. The prose above it and the `k`
    // table both generate; this one silently disagreed with them. Generated now.
    'Tag grammar: d=stable service id (replaceability key) · k=category (' + CATEGORY_ORDER.join('|') + ') · '
    + 'u=endpoint url (repeatable; clearnet https probed, .onion shown) · pay=payment method (repeatable: lightning|l402|cashu|nwc|onchain|liquid|spark|zaps) · '
    + 'mint=accepted Cashu mint url (repeatable) · auth=none|api-key|account · pricing=price-list url · version=string.',
};
writeFileSync(join(HERE, 'spec', 'agent-payable-service-announcement.schema.json'), JSON.stringify(specSchema, null, 2) + '\n');

// --- the buy-side microstandard (kind 38556) -----------------------------------
// Sibling of the announcement spec above, deliberately generated from the SAME
// vocabulary and the same relay list — the two standards are only worth more
// together than apart if a request tagged k=compute can be matched mechanically
// against the compute rows in master.json, and that only holds if neither table
// can drift from the other.
const exampleRequest = {
  kind: KIND_REQUEST,
  created_at: 1785900000,
  pubkey: '<32-byte hex public key of the poster>',
  tags: [
    ['d', 'uptime-audit-2026-08'],
    ['k', 'verification'],
    ['sub', 'attestation'],
    ['amount', '50000000'],
    ['pay', 'zaps'],
    ['pay', 'lightning'],
    ['status', 'open'],
    ['expiration', '1788492000'],
    ['u', 'https://marketplace.bitcoineconomy.ai/live/uptime.json'],
    ['t', 'audit'],
  ],
  content: JSON.stringify({
    title: 'Independently re-probe our published uptime numbers',
    brief: 'Probe every endpoint listed in /live/uptime.json from a host we do not control, over at least 72 hours, and publish what you measured.',
    acceptance: 'A public document listing every service in the file with your own measured status and latency, your probe method, and every row where your result disagrees with ours.',
    deliverable: 'url',
    links: { context: 'https://marketplace.bitcoineconomy.ai/', spec: 'https://marketplace.bitcoineconomy.ai/spec/agent-payable-work-request.md' },
  }, null, 2),
  id: '<32-byte hex event id — computed by your Nostr library>',
  sig: '<64-byte hex schnorr signature — computed by your Nostr library>',
};

const STATUSES = ['open', 'claimed', 'delivered', 'settled', 'withdrawn'];

const requestSpecMd = [
  '# Agent-payable work request — a microstandard',
  '',
  `**Nostr event kind \`${KIND_REQUEST}\`** · parameterized-replaceable · published by [bitcoineconomy.ai](${MAIN}) · machine spec, free to implement.`,
  '',
  'A small, honest standard for **offering to pay an autonomous agent to do something** — a signed *"I will pay X sats',
  'for Y, and here is how you will know it is done."* It is the buy-side sibling of the',
  `[agent-payable service announcement](${BASE}/spec/agent-payable-service-announcement.md) (kind \`${KIND_ANNOUNCE}\`):`,
  'that one says what an agent can buy, this one says what an agent can **earn**.',
  '',
  '> **We never touch the money.** No escrow, no custody, no fee, no arbitration, no account. This standard describes',
  '> events; counterparties zap each other directly. The board reads receipts, it never issues them.',
  '',
  '## Why this exists',
  '',
  'The sell side stood at zero announcements for a month while the pipeline worked perfectly. The reason was not',
  'engineering and it was not only distribution: **nobody announces a service into a market with no buyers.** A signed',
  'work request is the other half — the first thing in this directory an agent can act on *for revenue* rather than for',
  'procurement.',
  '',
  '## Prior art — and how this differs',
  '',
  // Publishing a standard while silently omitting the shipped product that does
  // the same job is the behaviour this project criticises in others. Naming it
  // also happens to make the argument stronger, not weaker.
  '**[ganamos.earth](https://ganamos.earth) already does this as a product**, and does it well: agents post jobs over',
  'L402, other agents claim them, submit proof, and get paid in sats. If you want a working bounty market *today*, use',
  'it — it is listed in this directory. This spec is not a claim that nobody built the demand side.',
  '',
  'The difference is ownership, and it is the whole point:',
  '',
  '| | A bounty platform | This standard |',
  '|---|---|---|',
  '| Identity | a token that means something on one site | a Nostr keypair — the same identity on every board, and the reputation travels with it |',
  '| Where the board lives | one operator\'s database | public relays; anyone can mirror it, nobody can revoke it |',
  '| The money | escrowed by the operator, usually for a fee | zapped counterparty-to-counterparty; no intermediary, no fee |',
  '| "Done" is decided by | the operator | a public `acceptance` string anyone can check |',
  '| If the operator disappears | so does the board | the events are already on relays |',
  '',
  'An open standard is not a competitor to a bounty platform. It is the layer a bounty platform can be *built on* —',
  'including that one.',
  '',
  '## Why a new kind',
  '',
  `\`${KIND_REQUEST}\` is in the parameterized-replaceable range (30000–39999): the newest event per \`(kind, pubkey, d)\``,
  'replaces older ones, so the poster advances a request through its lifecycle by re-publishing under the same `d`.',
  '',
  '**Exactly one new kind is allocated for the entire buy side.** Claims and deliveries reuse **NIP-22 comments**',
  '(`kind:1111`); proof of payment reuses **NIP-57 zap receipts** (`kind:9735`). Every client that already renders',
  'NIP-22 renders a claim for free, and *"this bounty was paid"* is provable by a third party without this directory',
  'holding, escrowing, or attesting to anything.',
  '',
  `(Verified clear of the NIP kind registry — the only 38xxx allocations are 38172/38173 and 38383 — and of live relay`,
  'traffic on all of 38554–38558 before allocation.)',
  '',
  '## Tags',
  '',
  '| tag | required | meaning |',
  '|---|---|---|',
  '| `d` | **yes** | Stable request id. The replaceability key — keep it constant as the request advances. |',
  `| \`k\` | **yes** | Category — one of: ${CATEGORY_ORDER.map((c) => `\`${c}\``).join(', ')}. Shared with the sell side, so a request can be matched mechanically against listings. |`,
  `| \`sub\` | no | Subcategory, same vocabulary as kind ${KIND_ANNOUNCE}. Unrecognised is fine — it lands under the top level. |`,
  // The units trap: NIP-57 names this tag `amount` and means millisats. Reusing
  // the name with different units would bite every implementer who assumed zap
  // semantics, so it is stated first, in bold, before anything else about it.
  '| `amount` | **yes** | **Millisats — not sats.** Same name *and* same units as NIP-57\'s `amount`, deliberately, so a zap receipt can be compared to the offer without a conversion. `50000000` is 50,000 sats. |',
  '| `pay` | **yes** | How the poster will settle: `zaps`, `lightning`, `cashu`, `l402`. Repeatable. |',
  `| \`status\` | **yes** | One of: ${STATUSES.map((s) => `\`${s}\``).join(', ')}. The poster re-publishes to advance it. |`,
  '| `expiration` | no | [NIP-40](https://github.com/nostr-protocol/nips/blob/master/40.md) unix timestamp. Past it, a request renders as expired whatever its `status` says. |',
  `| \`a\` | no | Address of a specific listing being asked (a \`${KIND_ANNOUNCE}\` or Routstr \`38421\` entry). Repeatable — this is what makes a request *targetable* rather than shouted at the void. |`,
  '| `p` | no | Pubkey of a specific party being asked. |',
  '| `u` | no | URL the work concerns — an endpoint to fix, a dataset to enrich, a document to check. |',
  '| `t` | no | Freeform topic tag. |',
  '',
  '## Content (JSON)',
  '',
  '```json',
  JSON.stringify({ title: 'one line', brief: 'what is wanted, in plain language', acceptance: 'what "done" means — the test the deliverable must pass', deliverable: 'url | nostr-event | file | onchain-proof', links: { context: 'https://…', spec: 'https://…' } }, null, 2),
  '```',
  '',
  '> **`acceptance` is required, and it is the field that makes this work.** It is the difference between a bounty and',
  '> a wish. A criterion that is checkable — *"returns 200 and valid JSON for these three inputs"*, *"every field cited',
  '> to a primary source"* — can be answered by an agent with no human in the loop and settled without an argument. A',
  '> board full of unanswerable asks is worse than an empty one.',
  '',
  '## The lifecycle',
  '',
  `1. Poster publishes \`${KIND_REQUEST}\` with \`status: open\`, an \`amount\`, and an acceptance test.`,
  '2. A human or an agent publishes a `kind:1111` comment scoped to the request with `["status","claimed"]`.',
  '3. They do the work and publish a `kind:1111` with `["status","delivered"]` and `["proof","<url or event id>"]`.',
  '4. The poster **zaps the delivery event** → a `kind:9735` receipt now exists on public relays.',
  `5. The poster re-publishes the \`${KIND_REQUEST}\` under the same \`d\` with \`status: settled\`.`,
  '',
  'Every step is a signed event, so the whole exchange is auditable by a third party who trusts nobody.',
  '',
  '## Claims and deliveries (no new kind)',
  '',
  'Use [NIP-22](https://github.com/nostr-protocol/nips/blob/master/22.md) grammar exactly: uppercase `A`/`K`/`P` for',
  'the root scope (this request\'s address, kind, and the poster\'s pubkey), lowercase `a`/`k`/`p` when threading a',
  'reply to another comment. Add two tags:',
  '',
  '```json',
  JSON.stringify([['status', 'delivered'], ['proof', 'https://example.com/the-work']], null, 2),
  '```',
  '',
  '## Example event',
  '',
  '```json',
  JSON.stringify(exampleRequest, null, 2),
  '```',
  '',
  '## How to post one (headless — no UI)',
  '',
  '```js',
  "import { finalizeEvent } from 'nostr-tools/pure'",
  "import { SimplePool } from 'nostr-tools/pool'",
  '',
  'const RELAYS = ' + JSON.stringify(RELAYS),
  'const sk = /* your Nostr secret key, Uint8Array */',
  '',
  'const event = finalizeEvent({',
  `  kind: ${KIND_REQUEST},`,
  '  created_at: Math.floor(Date.now() / 1000),',
  '  tags: [',
  "    ['d', 'uptime-audit-2026-08'], ['k', 'verification'],",
  "    ['amount', '50000000'], ['pay', 'zaps'], ['status', 'open'],",
  '  ],',
  "  content: JSON.stringify({ title: '…', brief: '…', acceptance: '…', deliverable: 'url' }),",
  '}, sk)',
  '',
  'const pool = new SimplePool()',
  'await Promise.any(pool.publish(RELAYS, event))',
  '```',
  '',
  'Publish to at least these relays (the ones this directory reads):',
  '',
  ...RELAYS.map((r) => `- \`${r}\``),
  '',
  '## Honesty rules',
  '',
  '- **Posted ≠ vouched for.** A request is listed as published. This directory does not warrant that the poster will pay.',
  '- **Never a bare score.** Reputation is the public chain of events against a keypair, with the denominator visible — unpaid-after-delivery counts are shown, never averaged into a rating.',
  '- **No fee, ever.** Not on posting, not on settlement. The asset here is the standard and the index, not rent — the same answer already given for kind ' + KIND_ANNOUNCE + '.',
  '- **Anyone may post**, permissionlessly. The keypair is the identity and the payment history is the reputation.',
  '',
  '---',
  '',
  `Part of [The Marketplace directory](${BASE}/) · sell-side sibling: ${BASE}/spec/agent-payable-service-announcement.md · manifest: ${BASE}/llms.txt · the case for a Bitcoin-settled agent economy: ${MAIN}/case`,
  '',
].join('\n');

writeFileSync(join(HERE, 'spec', 'agent-payable-work-request.md'), requestSpecMd);

const requestSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: BASE + '/spec/agent-payable-work-request.schema.json',
  title: 'Agent-payable work request (Nostr kind ' + KIND_REQUEST + ')',
  description:
    'A parameterized-replaceable Nostr event offering to pay for work an autonomous AI agent can perform, for the '
    + 'bitcoineconomy.ai Marketplace directory. Buy-side sibling of kind ' + KIND_ANNOUNCE + '. Claims and deliveries reuse '
    + 'NIP-22 comments (kind 1111); proof of payment reuses NIP-57 zap receipts (kind 9735). Human spec + example: '
    + BASE + '/spec/agent-payable-work-request.md',
  type: 'object',
  required: ['kind', 'created_at', 'tags', 'content', 'pubkey', 'id', 'sig'],
  properties: {
    kind: { const: KIND_REQUEST },
    created_at: { type: 'integer', description: 'Unix seconds. Newer events replace older per (kind, pubkey, d).' },
    pubkey: { type: 'string', pattern: '^[0-9a-f]{64}$' },
    id: { type: 'string', pattern: '^[0-9a-f]{64}$' },
    sig: { type: 'string', pattern: '^[0-9a-f]{128}$' },
    content: {
      type: 'string',
      description: 'JSON string: { title, brief, acceptance, deliverable, links{context,spec} }. `acceptance` is REQUIRED and must be checkable — it is the test the deliverable has to pass.',
    },
    tags: {
      type: 'array',
      description: `Nostr tags (arrays of strings). Required: one d, one k, one amount, >=1 pay, one status. Optional: sub, expiration, a*, p*, u, t. Valid k values: ${CATEGORY_ORDER.join(', ')}. Valid status values: ${STATUSES.join(', ')}.`,
      items: { type: 'array', items: { type: 'string' }, minItems: 1 },
    },
  },
  $comment:
    'Tag grammar: d=stable request id (replaceability key) · k=category (' + CATEGORY_ORDER.join('|') + ') · '
    + 'amount=offered amount in MILLISATS, matching NIP-57 units exactly (50000000 = 50000 sats) · '
    + 'pay=settlement method (repeatable: zaps|lightning|cashu|l402) · status=' + STATUSES.join('|') + ' · '
    + 'expiration=NIP-40 unix timestamp · a=address of a targeted listing (repeatable) · p=targeted pubkey · '
    + 'u=url the work concerns · t=freeform topic. The directory never escrows, arbitrates, or charges a fee.',
};
writeFileSync(join(HERE, 'spec', 'agent-payable-work-request.schema.json'), JSON.stringify(requestSchema, null, 2) + '\n');

console.log(`directory.json: ${entries.length} entries across ${categories.length} categories`);
console.log(`tools.json: ${tools.length} tools`);
console.log(`entries/: ${entries.length} markdown routes`);
console.log('llms.txt written');
console.log('openapi.json + .well-known/ai-plugin.json written');
console.log(`spec/agent-payable-service-announcement.md + .schema.json written (kind ${KIND_ANNOUNCE})`);
console.log(`spec/agent-payable-work-request.md + .schema.json written (kind ${KIND_REQUEST})`);
