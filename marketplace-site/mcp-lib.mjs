// mcp-lib.mjs — the directory-as-MCP server for marketplace.bitcoineconomy.ai
//
// Exposes the curated Bitcoin-native services directory + the live cross-provider
// inference price index as Model Context Protocol tools, so an LN-enabled agent
// can DISCOVER (find_service / get_service / price_model / list_categories) and
// QUOTE (get_quote — a structured payment plan, plus a live L402 invoice or live
// sats price where the provider supports it) without scraping the site.
//
// Transport: stateless Streamable HTTP (MCP 2025-06-18). One POST /mcp carrying a
// single JSON-RPC request → one `application/json` JSON-RPC response. No sessions,
// no SSE, no batching (removed in 2025-06-18). Notifications → 202; GET/DELETE → 405.
//
// Safety: read-only over public data. get_quote probes ONLY the api_base recorded
// on the directory entry the caller names by slug — never a caller-supplied URL —
// so the Worker can't be turned into an open proxy. No funds move through here; the
// agent pays the returned invoice with its own wallet.

import { detectL402 } from './snapshot-lib.mjs';

const SERVER_INFO = { name: 'bitcoineconomy-marketplace', version: '1.0.0' };
const ANNOUNCE_SPEC_URL = 'https://marketplace.bitcoineconomy.ai/spec/agent-payable-service-announcement.md';
const LATEST_VERSION = '2025-06-18';
const SUPPORTED_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];

const INSTRUCTIONS =
  'The bitcoineconomy.ai marketplace: a curated directory of Bitcoin-native services AI agents can pay for over Lightning, Cashu, and L402, plus a catalog of the tools an agent equips to transact. ' +
  'Find services to BUY from with find_service and list_categories, drill in with get_service, get live inference pricing with price_model, and get a ready-to-pay ' +
  'payment plan (or a live invoice / inference price / swap rate) with get_quote. Find tools to EQUIP (wallets, node toolkits, ecash, bridges, protocol primitives) with find_tool and get_tool. ' +
  'Some providers run their own MCP server (Amboss, Bitrefill, Alby NWC) — list_mcp_servers gives the connection detail: discover here, connect there to act. ' +
  'The directory is two-sided: services can also SELL here by publishing a signed kind-38555 "agent-payable service announcement" — find_service tier="announced" surfaces those (self-listed, probed-but-unverified), and the spec to publish one is at ' + ANNOUNCE_SPEC_URL + '. ' +
  'Directory entries and the tool catalog are reference facts; relay/probe data and announced entries are announcements — not endorsements. ' +
  "find_l402_endpoints searches a Wider L402 tier — a selective, attributed pass over 402index.io's verified-L402 feed (external-index provenance, third-party-verified, NOT endorsements) — real Lightning-payable endpoints beyond the curated set. " +
  'You pay providers directly with your own wallet; this server never holds funds and never proxies another MCP.';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, GET, OPTIONS',
  'access-control-allow-headers': 'content-type, mcp-protocol-version, mcp-session-id, authorization',
  'access-control-max-age': '86400',
};

// ---------- data loading (memoized per request) ----------

