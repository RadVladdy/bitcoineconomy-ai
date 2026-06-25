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

const SERVER_INFO = { name: 'bitcoineconomy-marketplace', version: '1.0.0' };
const LATEST_VERSION = '2025-06-18';
const SUPPORTED_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];

const INSTRUCTIONS =
  'The bitcoineconomy.ai marketplace: a curated directory of Bitcoin-native services AI agents can pay for over Lightning, Cashu, and L402. ' +
  'Discover with find_service and list_categories, drill in with get_service, get live inference pricing with price_model, and get a ready-to-pay ' +
  'payment plan (or a live invoice) with get_quote. Directory entries are reference facts and relay/probe data are announcements — not endorsements. ' +
  'You pay providers directly with your own wallet; this server never holds funds.';

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
  let dirP, modelsP;
  return {
    directory: () => (dirP ||= loadJsonAsset(env, origin, '/directory.json')),
    async entries() { return (await this.directory())?.entries || []; },
    async models() { return (await (modelsP ||= loadKvOrAsset(env, origin, 'models', '/models.json')))?.models || []; },
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
    two_sided: e.two_sided || null, has_api_base: !!e.api_base, card_url: e.card_url,
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

// L402 (formerly LSAT): a 402 response carries `WWW-Authenticate: L402 macaroon="..", invoice="lnbc.."`.
function detectL402(status, wwwAuth, body) {
  const isL402 = status === 402 || /\b(l402|lsat)\b/i.test(wwwAuth);
  if (!isL402) return null;
  const invoice = (`${wwwAuth}\n${body}`.match(/ln(bc|tb|bcrt)[0-9a-z]{50,}/i) || [])[0] || null;
  const macaroon = (wwwAuth.match(/macaroon="?([^",\s]+)"?/i) || [])[1] || null;
  return { detected: true, invoice, macaroon, www_authenticate: wwwAuth || null };
}

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

// ---------- tools ----------

const TOOLS = [
  {
    name: 'find_service',
    description:
      'Search the curated marketplace directory of Bitcoin-native services AI agents can buy from. Filter by free-text query, category, payment method, KYC, automatability tier, or whether the agent can also sell through it. Returns compact matches; call get_service for full detail.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text over name, summary, what-an-agent-buys, category.' },
        category: { type: 'string', description: 'One of: inference, compute, machine-work, commerce, privacy, swap, liquidity, fiat-ramp.' },
        payment_method: { type: 'string', description: 'One of: lightning, onchain, cashu, l402, nwc, liquid, spark, fiat.' },
        no_kyc: { type: 'boolean', description: 'If true, return only services that need no KYC.' },
        automatability: { type: 'string', description: 'One of: api-no-account, api-account, api-kyc.' },
        two_sided: { type: 'boolean', description: 'If true, return only services an agent can also sell/offer through.' },
      },
      additionalProperties: false,
    },
    async handler(a, ctx) {
      let r = await ctx.entries();
      const q = lc(a.query).trim();
      if (q) r = r.filter((e) => `${e.name} ${e.summary} ${e.what_an_agent_buys} ${e.category} ${(e.payment_methods || []).join(' ')}`.toLowerCase().includes(q));
      if (a.category) r = r.filter((e) => lc(e.category) === lc(a.category));
      if (a.payment_method) r = r.filter((e) => (e.payment_methods || []).map(lc).includes(lc(a.payment_method)));
      if (a.no_kyc === true) r = r.filter(isNoKyc);
      if (a.automatability) r = r.filter((e) => lc(e.automatability) === lc(a.automatability));
      if (a.two_sided === true) r = r.filter((e) => /offer/i.test(String(e.two_sided || '')));
      return { count: r.length, services: r.map(compact) };
    },
  },
  {
    name: 'get_service',
    description: 'Get the full machine-readable detail for one marketplace service by slug (api_base, auth, payment methods, custody/KYC, quickstart, pricing, links).',
    inputSchema: {
      type: 'object',
      properties: { slug: { type: 'string', description: 'The service slug, e.g. "routstr", "boltz", "bitrefill".' } },
      required: ['slug'],
      additionalProperties: false,
    },
    async handler(a, ctx) {
      const e = (await ctx.entries()).find((x) => x.slug === a.slug);
      if (!e) return { error: `No service with slug "${a.slug}". Use find_service or list_categories to discover valid slugs.` };
      const { entry_md, ...rest } = e; // drop the heavy markdown blob; card_url/links point to it
      return rest;
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
    description: 'List the marketplace vocabulary and live tallies (categories, payment methods, automatability tiers, KYC) so you can target find_service, plus the live JSON routes.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    async handler(_a, ctx) {
      const dir = await ctx.directory();
      const entries = dir?.entries || [];
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
    name: 'get_quote',
    description:
      'Get a ready-to-pay quote for one service by slug. Returns the structured payment plan (methods, auth, api_base, quickstart, pricing) and — where the provider supports it — a live result: an HTTP 402 / L402 Lightning invoice captured from its API, or, for inference providers given a model, the live cheapest sats price. No funds move; you pay the returned invoice with your own wallet.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'The service slug to quote, e.g. "routstr", "ppq-ai", "boltz".' },
        model: { type: 'string', description: 'Optional — for inference services, the model id to price live.' },
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
          pricing_url: e.pricing_url || null, links: e.links || null,
        },
        disclaimer: 'Reference data, not an endorsement. No funds move through this server — you pay the provider directly with your own wallet.',
      };
      out.live_probe = e.api_base
        ? await probeApiBase(e.api_base)
        : { reachable: false, note: 'No public API base on file — follow quickstart / how_to_pay above to obtain a payable quote.' };
      if (e.category === 'inference' && a.model) {
        const priced = priceModel(await ctx.models(), a.model, 3);
        out.live_price = priced.length
          ? { model_query: a.model, matches: priced }
          : { model_query: a.model, matches: [], note: 'No alive provider in the 6-hourly price index matches that model id right now.' };
      }
      return out;
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
