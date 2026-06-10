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

const THIRTY_DAYS = 30 * 24 * 60 * 60;

export function makeFilters(nowSec) {
  return {
    routstr: { kinds: [38421], limit: 500 },
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
  const cashu = dedupeReplaceable(bySub.cashu ?? []);
  const fedimint = dedupeReplaceable(bySub.fedimint ?? []);
  const handlers = dedupeReplaceable(bySub.handlers ?? []);
  const reviews = bySub.reviews ?? [];
  const dvmjobs = bySub.dvmjobs ?? [];

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
