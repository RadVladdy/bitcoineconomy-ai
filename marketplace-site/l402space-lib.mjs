// l402space-lib.mjs — the gateway-observed tier: paid API hosts seen settling
// through Alby's l402.space, the "Universal 402 Gateway" (announced 2026-07-29).
//
// What the gateway is. An agent pays l402.space over whichever rail its wallet
// speaks (L402 / Lightning, x402 / USDC, MPP / Tempo); the gateway pays the
// upstream API over whichever rail THAT API speaks and returns the response. For
// this directory it does two distinct jobs:
//
//   1. A DATA SOURCE with something no other tier has. 402index probes endpoints
//      from outside and reports health; the curated tier probes liveness; both
//      are observations of whether a thing answers. l402.space settled the
//      payments itself, so its numbers are OBSERVED SETTLEMENT: how many
//      payments were received, how many deliveries actually came back, real
//      price ranges, real volume. `deliveries / paymentsReceived` is a
//      paid-and-got-the-goods rate — the strongest trust signal in the directory.
//
//   2. A PAYMENT ROUTE for rows an agent otherwise cannot buy. Any x402/MPP
//      endpoint becomes sats-payable through it (see `gateway_url` in
//      l402index-lib.mjs).
//
// Honest framing, and it cuts both ways. A bridge from sats to the USDC agent
// economy is a genuine answer to "there is nothing to buy with Lightning" — and
// it is also a CUSTODIAL HOP: the agent hands sats to an intermediary that holds
// a USDC float and pays out of it. That relieves exactly the pressure that would
// otherwise push these sellers to accept Lightning directly. The directory does
// not smooth this over: rows reached this way are labelled `via-gateway`, and
// the trust note ships in-band on the tier.
//
// Scale discipline. As of first ingest the gateway had settled ~$35 across ~850
// transactions — a working demo, not a market. `stats` is published verbatim on
// the tier so nobody (us included) can imply otherwise from a row count.
//
// Provenance: "gateway-observed" — observed by a third party at settlement time,
// NOT a bitcoineconomy.ai endorsement and NOT our own measurement.

import { classify } from './taxonomy.mjs';

export const UPSTREAM_BASE = 'https://l402.space';
export const SERVICES_URL = UPSTREAM_BASE + '/api/services';
export const STATS_URL = UPSTREAM_BASE + '/api/stats';
export const GATEWAY_BASE = UPSTREAM_BASE + '/';

// A host needs at least this many observed deliveries before its reliability
// figure is worth showing. Below it the ratio is noise (1/1 is not "100%") — the
// row still ships, but `reliability` is null and the denominator is visible.
export const MIN_DELIVERIES_FOR_RELIABILITY = 5;

const LIGHTNING_NETWORKS = new Set(['lightning', 'bolt11', 'ln']);

function railFor(network) {
  return LIGHTNING_NETWORKS.has(String(network || '').toLowerCase()) ? 'bitcoin-native' : 'via-gateway';
}

function normalize(s) {
  const host = String(s.host || '').trim();
  const desc = String(s.desc || '').trim();
  const cls = classify({ rawCategory: null, name: host, description: desc });
  const deliveries = typeof s.deliveries === 'number' ? s.deliveries : null;
  const received = typeof s.paymentsReceived === 'number' ? s.paymentsReceived : null;
  const enough = deliveries != null && received != null && deliveries >= MIN_DELIVERIES_FOR_RELIABILITY;
  return {
    id: 'l402space:' + host,
    name: host,
    provider: host,
    description: desc || null,
    category: cls.category,
    subcategory: cls.subcategory,
    source_category: null,           // the gateway publishes no category at all
    classification_confidence: cls.confidence,
    protocol: null,                  // the gateway abstracts the upstream protocol
    url: null,                       // it lists hosts, not individual endpoints
    host,
    docs: s.docs || null,
    payment_network: s.networkLabel || s.network || null,
    rail: railFor(s.network),
    gateway_url: host ? GATEWAY_BASE + encodeURIComponent('https://' + host + '/') : null,
    // --- observed settlement (the thing only this source has) ---
    price_usd_min: typeof s.priceMin === 'number' ? s.priceMin : null,
    price_usd_max: typeof s.priceMax === 'number' ? s.priceMax : null,
    tx_count: typeof s.txCount === 'number' ? s.txCount : null,
    volume_usd: typeof s.volumeUsd === 'number' ? s.volumeUsd : null,
    payments_received: received,
    deliveries,
    // Ratio only where the denominator supports it — never a bare score.
    reliability: enough && received > 0 ? deliveries / received : null,
    reliability_denominator: received,
    last_activity: typeof s.lastActivity === 'number' ? new Date(s.lastActivity).toISOString() : null,
    source_page: UPSTREAM_BASE + '/',
  };
}

/**
 * Fetch the gateway's observed-host directory plus its aggregate stats.
 * Throws on a non-OK upstream so the caller keeps its previous good data.
 * Returns { services, stats }.
 */
