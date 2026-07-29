// snapshot-lib.mjs — shared relay-query + snapshot-shape logic.
//
// Used by BOTH:
//   sample-relays.mjs  (local CLI; Node's built-in WebSocket)
//   worker.js          (Cloudflare Worker cron; fetch-Upgrade client WebSocket)
// so the committed fallback snapshot and the cron-written KV snapshot always
// share one schema. Change the shape here, never in the consumers.

export const RELAYS = [
  'wss://relay.nostr.band',
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.primal.net',
];

import { CATEGORY_ORDER } from './taxonomy.mjs';

const THIRTY_DAYS = 30 * 24 * 60 * 60;

// Our own "agent-payable service announcement" microstandard — a parameterized-
// replaceable kind (30000–39999, replaceable by (kind, pubkey, d)) that reuses
// Routstr's tag grammar (d/u/mint/version) and adds the directory's machine-
// actionable fields (k category, pay methods, auth, pricing). 38421 stays the
// kind for INFERENCE (Routstr); this is the GENERAL case (commerce, compute,
// swap, machine-work, privacy, liquidity, fiat-ramp) — exactly the use-case
// microstandard the NIP-90 deprecation note invites. Kind chosen by two checks:
// (1) clear of the official NIP kind index (only 38172/38173/38383 are allocated
// in 38xxx; 38383 is NIP-69 Mostro P2P orders) and clear of Routstr's 38421; and
// (2) clear of live relay traffic — a live query showed 38501 already carries ~17
// unrelated events in the wild (an unregistered kind in use), so it was rejected
// for this one, which the same query found empty. Spec at
// /spec/agent-payable-service-announcement.md.
export const KIND_ANNOUNCE = 38555;

export function makeFilters(nowSec) {
  return {
    routstr: { kinds: [38421], limit: 500 },
    announced: { kinds: [KIND_ANNOUNCE], limit: 500 },
    cashu: { kinds: [38172], limit: 500 },
    fedimint: { kinds: [38173], limit: 500 },
    reviews: { kinds: [38000], limit: 500 },
    handlers: { kinds: [31990], limit: 500 },
    dvmjobs: { kinds: Array.from({ length: 1000 }, (_, i) => 5000 + i), since: nowSec - THIRTY_DAYS, limit: 1000 },
  };
}

function tag(ev, name) {
  return ev.tags.filter((t) => t[0] === name).map((t) => t[1]);
}

// connectFn: async (url) => an OPEN WHATWG-style WebSocket (send/addEventListener ready).
export async function queryRelay(connectFn, url, filters, { timeoutMs = 25000 } = {}) {
  let ws;
  try {
    ws = await connectFn(url);
  } catch (e) {
    return { url, status: 'connect-error: ' + (e?.message ?? e), events: [], notices: [], unfinished: Object.keys(filters) };
  }
  return new Promise((resolve) => {
    const events = new Map();
    const pending = new Set(Object.keys(filters));
    const notices = [];
    let settled = false;

    const finish = (status) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { ws.close(); } catch {}
      resolve({ url, status, events: [...events.values()], notices, unfinished: [...pending] });
    };
    const timer = setTimeout(() => finish('timeout'), timeoutMs);

    ws.addEventListener('message', (msg) => {
      let data;
      try { data = JSON.parse(msg.data); } catch { return; }
      const [type, subName, payload] = data;
      if (type === 'EVENT' && payload?.id && !events.has(payload.id)) {
        events.set(payload.id, { subName, event: payload });
      } else if (type === 'EOSE' || type === 'CLOSED') {
        if (type === 'CLOSED') notices.push(`CLOSED ${subName}: ${payload}`);
        try { ws.send(JSON.stringify(['CLOSE', subName])); } catch {}
        pending.delete(subName);
        if (pending.size === 0) finish('ok');
      } else if (type === 'NOTICE') {
        notices.push(String(subName));
      }
    });
    ws.addEventListener('error', () => finish('ws-error'));
    ws.addEventListener('close', () => finish(settled ? 'ok' : 'closed-early'));

    for (const [name, filter] of Object.entries(filters)) {
      ws.send(JSON.stringify(['REQ', name, filter]));
    }
  });
}

// Replaceable-event dedup: keep newest per (kind, pubkey, d-tag).
function dedupeReplaceable(events) {
  const byKey = new Map();
  for (const ev of events) {
    const key = `${ev.kind}:${ev.pubkey}:${tag(ev, 'd')[0] ?? ''}`;
    const prev = byKey.get(key);
    if (!prev || ev.created_at > prev.created_at) byKey.set(key, ev);
  }
  return [...byKey.values()];
}