async function loadJsonAsset(env, origin, path) {
  try {
    const res = await env.ASSETS.fetch(new URL(path, origin));
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

async function loadKvOrAsset(env, origin, kvKey, assetPath) {
  try {
    const kv = await env.SNAPSHOT?.get(kvKey);
    if (kv) return JSON.parse(kv);
  } catch {}
  return loadJsonAsset(env, origin, assetPath);
}

function makeCtx(env, origin) {
  let dirP, modelsP, toolsP, snapP, l402P;
  return {
    directory: () => (dirP ||= loadJsonAsset(env, origin, '/directory.json')),
    async entries() { return (await this.directory())?.entries || []; },
    async models() { return (await (modelsP ||= loadKvOrAsset(env, origin, 'models', '/models.json')))?.models || []; },
    toolsDoc: () => (toolsP ||= loadJsonAsset(env, origin, '/tools.json')),
    async tools() { return (await this.toolsDoc())?.tools || []; },
    snapshot: () => (snapP ||= loadKvOrAsset(env, origin, 'snapshot', '/snapshot.json')),
    // The announced tier: self-listed services (our microstandard, kind 38555),
    // probed-but-unverified — announcements, not endorsements.
    async announced() { return (await this.snapshot())?.modules?.announced?.services || []; },
    // The Wider L402 tier: a selective, attributed pass over 402index.io's
    // verified-L402 feed — external-index provenance, NOT endorsements.
    l402index: () => (l402P ||= loadKvOrAsset(env, origin, 'l402index', '/l402index.json')),
  };
}

// ---------- helpers ----------

const lc = (v) => String(v ?? '').toLowerCase();
const isNoKyc = (e) => /^none/i.test(String(e.kyc || ''));

function compact(e) {
  return {
    slug: e.slug, name: e.name, category: e.category, summary: e.summary,
    what_an_agent_buys: e.what_an_agent_buys, payment_methods: e.payment_methods,
    kyc: e.kyc, custody: e.custody, automatability: e.automatability,
    two_sided: e.two_sided || null, has_api_base: !!e.api_base,
    has_mcp_server: !!e.mcp_endpoint, card_url: e.card_url,
  };
}

function compactAnnounced(s) {
  return {
    slug: s.slug, name: s.name || null, category: s.category || null, summary: s.summary || null,
    what_an_agent_buys: s.what_an_agent_buys || null, payment_methods: s.payment_methods || [],
    tier: 'announced', provenance: 'live-from-relay',
    status: s.status || 'unprobed',
    announcement_age_days: s.announcement_age_days ?? null,
    mint_health: s.mint_health || null,
    has_api_base: !!s.api_base, has_mcp_server: false,
    announce_spec: ANNOUNCE_SPEC_URL,
  };
}

function compactTool(t) {
  return {
    slug: t.slug, name: t.name, toolbox_group: t.toolbox_group, tool_type: t.tool_type,
    tagline: t.tagline, prereq_tier: t.prereq_tier || null, maintainer: t.maintainer || null,
    has_mcp_server: !!t.mcp_endpoint, card_url: t.card_url,
  };
}

function priceModel(models, query, limit) {
  const q = lc(query).trim();
  if (!q) return [];
  const lim = Math.max(1, Math.min(limit || 5, 20));
  return models
    .filter((m) => lc(m.id).includes(q) || lc(m.name).includes(q))
    .slice(0, 25)
    .map((m) => {
      // The source index can list the same endpoint twice (two announcements of
      // one node); dedupe by endpoint, keeping the cheapest (providers are sorted).
      const seen = new Set();
      const cheapest_providers = [];
      for (const p of m.providers || []) {
        const key = p.endpoint || p.provider;
        if (seen.has(key)) continue;
        seen.add(key);
        cheapest_providers.push({
          provider: p.provider, endpoint: p.endpoint,
          sats_per_prompt_token: p.sats_per_prompt_token,
          sats_per_completion_token: p.sats_per_completion_token,
          sats_max_cost_per_request: p.sats_max_cost_per_request,
        });
        if (cheapest_providers.length >= lim) break;
      }
      return { id: m.id, name: m.name, context_length: m.context_length, cheapest_providers };
    });
}

// detectL402 is shared with snapshot-lib's announced-service probe (one detector).

async function probeApiBase(apiBase) {
  // Hard deadline via Promise.race so a slow/hanging endpoint can never stall the
  // MCP call, regardless of whether AbortSignal.timeout fires in the runtime.
  const probe = (async () => {
    const res = await fetch(apiBase, {
      method: 'GET',
      headers: { accept: 'application/json, text/plain;q=0.9, */*;q=0.5' },
      signal: AbortSignal.timeout(5000),
    });
    let body = '';
    try { body = (await res.text()).slice(0, 4000); } catch {}
    const wwwAuth = res.headers.get('www-authenticate') || '';
    const l402 = detectL402(res.status, wwwAuth, body);
    return {
      reachable: true,
      http_status: res.status,
      ...(l402 ? { l402 } : {}),
      note: l402
        ? 'Live L402 challenge captured — pay this invoice, then retry the request with the preimage in the Authorization header.'
        : `Endpoint reachable (HTTP ${res.status}); no L402 challenge on a bare GET. Follow quickstart / how_to_pay to obtain a payable invoice.`,
    };
  })();
  const deadline = new Promise((resolve) => setTimeout(() => resolve({ reachable: false, note: 'Probe timed out (>4.5s); endpoint did not respond in time. Use quickstart / how_to_pay below.' }), 4500));
  try {
    return await Promise.race([probe, deadline]);
  } catch (e) {
    return { reachable: false, note: `Probe failed (${String((e && e.message) || e)}). Use quickstart / how_to_pay below.` };
  }
}

// Live swap-rate lookup for swap-category providers (10d-i). Read-only rate
// ESTIMATE only — no order/swap is created and no funds move. Adapters are keyed
// by api_base host: SideShift returns a market rate for a network-qualified coin
// pair; Boltz is fee-based (rate ≈ 1 — it swaps BTC across layers, so the quote
// is the fee). Mirrors the inference price-index path: get_quote stays read-only.
async function liveSwapRate(entry, { from, to, amount } = {}) {
  let host = '';
  try { host = new URL(entry.api_base).host; } catch {}
  const withDeadline = (p, ms = 4500) =>
    Promise.race([p, new Promise((r) => setTimeout(() => r({ timedOut: true }), ms))]);
  const getJson = async (url) => {
    const res = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(5000) });
    const text = await res.text();
    let json = null; try { json = JSON.parse(text); } catch {}
    return { ok: res.ok, status: res.status, json, text: text.slice(0, 300) };
  };

  // SideShift — GET /v2/pair/{from}/{to}; coins are network-qualified.
  if (host.includes('sideshift')) {
    if (!from || !to) {
      return { provider: 'sideshift', note: 'Pass from + to as network-qualified SideShift coin ids (e.g. from="btc-bitcoin", to="usdc-ethereum") for a live rate. Estimate only — no order created.' };
    }
    try {
      const r = await withDeadline(getJson(`https://sideshift.ai/api/v2/pair/${encodeURIComponent(from)}/${encodeURIComponent(to)}`));
      if (r.timedOut) return { provider: 'sideshift', query: { from, to }, error: 'rate lookup timed out' };
      if (r.json?.error) return { provider: 'sideshift', query: { from, to }, error: r.json.error.message || 'pair error', note: 'SideShift coins are network-qualified — e.g. btc-bitcoin, usdc-ethereum, usdt-tron.' };
      if (!r.ok || !r.json) return { provider: 'sideshift', query: { from, to }, error: `HTTP ${r.status}`, raw: r.text };
      return {
        provider: 'sideshift', query: { from, to, amount: amount || null },
        rate: r.json.rate, min: r.json.min, max: r.json.max,
        deposit_coin: r.json.depositCoin, settle_coin: r.json.settleCoin,
        deposit_network: r.json.depositNetwork, settle_network: r.json.settleNetwork,
        source: 'GET https://sideshift.ai/api/v2/pair/{from}/{to}',
        note: 'Market-rate ESTIMATE — no order created, no funds move. Lock a rate via SideShift /v2/quotes when you actually shift.',
      };
    } catch (e) {
      return { provider: 'sideshift', query: { from, to }, error: String((e && e.message) || e) };
    }
  }

  // Boltz — fee/limit per direction (rate ≈ 1). from = the on-chain asset (BTC, L-BTC, RBTC).
  if (host.includes('boltz')) {
    const asset = (from || 'BTC').toUpperCase();
    try {
      const [sub, rev] = await Promise.all([
        withDeadline(getJson('https://api.boltz.exchange/v2/swap/submarine')),
        withDeadline(getJson('https://api.boltz.exchange/v2/swap/reverse')),
      ]);
      const subPair = sub.json?.[asset]?.BTC;   // on-chain {asset} -> Lightning
      const revPair = rev.json?.BTC?.[asset];   // Lightning -> on-chain {asset}
      const norm = (p) => (p ? { rate: p.rate, fee_percentage: p.fees?.percentage, miner_fees_sats: p.fees?.minerFees, limits_sats: p.limits } : null);
      if (!subPair && !revPair) return { provider: 'boltz', asset, note: `No Boltz pair for asset "${asset}". Boltz swaps BTC across layers — try from="BTC" (or "L-BTC", "RBTC").` };
      return {
        provider: 'boltz', asset, rate: 1,
        to_lightning: norm(subPair),    // submarine swap: pay on-chain {asset}, receive Lightning
        from_lightning: norm(revPair),  // reverse swap: pay Lightning, receive on-chain {asset}
        source: 'GET https://api.boltz.exchange/v2/swap/submarine + /v2/swap/reverse',
        note: 'Boltz swaps BTC across layers (on-chain ⇄ Lightning ⇄ L-BTC/RBTC); rate is ~1 and the quote is the fee (percentage + miner fees, in sats). Estimate only — no swap created, no funds move.',
      };
    } catch (e) {
      return { provider: 'boltz', asset, error: String((e && e.message) || e) };
    }
  }

  return { note: `No live-rate adapter for ${host || 'this provider'} yet — use the payment plan, api_base, and quickstart above.` };
}

