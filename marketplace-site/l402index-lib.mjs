// l402index-lib.mjs — the external-index tier: a selective, attributed pass over
// 402index.io's feed (built by Ryan Gentry, ex-Lightning Labs).
//
// 402index is a protocol-agnostic crawler of paid HTTP-402 endpoints (L402 +
// x402 + MPP). We do NOT mirror it — a raw dump is the phone-book trap the
// curated registry exists to avoid. We take a SELECTIVE pass, each row passed
// through WITH ATTRIBUTION and a link back to its 402index source record.
//
// Provenance: "external-index" — third-party-indexed, third-party-verified, and
// NOT a bitcoineconomy.ai endorsement.
//
// WIDENED BEYOND L402 (2026-07-29). This tier used to filter `protocol=l402`,
// because a sats-holding agent could only pay Lightning-native endpoints. Alby's
// l402.space gateway removed that constraint: an agent pays the gateway in sats
// and the gateway settles upstream over x402/USDC or MPP. So x402 and MPP rows
// now belong here too — carried with `rail: "via-gateway"` and a ready-made
// gateway URL, versus `rail: "bitcoin-native"` for the ones an agent pays
// directly. The distinction is surfaced on every row rather than smoothed away:
// paying through a gateway means trusting an intermediary with the sats leg, and
// that is a real difference the reader is entitled to see.
//
// Quality gate. 402index files 72,819 of its ~86,000 endpoints as
// `uncategorized`, and most of those rows carry no name and no description — raw
// URLs from demo starters, one row per path on a single host. A row must have a
// real name AND description AND classify into our vocabulary to be ingested. The
// classifier doubles as the noise filter, which is why the merged directory has
// no uncategorized rows in it.
//
// Shared by the local CLI (fetch-402index.mjs) and the worker cron (worker.js)
// so the committed fallback (l402index.json) and the KV copy share one schema.
// Change the shape here, never in the consumers.

import { classify } from './taxonomy.mjs';

export const UPSTREAM_BASE = 'https://402index.io';
export const UPSTREAM_API = UPSTREAM_BASE + '/api/v1';
export const GATEWAY_BASE = 'https://l402.space/';

// Selective-curation knobs.
export const CAP = 120;                 // total rows kept across all protocols
export const CAP_NON_LIGHTNING = 60;    // slots RESERVED for gateway-payable rows
// Per top-level category, per rail. Looser for Lightning-native rows: those are
// the Bitcoin-native slice this directory exists to widen, so they get more room
// than rows that can only be reached through an intermediary.
export const PER_CATEGORY_CAP_LIGHTNING = 40;
export const PER_CATEGORY_CAP_GATEWAY = 20;
// 402index registers one row per PATH, so a single host can hold dozens of
// near-identical endpoints (llm402.ai alone has 38). Showing them all is the
// phone book again, one host at a time — take each host's most reliable few.
export const PER_HOST_CAP = 3;

// 402index's reliability sort is not just inference-heavy — it is HOST-heavy.
// Its top 400 verified L402 rows come from SIX hosts, 375 of them llm402.ai
// alone. Sorting by reliability therefore cannot see the Lightning-native long
// tail at all (ganamos.earth, lightningenable, certvera, l402kit, bitcoinbenji…),
// which is most of the interesting Bitcoin-native breadth. So we also query
// per-category: these are the categories where their own tallies show real L402
// presence. Cheap parallel HTTPS fetches, and each one is allowed to fail.
export const L402_BREADTH_CATEGORIES = [
  'ai', 'tools', 'bitcoin', 'energy', 'data', 'identity', 'video',
  'guides', 'nostr', 'crypto', 'communication', 'storage', 'l402',
];
export const MIN_RELIABILITY = 70;
export const MIN_DESC_CHARS = 12;

const NOISE = [/faucet/i, /mutinynet/i, /\btest(net)?\b/i, /\bdemo\b/i, /\bexample\b/i, /\bsandbox\b/i, /\bstarter\b/i, /\bsimulated\b/i, /protected content/i, /\bpay per use\b/i, /directory/i, /l402\s*apps/i];

function isNoise(s) {
  const hay = `${s.name || ''} ${s.description || ''} ${s.category || ''}`;
  return NOISE.some((re) => re.test(hay));
}