function parseContentName(ev) {
  try {
    const c = JSON.parse(ev.content);
    return c.name || c.title || undefined;
  } catch { return undefined; }
}

function parseContentObj(ev) {
  try { const c = JSON.parse(ev.content); return c && typeof c === 'object' ? c : {}; }
  catch { return {}; }
}

// The 8-term category vocabulary the directory curates on; an announcement's `k`
// tag is normalized into it (unknown values pass through, labeled, never dropped).
// Drawn from the shared vocabulary (taxonomy.mjs) so a self-listing service and
// a curated entry are filed under the same words — the spec's `k` tag and the
// directory's `category` field are one vocabulary, not two. Unknown values still
// pass through labeled rather than being dropped (see parseAnnounced).
const ANNOUNCE_CATEGORIES = CATEGORY_ORDER;

// Parse one kind-38555 event into the directory's announced-service shape. Tag
// grammar (reused from Routstr where it overlaps): d=service id · u=endpoint(s) ·
// mint=accepted Cashu mint(s) · version. Our additions: k=category · pay=payment
// method(s) · auth · pricing=pricing url. Descriptive fields ride in content JSON.
function parseAnnounced(ev) {
  const c = parseContentObj(ev);
  const urls = tag(ev, 'u');
  const k = (tag(ev, 'k')[0] || c.category || '').toLowerCase();
  const links = {};
  if (c.links && typeof c.links === 'object') {
    if (c.links.site) links.site = String(c.links.site);
    if (c.links.docs) links.docs = String(c.links.docs);
    if (c.links.repo) links.repo = String(c.links.repo);
  }
  const d = tag(ev, 'd')[0];
  return {
    slug: d ? `announced:${d}` : `announced:${ev.pubkey.slice(0, 12)}`,
    d,
    name: parseContentName(ev) || c.name,
    category: ANNOUNCE_CATEGORIES.includes(k) ? k : (k || undefined),
    summary: c.summary || undefined,
    what_an_agent_buys: c.what_an_agent_buys || undefined,
    urls,
    network: networkOf(urls),
    api_base: clearnetBase(urls),
    payment_methods: tag(ev, 'pay').map((p) => p.toLowerCase()),
    accepted_mints: tag(ev, 'mint'),
    auth: tag(ev, 'auth')[0] || c.auth || undefined,
    pricing_url: tag(ev, 'pricing')[0] || c.pricing_url || undefined,
    quickstart: c.quickstart || undefined,
    version: tag(ev, 'version')[0],
    links,
    pubkey: ev.pubkey,
    updated_at: ev.created_at,
  };
}