// ---------- tools ----------

const TOOLS = [
  {
    name: 'find_service',
    description:
      'Search the marketplace directory of Bitcoin-native services AI agents can buy from. Defaults to the curated tier (editor-verified). Set tier="announced" or "all" to also see self-listed services (published via our kind-38555 microstandard) — those are probed-but-unverified announcements, NOT endorsements; each carries tier, provenance, probe status, announcement age, and mint-health so you never confuse them with curated entries. Filter by free-text query, category, payment method, KYC, automatability tier, or whether the agent can also sell through it. Returns compact matches; call get_service for full detail.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text over name, summary, what-an-agent-buys, category.' },
        category: { type: 'string', description: 'One of: inference, compute, machine-work, commerce, privacy, swap, liquidity, fiat-ramp.' },
        payment_method: { type: 'string', description: 'One of: lightning, onchain, cashu, l402, nwc, liquid, spark, fiat.' },
        no_kyc: { type: 'boolean', description: 'If true, return only services that need no KYC (curated tier only — announced entries do not carry a verified KYC field).' },
        automatability: { type: 'string', description: 'One of: api-no-account, api-account, api-kyc (curated tier only).' },
        two_sided: { type: 'boolean', description: 'If true, return only services an agent can also sell/offer through (curated tier only).' },
        tier: { type: 'string', description: 'Which tier to search: "curated" (default, editor-verified), "announced" (self-listed via kind 38555, probed-but-unverified), or "all".' },
      },
      additionalProperties: false,
    },
    async handler(a, ctx) {
      const tier = lc(a.tier).trim() || 'curated';
      const q = lc(a.query).trim();
      const curatedWanted = tier === 'curated' || tier === 'all';
      const announcedWanted = tier === 'announced' || tier === 'all';

      let curated = [];
      if (curatedWanted) {
        let r = await ctx.entries();
        if (q) r = r.filter((e) => `${e.name} ${e.summary} ${e.what_an_agent_buys} ${e.category} ${(e.payment_methods || []).join(' ')}`.toLowerCase().includes(q));
        if (a.category) r = r.filter((e) => lc(e.category) === lc(a.category));
        if (a.payment_method) r = r.filter((e) => (e.payment_methods || []).map(lc).includes(lc(a.payment_method)));
        if (a.no_kyc === true) r = r.filter(isNoKyc);
        if (a.automatability) r = r.filter((e) => lc(e.automatability) === lc(a.automatability));
        if (a.two_sided === true) r = r.filter((e) => /offer/i.test(String(e.two_sided || '')));
        curated = r.map((e) => ({ tier: 'curated', provenance: 'curated', ...compact(e) }));
      }

      let announced = [];
      if (announcedWanted) {
        // KYC/automatability/two_sided are curated-only verified fields — applying
        // them to announced entries would silently drop honest results, so the
        // announced tier filters only on what an announcement actually carries.
        let r = await ctx.announced();
        if (q) r = r.filter((s) => `${s.name || ''} ${s.summary || ''} ${s.what_an_agent_buys || ''} ${s.category || ''} ${(s.payment_methods || []).join(' ')}`.toLowerCase().includes(q));
        if (a.category) r = r.filter((s) => lc(s.category) === lc(a.category));
        if (a.payment_method) r = r.filter((s) => (s.payment_methods || []).map(lc).includes(lc(a.payment_method)));
        announced = r.map(compactAnnounced);
      }

      return {
        tier,
        count: curated.length + announced.length,
        ...(announcedWanted ? { announced_note: 'Announced entries are self-listed (kind 38555) and probed-but-unverified — announcements, not endorsements. Weigh status, announcement_age_days, and mint_health; verify before trusting. To list a service: ' + ANNOUNCE_SPEC_URL } : {}),
        services: [...curated, ...announced],
      };
    },
  },
  {
    name: 'get_service',
    description: 'Get the full machine-readable detail for one marketplace service by slug (api_base, auth, payment methods, custody/KYC, quickstart, pricing, links). Resolves both curated slugs (e.g. "routstr") and announced slugs ("announced:{id}", self-listed via kind 38555 — returned with probe status + trust signals + the announcements-not-endorsements caveat).',
    inputSchema: {
      type: 'object',
      properties: { slug: { type: 'string', description: 'The service slug, e.g. "routstr", "boltz", "bitrefill", or an announced slug "announced:acme-gpu".' } },
      required: ['slug'],
      additionalProperties: false,
    },
    async handler(a, ctx) {
      // Announced entries are namespaced "announced:…"; route by that, else curated.
      if (/^announced:/i.test(String(a.slug))) {
        const s = (await ctx.announced()).find((x) => x.slug === a.slug);
        if (!s) return { error: `No announced service with slug "${a.slug}". It may have been replaced or expired off the relays. Use find_service tier="announced" for the current list.` };
        return {
          tier: 'announced', provenance: 'live-from-relay',
          disclaimer: 'Self-listed via the kind-38555 microstandard — an announcement as published, NOT an endorsement. Weigh status / announcement_age_days / mint_health and verify before trusting.',
          announce_spec: ANNOUNCE_SPEC_URL,
          ...s,
        };
      }
      const e = (await ctx.entries()).find((x) => x.slug === a.slug);
      if (!e) return { error: `No service with slug "${a.slug}". Use find_service or list_categories to discover valid slugs (announced services use "announced:{id}").` };
      const { entry_md, ...rest } = e; // drop the heavy markdown blob; card_url/links point to it
      return { tier: 'curated', ...rest };
    },
  },
  {
    name: 'find_tool',
    description:
      'Search the tool catalog — the equipment an agent installs or runs to transact in Bitcoin (wallets & treasuries, node toolkits, ecash software, bridges & swaps, protocol primitives). This is what an agent EQUIPS, distinct from find_service (what it BUYS). Filter by free-text query, toolbox group, tool type, the prerequisite tier (what must be in place first), or whether the tool ships its own MCP server. Returns compact matches; call get_tool for full detail.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text over name, tagline, group, maintainer.' },
        toolbox_group: { type: 'string', description: 'One of: wallets, node-toolkits, ecash, bridges, primitive.' },
        tool_type: { type: 'string', description: 'One of: software, protocol, service, guide.' },
        prereq_tier: { type: 'string', description: 'What must be in place first: keys-only, account, wallet, bitcoin-node, lightning-node, l2-network.' },
        has_mcp_server: { type: 'boolean', description: 'If true, return only tools that ship their own MCP server (connect there to act).' },
      },
      additionalProperties: false,
    },
    async handler(a, ctx) {
      let r = await ctx.tools();
      const q = lc(a.query).trim();
      if (q) r = r.filter((t) => `${t.name} ${t.tagline} ${t.toolbox_group} ${t.maintainer || ''} ${t.tool_type}`.toLowerCase().includes(q));
      if (a.toolbox_group) r = r.filter((t) => lc(t.toolbox_group) === lc(a.toolbox_group));
      if (a.tool_type) r = r.filter((t) => lc(t.tool_type) === lc(a.tool_type));
      if (a.prereq_tier) r = r.filter((t) => lc(t.prereq_tier) === lc(a.prereq_tier));
      if (a.has_mcp_server === true) r = r.filter((t) => !!t.mcp_endpoint);
      return { count: r.length, tools: r.map(compactTool) };
    },
  },
  {
    name: 'get_tool',
    description: 'Get the full machine-readable detail for one tool by slug (toolbox group, type, layer, prerequisite tier, maintainer, repo/docs/site links, and — where it ships one — its own mcp_endpoint). Full gotchas/dependencies live at the card_url.',
    inputSchema: {
      type: 'object',
      properties: { slug: { type: 'string', description: 'The tool slug, e.g. "alby-nwc", "lnbits", "cashu", "amboss".' } },
      required: ['slug'],
      additionalProperties: false,
    },
    async handler(a, ctx) {
      const t = (await ctx.tools()).find((x) => x.slug === a.slug);
      if (!t) return { error: `No tool with slug "${a.slug}". Use find_tool to discover valid slugs.` };
      return t;
    },
  },
  {
    name: 'price_model',
    description:
      'Given an LLM model id or partial name, return the alive Bitcoin-paid inference providers serving it, cheapest first, in sats per prompt/completion token and max sats per request. Backed by a cross-provider price index refreshed every 6 hours.',
    inputSchema: {
      type: 'object',
      properties: {
        model: { type: 'string', description: 'Model id or partial name, e.g. "gpt-5", "claude", "gemini-3-flash".' },
        limit: { type: 'integer', description: 'Max providers per model (default 5, max 20).' },
      },
      required: ['model'],
      additionalProperties: false,
    },
    async handler(a, ctx) {
      const matches = priceModel(await ctx.models(), a.model, a.limit);
      return {
        model_query: a.model,
        match_count: matches.length,
        note: matches.length
          ? "Providers are cheapest-first, in sats. Prices are providers' own published numbers, refreshed every 6 hours — announcements, not endorsements."
          : 'No alive provider matches that model id right now. Try a broader query (e.g. just the family name).',
        models: matches,
      };
    },
  },
  {
    name: 'list_categories',
    description: 'List the marketplace vocabulary and live tallies (categories, payment methods, automatability tiers, KYC) so you can target find_service, plus the count of self-announced services and the live JSON routes.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    async handler(_a, ctx) {
      const dir = await ctx.directory();
      const entries = dir?.entries || [];
      const announced = await ctx.announced();
      const tally = (fn) => entries.reduce((m, e) => { const k = fn(e) ?? '(none)'; m[k] = (m[k] || 0) + 1; return m; }, {});
      const pm = {};
      for (const e of entries) for (const p of e.payment_methods || []) pm[p] = (pm[p] || 0) + 1;
      return {
        total_services: entries.length,
        categories: tally((e) => e.category),
        payment_methods: pm,
        automatability_tiers: tally((e) => e.automatability),
        kyc: tally((e) => e.kyc),
        two_sided: tally((e) => e.two_sided),
        announced_tier: {
          count: announced.length,
          note: 'Self-listed services via the kind-38555 microstandard (probed-but-unverified — announcements, not endorsements). Query with find_service tier="announced". List your own service: ' + ANNOUNCE_SPEC_URL,
        },
        vocabulary: {
          categories: dir?.categories,
          automatability_tiers: dir?.automatability_tiers,
          payment_method_vocabulary: dir?.payment_method_vocabulary,
        },
        live_routes: dir?.live_routes,
      };
    },
  },
  {
    name: 'list_mcp_servers',
    description:
      "List the providers in this directory that run their OWN Model Context Protocol server, with the details to connect: transport (stdio or http), how to run it (npm package / run command, or hosted URL), the tools it exposes, repo, and auth. This makes the directory a registry of other services' MCP servers — discover here, connect there to act. This server never proxies them; you connect directly and pay the provider with your own wallet.",
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    async handler(_a, ctx) {
      const [entries, tools] = [await ctx.entries(), await ctx.tools()];
      const bySlug = new Map();
      const add = (item, source, classification) => {
        if (!item.mcp_endpoint) return;
        const existing = bySlug.get(item.slug);
        if (existing) { if (!existing.source.includes(source)) existing.source += `+${source}`; return; }
        bySlug.set(item.slug, {
          slug: item.slug, name: item.name, source, classification,
          mcp_endpoint: item.mcp_endpoint, card_url: item.card_url,
        });
      };
      for (const e of entries) add(e, 'service', e.category);
      for (const t of tools) add(t, 'tool', t.toolbox_group);
      const servers = [...bySlug.values()];
      return {
        count: servers.length,
        note: 'These are providers’ OWN MCP servers. Connect to them directly to act (buy, pay, swap); this directory only points to them. Reference facts, not endorsements — verify a server is current and trusted before running it. Funds never move through this directory server.',
        servers,
      };
    },
  },
  {
    name: 'get_quote',
    description:
      'Get a ready-to-pay quote for one service by slug. Returns the structured payment plan (methods, auth, api_base, quickstart, pricing) and — where the provider supports it — a live result: an HTTP 402 / L402 Lightning invoice captured from its API; for inference providers given a model, the live cheapest sats price; for swap providers (Boltz, SideShift) given from/to, a live swap rate or fee. No funds move and no order/swap is created; you pay or shift with your own wallet.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'The service slug to quote, e.g. "routstr", "ppq-ai", "boltz", "sideshift".' },
        model: { type: 'string', description: 'Optional — for inference services, the model id to price live.' },
        from: { type: 'string', description: 'Optional — for swap services, the source asset. SideShift: a network-qualified coin id (e.g. "btc-bitcoin"). Boltz: the on-chain asset ("BTC", "L-BTC", "RBTC"; defaults to BTC).' },
        to: { type: 'string', description: 'Optional — for swap services (SideShift), the network-qualified destination coin id (e.g. "usdc-ethereum").' },
        amount: { type: 'string', description: 'Optional — for swap services, the amount to quote (advisory; the rate returned is an estimate).' },
      },
      required: ['slug'],
      additionalProperties: false,
    },
    async handler(a, ctx) {
      const e = (await ctx.entries()).find((x) => x.slug === a.slug);
      if (!e) return { error: `No service with slug "${a.slug}". Use find_service or list_categories first.` };
      const out = {
        service: { slug: e.slug, name: e.name, category: e.category },
        payment_plan: {
          pay_with: e.payment_methods, how_to_pay: e.payment_detail || null,
          auth: e.auth || null, custody: e.custody || null, kyc: e.kyc || null,
          api_base: e.api_base || null, quickstart: e.quickstart || null,
          pricing_url: e.pricing_url || null,
          connect_via_mcp: e.mcp_endpoint || null,
          links: e.links || null,
        },
        disclaimer: 'Reference data, not an endorsement. No funds move through this server — you pay the provider directly with your own wallet.',
      };
      out.live_probe = e.api_base
        ? await probeApiBase(e.api_base)
        : e.mcp_endpoint
          ? { reachable: false, note: `No L402 API base to bare-GET probe — this provider runs its own MCP server (${e.mcp_endpoint.transport}: ${e.mcp_endpoint.url || e.mcp_endpoint.run || e.mcp_endpoint.package}). Connect to it directly to act; see connect_via_mcp above or call list_mcp_servers.` }
          : { reachable: false, note: 'No public API base on file — follow quickstart / how_to_pay above to obtain a payable quote.' };
      if (e.category === 'inference' && a.model) {
        const priced = priceModel(await ctx.models(), a.model, 3);
        out.live_price = priced.length
          ? { model_query: a.model, matches: priced }
          : { model_query: a.model, matches: [], note: 'No alive provider in the 6-hourly price index matches that model id right now.' };
      }
      if (e.category === 'swap' && e.api_base) {
        out.live_rate = await liveSwapRate(e, { from: a.from, to: a.to, amount: a.amount });
      }
      return out;
    },
  },
  {
    name: 'find_l402_endpoints',
    description:
      "Search the Wider L402 tier — a selective, attributed pass over 402index.io's verified-L402 feed (Ryan Gentry, ex-Lightning Labs). These are real Lightning-payable (L402) endpoints BEYOND the curated registry: health-filtered and reliability-capped, each with a source_page back to its 402index.io record. provenance is external-index — third-party-indexed and third-party-verified, NOT bitcoineconomy.ai endorsements; verify at the source before trusting. Filter by free-text query, category (e.g. ai/llm, ai/image, ai/video, ai/code, ai/text), or a max price in sats. For the curated, editor-verified services use find_service instead.",
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text match on name / provider / category.' },
        category: { type: 'string', description: 'Prefix match on the 402index category (e.g. "ai/llm", "ai/image", "ai/video", "ai").' },
        max_price_sats: { type: 'number', description: 'Only endpoints whose per-call price in sats is at or below this.' },
        limit: { type: 'number', description: 'Max results (default 25, max 60).' },
      },
    },
    handler: async (a, ctx) => {
      const doc = await ctx.l402index();
      if (!doc || !Array.isArray(doc.services)) {
        return { error: 'Wider L402 index unavailable right now — the curated registry (find_service) is unaffected.' };
      }
      const q = lc(a.query).trim();
      const cat = lc(a.category).trim();
      const lim = Math.max(1, Math.min(a.limit || 25, 60));
      const hits = doc.services.filter((s) =>
        (!q || lc(`${s.name} ${s.provider} ${s.category}`).includes(q)) &&
        (!cat || lc(s.category).startsWith(cat)) &&
        (a.max_price_sats == null || (typeof s.price_sats === 'number' && s.price_sats <= a.max_price_sats))
      ).slice(0, lim);
      return {
        tier: 'wider-l402',
        provenance: 'external-index',
        attribution: doc.attribution,
        note: "Third-party-indexed + verified by 402index.io, passed through with attribution — NOT endorsements. Each result's source_page links to its 402index.io record; verify before trusting. Curated, editor-verified services: use find_service.",
        generated_at: doc.generated_at,
        count: hits.length,
        of_indexed: doc.count,
        services: hits.map((s) => ({
          name: s.name, provider: s.provider, category: s.category,
          url: s.url, price_sats: s.price_sats, price_usd: s.price_usd,
          payment: `${s.payment_asset}/${s.payment_network} (L402)`,
          reliability_score: s.reliability_score, health_status: s.health_status,
          http_method: s.http_method, source_page: s.source_page,
          tier: 'wider-l402', provenance: 'external-index',
        })),
      };
    },
  },
];