// A row whose "name" is just its own URL carries no information — 402index emits
// these in bulk for hosts that register per-path. Reject rather than display.
function hasRealIdentity(s) {
  const name = String(s.name || '').trim();
  const desc = String(s.description || '').trim();
  if (!name || /^https?:\/\//i.test(name)) return false;
  if (desc.length < MIN_DESC_CHARS) return false;
  return true;
}

const LIGHTNING_PROTOCOLS = new Set(['l402', 'mpp-lightning']);

function isLightningNative(s) {
  const proto = String(s.protocol || '').toLowerCase();
  const net = String(s.payment_network || '').toLowerCase();
  return LIGHTNING_PROTOCOLS.has(proto) || net === 'lightning';
}

function normalize(s) {
  let host = '';
  try { host = new URL(s.url).host; } catch {}
  const lightning = isLightningNative(s);
  const cls = classify({ rawCategory: s.category, name: s.name, description: s.description });
  return {
    id: s.id,
    name: s.name || host || '(unnamed)',
    provider: s.provider || host || null,
    description: s.description || null,
    category: cls.category,
    subcategory: cls.subcategory,
    source_category: cls.source_category,
    classification_confidence: cls.confidence,
    protocol: String(s.protocol || '').toLowerCase() || null,
    url: s.url || null,
    host,
    price_sats: (typeof s.price_sats === 'number') ? s.price_sats : null,
    price_usd: (typeof s.price_usd === 'number') ? s.price_usd : null,
    payment_asset: s.payment_asset || (lightning ? 'BTC' : null),
    payment_network: s.payment_network || (lightning ? 'Lightning' : null),
    // How an agent holding only sats actually pays this endpoint.
    rail: lightning ? 'bitcoin-native' : 'via-gateway',
    gateway_url: lightning || !s.url ? null : GATEWAY_BASE + encodeURIComponent(s.url),
    health_status: s.health_status || null,
    reliability_score: (typeof s.reliability_score === 'number') ? s.reliability_score : null,
    uptime_30d: (typeof s.uptime_30d === 'number') ? s.uptime_30d : null,
    latency_p50_ms: (typeof s.latency_p50_ms === 'number') ? s.latency_p50_ms : null,
    http_method: s.http_method || 'GET',
    last_checked: s.last_checked || null,
    source_page: UPSTREAM_BASE + '/service/' + s.id,
  };
}

function keep(s, minReliability) {
  if (String(s.health_status || '').toLowerCase() !== 'healthy') return false;
  if (typeof s.reliability_score === 'number' && s.reliability_score < minReliability) return false;
  if (isNoise(s)) return false;
  if (!hasRealIdentity(s)) return false;
  // The classifier is the last gate: a row we cannot place is a row we cannot
  // honestly display next to a curated entry.
  return classify({ rawCategory: s.category, name: s.name, description: s.description }).confidence !== 'unmapped';
}

/**
 * Fetch and select from 402index across all three protocols.
 *
 * Lightning-native rows are taken first and are never displaced by gateway rows
 * — the sovereignty-first ordering rule applies to ingestion, not just display.
 * Returns { services, scanned, kept_lightning, kept_gateway }.
 */
export async function fetch402index(fetchImpl = fetch, { cap = CAP, capNonLightning = CAP_NON_LIGHTNING, perCategoryCapLightning = PER_CATEGORY_CAP_LIGHTNING, perCategoryCapGateway = PER_CATEGORY_CAP_GATEWAY, minReliability = MIN_RELIABILITY, limit = 200, timeoutMs = 15000 } = {}) {
  // 402index intermittently 502s (observed 2026-07-29: roughly one call in
  // three, transient, succeeding on immediate retry). Without a retry a single
  // flake empties a whole tier, so each query gets two more tries with a short
  // backoff before giving up.
  const getOnce = async (qs) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const r = await fetchImpl(`${UPSTREAM_API}/services?${qs}`, { headers: { accept: 'application/json' }, signal: ctrl.signal });
      if (!r.ok) throw new Error('402index /services ' + r.status);
      const data = await r.json();
      return Array.isArray(data) ? data : (data.services || []);
    } finally { clearTimeout(t); }
  };
  const get = async (qs) => {
    let last;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt) await new Promise((r) => setTimeout(r, 400 * attempt));
      try { return await getOnce(qs); } catch (e) { last = e; }
    }
    throw last;
  };

  // Three kinds of pass, all in parallel, each independently failable:
  //   1. the general reliability-sorted feed — supplies the gateway-payable rows
  //   2. the L402 reliability-sorted feed — the dense Bitcoin-native core
  //   3. per-category L402 queries — the ONLY way to reach the Lightning-native
  //      long tail, since passes 1–2 are dominated by a handful of hosts
  const safe = (p) => p.catch(() => []);
  const [allRaw, l402Core, ...byCategory] = await Promise.all([
    safe(get(`verified=true&sort=reliability&order=desc&limit=${limit}`)),
    safe(get(`protocol=l402&verified=true&sort=reliability&order=desc&limit=${limit}`)),
    ...L402_BREADTH_CATEGORIES.map((c) => safe(get(`protocol=l402&verified=true&category=${encodeURIComponent(c)}&limit=50`))),
  ]);
  // Breadth rows lead so that when the per-host cap runs, each host's slots go to
  // its category-representative endpoints rather than to 375 llm402.ai paths.
  const l402Raw = [...byCategory.flat(), ...l402Core];
  const scanned = l402Raw.length + allRaw.length;

  const seen = new Set();
  const lightning = [];
  const gateway = [];
  for (const s of [...l402Raw, ...allRaw]) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    if (!keep(s, minReliability)) continue;
    (isLightningNative(s) ? lightning : gateway).push(s);
  }

  // Diversity cap. Sorted by reliability alone, 402index's verified feed is ~90%
  // AI inference — 120 near-identical LLM endpoints, which is a phone book with
  // extra steps. Cap each top-level category within each rail so the directory
  // shows what the agent economy actually sells. Dropped counts are published in
  // `dropped_to_diversify` rather than silently truncated.
  const dropped = {};
  let droppedPerHost = 0;
  // Per-host cap first: the rows arrive reliability-sorted, so this keeps each
  // host's best endpoints and drops its long tail before the category cap runs.
  const capPerHost = (rows) => {
    const seenHost = {};
    return rows.filter((s) => {
      let h = '';
      try { h = new URL(s.url).host; } catch { return true; }
      seenHost[h] = (seenHost[h] || 0) + 1;
      if (seenHost[h] > PER_HOST_CAP) { droppedPerHost++; return false; }
      return true;
    });
  };
  const diversify = (rows, perCategoryCap) => {
    const perCat = {};
    const out = [];
    for (const s of rows) {
      const cat = classify({ rawCategory: s.category, name: s.name, description: s.description }).category || 'other';
      perCat[cat] = (perCat[cat] || 0) + 1;
      if (perCat[cat] > perCategoryCap) { dropped[cat] = (dropped[cat] || 0) + 1; continue; }
      out.push(s);
    }
    return out;
  };

  // Reserve slots for gateway rows first, then give any unused ones back to the
  // Lightning-native side — Bitcoin-native rows never lose a slot they can fill.
  const gwPool = diversify(capPerHost(gateway), perCategoryCapGateway);
  const lnPool = diversify(capPerHost(lightning), perCategoryCapLightning);
  const gwWanted = Math.min(capNonLightning, gwPool.length);
  const keptLightning = lnPool.slice(0, Math.max(0, cap - gwWanted));
  const keptGateway = gwPool.slice(0, Math.max(0, cap - keptLightning.length));
  return {
    services: [...keptLightning, ...keptGateway].map(normalize),
    scanned,
    kept_lightning: keptLightning.length,
    kept_gateway: keptGateway.length,
    dropped_to_diversify: dropped,
    dropped_over_per_host_cap: droppedPerHost,
  };
}

