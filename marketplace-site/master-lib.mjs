// master-lib.mjs — the mastered directory.
//
// One table. Every service an agent can pay for is one row in the SAME shape,
// classified in the SAME vocabulary, whatever tier it came from. Where a row
// came from is a FILTER (`source`), not a separate directory.
//
// The invariant this protects: a reader looking for "inference I can pay for in
// sats" searches ONE place, in ONE vocabulary. Splitting the directory by
// provenance costs three row shapes, three sets of category strings and three
// intro paragraphs, and any tier with no members renders an empty table.
// Provenance is a property OF a row, not a reason to put it somewhere else.
//
// The four sources, and what each is actually worth:
//
//   curated          — editor-verified against primary sources. The only tier
//                      where a human checked the claims. Sorts first.
//   announced        — self-listed on Nostr (our kind-38555 microstandard).
//                      Permissionless, probed for liveness, NOT endorsed.
//   external-index   — 402index.io's verified feed, selectively passed through
//                      with attribution. Third-party-indexed AND third-party-
//                      verified; breadth we didn't hand-check.
//   gateway-observed — hosts seen settling through Alby's l402.space. The only
//                      tier whose numbers come from actual payments rather than
//                      probes: deliveries / payments_received is a real
//                      paid-and-got-the-goods rate.
//
// The honesty rules carry over unchanged, per-row rather than per-tab:
//   - provenance is labeled on every row; `curated` is a claim about editorial
//     verification and nothing else earns it
//   - trust figures ship with their denominator and their formula; never a bare
//     score (the Phase-2 trust-layer rule, applied to the merged shape)
//   - the upstream's own raw category survives in `source_category`, so our
//     classification is checkable
//   - `rail` states whether an agent pays in sats DIRECTLY or only by handing
//     sats to an intermediary — a real difference, kept visible at the point of
//     decision rather than averaged into "payable"

import { CATEGORY_ORDER, CATEGORIES, vocabularyDoc } from './taxonomy.mjs';

export const SOURCES = {
  curated: {
    label: 'Curated',
    provenance: 'curated',
    blurb: 'Editor-verified against primary sources on the date shown. The only rows a human checked.',
  },
  announced: {
    label: 'Self-announced',
    provenance: 'live-from-relay',
    blurb: 'Self-listed by the service itself via a signed Nostr announcement (kind 38555) — permissionless, probed for liveness, taken as published. Announced ≠ curated.',
  },
  'external-index': {
    label: 'Indexed',
    provenance: 'external-index',
    blurb: 'Passed through from 402index.io with attribution — third-party-indexed and third-party-verified, not our endorsements.',
  },
  'gateway-observed': {
    label: 'Gateway-observed',
    provenance: 'gateway-observed',
    blurb: 'Seen settling through Alby\'s l402.space gateway. The figures are observed payments, not probes — but they are a third party\'s observations, not ours.',
  },
};

export const SOURCE_ORDER = ['curated', 'announced', 'gateway-observed', 'external-index'];

// Payment methods that mean an agent pays in Bitcoin without an intermediary
// holding the sats leg.
const BITCOIN_NATIVE_METHODS = new Set(['lightning', 'l402', 'cashu', 'nwc', 'zaps', 'onchain', 'liquid', 'spark']);

// Three rails, not two. `via-gateway` is a specific claim — "sats-payable through
// l402.space" — and applying it to a service that takes only fiat would be a
// straightforward lie about a payment route that does not exist. A curated entry
// with no Bitcoin method and no gateway route is `fiat-only`: an agent holding
// sats cannot buy it at all, which is exactly the fact worth surfacing.
function railForMethods(methods = []) {
  const m = methods.map((x) => String(x).toLowerCase());
  if (m.some((x) => BITCOIN_NATIVE_METHODS.has(x))) return 'bitcoin-native';
  if (m.includes('fiat')) return 'fiat-only';
  return 'via-gateway';
}

/** The shared row shape. Every source normalizes INTO this and nothing else. */
function row(o) {
  return {
    id: o.id,
    name: o.name,
    description: o.description || null,
    category: o.category || null,
    subcategory: o.subcategory || null,
    source_category: o.source_category ?? null,
    classification_confidence: o.classification_confidence || null,
    source: o.source,
    provenance: SOURCES[o.source].provenance,
    rail: o.rail,
    payment_methods: o.payment_methods || [],
    payment_network: o.payment_network || null,
    payment_asset: o.payment_asset || null,
    protocol: o.protocol || null,
    price: o.price || null,
    kyc: o.kyc || null,
    custody: o.custody || null,
    automatability: o.automatability || null,
    auth: o.auth || null,
    api_base: o.api_base || null,
    quickstart: o.quickstart || null,
    mcp_endpoint: o.mcp_endpoint || null,
    two_sided: o.two_sided || null,
    trust: o.trust || null,
    observed: o.observed || null,
    links: o.links || {},
    last_verified: o.last_verified || null,
    last_seen: o.last_seen || null,
  };
}