// ---------- JSON-RPC ----------

const rpcResult = (id, result) => ({ jsonrpc: '2.0', id, result });
const rpcError = (id, code, message, data) => ({ jsonrpc: '2.0', id: id ?? null, error: data === undefined ? { code, message } : { code, message, data } });

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...CORS } });
}

async function handleRpc(msg, env, origin) {
  const { id, method, params } = msg;
  switch (method) {
    case 'initialize': {
      const reqVer = params?.protocolVersion;
      return rpcResult(id, {
        protocolVersion: SUPPORTED_VERSIONS.includes(reqVer) ? reqVer : LATEST_VERSION,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      });
    }
    case 'ping':
      return rpcResult(id, {});
    case 'tools/list':
      return rpcResult(id, { tools: TOOLS.map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })) });
    case 'tools/call': {
      const tool = TOOLS.find((t) => t.name === params?.name);
      if (!tool) return rpcError(id, -32602, `Unknown tool: ${params?.name}`);
      try {
        const result = await tool.handler(params.arguments || {}, makeCtx(env, origin));
        return rpcResult(id, { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }], isError: !!(result && result.error) });
      } catch (e) {
        return rpcResult(id, { content: [{ type: 'text', text: `Tool error: ${String((e && e.message) || e)}` }], isError: true });
      }
    }
    default:
      return rpcError(id, -32601, `Method not found: ${method}`);
  }
}

export async function handleMcp(request, env, origin) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed — POST a JSON-RPC message to this MCP endpoint.', { status: 405, headers: { ...CORS, allow: 'POST, OPTIONS' } });
  }

  let msg;
  try { msg = await request.json(); }
  catch { return jsonResponse(rpcError(null, -32700, 'Parse error'), 400); }

  if (Array.isArray(msg)) return jsonResponse(rpcError(null, -32600, 'Batch requests are not supported (removed in MCP 2025-06-18).'), 400);

  // No method, or a method with no id → notification/response: acknowledge, no body.
  if (!msg || !msg.method || msg.id === undefined || msg.id === null) {
    return new Response(null, { status: 202, headers: CORS });
  }

  return jsonResponse(await handleRpc(msg, env, origin), 200);
}