// Back-compat alias — the old name meant "the L402-only pass". Callers that want
// only Lightning-native rows should filter on `rail` instead.
export const fetch402indexL402 = fetch402index;

export function buildL402Index({ services, scanned, kept_lightning, kept_gateway }, { generatedAt, source }) {
  const cats = {};
  for (const s of services) {
    const k = s.category + (s.subcategory ? '/' + s.subcategory : '');
    cats[k] = (cats[k] || 0) + 1;
  }
  return {
    $schema_note:
      "External-index tier — a SELECTIVE, attributed pass over 402index.io's verified feed (built by Ryan " +
      'Gentry, ex-Lightning Labs). These endpoints are third-party-INDEXED and third-party-VERIFIED, passed ' +
      'through WITH ATTRIBUTION — NOT bitcoineconomy.ai endorsements. Each carries a source_page linking back ' +
      'to its 402index.io record. Every row states its `rail`: "bitcoin-native" = an agent pays it directly ' +
      'in sats (L402 / Lightning MPP); "via-gateway" = it settles in USDC or Tempo upstream and is sats-payable ' +
      'only through l402.space, which means trusting an intermediary with the sats leg — a real difference, ' +
      'stated per row rather than smoothed away. Rows must carry a real name and description and classify into ' +
      'the shared vocabulary to be ingested, which is why there are no uncategorized rows here (402index files ' +
      '72,819 of ~86,000 endpoints as uncategorized, most with no description at all). Curated picks: ' +
      '/directory.json. Everything merged into one filterable table: /live/master.json. Provenance: external-index.',
    generated_at: generatedAt,
    source: source || '402index.io/api/v1 (verified=true, all protocols)',
    provenance: 'external-index',
    attribution: {
      name: '402 Index',
      url: UPSTREAM_BASE,
      by: 'Ryan Gentry',
      note: 'Data indexed and health-verified by 402index.io; passed through with attribution. Verify at the source before trusting.',
    },
    gateway: {
      name: 'l402.space — Universal 402 Gateway',
      by: 'Alby',
      url: 'https://l402.space/',
      note: 'Rows with rail "via-gateway" carry a gateway_url an agent can pay in sats; the gateway settles upstream over x402/USDC or MPP. Using it means trusting an intermediary with the sats leg.',
    },
    filter: {
      protocols: 'all (l402, x402, mpp)',
      verified: true,
      healthy_only: true,
      min_reliability: MIN_RELIABILITY,
      requires_name_and_description: true,
      requires_classification: true,
      cap: CAP,
      cap_non_lightning: CAP_NON_LIGHTNING,
      sort: 'bitcoin-native first, then reliability desc',
      excluded: 'faucet/test/demo/sandbox/starter/directory noise, rows named only by their URL, rows we cannot classify',
    },
    scanned,
    count: services.length,
    lightning_native: kept_lightning ?? services.filter((s) => s.rail === 'bitcoin-native').length,
    via_gateway: kept_gateway ?? services.filter((s) => s.rail === 'via-gateway').length,
    categories: cats,
    services,
  };
}