export function buildSnapshot(perRelayResults, { source, generatedAt }) {
  const bySub = {};
  const seenIds = new Set();
  for (const r of perRelayResults) {
    for (const { subName, event } of r.events) {
      if (seenIds.has(event.id)) continue;
      seenIds.add(event.id);
      (bySub[subName] ??= []).push(event);
    }
  }

  const routstr = dedupeReplaceable(bySub.routstr ?? []);
  const announced = dedupeReplaceable(bySub.announced ?? []).map(parseAnnounced);
  const cashu = dedupeReplaceable(bySub.cashu ?? []);
  const fedimint = dedupeReplaceable(bySub.fedimint ?? []);
  const handlers = dedupeReplaceable(bySub.handlers ?? []);
  const reviews = bySub.reviews ?? [];
  const dvmjobs = bySub.dvmjobs ?? [];

  // Trust cold-start signals computed at snapshot time (probed liveness is folded
  // in later by applyAnnouncedProbes): announcement age, and accepted-mint health —
  // a join against the NIP-87 mints this same snapshot already carries, so a
  // claimed mint that is itself a known/announced mint counts as healthy.
  const nowSec = Math.floor(new Date(generatedAt).getTime() / 1000) || 0;
  const knownMints = new Set(cashu.map((ev) => (tag(ev, 'u')[0] || '').replace(/\/+$/, '')).filter(Boolean));
  for (const s of announced) {
    s.announcement_age_days = s.updated_at ? Math.max(0, Math.round((nowSec - s.updated_at) / 86400)) : null;
    const claimed = (s.accepted_mints || []).map((u) => u.replace(/\/+$/, ''));
    s.mint_health = { claimed: claimed.length, healthy: claimed.filter((u) => knownMints.has(u)).length };
  }
  announced.sort((a, b) => (b.updated_at ?? 0) - (a.updated_at ?? 0));

  const dvmByKind = {};
  for (const ev of dvmjobs) dvmByKind[ev.kind] = (dvmByKind[ev.kind] ?? 0) + 1;

  const reviewsByTargetKind = {};
  for (const ev of reviews) {
    const k = tag(ev, 'k')[0] ?? tag(ev, 'a')[0]?.split(':')[0] ?? 'untagged';
    reviewsByTargetKind[k] = (reviewsByTargetKind[k] ?? 0) + 1;
  }

  return {
    generated_at: generatedAt,
    source,
    provenance: 'live-from-relay',
    relays: perRelayResults.map((r) => ({ url: r.url, status: r.status, unfinished: r.unfinished })),
    modules: {
      routstr: {
        kind: 38421,
        count: routstr.length,
        providers: routstr.map((ev) => {
          const urls = tag(ev, 'u');
          return {
            name: parseContentName(ev),
            d: tag(ev, 'd')[0],
            urls,
            network: networkOf(urls),
            mints: tag(ev, 'mint'),
            version: tag(ev, 'version')[0],
            pubkey: ev.pubkey,
            updated_at: ev.created_at,
          };
        }).sort((a, b) => b.updated_at - a.updated_at),
      },
      announced: {
        kind: KIND_ANNOUNCE,
        spec: 'https://marketplace.bitcoineconomy.ai/spec/agent-payable-service-announcement.md',
        count: announced.length,
        note: 'Self-announced, agent-payable services published with our "agent-payable service announcement" microstandard (kind ' + KIND_ANNOUNCE + '). Announced ≠ curated: these are permissionless announcements taken as published, not endorsements, and graduate to the curated registry only via verification. Trust signals per entry: probe status, announcement_age_days, mint_health.',
        services: announced,
      },
      mints: {
        kinds: [38172, 38173],
        cashu_count: cashu.length,
        fedimint_count: fedimint.length,
        cashu: cashu.map((ev) => ({
          url: tag(ev, 'u')[0],
          d: tag(ev, 'd')[0],
          nuts: tag(ev, 'nuts')[0],
          network: tag(ev, 'n')[0],
          pubkey: ev.pubkey,
          updated_at: ev.created_at,
        })).sort((a, b) => b.updated_at - a.updated_at),
        fedimint: fedimint.map((ev) => ({
          invite: tag(ev, 'u')[0]?.slice(0, 60),
          d: tag(ev, 'd')[0],
          modules: tag(ev, 'modules')[0],
          network: tag(ev, 'n')[0],
          pubkey: ev.pubkey,
          updated_at: ev.created_at,
        })).sort((a, b) => b.updated_at - a.updated_at),
      },
      reviews: { kind: 38000, count: reviews.length, by_target_kind: reviewsByTargetKind },
      handlers: { kind: 31990, count: handlers.length },
      dvm_jobs_30d: {
        kinds_sampled: '5000-5999',
        window_days: 30,
        total: dvmjobs.length,
        by_kind: Object.fromEntries(Object.entries(dvmByKind).sort((a, b) => b[1] - a[1])),
      },
    },
  };
}

// ---- provider endpoint probes — the agent-decision layer ---------------------
// Announcements are replaceable Nostr events that outlive their nodes (observed
// 2026-06-10: 11 of 24 probeable announced providers were dead). So the snapshot
// probes every clearnet endpoint's /v1/models at refresh time and records what
// answered. Onion-only providers can't be probed from our infrastructure (no
// Tor): they get "unverified-tor-only" — honestly distinct from both "alive"
// and "unreachable". Dead ≠ delisted: the announcement layer stays the source
// of record; consumers filter on `status`.

