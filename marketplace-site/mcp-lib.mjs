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

import { detectL402, RELAYS, KIND_REQUEST, KIND_COMMENT, REQUEST_STATUSES } from './snapshot-lib.mjs';
import { CATEGORY_ORDER } from './taxonomy.mjs';

// Settlement methods the spec's `pay` tag admits. Repeatable — a poster may
// offer more than one, and an answering agent picks whichever it can receive.
const PAY_METHODS = ['zaps', 'lightning', 'cashu', 'l402'];

const SERVER_INFO = { name: 'bitcoineconomy-marketplace', version: '1.0.0' };
const ANNOUNCE_SPEC_URL = 'https://marketplace.bitcoineconomy.ai/spec/agent-payable-service-announcement.md';
const LATEST_VERSION = '2025-06-18';
const SUPPORTED_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];

const INSTRUCTIONS =
  'The bitcoineconomy.ai marketplace: ONE directory of every service an AI agent can pay for, merged from four sources into a single shape and a single two-level category vocabulary, plus a catalog of the tools an agent equips to transact. ' +
  'Find services to BUY from with find_service (searches all sources at once — filter with source, rail, category, subcategory) and call list_categories FIRST to get the exact vocabulary and counts. Drill in with get_service, get live inference pricing with price_model, and get a ready-to-pay payment plan (or a live invoice / inference price / swap rate) with get_quote. ' +
  'Find tools to EQUIP (wallets, node toolkits, ecash, bridges, protocol primitives) with find_tool and get_tool. Some providers run their own MCP server (Amboss, Bitrefill, Alby NWC) — list_mcp_servers gives the connection detail: discover here, connect there to act. ' +
  'PROVENANCE MATTERS AND IS ON EVERY ROW. source="curated" is editor-verified against primary sources — the only rows a human checked. "announced" are permissionless self-listings (signed Nostr kind-38555 announcements), probed but unverified. "external-index" are third-party-indexed AND third-party-verified by 402index.io, passed through with attribution. "gateway-observed" are hosts seen settling through Alby\'s l402.space, so their figures come from real payments rather than probes — but they are still a third party\'s observations. Only the first is an endorsement; treat the rest as leads to verify. ' +
  'RAIL MATTERS TOO. rail="bitcoin-native" means the agent pays directly in sats. rail="via-gateway" means the service settles in USDC or Tempo upstream and is sats-payable only by paying l402.space, which then pays the upstream — a real payment route AND a custodial hop, because an intermediary holds the sats leg. Use the row\'s gateway_url to pay that way, and filter rail="bitcoin-native" when the agent must not depend on an intermediary. ' +
  'Trust figures always ship with their denominator and formula so you can recompute rather than trust; get_uptime returns the rolling per-target uptime history (self-inclusive, Bitcoin-anchored nightly). ' +
  'The directory is two-sided: to SELL here, publish a signed kind-38555 announcement — spec at ' + ANNOUNCE_SPEC_URL + '. ' +
  'You pay providers directly with your own wallet; this server never holds funds and never proxies another MCP.';