// --- per-source normalizers ----------------------------------------------------

function fromCurated(dir) {
  return (dir?.entries || []).map((e) => row({
    id: 'curated:' + e.slug,
    name: e.name,
    description: e.what_an_agent_buys || e.summary,
    category: e.category,
    subcategory: e.subcategory || null,
    source_category: null,          // we authored the category; there is no upstream
    classification_confidence: 'exact',
    source: 'curated',
    rail: railForMethods(e.payment_methods),
    payment_methods: e.payment_methods,
    payment_detail: e.payment_detail,
    kyc: e.kyc,
    custody: e.custody,
    automatability: e.automatability,
    auth: e.auth,
    api_base: e.api_base,
    quickstart: e.quickstart,
    mcp_endpoint: e.mcp_endpoint,
    two_sided: e.two_sided,
    links: {
      site: e.links?.site || null,
      docs: e.links?.docs || null,
      card: e.card_url || null,
      entry_md: e.entry_md || null,
      pricing: e.pricing_url || null,
    },
    last_verified: e.last_verified || null,
  }));
}

function fromAnnounced(snapshot, uptime) {
  const mod = snapshot?.modules?.announced;
  return (mod?.services || []).map((s) => {
    const up = uptime?.targets?.[`announced:${s.d}`] || null;
    return row({
      id: 'announced:' + (s.d || s.pubkey?.slice(0, 12)),
      name: s.name || s.d || '(unnamed announcement)',
      description: s.what_an_agent_buys || s.summary || null,
      category: s.category || null,
      subcategory: s.subcategory || null,
      source_category: s.category || null,
      classification_confidence: s.category ? 'exact' : 'unmapped',
      source: 'announced',
      rail: railForMethods(s.payment_methods),
      payment_methods: s.payment_methods || [],
      payment_network: s.network || null,
      auth: s.auth,
      api_base: s.api_base,
      quickstart: s.quickstart,
      trust: {
        status: s.probe?.status || null,
        latency_ms: s.probe?.latency_ms ?? null,
        uptime_pct: up?.uptime_pct ?? null,
        uptime_denominator: up?.uptime_denominator ?? null,
        method: 'Liveness probe on the 6-hourly full refresh (the directory re-reads the relays hourly; that pass carries the last probe forward and says so); rolling uptime recomputable from the raw runs in /live/uptime.json. Announcements outlive their nodes — dead ≠ delisted, and onion-only endpoints cannot be probed from this infrastructure (unverified, not dead).',
        accepted_mints: s.accepted_mints || [],
        announcement_age_days: s.announcement_age_days ?? null,
      },
      links: {
        site: s.links?.site || null,
        docs: s.links?.docs || null,
        pricing: s.pricing_url || null,
        endpoint: s.api_base || (s.urls || [])[0] || null,
        spec: 'https://marketplace.bitcoineconomy.ai/spec/agent-payable-service-announcement.md',
      },
      last_seen: s.updated_at ? new Date(s.updated_at * 1000).toISOString() : null,
    });
  });
}

function fromExternalIndex(doc) {
  return (doc?.services || []).map((s) => row({
    id: 'x402index:' + s.id,
    name: s.name,
    description: s.description,
    category: s.category,
    subcategory: s.subcategory,
    source_category: s.source_category,
    classification_confidence: s.classification_confidence,
    source: 'external-index',
    rail: s.rail,
    payment_methods: s.protocol ? [s.protocol] : [],
    payment_network: s.payment_network,
    payment_asset: s.payment_asset,
    protocol: s.protocol,
    price: (s.price_sats != null || s.price_usd != null)
      ? { sats_min: s.price_sats, sats_max: s.price_sats, usd_min: s.price_usd, usd_max: s.price_usd }
      : null,
    trust: {
      status: s.health_status,
      reliability_pct: s.reliability_score ?? null,
      uptime_pct: s.uptime_30d != null ? Math.round(s.uptime_30d * 1000) / 10 : null,
      latency_ms: s.latency_p50_ms ?? null,
      last_checked: s.last_checked,
      method: 'Health, reliability score and 30-day uptime as measured and published by 402index.io — a third party. Not our measurement; verify at the source record.',
    },
    links: {
      endpoint: s.url,
      source_page: s.source_page,
      gateway_url: s.gateway_url,
    },
  }));
}