export async function fetchL402Space(fetchImpl = fetch, { timeoutMs = 15000, minDeliveries = 0 } = {}) {
  const getOnce = async (url) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const r = await fetchImpl(url, { headers: { accept: 'application/json' }, signal: ctrl.signal });
      if (!r.ok) throw new Error('l402.space ' + url + ' ' + r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  };
  // Same retry discipline as the external index: a transient upstream blip must
  // not empty a tier, because an empty tier is indistinguishable from "nothing
  // to sell here" to anyone reading the directory.
  const get = async (url) => {
    let last;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt) await new Promise((r) => setTimeout(r, 400 * attempt));
      try { return await getOnce(url); } catch (e) { last = e; }
    }
    throw last;
  };

  const [svcDoc, stats] = await Promise.all([
    get(SERVICES_URL),
    get(STATS_URL).catch(() => null),   // stats are context, not load-bearing
  ]);

  const raw = Array.isArray(svcDoc) ? svcDoc : (svcDoc.services || []);

  // The gateway lists a host once per inbound network, so the same host can
  // appear twice (e.g. StableEnrich over Base and over Lightning). Merge on host,
  // summing the observed counters and preferring the Lightning-native rail —
  // if an agent CAN pay it directly in sats, that is the fact worth surfacing.
  const byHost = new Map();
  for (const s of raw) {
    const host = String(s.host || '').trim();
    if (!host) continue;
    const prev = byHost.get(host);
    if (!prev) { byHost.set(host, { ...s }); continue; }
    const sum = (a, b) => (typeof a === 'number' || typeof b === 'number') ? (a || 0) + (b || 0) : null;
    const lightningWins = railFor(s.network) === 'bitcoin-native';
    byHost.set(host, {
      ...prev,
      network: lightningWins ? s.network : prev.network,
      networkLabel: lightningWins ? s.networkLabel : prev.networkLabel,
      desc: prev.desc || s.desc,
      docs: prev.docs || s.docs,
      txCount: sum(prev.txCount, s.txCount),
      volumeUsd: sum(prev.volumeUsd, s.volumeUsd),
      paymentsReceived: sum(prev.paymentsReceived, s.paymentsReceived),
      deliveries: sum(prev.deliveries, s.deliveries),
      priceMin: Math.min(prev.priceMin ?? Infinity, s.priceMin ?? Infinity),
      priceMax: Math.max(prev.priceMax ?? -Infinity, s.priceMax ?? -Infinity),
      lastActivity: Math.max(prev.lastActivity || 0, s.lastActivity || 0),
    });
  }

  const services = [...byHost.values()]
    .map(normalize)
    // Same gate as the external index: a row we cannot classify is a row we
    // cannot honestly show next to a curated entry.
    .filter((s) => s.category && (s.deliveries ?? 0) >= minDeliveries)
    .sort((a, b) => (b.volume_usd || 0) - (a.volume_usd || 0));

  return { services, stats };
}

export function buildL402SpaceDoc({ services, stats }, { generatedAt, source }) {
  const cats = {};
  for (const s of services) {
    const k = s.category + (s.subcategory ? '/' + s.subcategory : '');
    cats[k] = (cats[k] || 0) + 1;
  }
  return {
    $schema_note:
      'Gateway-observed tier — paid API hosts seen settling through l402.space, the Universal 402 Gateway built ' +
      'by Alby. Unlike every other tier here, these figures are OBSERVED SETTLEMENT rather than external probing: ' +
      'the gateway made the payments itself, so payments_received / deliveries is a real paid-and-got-the-goods ' +
      'rate and volume_usd is money that actually moved. Reliability is published only where deliveries >= ' +
      MIN_DELIVERIES_FOR_RELIABILITY + ' and always with its denominator — never a bare score. Rows carry a ' +
      '`rail`: "bitcoin-native" = payable directly in sats; "via-gateway" = it settles in USDC or Tempo ' +
      'upstream and is sats-payable only by handing sats to the gateway, which is a CUSTODIAL HOP and is stated, ' +
      'not smoothed away. Third-party observation, NOT a bitcoineconomy.ai endorsement and not our own ' +
      'measurement. Check the scale in `stats` before reading anything into a row count. Provenance: gateway-observed.',
    generated_at: generatedAt,
    source: source || 'l402.space/api/services + /api/stats',
    provenance: 'gateway-observed',
    attribution: {
      name: 'l402.space — Universal 402 Gateway',
      url: UPSTREAM_BASE + '/',
      by: 'Alby',
      docs: UPSTREAM_BASE + '/docs',
      note: 'Directory and settlement figures observed and published by l402.space; passed through with attribution. Verify at the source before trusting.',
    },
    trust_note:
      'A gateway that lets a sats-holding agent buy from USDC-settled APIs is a real answer to "there is nothing ' +
      'to buy with Lightning" — and it is also an intermediary holding the sats leg, which relieves the pressure ' +
      'that would otherwise push those sellers to accept Lightning directly. Both are true. Rows reached this way ' +
      'are labelled via-gateway so the trade-off stays visible at the point of decision.',
    reliability_method: {
      formula: 'reliability = deliveries / payments_received',
      published_when: 'deliveries >= ' + MIN_DELIVERIES_FOR_RELIABILITY,
      note: 'Below that threshold the ratio is noise (1/1 is not 100%), so reliability is null and the raw counters are shown instead. Recompute from tx_count / payments_received / deliveries on any row.',
    },
    stats: stats || null,
    count: services.length,
    lightning_native: services.filter((s) => s.rail === 'bitcoin-native').length,
    via_gateway: services.filter((s) => s.rail === 'via-gateway').length,
    categories: cats,
    services,
  };
}