function isPublicHttp(u) {
  if (!/^https?:\/\//i.test(u) || /\.onion/i.test(u)) return false;
  try {
    const h = new URL(u).hostname;
    if (/^(localhost|0\.0\.0\.0|127\.|10\.|192\.168\.)/i.test(h)) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return false;
    if (h === '[::1]' || h.endsWith('.local') || !h.includes('.')) return false;
    return true;
  } catch { return false; }
}

export function networkOf(urls = []) {
  const onion = urls.some((u) => /\.onion/i.test(u));
  const clear = urls.some(isPublicHttp);
  if (onion && clear) return 'both';
  if (onion) return 'tor';
  if (clear) return 'clearnet';
  // Announced, but with no publicly routable endpoint at all (e.g. localhost).
  return 'unroutable';
}

function clearnetBase(urls = []) {
  const u = urls.find(isPublicHttp);
  return u ? u.replace(/\/+$/, '') : undefined;
}

const sig6 = (n) => (typeof n === 'number' && isFinite(n) ? Number(n.toPrecision(6)) : undefined);

// Probes each provider's clearnet /v1/models (Routstr nodes are OpenAI-compatible
// and the endpoint is unauthenticated). Returns Map(d → probe result); `models`
// (the full priced catalog) rides along for buildModelsIndex but is NOT written
// into the snapshot — model_count + status are.
export async function probeProviders(providers, { timeoutMs = 10000, concurrency = 8, fetchFn = fetch } = {}) {
  const results = new Map();
  const queue = [...providers];
  async function lane() {
    while (queue.length) {
      const p = queue.shift();
      const base = clearnetBase(p.urls);
      if (!base) {
        const onion = (p.urls ?? []).some((u) => /\.onion/i.test(u));
        results.set(p.d, { status: onion ? 'unverified-tor-only' : 'unroutable' });
        continue;
      }
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort('timeout'), timeoutMs);
      const t0 = Date.now();
      try {
        const res = await fetchFn(base + '/v1/models', { signal: ctrl.signal, headers: { accept: 'application/json' } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const body = await res.json();
        const models = Array.isArray(body?.data) ? body.data : Array.isArray(body?.models) ? body.models : [];
        results.set(p.d, { status: 'alive', latency_ms: Math.round(Date.now() - t0), model_count: models.length, endpoint: base, models });
      } catch {
        results.set(p.d, { status: 'unreachable', endpoint: base });
      } finally {
        clearTimeout(timer);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(queue.length, 1)) }, lane));
  return results;
}

// Folds probe results into the snapshot in place (and returns it): per-provider
// status/latency/model_count + a module-level probe summary.
export function applyProbes(snapshot, probeResults, { probedAt }) {
  const mod = snapshot.modules?.routstr;
  if (!mod) return snapshot;
  const counts = { alive: 0, unreachable: 0, 'unverified-tor-only': 0, unroutable: 0 };
  for (const p of mod.providers) {
    const r = probeResults.get(p.d);
    if (!r) continue;
    p.status = r.status;
    if (r.latency_ms !== undefined) p.latency_ms = r.latency_ms;
    if (r.model_count !== undefined) p.model_count = r.model_count;
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  }
  mod.probe = {
    probed_at: probedAt,
    method: 'GET {clearnet endpoint}/v1/models, 10s timeout; onion-only endpoints are not probeable from this infrastructure; unroutable = announced with no publicly routable endpoint (e.g. localhost)',
    alive: counts.alive,
    unreachable: counts.unreachable,
    unverified_tor_only: counts['unverified-tor-only'],
    unroutable: counts.unroutable,
    note: 'status reflects the probe moment only; dead ≠ delisted — announcements remain the source of record',
  };
  return snapshot;
}

// L402 (formerly LSAT): a 402 response carries `WWW-Authenticate: L402 macaroon="..",
// invoice="lnbc.."`. Shared by the announced-service probe here and get_quote's
// api_base probe in mcp-lib.mjs (one detector, one behaviour).
export function detectL402(status, wwwAuth = '', body = '') {
  const isL402 = status === 402 || /\b(l402|lsat)\b/i.test(wwwAuth);
  if (!isL402) return null;
  const invoice = (`${wwwAuth}\n${body}`.match(/ln(bc|tb|bcrt)[0-9a-z]{50,}/i) || [])[0] || null;
  const macaroon = (wwwAuth.match(/macaroon="?([^",\s]+)"?/i) || [])[1] || null;
  return { detected: true, invoice, macaroon, www_authenticate: wwwAuth || null };
}

// Generalized liveness probe for announced services (the general case — they are
// NOT all OpenAI-compatible, so unlike probeProviders we do a bare GET on the
// clearnet endpoint and record reachability + an L402 challenge where one is
// served). Onion-only → unverified-tor-only; no routable endpoint → unroutable.
// Same honesty vocabulary as the Routstr probe; dead ≠ delisted.
export async function probeAnnounced(services, { timeoutMs = 8000, concurrency = 8, fetchFn = fetch } = {}) {
  const results = new Map();
  const queue = [...services];
  async function lane() {
    while (queue.length) {
      const s = queue.shift();
      const base = clearnetBase(s.urls);
      if (!base) {
        const onion = (s.urls ?? []).some((u) => /\.onion/i.test(u));
        results.set(s.slug, { status: onion ? 'unverified-tor-only' : 'unroutable' });
        continue;
      }
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort('timeout'), timeoutMs);
      const t0 = Date.now();
      try {
        const res = await fetchFn(base, { signal: ctrl.signal, headers: { accept: 'application/json, text/plain;q=0.9, */*;q=0.5' } });
        let body = '';
        try { body = (await res.text()).slice(0, 4000); } catch {}
        const l402 = detectL402(res.status, res.headers.get('www-authenticate') || '', body);
        results.set(s.slug, { status: 'alive', latency_ms: Math.round(Date.now() - t0), http_status: res.status, endpoint: base, ...(l402 ? { l402 } : {}) });
      } catch {
        results.set(s.slug, { status: 'unreachable', endpoint: base });
      } finally {
        clearTimeout(timer);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(queue.length, 1)) }, lane));
  return results;
}