function fromGatewayObserved(doc) {
  return (doc?.services || []).map((s) => row({
    id: s.id,
    name: s.name,
    description: s.description,
    category: s.category,
    subcategory: s.subcategory,
    source_category: null,
    classification_confidence: s.classification_confidence,
    source: 'gateway-observed',
    rail: s.rail,
    payment_network: s.payment_network,
    price: (s.price_usd_min != null || s.price_usd_max != null)
      ? { sats_min: null, sats_max: null, usd_min: s.price_usd_min, usd_max: s.price_usd_max }
      : null,
    trust: {
      status: s.deliveries ? 'settling' : null,
      reliability_pct: s.reliability != null ? Math.round(s.reliability * 1000) / 10 : null,
      reliability_denominator: s.reliability_denominator,
      method: 'reliability = deliveries / payments_received, observed by l402.space at settlement. Published only where deliveries >= 5, always with its denominator — below that the ratio is noise. Recompute from the raw counters in `observed`.',
      last_checked: s.last_activity,
    },
    observed: {
      tx_count: s.tx_count,
      volume_usd: s.volume_usd,
      payments_received: s.payments_received,
      deliveries: s.deliveries,
    },
    links: {
      docs: s.docs,
      endpoint: s.host ? 'https://' + s.host + '/' : null,
      source_page: s.source_page,
      gateway_url: s.gateway_url,
    },
    last_seen: s.last_activity,
  }));
}

// --- merge ---------------------------------------------------------------------

// Same service reachable through more than one source (e.g. PPQ.AI is a curated
// entry AND appears in 402index AND settles through the gateway). Collapse on
// host so the table doesn't show it three times — keeping the HIGHEST-authority
// row and recording the others in `also_in`, so the corroboration is visible
// rather than thrown away.
//
// ACROSS sources only. Within one source a shared host is not a duplicate:
// 402index registers one row per PATH, so `llm402.ai/chat` and `llm402.ai/embed`
// are genuinely different things to buy. Collapsing those would silently delete
// most of the tier (it did, on the first pass — 75 rows became 12). The
// per-host cap that keeps a single host from flooding the table belongs at
// INGEST, in l402index-lib.mjs, not here.
function hostOf(r) {
  const cand = r.api_base || r.links?.endpoint || r.links?.site;
  if (!cand) return null;
  try { return new URL(cand).host.replace(/^www\./, '').toLowerCase(); } catch { return null; }
}

function dedupe(rows) {
  const rank = Object.fromEntries(SOURCE_ORDER.map((s, i) => [s, i]));
  const byHost = new Map();
  const out = [];
  for (const r of rows.slice().sort((a, b) => rank[a.source] - rank[b.source])) {
    const h = hostOf(r);
    if (!h) { out.push(r); continue; }
    const prev = byHost.get(h);
    if (!prev) { byHost.set(h, r); out.push(r); continue; }
    if (prev.source === r.source) { out.push(r); continue; }   // same tier, different endpoint
    (prev.also_in ??= []).push({
      source: r.source,
      provenance: r.provenance,
      rail: r.rail,
      trust: r.trust || null,
      observed: r.observed || null,
      source_page: r.links?.source_page || null,
      gateway_url: r.links?.gateway_url || null,
    });
    // A corroborating row can still contribute a payment route the winner lacks.
    if (!prev.links.gateway_url && r.links?.gateway_url) prev.links.gateway_url = r.links.gateway_url;
  }
  return out;
}

/**
 * Build the mastered directory.
 *
 * Every input is optional — a source that failed to refresh is simply absent,
 * and `sources[].available` says so rather than the table silently shrinking.
 */