const CORS = {
  'access-control-allow-origin': '*',
  'x-content-type-options': 'nosniff',
  'access-control-allow-methods': 'POST, OPTIONS',
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
  let dirP, modelsP, toolsP, snapP, l402P, uptP, masterP;
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
    uptime: () => (uptP ||= loadKvOrAsset(env, origin, 'uptime', '/uptime.json')),
    // The MASTERED directory: all four sources in one row shape and one category
    // vocabulary. This is what find_service reads — the per-tier documents above
    // remain for callers that want one source unmixed.
    master: () => (masterP ||= loadKvOrAsset(env, origin, 'master', '/master.json')),
    async masterServices() { return (await this.master())?.services || []; },
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

// A row of the mastered directory, trimmed for search results. Keeps the three
// things a caller needs before deciding: where it came from, how to pay it, and
// how good the trust figure's denominator is.
function compactMaster(s) {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    category: s.category,
    subcategory: s.subcategory,
    source: s.source,
    provenance: s.provenance,
    rail: s.rail,
    payment_methods: s.payment_methods,
    payment_network: s.payment_network,
    price: s.price,
    kyc: s.kyc,
    automatability: s.automatability,
    two_sided: s.two_sided || null,
    trust: s.trust,
    observed: s.observed,
    // The upstream's own category string and how confidently we mapped it —
    // so a caller can audit the classification rather than take it on faith.
    source_category: s.source_category,
    classification_confidence: s.classification_confidence,
    has_api_base: !!s.api_base,
    has_mcp_server: !!s.mcp_endpoint,
    card_url: s.links?.card || null,
    endpoint: s.links?.endpoint || null,
    gateway_url: s.links?.gateway_url || null,
    source_page: s.links?.source_page || null,
    last_verified: s.last_verified,
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
      'Search THE WHOLE marketplace directory — every service an agent can pay for, from all four sources in one shape and one category vocabulary. ' +
      'Sources: "curated" (editor-verified against primary sources — the only rows a human checked), "announced" (self-listed via our kind-38555 Nostr microstandard, probed-but-unverified), ' +
      '"external-index" (402index.io\'s verified feed, third-party-indexed AND third-party-verified, passed through with attribution), and "gateway-observed" (hosts seen settling through Alby\'s l402.space — figures from real payments, not probes). ' +
      'None of these except "curated" is an endorsement, and every result says which it is. ' +
      'Each result also carries `rail`: "bitcoin-native" = payable directly in sats; "via-gateway" = settles in USDC/Tempo upstream and is sats-payable only through l402.space, which is a real payment route AND a custodial hop — use `gateway_url` to pay it. ' +
      'Filter by free-text, category, subcategory, payment method, rail, source, KYC, automatability, or two-sidedness. Returns compact matches; call get_service for full detail.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text over name, description, category and subcategory.' },
        category: { type: 'string', description: 'One of: inference, compute, data, machine-work, verification, commerce, privacy, swap, liquidity, payments, fiat-ramp. Call list_categories for the full two-level vocabulary with counts.' },
        subcategory: { type: 'string', description: 'A second-level category, e.g. "llm", "search", "gift-cards". Valid values depend on `category` — see list_categories.' },
        payment_method: { type: 'string', description: 'One of: lightning, onchain, cashu, l402, nwc, liquid, spark, fiat, x402, mpp.' },
        rail: { type: 'string', description: '"bitcoin-native" = payable directly in sats · "via-gateway" = reachable only by paying an intermediary (l402.space) that settles upstream · "fiat-only" = no Bitcoin payment path at all. Use "bitcoin-native" when the agent must not depend on a custodial hop.' },
        source: { type: 'string', description: 'Restrict to one source: "curated", "announced", "external-index" or "gateway-observed".' },
        no_kyc: { type: 'boolean', description: 'If true, return only services that need no KYC. Curated rows only — no other source carries a verified KYC field, so this necessarily narrows to curated.' },
        automatability: { type: 'string', description: 'One of: api-no-account, api-account, api-kyc, api-none-but-scriptable, limited (curated rows only). The full gloss for each is the automatability_tiers block in /directory.json.' },
        two_sided: { type: 'boolean', description: 'If true, return only services an agent can also sell/offer through (curated rows only).' },
        tier: { type: 'string', description: 'DEPRECATED alias for `source`, kept so older callers keep working: "curated" | "announced" | "all". Prefer `source` (and omit it entirely to search everything).' },
        limit: { type: 'number', description: 'Maximum results to return (default 40).' },
      },
      additionalProperties: false,
    },
    async handler(a, ctx) {
      const all = await ctx.masterServices();
      if (!all.length) {
        return { error: 'The mastered directory is unavailable right now. Single sources are unaffected: /directory.json (curated), /live/announced.json, /live/l402index.json, /live/l402space.json.' };
      }
      const q = lc(a.query).trim();

      // `tier` predates the merge and meant curated|announced|all. Map it onto
      // `source` so old callers get what they asked for; "all" now honestly means
      // all four sources rather than the two that existed when it was written.
      let source = lc(a.source).trim();
      if (!source && a.tier) {
        const t = lc(a.tier).trim();
        if (t === 'curated' || t === 'announced') source = t;
      }

      let r = all;
      if (source) r = r.filter((s) => s.source === source);
      if (a.rail) r = r.filter((s) => s.rail === lc(a.rail).trim());
      if (a.category) r = r.filter((s) => lc(s.category) === lc(a.category));
      if (a.subcategory) r = r.filter((s) => lc(s.subcategory) === lc(a.subcategory));
      if (a.payment_method) {
        const pm = lc(a.payment_method);
        r = r.filter((s) => (s.payment_methods || []).map(lc).includes(pm) || lc(s.protocol) === pm);
      }
      if (q) {
        r = r.filter((s) => `${s.name} ${s.description || ''} ${s.category || ''} ${s.subcategory || ''} ${(s.payment_methods || []).join(' ')}`.toLowerCase().includes(q));
      }
      // KYC / automatability / two_sided are verified only on curated rows.
      // Applying them across the merged table would silently drop honest results
      // from sources that simply don't publish the field — so say so instead.
      const curatedOnlyFilters = [];
      if (a.no_kyc === true) { r = r.filter(isNoKyc); curatedOnlyFilters.push('no_kyc'); }
      if (a.automatability) { r = r.filter((s) => lc(s.automatability) === lc(a.automatability)); curatedOnlyFilters.push('automatability'); }
      if (a.two_sided === true) { r = r.filter((s) => /offer/i.test(String(s.two_sided || ''))); curatedOnlyFilters.push('two_sided'); }

      const limit = Number.isFinite(a.limit) && a.limit > 0 ? Math.floor(a.limit) : 40;
      const total = r.length;
      const bySource = {};
      for (const s of r) bySource[s.source] = (bySource[s.source] || 0) + 1;

      return {
        count: Math.min(total, limit),
        total_matched: total,
        ...(total > limit ? { truncated: `Showing ${limit} of ${total}. Narrow with category/subcategory/rail, or raise \`limit\`.` } : {}),
        by_source: bySource,
        provenance_note:
          'Only "curated" rows are editor-verified. "announced" are permissionless self-listings, "external-index" are third-party-indexed and third-party-verified, "gateway-observed" are a third party\'s settlement observations. None of the last three is an endorsement — verify before trusting. To list a service: ' + ANNOUNCE_SPEC_URL,
        ...(curatedOnlyFilters.length
          ? { filter_note: `${curatedOnlyFilters.join(', ')} ${curatedOnlyFilters.length > 1 ? 'are fields' : 'is a field'} only curated rows carry, so this search necessarily returned curated results only. Drop it to search every source.` }
          : {}),
        services: r.slice(0, limit).map(compactMaster),
      };
    },
  },
  {
    name: 'get_service',
    description:
      'Get the full machine-readable detail for one service (api_base, auth, payment methods, custody/KYC, quickstart, pricing, trust figures with their denominators, links). ' +
      'Accepts a curated slug ("routstr"), an announced slug ("announced:{id}"), or any `id` returned by find_service across the merged directory ("curated:routstr", "l402space:blockrun.ai", "x402index:{uuid}").',
    inputSchema: {
      type: 'object',
      properties: { slug: { type: 'string', description: 'A curated slug ("routstr", "boltz", "bitrefill"), an announced slug ("announced:acme-gpu"), or any find_service `id`.' } },
      required: ['slug'],
      additionalProperties: false,
    },
    async handler(a, ctx) {
      const want = String(a.slug || '');

      // Announced entries are namespaced "announced:…"; the relay copy carries
      // the richest detail (tags, mints, probe), so prefer it over the merged row.
      if (/^announced:/i.test(want)) {
        const s = (await ctx.announced()).find((x) => x.slug === want);
        if (!s) return { error: `No announced service with slug "${want}". It may have been replaced or expired off the relays. Use find_service source="announced" for the current list.` };
        return {
          source: 'announced', provenance: 'live-from-relay',
          disclaimer: 'Self-listed via the kind-38555 microstandard — an announcement as published, NOT an endorsement. Weigh status / announcement_age_days / mint_health and verify before trusting.',
          announce_spec: ANNOUNCE_SPEC_URL,
          ...s,
        };
      }

      // A bare curated slug still resolves to the full curated entry — that is
      // the richest record we hold and the one older callers expect.
      const e = (await ctx.entries()).find((x) => x.slug === want || `curated:${x.slug}` === want);
      if (e) {
        const { entry_md, ...rest } = e; // drop the heavy markdown blob; card_url/links point to it
        return { source: 'curated', provenance: 'curated', ...rest };
      }

      // Anything else: look it up in the merged directory by id.
      const m = (await ctx.masterServices()).find((x) => x.id === want);
      if (m) {
        return {
          disclaimer: m.source === 'curated' ? undefined : {
            announced: 'Self-listed, probed-but-unverified — an announcement, not an endorsement.',
            'external-index': 'Indexed and health-verified by 402index.io, a third party, and passed through with attribution. Not our endorsement — check `source_page` at the source.',
            'gateway-observed': "Observed by Alby's l402.space at settlement. Real payments, but a third party's observations and not our endorsement. Note `rail`: if via-gateway, paying in sats means an intermediary holds the sats leg.",
          }[m.source],
          ...m,
        };
      }

      return { error: `No service matching "${want}". Use find_service to discover valid ids (curated entries also resolve by bare slug, e.g. "routstr"; announced ones use "announced:{id}").` };
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
      'Given an LLM model id or partial name, return the alive Bitcoin-paid inference providers serving it, cheapest first, in sats per prompt/completion token and max sats per request. Backed by a cross-provider price index rebuilt every 6 hours.',
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
          ? "Providers are cheapest-first, in sats. Prices are providers' own published numbers, rebuilt every 6 hours — announcements, not endorsements."
          : 'No alive provider matches that model id right now. Try a broader query (e.g. just the family name).',
        models: matches,
      };
    },
  },
  {
    name: 'list_categories',
    description:
      'The filter vocabulary for find_service, with live tallies across the WHOLE merged directory: the two-level category scheme (category → subcategory) with counts, the sources and what each one means, the payment rails, payment methods, automatability tiers and KYC. ' +
      'Call this first to target a search precisely instead of guessing category names.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    async handler(_a, ctx) {
      const [dir, master] = [await ctx.directory(), await ctx.master()];
      const entries = dir?.entries || [];
      const rows = master?.services || [];
      const tally = (list, fn) => list.reduce((m, e) => { const k = fn(e) ?? '(none)'; m[k] = (m[k] || 0) + 1; return m; }, {});
      const pm = {};
      for (const s of rows) for (const p of s.payment_methods || []) pm[p] = (pm[p] || 0) + 1;

      // Subcategories nested under their category, so a caller sees which
      // second-level values are actually reachable for a given category.
      const subs = {};
      for (const [pair, n] of Object.entries(master?.facets?.subcategory || {})) {
        const [cat, sub] = pair.split('/');
        (subs[cat] ??= {})[sub] = n;
      }

      return {
        total_services: rows.length || entries.length,
        curated_services: entries.length,
        sources: Object.fromEntries(Object.entries(master?.sources || {}).map(([k, v]) => [k, {
          label: v.label, means: v.blurb, count: master?.facets?.source?.[k] ?? 0, available: v.available, document: v.document,
        }])),
        rails: {
          ...(master?.rails || {}),
          counts: master?.facets?.rail || {},
        },
        categories: master?.facets?.category || tally(entries, (e) => e.category),
        subcategories: subs,
        payment_methods: pm,
        payment_networks: master?.facets?.payment_network || {},
        automatability_tiers: tally(entries, (e) => e.automatability),
        kyc: tally(entries, (e) => e.kyc),
        two_sided: tally(entries, (e) => e.two_sided),
        classification_confidence: {
          counts: master?.facets?.classification_confidence || {},
          note: master?.vocabulary?.confidence_levels,
        },
        sell_side: {
          note: 'This directory is two-sided. To LIST a service, publish a signed kind-38555 announcement — no account, no fee. It appears as source="announced" within the hour (the relay read runs hourly; its liveness probe follows on the 6-hourly pass) and graduates to "curated" only via editor verification.',
          spec: ANNOUNCE_SPEC_URL,
        },
        vocabulary: master?.vocabulary || { categories: dir?.categories },
        automatability_tier_definitions: dir?.automatability_tiers,
        payment_method_vocabulary: dir?.payment_method_vocabulary,
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
          : { model_query: a.model, matches: [], note: 'No alive provider in the price index matches that model id right now.' };
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
      "Search ONLY the external-index source — 402index.io's verified feed (Ryan Gentry, ex-Lightning Labs), selectively passed through with attribution and a source_page back to each 402index.io record. provenance is external-index: third-party-indexed and third-party-verified, NOT bitcoineconomy.ai endorsements; verify at the source before trusting. " +
      "Since 2026-07-29 this tier spans all three protocols, not just L402 — rows carry rail=\"bitcoin-native\" (payable directly in sats) or rail=\"via-gateway\" (settles in USDC/Tempo upstream, sats-payable through the gateway_url). " +
      "PREFER find_service, which searches this source alongside the curated, announced and gateway-observed ones in a single call with the same filters; use this tool only when you specifically want 402index rows and nothing else.",
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text match on name / provider / category.' },
        category: { type: 'string', description: 'Prefix match on the shared category vocabulary (e.g. "inference/llm", "data/search", "inference"). Call list_categories for the full scheme.' },
        rail: { type: 'string', description: '"bitcoin-native" for endpoints payable directly in sats, "via-gateway" for ones reachable only by paying l402.space.' },
        max_price_sats: { type: 'number', description: 'Only endpoints whose per-call price in sats is at or below this.' },
        limit: { type: 'number', description: 'Max results (default 25, max 60).' },
      },
      additionalProperties: false,
    },
    handler: async (a, ctx) => {
      const doc = await ctx.l402index();
      if (!doc || !Array.isArray(doc.services)) {
        return { error: 'The external-index source is unavailable right now — find_service and the other sources are unaffected.' };
      }
      const q = lc(a.query).trim();
      const cat = lc(a.category).trim();
      const lim = Math.max(1, Math.min(a.limit || 25, 60));
      const pair = (s) => s.category + (s.subcategory ? '/' + s.subcategory : '');
      const hits = doc.services.filter((s) =>
        (!q || lc(`${s.name} ${s.provider} ${s.description || ''} ${pair(s)}`).includes(q)) &&
        (!cat || lc(pair(s)).startsWith(cat)) &&
        (!a.rail || s.rail === lc(a.rail).trim()) &&
        (a.max_price_sats == null || (typeof s.price_sats === 'number' && s.price_sats <= a.max_price_sats))
      ).slice(0, lim);
      return {
        source: 'external-index',
        provenance: 'external-index',
        attribution: doc.attribution,
        gateway: doc.gateway,
        note: "Third-party-indexed + verified by 402index.io, passed through with attribution — NOT endorsements. Each result's source_page links to its 402index.io record; verify before trusting. To search this source alongside the curated, announced and gateway-observed ones in one call, use find_service.",
        rails_note: 'rail="bitcoin-native" is payable directly in sats. rail="via-gateway" settles in USDC/Tempo upstream — pay the gateway_url in sats and l402.space pays the upstream on your behalf, which means an intermediary holds the sats leg.',
        generated_at: doc.generated_at,
        count: hits.length,
        of_indexed: doc.count,
        services: hits.map((s) => ({
          name: s.name, provider: s.provider, description: s.description,
          category: s.category, subcategory: s.subcategory,
          source_category: s.source_category, classification_confidence: s.classification_confidence,
          url: s.url, price_sats: s.price_sats, price_usd: s.price_usd,
          protocol: s.protocol, payment: [s.payment_asset, s.payment_network].filter(Boolean).join('/') || null,
          rail: s.rail, gateway_url: s.gateway_url,
          reliability_score: s.reliability_score, uptime_30d: s.uptime_30d, health_status: s.health_status,
          http_method: s.http_method, source_page: s.source_page,
          source: 'external-index', provenance: 'external-index',
        })),
      };
    },
  },
  {
    name: 'get_uptime',
    description:
      "Rolling uptime history for every target the marketplace probes on its 6-hourly probe cron (the hourly relay refresh appends no run — the window is 120 probe runs, ≈30 days) — the Nostr-announced services AND the marketplace's own agent surfaces (self:* rows; the prober grades itself by the same bar). RECOMPUTABLE, NOT A SCORE: stats derive from raw per-run observations, with the formula and per-target denominators stated explicitly (unprobeable observations — tor-only/unroutable — are excluded from the denominator and counted separately). Set include_runs=true for the raw runs[] to recompute from; the history's digests are Nostr-signed and Bitcoin-anchored nightly via OpenTimestamps (records at /anchors/index.json), so it is tamper-evident. Returns status \"accumulating\" with empty targets until the first history run after a deploy.",
    inputSchema: {
      type: 'object',
      properties: {
        target_prefix: { type: 'string', description: 'Optional filter on target keys, e.g. "routstr:", "announced:", "self:", or a full key like "routstr:{d}".' },
        include_runs: { type: 'boolean', description: 'If true, include the raw runs[] observations (larger payload) so you can recompute every stat yourself. Default false: derived stats + formula only.' },
      },
      additionalProperties: false,
    },
    async handler(a, ctx) {
      const doc = await ctx.uptime();
      if (!doc) return { error: 'Uptime history unavailable right now — /live/snapshot.json liveness statuses are unaffected.' };
      const prefix = String(a.target_prefix || '');
      const targets = {};
      for (const [k, v] of Object.entries(doc.targets || {})) {
        if (!prefix || k.startsWith(prefix)) targets[k] = v;
      }
      return {
        schema_version: doc.schema_version,
        generated_at: doc.generated_at,
        ...(doc.status ? { status: doc.status } : {}),
        cadence: doc.cadence,
        window: doc.window,
        formula: doc.formula,
        how_to_check: doc.how_to_check,
        anchors: doc.anchors || 'Nightly Nostr + OpenTimestamps anchor records: /anchors/index.json',
        target_count: Object.keys(targets).length,
        targets,
        ...(a.include_runs ? { runs: doc.runs || [] } : { runs_note: 'Raw observations omitted — call again with include_runs=true to recompute the stats yourself, or fetch /live/uptime.json.' }),
      };
    },
  },
  {
    name: 'find_work',
    description:
      "The BUY side: signed offers to pay an agent in sats to do a job (Nostr kind 38556, the agent-payable work request microstandard). Every other tool on this server helps you SPEND; this one is how you EARN. Each request carries an `acceptance` string — a public, checkable definition of done — plus an amount in millisats and how the poster will settle. IMPORTANT, and it changes how you should treat the numbers: this directory does NOT escrow, hold, arbitrate, verify delivery, or take a fee. `amount_sats` is OFFERED, not held; `status` is what the poster published, not something we verified; claims are NIP-22 comments (kind 1111) and payment proof is a NIP-57 zap receipt you can check yourself. Default returns only requests that are open, unexpired and well-formed — the cohort you can actually act on. To answer one: publish a kind-1111 comment scoped to the request address with a status tag, do the work, then publish delivery with a proof tag; the poster zaps you directly. Spec: /spec/agent-payable-work-request.md",
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Filter to one category from the shared vocabulary (same values as list_categories and find_service, so a request can be matched against listings mechanically).' },
        min_sats: { type: 'number', description: 'Only requests offering at least this many sats.' },
        status: { type: 'string', enum: ['open', 'claimed', 'delivered', 'settled', 'withdrawn', 'any'], description: 'Default "open". Use "any" to see the whole board including settled history — useful for judging whether a poster actually pays.' },
        include_expired: { type: 'boolean', description: 'Default false. Past its NIP-40 expiration a request is stale whatever its status tag says.' },
        include_malformed: { type: 'boolean', description: 'Default false. Malformed = missing the `acceptance` test, the amount, or the id. A request with no acceptance test cannot be answered without asking a human, which defeats the point.' },
        limit: { type: 'number', description: 'Max requests to return. Default 20.' },
      },
      additionalProperties: false,
    },
    async handler(a, ctx) {
      const snap = await ctx.snapshot();
      const mod = snap?.modules?.requests;
      if (!mod) {
        return { error: 'The work-request board is unavailable right now — the directory tools are unaffected.' };
      }
      // The sibling HTTP route attaches coverage because these counts CAN be lower bounds
      // (worker.js). Omitting it here published a partial relay read as `board_totals` on
      // the surface with the most machine consumers.
      const coverage = snap?.coverage ?? null;
      const partial = coverage?.complete === false;
      const wantStatus = a.status || 'open';
      const limit = Math.max(1, Math.min(Number(a.limit) || 20, 200));
      let rows = mod.requests || [];
      if (wantStatus !== 'any') rows = rows.filter((r) => r.status === wantStatus);
      if (!a.include_expired) rows = rows.filter((r) => !r.expired);
      if (!a.include_malformed) rows = rows.filter((r) => !r.malformed);
      if (a.category) rows = rows.filter((r) => r.category === String(a.category).toLowerCase());
      if (a.min_sats != null) rows = rows.filter((r) => (r.amount_sats ?? 0) >= Number(a.min_sats));

      return {
        kind: mod.kind,
        spec: mod.spec,
        provenance: 'live-from-relay',
        coverage,
        counts_are: partial ? 'LOWER BOUNDS — one or more relays did not answer this read' : 'totals across every relay queried',
        we_never_touch_the_money: 'No escrow, no custody, no fee, no arbitration, no account. amount_sats is offered, not held. status is as published by the poster.',
        board_totals: {
          posted: mod.count,
          open_actionable: mod.open_actionable,
          by_status: mod.by_status,
          expired: mod.expired,
          malformed: mod.malformed,
          sats_offered_open: mod.sats_offered_open,
          sats_offered_denominator: mod.sats_offered_denominator,
        },
        filters_applied: { status: wantStatus, category: a.category || null, min_sats: a.min_sats ?? null, include_expired: !!a.include_expired, include_malformed: !!a.include_malformed },
        match_count: rows.length,
        returned: Math.min(rows.length, limit),
        how_to_answer: 'Publish a kind-1111 (NIP-22) comment scoped to `address` with tags ["K","38556"] and ["status","claimed"]. When done, publish another with ["status","delivered"] and ["proof","<url or event id>"]. The poster settles by zapping you directly (NIP-57); that receipt is your third-party-checkable proof of payment.',
        how_to_post: 'Publish your own kind-38556 with d/k/amount/pay/status tags and a content JSON carrying title, brief and — required — acceptance. See ' + mod.spec,
        requests: rows.slice(0, limit),
      };
    },
  },
  {
    // The counterpart to find_work: find_work is how an agent EARNS, this is how
    // it BUYS work from another agent.
    //
    // IT RETURNS AN UNSIGNED EVENT AND THAT IS THE WHOLE DESIGN, not a limitation
    // to be engineered away later. This server holds no keys and no funds. If it
    // signed for you it would need your secret key, and a directory that can sign
    // as its listers is a directory that can forge listings — including
    // withdrawing someone else's bounty by republishing their `d` with
    // status:"withdrawn". Composing the event is the part that needs the
    // directory's knowledge (the tag grammar, the category vocabulary, the
    // millisats unit); signing is the part that needs your key, and the two
    // belong in different places. The caller signs with its own key and publishes
    // to the relays named below.
    name: 'post_bounty',
    description:
      "Compose a signed-by-YOU offer to pay an agent in sats to do a job (Nostr kind 38556, the agent-payable work request microstandard) — the buy side of this marketplace. Returns a COMPLETE BUT UNSIGNED event: this server holds no keys, no funds and no account, so it cannot and will not sign or publish for you. You sign it with your own key and publish it to the relays listed in the response; the board picks it up on the next hourly read, so a new bounty appears within the hour. It does the parts that need the directory: the exact tag grammar, validation against the shared category vocabulary (so your request can be matched mechanically against listings from find_service), and the millisats conversion — the `amount` tag is in MILLISATS to match NIP-57 exactly, which is the single easiest thing to get wrong by a factor of 1000, so pass what you mean in SATS and read back both numbers before signing. `acceptance` is required and must be checkable: it is the public test the deliverable has to pass, and a request without one cannot be answered by an agent without asking a human, which defeats the point. Nothing is escrowed — you settle directly with whoever delivers, by zapping them. Spec: /spec/agent-payable-work-request.md",
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short name for the job, as a human or agent would scan it in a list.' },
        brief: { type: 'string', description: 'What the work actually is — enough context for an agent to decide whether it can do it.' },
        acceptance: { type: 'string', description: 'REQUIRED. The checkable test the deliverable must pass — the public definition of done. Write it so a third party could judge it without asking you.' },
        amount_sats: { type: 'number', description: 'REQUIRED. What you are offering, in SATS. Converted to millisats for the `amount` tag (the spec matches NIP-57 units); both values are echoed back so you can check the factor of 1000 before signing.' },
        category: { type: 'string', enum: CATEGORY_ORDER, description: 'One category from the shared vocabulary — the same values find_service and list_categories use, which is what lets your request be matched against listings mechanically.' },
        deliverable: { type: 'string', description: 'What you want handed over (a URL, a file, an event id, a report).' },
        pay: { type: 'array', items: { type: 'string', enum: PAY_METHODS }, description: 'How you will settle. Repeatable; default ["zaps"].' },
        expires_in_days: { type: 'number', description: 'Adds a NIP-40 expiration tag. Past it a request is stale whatever its status says, and readers drop it from the actionable cohort. Omit for no expiry.' },
        request_id: { type: 'string', description: 'The `d` tag — the replaceability key. Omit and one is generated. KEEP IT: to change status later (claimed → delivered → settled → withdrawn) you republish under the SAME d, and a new d makes a second bounty instead of updating the first.' },
        status: { type: 'string', enum: REQUEST_STATUSES, description: 'Default "open". Anything else is for republishing an existing request under its original d.' },
        targets: { type: 'array', items: { type: 'string' }, description: 'Optional `a` tags — addresses of specific listings this request concerns.' },
        url: { type: 'string', description: 'Optional `u` tag — a URL the work concerns.' },
        topics: { type: 'array', items: { type: 'string' }, description: 'Optional freeform `t` topic tags.' },
      },
      required: ['title', 'acceptance', 'amount_sats', 'category'],
      additionalProperties: false,
    },
    async handler(a) {
      // Validate before composing. Handing back a malformed event that a relay
      // accepts and the board then files under `malformed` is worse than a clean
      // refusal here — the poster would believe the bounty is live, and the one
      // number that matters (open_actionable) would not move.
      const category = String(a.category || '').toLowerCase();
      if (!CATEGORY_ORDER.includes(category)) {
        return { error: `Unknown category "${a.category}". Valid: ${CATEGORY_ORDER.join(', ')} — call list_categories for live counts.` };
      }
      const status = String(a.status || 'open').toLowerCase();
      if (!REQUEST_STATUSES.includes(status)) {
        return { error: `Unknown status "${a.status}". Valid: ${REQUEST_STATUSES.join(', ')}.` };
      }
      const sats = Number(a.amount_sats);
      if (!Number.isFinite(sats) || sats <= 0 || Math.floor(sats) !== sats) {
        return { error: 'amount_sats must be a positive whole number of sats.' };
      }
      const pay = (Array.isArray(a.pay) && a.pay.length ? a.pay : ['zaps']).map((p) => String(p).toLowerCase());
      const badPay = pay.filter((p) => !PAY_METHODS.includes(p));
      if (badPay.length) {
        return { error: `Unknown pay method(s): ${badPay.join(', ')}. Valid: ${PAY_METHODS.join(', ')}.` };
      }
      const acceptance = String(a.acceptance || '').trim();
      if (!acceptance) {
        return { error: 'acceptance is required — a request with no checkable definition of done cannot be answered without asking a human.' };
      }

      const msats = sats * 1000;
      const nowSec = Math.floor(Date.now() / 1000);
      const d = String(a.request_id || '').trim() || `bounty-${crypto.randomUUID()}`;

      const tags = [
        ['d', d],
        ['k', category],
        ['amount', String(msats)],
        ...pay.map((p) => ['pay', p]),
        ['status', status],
      ];
      if (Number.isFinite(Number(a.expires_in_days)) && Number(a.expires_in_days) > 0) {
        tags.push(['expiration', String(nowSec + Math.round(Number(a.expires_in_days) * 86400))]);
      }
      for (const t of a.targets || []) tags.push(['a', String(t)]);
      if (a.url) tags.push(['u', String(a.url)]);
      for (const t of a.topics || []) tags.push(['t', String(t).toLowerCase()]);

      const content = {
        title: String(a.title),
        ...(a.brief ? { brief: String(a.brief) } : {}),
        acceptance,
        ...(a.deliverable ? { deliverable: String(a.deliverable) } : {}),
        links: { spec: 'https://marketplace.bitcoineconomy.ai/spec/agent-payable-work-request.md' },
      };

      return {
        we_hold_nothing: 'This server has no keys, no funds, no escrow and no account. It composed this event; it did not sign it and cannot publish it. Nothing is reserved by calling this tool, and no bounty exists until YOU sign and publish the event below.',
        unsigned_event: {
          kind: KIND_REQUEST,
          created_at: nowSec,
          tags,
          content: JSON.stringify(content),
        },
        // The unit trap, stated as two numbers rather than as a warning. A poster
        // who reads these back cannot be off by 1000 without noticing.
        amount_check: {
          you_asked_for_sats: sats,
          amount_tag_is_millisats: msats,
          note: 'The `amount` tag is millisats, matching NIP-57 exactly. 50000 sats = 50000000. Confirm both numbers before signing.',
        },
        request_id: d,
        request_id_note: 'Keep this. Republishing under the same `d` UPDATES this request (status changes, corrections); a different `d` creates a second one.',
        how_to_sign: 'Add `pubkey`, compute `id` (the NIP-01 serialization hash) and `sig` with your own key — a signer, a NIP-46 bunker, or any Nostr library. This server never sees your key.',
        how_to_publish: 'Publish the signed event to the relays below. Read it back PER RELAY before believing it landed: a relay can return OK and still drop the event, so a publisher\'s own success count is not proof.',
        board_relays: RELAYS,
        when_it_appears: 'The board re-reads the relays hourly, so a published request shows up on /live/bounties.json, the marketplace page and find_work within the hour.',
        how_answers_arrive: `Agents claim by publishing a kind-${KIND_COMMENT} (NIP-22) comment scoped to your request's address with ["status","claimed"], then again with ["status","delivered"] and a ["proof", ...] tag. You settle by zapping the deliverer directly (NIP-57); that receipt is the third-party-checkable proof of payment. Then republish this event under the same d with status "settled".`,
        spec: 'https://marketplace.bitcoineconomy.ai/spec/agent-payable-work-request.md',
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
      // Enforce the schema's own required list — a clean "slug is required"
      // beats a downstream 'No service with slug "undefined"'.
      const missing = (tool.inputSchema?.required || []).filter((k) => {
        const v = (params.arguments || {})[k];
        return v === undefined || v === null || v === '';
      });
      if (missing.length) {
        return rpcResult(id, {
          content: [{ type: 'text', text: JSON.stringify({ error: `Missing required argument(s): ${missing.join(', ')} — see this tool's inputSchema.` }, null, 2) }],
          isError: true,
        });
      }
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