// Folds announced-service probe results into the snapshot in place: per-service
// status/latency/http_status (+ any captured L402) + a module-level probe summary.
export function applyAnnouncedProbes(snapshot, probeResults, { probedAt }) {
  const mod = snapshot.modules?.announced;
  if (!mod) return snapshot;
  const counts = { alive: 0, unreachable: 0, 'unverified-tor-only': 0, unroutable: 0 };
  for (const s of mod.services) {
    const r = probeResults.get(s.slug);
    if (!r) continue;
    s.status = r.status;
    if (r.latency_ms !== undefined) s.latency_ms = r.latency_ms;
    if (r.http_status !== undefined) s.http_status = r.http_status;
    if (r.l402) s.l402 = r.l402;
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  }
  mod.probe = {
    probed_at: probedAt,
    method: 'GET {clearnet endpoint}, 8s timeout; an L402 challenge is captured where served. Onion-only endpoints are not probeable from this infrastructure; unroutable = announced with no publicly routable endpoint.',
    alive: counts.alive,
    unreachable: counts.unreachable,
    unverified_tor_only: counts['unverified-tor-only'],
    unroutable: counts.unroutable,
    note: 'status reflects the probe moment only; dead ≠ delisted — announcements remain the source of record',
  };
  return snapshot;
}

// The cross-provider price index: model id → every alive provider serving it,
// with sats pricing, cheapest first. One fetch answers "who serves model X
// cheapest right now". Pricing fields mirror the providers' own sats_pricing:
// sats per token (prompt/completion) + the per-request max_cost ceiling.
export function buildModelsIndex(providers, probeResults, { generatedAt, source }) {
  const byModel = new Map();
  let alive = 0;
  for (const p of providers) {
    const probe = probeResults.get(p.d);
    if (!probe || probe.status !== 'alive') continue;
    alive++;
    for (const m of probe.models ?? []) {
      const sp = m.sats_pricing;
      if (!m.id || !sp) continue;
      const rec = byModel.get(m.id) ?? { id: m.id, name: m.name, context_length: m.context_length ?? null, providers: [] };
      if ((m.context_length ?? 0) > (rec.context_length ?? 0)) rec.context_length = m.context_length;
      rec.providers.push({
        provider: p.name,
        d: p.d,
        endpoint: probe.endpoint,
        sats_per_prompt_token: sig6(sp.prompt),
        sats_per_completion_token: sig6(sp.completion),
        sats_max_cost_per_request: sig6(sp.max_cost),
      });
      byModel.set(m.id, rec);
    }
  }
  const models = [...byModel.values()];
  for (const m of models) {
    m.providers.sort((a, b) => (a.sats_per_prompt_token ?? Infinity) - (b.sats_per_prompt_token ?? Infinity));
    m.provider_count = m.providers.length;
  }
  models.sort((a, b) => b.provider_count - a.provider_count || String(a.id).localeCompare(String(b.id)));
  return {
    $schema_note:
      'Cross-provider price index for Routstr (kind 38421) inference providers, built by probing each ' +
      'alive clearnet endpoint\'s unauthenticated /v1/models at snapshot time. models[] is sorted by how many ' +
      'providers serve the model; each model\'s providers[] is sorted cheapest-first by sats_per_prompt_token. ' +
      'Units: sats per token (prompt/completion); sats_max_cost_per_request is the provider\'s stated per-request ' +
      'ceiling. Prices are the providers\' own published numbers, not endorsements — verify before trusting. ' +
      'Provider inventory + liveness: /live/snapshot.json. Part of https://marketplace.bitcoineconomy.ai.',
    generated_at: generatedAt,
    source,
    provenance: 'probed-from-provider-endpoints',
    providers_alive: alive,
    model_count: models.length,
    models,
  };
}