export function buildMaster({ directory, snapshot, l402index, l402space, uptime }, { generatedAt, base = 'https://marketplace.bitcoineconomy.ai' } = {}) {
  const parts = [
    ['curated', fromCurated(directory), directory],
    ['announced', fromAnnounced(snapshot, uptime), snapshot],
    ['gateway-observed', fromGatewayObserved(l402space), l402space],
    ['external-index', fromExternalIndex(l402index), l402index],
  ];

  const all = dedupe(parts.flatMap(([, rows]) => rows));

  // Display order: curated first, then Bitcoin-native before gateway-only, then
  // by category order, then by name. The sovereignty-first rule the curated
  // registry has always used, extended across the merged table.
  const srcRank = Object.fromEntries(SOURCE_ORDER.map((s, i) => [s, i]));
  const catRank = Object.fromEntries(CATEGORY_ORDER.map((c, i) => [c, i]));
  const railRank = { 'bitcoin-native': 0, 'via-gateway': 1, 'fiat-only': 2 };
  all.sort((a, b) =>
    srcRank[a.source] - srcRank[b.source] ||
    (railRank[a.rail] ?? 3) - (railRank[b.rail] ?? 3) ||
    (catRank[a.category] ?? 99) - (catRank[b.category] ?? 99) ||
    String(a.name).localeCompare(String(b.name)),
  );

  const tally = (key) => {
    const t = {};
    for (const r of all) {
      const k = typeof key === 'function' ? key(r) : r[key];
      if (k == null) continue;
      t[k] = (t[k] || 0) + 1;
    }
    return t;
  };

  return {
    $schema_note:
      'THE MASTERED DIRECTORY — every service an agent can pay for, from all four sources, in one row shape and ' +
      'one category vocabulary. Where a row came from is the `source` field, not a separate document: curated ' +
      '(editor-verified) · announced (self-listed on Nostr, permissionless, not endorsed) · gateway-observed ' +
      "(seen settling through Alby's l402.space — observed payments, not probes) · external-index (402index.io's " +
      'verified feed, passed through with attribution). Merged 2026-07-29, replacing three separate tabs with ' +
      'their own shapes and vocabularies. Read `sources` for what each tier means and whether it refreshed, ' +
      '`vocabulary` for the two-level category scheme, and `rail` on each row for whether an agent pays in sats ' +
      'DIRECTLY (bitcoin-native) or only by handing sats to an intermediary (via-gateway) — the tier-source ' +
      'documents remain at /directory.json, /live/announced.json, /live/l402index.json and /live/l402space.json ' +
      'for anyone who wants one source unmixed.',
    name: 'The Marketplace directory — mastered',
    url: base + '/live/master.json',
    generated_at: generatedAt,
    count: all.length,
    honesty_rules: {
      provenance_per_row: 'Every row states its source and provenance. Only editor-verified rows are `curated`; nothing else earns that label.',
      never_a_bare_score: 'Trust figures ship with their denominator and the formula that produced them, so a skeptic recomputes rather than trusts.',
      raw_input_survives: 'The upstream\'s own category string is kept in `source_category` and our confidence in `classification_confidence`, so the classification is checkable and disputable.',
      rail_is_not_smoothed: 'A row payable only through a gateway is labelled via-gateway. Paying that way means trusting an intermediary with the sats leg; the directory states it rather than averaging it into "payable".',
      dedupe_is_additive: 'A service found in more than one source appears once, under its highest-authority row, with the corroborating observations kept in `also_in`.',
    },
    sources: Object.fromEntries(parts.map(([key, rows, doc]) => [key, {
      ...SOURCES[key],
      available: Boolean(doc),
      rows_contributed: rows.length,
      generated_at: doc?.generated_at || null,
      attribution: doc?.attribution || null,
      document: {
        curated: base + '/directory.json',
        announced: base + '/live/announced.json',
        'external-index': base + '/live/l402index.json',
        'gateway-observed': base + '/live/l402space.json',
      }[key],
    }])),
    vocabulary: vocabularyDoc(),
    rails: {
      'bitcoin-native': 'An agent pays this in Bitcoin directly — Lightning, L402, Cashu, on-chain or another Bitcoin rail. No intermediary holds the sats leg.',
      'via-gateway': 'This settles in USDC or another non-Bitcoin asset upstream. A sats-holding agent can still buy it by paying l402.space, which pays the upstream on its behalf — a real payment route AND a custodial hop. `links.gateway_url` is the pre-built URL.',
      'fiat-only': 'No Bitcoin payment path at all: this takes a bank/card leg and no gateway route reaches it. An agent holding only sats cannot buy this. Listed because it is otherwise agent-drivable, not because it is payable in Bitcoin.',
    },
    facets: {
      source: tally('source'),
      rail: tally('rail'),
      category: tally('category'),
      subcategory: tally((r) => (r.category && r.subcategory ? r.category + '/' + r.subcategory : null)),
      payment_network: tally('payment_network'),
      classification_confidence: tally('classification_confidence'),
    },
    category_titles: Object.fromEntries(CATEGORY_ORDER.map((c) => [c, CATEGORIES[c].title])),
    services: all,
  };
}
