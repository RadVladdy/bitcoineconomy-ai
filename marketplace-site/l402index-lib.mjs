// l402index-lib.mjs — the "Wider L402" tier: a selective, attributed pass over
// 402index.io's verified-L402 feed (built by Ryan Gentry, ex-Lightning Labs).
//
// 402index is a protocol-agnostic crawler of paid HTTP-402 endpoints (L402 +
// x402 + MPP). We do NOT mirror it — a raw dump is the phone-book trap the
// curated registry exists to avoid. Instead we take a SELECTIVE pass over their
// verified-L402 feed: real, healthy, Lightning-payable endpoints, with the
// faucet/test/directory noise filtered out and a reliability cap, each passed
// through WITH ATTRIBUTION and a link back to its 402index source record.
//
// Provenance: "external-index" — third-party-indexed, third-party-verified, and
// NOT a bitcoineconomy.ai endorsement. Curated picks live in /directory.json;
// live Nostr inventory in /live/snapshot.json; this widens the Lightning-native
// slice beyond the hand-curated set.
//
// Shared by the local CLI (fetch-402index.mjs) and the worker cron (worker.js)
// so the committed fallback (l402index.json) and the KV copy share one schema.
// Change the shape here, never in the consumers.

export const UPSTREAM_BASE = 'https://402index.io';
export const UPSTREAM_API = UPSTREAM_BASE + '/api/v1';

// Selective-curation knobs. The verified + reliability-sorted L402 set is mostly
// real AI inference / image / video endpoints; a light filter drops the faucet /
// test / directory noise, and a cap keeps this a curated slice, not a 1,200-row
// dump. (Upstream caps `limit` at 200, so `scanned` is the top-N by reliability.)
export const CAP = 60;
export const MIN_RELIABILITY = 70;
const NOISE = [/faucet/i, /mutinynet/i, /\btest(net)?\b/i, /\bdemo\b/i, /\bexample\b/i, /\bsandbox\b/i, /directory/i, /l402\s*apps/i];

function isNoise(s) {
  const hay = `${s.name || ''} ${s.description || ''} ${s.category || ''}`;
  return NOISE.some((re) => re.test(hay));
}

function normalize(s) {
  let host = '';
  try { host = new URL(s.url).host; } catch {}
  return {
    id: s.id,
    name: s.name || host || '(unnamed)',
    provider: s.provider || host || null,
    category: s.category || 'other',
    url: s.url || null,
    host,
    price_sats: (typeof s.price_sats === 'number') ? s.price_sats : null,
    price_usd: (typeof s.price_usd === 'number') ? s.price_usd : null,
    payment_asset: s.payment_asset || 'BTC',
    payment_network: s.payment_network || 'Lightning',
    health_status: s.health_status || null,
    reliability_score: (typeof s.reliability_score === 'number') ? s.reliability_score : null,
    latency_p50_ms: (typeof s.latency_p50_ms === 'number') ? s.latency_p50_ms : null,
    http_method: s.http_method || 'GET',
    last_checked: s.last_checked || null,
    source_page: UPSTREAM_BASE + '/service/' + s.id,
  };
}

// fetchImpl defaults to global fetch (Node 18+ and the Cloudflare Worker both
// provide it). Returns { services, scanned } — throws on a non-OK upstream so
// the caller (cron / CLI) can keep the previous good data rather than store noise.
export async function fetch402indexL402(fetchImpl = fetch, { cap = CAP, minReliability = MIN_RELIABILITY, limit = 200, timeoutMs = 15000 } = {}) {
  const url = `${UPSTREAM_API}/services?protocol=l402&verified=true&sort=reliability&order=desc&limit=${limit}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  let data;
  try {
    const r = await fetchImpl(url, { headers: { accept: 'application/json' }, signal: ctrl.signal });
    if (!r.ok) throw new Error('402index /services ' + r.status);
    data = await r.json();
  } finally { clearTimeout(t); }
  const raw = Array.isArray(data) ? data : (data.services || []);
  const scanned = raw.length;
  const kept = raw
    .filter((s) => String(s.protocol || '').toLowerCase() === 'l402')
    .filter((s) => String(s.health_status || '').toLowerCase() === 'healthy')
    .filter((s) => (typeof s.reliability_score !== 'number') || s.reliability_score >= minReliability)
    .filter((s) => !isNoise(s))
    .slice(0, cap)
    .map(normalize);
  return { services: kept, scanned };
}

export function buildL402Index({ services, scanned }, { generatedAt, source }) {
  const cats = {};
  for (const s of services) cats[s.category] = (cats[s.category] || 0) + 1;
  return {
    $schema_note:
      "Wider L402 index — a SELECTIVE, attributed pass over 402index.io's verified-L402 feed (built by Ryan " +
      'Gentry, ex-Lightning Labs). These are third-party-INDEXED and third-party-VERIFIED endpoints an agent can ' +
      'pay over Lightning (L402), passed through WITH ATTRIBUTION — NOT bitcoineconomy.ai endorsements. Each carries ' +
      'a source_page linking back to its 402index.io record. We filter for healthy, real services (dropping ' +
      'faucet/test/directory noise) and cap by reliability, so this widens the Lightning-native slice beyond the ' +
      'hand-curated registry without becoming a raw crawl. Curated picks: /directory.json. Live Nostr inventory: ' +
      '/live/snapshot.json. Provenance: external-index.',
    generated_at: generatedAt,
    source: source || '402index.io/api/v1 (protocol=l402, verified=true)',
    provenance: 'external-index',
    attribution: {
      name: '402 Index',
      url: UPSTREAM_BASE,
      by: 'Ryan Gentry',
      note: 'Data indexed and health-verified by 402index.io; passed through with attribution. Verify at the source before trusting.',
    },
    filter: { protocol: 'l402', verified: true, healthy_only: true, min_reliability: MIN_RELIABILITY, cap: CAP, sort: 'reliability desc', excluded: 'faucet/test/demo/sandbox/directory' },
    scanned,
    count: services.length,
    categories: cats,
    services,
  };
}
