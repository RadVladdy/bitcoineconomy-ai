#!/usr/bin/env node
// build.mjs — generates the marketplace directory's static artifacts.
//
// Reads the main site's card files (src/_raw/{services,exchanges,tools}) — the
// single source of truth for names, links, KYC, custody, and verification dates —
// merges directory-overlay.json (category, what-an-agent-buys, payment methods,
// automatability tier), and writes:
//
//   directory.json     the curated registry core (the agent-readable registry)
//   entries/{slug}.md  one clean Markdown route per entry
//   llms.txt           the agent manifest for the subdomain
//
// Run from marketplace-site/:  node build.mjs
// Regenerate + commit whenever cards or the overlay change.

import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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
    'An MCP server at /mcp exposes both the service registry and the tool catalog as Model Context Protocol tools (find_service, get_service, price_model, list_categories, get_quote, find_tool, get_tool, list_mcp_servers) for agents that call rather than fetch. ' +
    'The tool catalog (equipment an agent installs/runs to transact: wallets, node toolkits, ecash, bridges, protocol primitives) is at /tools.json. ' +
    'list_mcp_servers / the mcp_endpoint field make this directory a registry of OTHER services\' MCP servers (Amboss, Bitrefill, Alby NWC): discover here, connect there to act — no funds and no provider calls run through this server. ' +
    'Part of https://bitcoineconomy.ai — thesis at /case, methodology at /services-for-agents.',
  name: 'The Marketplace directory — bitcoineconomy.ai',
  url: BASE + '/',
  generated_at: new Date().toISOString(),
  entry_count: entries.length,
  categories,
  live_routes: {
    mcp: BASE + '/mcp',
    tools_catalog: BASE + '/tools.json',
    snapshot: BASE + '/live/snapshot.json',
    models_price_index: BASE + '/live/models.json',
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
    `- Category: ${e.category}`,
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
  '> The agent-readable directory of services autonomous AI agents buy and sell for Bitcoin —',
  '> inference, compute, machine work, commerce bridges, swaps, liquidity, and fiat ramps.',
  '> Curated registry + a live snapshot of Nostr-announced inventory (Routstr providers, NIP-87 ecash mints)',
  '> + a probed cross-provider price index for inference.',
  '',
  '## How to consume this directory (three fetches, no inference needed)',
  '',
  `1. ${BASE}/directory.json — the curated registry. Filter locally on category, payment_methods,`,
  '   automatability (api-no-account | api-account | api-kyc), and kyc. Entries carry auth, quickstart,',
  '   and (where verified) api_base + pricing_url — enough to make the first call.',
  `2. ${BASE}/live/snapshot.json — what announces itself on Nostr right now (Routstr kind-38421 inference`,
  '   providers, NIP-87 ecash mints, kind-38000 reviews). Each provider carries probe status',
  '   (alive | unreachable | unverified-tor-only | unroutable — announcements outlive nodes; filter status === "alive"',
  '   unless you can reach Tor, where network: tor | both endpoints are yours to verify) plus latency_ms,',
  '   model_count, and accepted mints.',
  `3. ${BASE}/live/models.json — the cross-provider inference price index: model id → every alive provider`,
  '   serving it, cheapest first, in sats per token (+ max_cost per request, the budgeting ceiling).',
  '   One fetch answers "who serves model X cheapest right now".',
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
  `An MCP server at ${BASE}/mcp exposes both the service registry and the tool catalog as Model Context Protocol`,
  'tools, so an agent can call instead of fetch: find_service, get_service, price_model, list_categories, get_quote',
  '(a ready-to-pay payment plan — a live L402 invoice or live sats price where the provider supports it),',
  'find_tool, get_tool, and list_mcp_servers. That last one lists the providers here that run their OWN MCP server',
  '(Amboss, Bitrefill, Alby NWC) — discover here, connect there to act. Stateless Streamable HTTP: POST one',
  'JSON-RPC request, get one JSON response. No funds move through it; you pay providers directly.',
  '',
  `Static fallbacks (work without the worker): ${BASE}/snapshot.json + ${BASE}/models.json`,
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

console.log(`directory.json: ${entries.length} entries across ${categories.length} categories`);
console.log(`entries/: ${entries.length} markdown routes`);
console.log('llms.txt written');
