// snapshot-lib.mjs — shared relay-query + snapshot-shape logic.
//
// Used by BOTH:
//   sample-relays.mjs  (local CLI; Node's built-in WebSocket)
//   worker.js          (Cloudflare Worker cron; fetch-Upgrade client WebSocket)
// so the committed fallback snapshot and the cron-written KV snapshot always
// share one schema. Change the shape here, never in the consumers.

// The board's READ set — and, because `build.mjs` imports this list into both
// specs, the exact set we tell strangers to publish to. Those two must never
// drift: advertising a relay we cannot read is how a conformant post lands
// somewhere the directory never looks.
//
// ⚠ THIS IS NOT THE PUBLISHING SET. Our own identities write through
// ~/dev/nostr-publisher, which has its own strategy and its own reasons. Same
// protocol, different job: that set optimizes OUR reach, this one optimizes
// whether we can SEE what other people published.
//
// Membership is earned on evidence, re-checkable by anyone:
//   * up on repeated sampling, not once;
//   * serves unregistered 38xxx kinds (a relay that whitelists kinds is useless
//     to a microstandard — verified with kind 38383, which has real traffic, so
//     an empty result means "no data" rather than "relay refuses the range");
//   * FREE TO WRITE. This list is an instruction to strangers, so payment or
//     auth on it is a paywall between someone and our own board.
//
// That last rule is why no paid relay is here and it is not a cost decision.
// nostr.wine wants 18,888 sats admission AND restricts writes; filter.nostr.wine
// adds NIP-42 auth on top. Paying would not even buy the thing that is broken:
// payment does not stop downtime, and downtime is the entire problem.
//
// 2026-08-06 — `relay.nostr.band` REPLACED by `nostr.bitcoiner.social`. Nostr.band
// answered 0 of 3 sampling rounds, timed out on NIP-11, and returned 522 to both
// this box and the Cloudflare Worker for days. Independent corroboration rather
// than just our own probe: NIP-66 monitors have effectively stopped reporting on
// it — its newest kind-30166 report is ~5,700 HOURS old from a single monitor,
// against 0-hour-old reports from 16–38 monitors for the other three.
// bitcoiner.social replaces it on measurement: up 3/3, strfry, free, a different
// operator, and it was ALREADY carrying all five live bounties, so the swap
// needed no re-broadcast. (`relay.damus.io` stays despite sampling 2/3 — it
// serves the whole board when up, 37 monitors still report on it hourly, and the
// `coverage` block now makes its flapping visible instead of silent.)
export const RELAYS = [
  'wss://nos.lol',
  'wss://relay.primal.net',
  'wss://relay.damus.io',
  'wss://nostr.bitcoiner.social',
];

import { CATEGORY_ORDER, CATEGORIES } from './taxonomy.mjs';

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

// The BUY side — "agent-payable work request". The sell side answers "what can
// an agent buy?"; this answers "what will someone pay an agent to do?", which is
// the half that makes listing worth doing at all. A seller who publishes a 38555
// into a market with no buyers gets a row in a directory and nothing else, which
// is precisely why the announced tier sat at zero for a month.
//
// Cleared the same two ways 38555 was, on 2026-08-04: (1) the NIP kind registry
// has nothing anywhere in 385xx — the only 38xxx allocations are 38172/38173
// (NIP-87 mints) and 38383 (NIP-69 Mostro); and (2) a live sweep of 38554-38558
// across seven relays came back empty on all five kinds, with the harness proved
// in the same run by pulling 682 kind-38383, 9 kind-38172 and 3 kind-38421
// events over the identical code path. An all-zero sweep is worthless unless you
// make it find something first.
//
// Exactly ONE new kind is allocated for the whole buy side. Claims and deliveries
// reuse NIP-22 comments (kind 1111); proof of payment reuses NIP-57 zap receipts
// (kind 9735), so "this bounty was paid" is verifiable by a third party without
// this project ever holding, escrowing, or attesting to anything.
export const KIND_REQUEST = 38556;

// Borrowed, not allocated: claims and deliveries are NIP-22 comments and proof
// of payment is a NIP-57 zap receipt. Both already render in every client that
// speaks those NIPs, and both are checkable by a third party without this site
// holding, escrowing or attesting to anything.
export const KIND_COMMENT = 1111;
export const REQUEST_STATUSES = ['open', 'claimed', 'delivered', 'settled', 'withdrawn'];

export function makeFilters(nowSec) {
  return {
    routstr: { kinds: [38421], limit: 500 },
    announced: { kinds: [KIND_ANNOUNCE], limit: 500 },
    cashu: { kinds: [38172], limit: 500 },
    fedimint: { kinds: [38173], limit: 500 },
    reviews: { kinds: [38000], limit: 500 },
    handlers: { kinds: [31990], limit: 500 },
    // The buy side. `requests` is the board itself; `claims` are the NIP-22
    // comments scoped to it — filtered on the uppercase `K` root-kind tag rather
    // than pulling every kind-1111 on the relay, which would be most of Nostr.
    requests: { kinds: [KIND_REQUEST], limit: 500 },
    claims: { kinds: [KIND_COMMENT], '#K': [String(KIND_REQUEST)], limit: 500 },
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
  // Optional second-level placement, so a self-listing service lands in the same
  // two-level scheme as every other row rather than only at the top level.
  // Unrecognised values are dropped rather than displayed — an announcement can
  // claim any subcategory it likes, and the vocabulary is ours to keep coherent.
  const subRaw = (tag(ev, 'sub')[0] || c.subcategory || '').toLowerCase().trim();
  const sub = subRaw && CATEGORIES[k]?.subcategories.includes(subRaw) ? subRaw : undefined;
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
    subcategory: sub,
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

// Parse one kind-38556 work request. Tag grammar per the spec: d=stable request
// id · k=category · sub=subcategory · amount=MILLISATS (NIP-57's units, same name
// and same units deliberately, so a zap receipt compares without a conversion) ·
// pay=settlement method(s) · status · expiration (NIP-40) · u=context url(s) ·
// t=freeform topic. Title/brief/acceptance/deliverable ride in content JSON.
//
// Two things this parser refuses to do, both load-bearing:
//   - it never computes or infers a status. `status` is what the poster
//     published, full stop; the only thing that overrides it is NIP-40 expiry,
//     which is arithmetic on a published timestamp, not a judgement.
//   - it never treats a request without an `acceptance` string as complete.
//     `acceptance` is what separates a bounty from a wish (spec § tags), so a
//     request missing it is surfaced as malformed rather than quietly rendered.
function parseRequest(ev, nowSec) {
  const c = parseContentObj(ev);
  const k = (tag(ev, 'k')[0] || '').toLowerCase();
  const subRaw = (tag(ev, 'sub')[0] || '').toLowerCase().trim();
  const sub = subRaw && CATEGORIES[k]?.subcategories.includes(subRaw) ? subRaw : undefined;
  const d = tag(ev, 'd')[0];

  // Millisats in, millisats kept — plus a sats figure for display, floored so a
  // partial sat is never rounded up into a larger-looking offer.
  const msatRaw = tag(ev, 'amount')[0];
  const msats = /^\d+$/.test(msatRaw || '') ? Number(msatRaw) : null;

  const declared = (tag(ev, 'status')[0] || '').toLowerCase();
  const status = REQUEST_STATUSES.includes(declared) ? declared : 'open';
  const expRaw = tag(ev, 'expiration')[0];
  const expiration = /^\d+$/.test(expRaw || '') ? Number(expRaw) : null;
  const expired = expiration != null && nowSec > 0 && expiration < nowSec;

  const links = {};
  if (c.links && typeof c.links === 'object') {
    for (const key of ['context', 'spec', 'repo', 'site']) {
      if (c.links[key]) links[key] = String(c.links[key]);
    }
  }

  const acceptance = typeof c.acceptance === 'string' ? c.acceptance.trim() : '';

  return {
    id: ev.id,
    d,
    address: d ? `${KIND_REQUEST}:${ev.pubkey}:${d}` : undefined,
    title: (typeof c.title === 'string' && c.title.trim()) || undefined,
    brief: (typeof c.brief === 'string' && c.brief.trim()) || undefined,
    acceptance: acceptance || undefined,
    deliverable: c.deliverable || undefined,
    category: CATEGORY_ORDER.includes(k) ? k : (k || undefined),
    subcategory: sub,
    amount_msats: msats,
    amount_sats: msats == null ? null : Math.floor(msats / 1000),
    pay: tag(ev, 'pay').map((p) => p.toLowerCase()),
    status,
    // Expiry is shown as its own axis rather than overwriting the published
    // status — "open, but expired" is the honest reading of a stale request,
    // and collapsing it to "closed" would be us deciding on the poster's behalf.
    expiration,
    expired,
    topics: tag(ev, 't'),
    context_urls: tag(ev, 'u'),
    links,
    malformed: !acceptance || msats == null || !d
      ? [!d && 'missing d', msats == null && 'missing or non-numeric amount', !acceptance && 'missing acceptance'].filter(Boolean)
      : undefined,
    pubkey: ev.pubkey,
    updated_at: ev.created_at,
  };
}

// NIP-22 comments scoped to a request. A claim is a comment carrying a `status`
// tag; anything else scoped to the request is just a comment and is counted, not
// promoted. We report what was published against each request — we never decide
// that a claim is valid, and we never decide that work was delivered.
function indexClaims(events) {
  const by = new Map();
  for (const ev of events) {
    const addr = (tag(ev, 'A')[0] || tag(ev, 'a')[0] || '').trim();
    if (!addr.startsWith(`${KIND_REQUEST}:`)) continue;
    const st = (tag(ev, 'status')[0] || '').toLowerCase();
    const entry = by.get(addr) || { comments: 0, claimed: 0, delivered: 0, latest_at: 0, proofs: [] };
    entry.comments += 1;
    if (st === 'claimed') entry.claimed += 1;
    if (st === 'delivered') {
      entry.delivered += 1;
      const proof = tag(ev, 'proof')[0];
      if (proof) entry.proofs.push(proof);
    }
    entry.latest_at = Math.max(entry.latest_at, ev.created_at || 0);
    by.set(addr, entry);
  }
  return by;
}

// Derived from the per-relay results; shared by buildSnapshot and by the
// writer's regression gate, so "was this run complete?" is answered in exactly
// one place rather than re-derived by each caller.
export function coverageOf(perRelayResults) {
  const incomplete = perRelayResults.filter((r) => r.status !== 'ok' || r.unfinished.length > 0);
  return {
    relays_queried: perRelayResults.length,
    relays_complete: perRelayResults.length - incomplete.length,
    relays_incomplete: incomplete.map((r) => ({ url: r.url, status: r.status, unfinished: r.unfinished })),
    complete: incomplete.length === 0,
    note: incomplete.length === 0
      ? 'Every queried relay answered every filter. The counts in this snapshot are totals across the relays listed below.'
      : 'PARTIAL READ — the relays in `relays_incomplete` did not answer every filter, so every count in this snapshot is a LOWER BOUND, not a total. Anything published only to those relays is missing from it. Absence here is not evidence of absence.',
  };
}

// The counts a regression would show up in. Enumerated rather than walked
// generically so that adding a module is a deliberate act here too.
export function snapshotCounts(s) {
  return {
    routstr: s.modules?.routstr?.count ?? 0,
    announced: s.modules?.announced?.count ?? 0,
    requests: s.modules?.requests?.count ?? 0,
    cashu: s.modules?.mints?.cashu_count ?? 0,
    fedimint: s.modules?.mints?.fedimint_count ?? 0,
    reviews: s.modules?.reviews?.count ?? 0,
    handlers: s.modules?.handlers?.count ?? 0,
  };
}

// Snapshots written before `coverage` existed still carry `relays[]`, so derive
// it with the SAME function rather than a second copy of the rule.
function coverageAsWritten(s) {
  return s.coverage ?? coverageOf(
    (s.relays ?? []).map((r) => ({ url: r.url, status: r.status, unfinished: r.unfinished ?? [] })));
}

// ── The write gate for the committed fallback ────────────────────────────────
// snapshot.json is what the UI renders and what the Worker serves when KV is
// empty. Overwriting it with a worse run is silent — the file looks exactly as
// authoritative either way — and it has already happened: the copy committed
// 2026-08-05 was built with TWO of four relays failing, so it carried a bounty
// board of zero while five funded requests sat on relays that run never reached.
//
// This is a REGRESSION test, not a completeness test, and the distinction is
// load-bearing. Refusing every partial would be wrong: `relay.nostr.band` has
// been answering 522 to both this box and the Worker, so a 3-of-4 read IS the
// steady state, and a gate that fires on every run just teaches whoever runs it
// to type the override flag reflexively until it stops meaning anything. What
// must never happen quietly is trading a better file for a worse one.
//
// Returns a list of human-readable reasons; empty means safe to write.
export function checkWriteRegression(next, prev) {
  if (!prev) return [];
  const reasons = [];
  const a = coverageAsWritten(prev), b = next.coverage ?? coverageAsWritten(next);
  if (b.relays_complete < a.relays_complete) {
    reasons.push(`relay coverage would drop ${a.relays_complete}/${a.relays_queried} → ${b.relays_complete}/${b.relays_queried}`);
  }
  const pc = snapshotCounts(prev), nc = snapshotCounts(next);
  for (const k of Object.keys(nc)) {
    // Non-zero → zero is the shape that matters: a module emptying out is what
    // an unreached relay looks like, and zero is the count that gets rendered
    // as a sentence about the world ("none have been published yet").
    if (pc[k] > 0 && nc[k] === 0) reasons.push(`modules.${k} would go ${pc[k]} → 0`);
  }
  return reasons;
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
  const requestEvents = dedupeReplaceable(bySub.requests ?? []);
  const claimIndex = indexClaims(bySub.claims ?? []);

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

  const requests = requestEvents.map((ev) => parseRequest(ev, nowSec));
  for (const r of requests) {
    const c = r.address ? claimIndex.get(r.address) : null;
    r.claims = c ? { comments: c.comments, claimed: c.claimed, delivered: c.delivered, proofs: c.proofs, latest_at: c.latest_at } : { comments: 0, claimed: 0, delivered: 0, proofs: [] };
  }
  // Open and unexpired first — that is the only cohort an agent can act on —
  // then by size, then by recency.
  const actionable = (r) => r.status === 'open' && !r.expired && !r.malformed;
  requests.sort((a, b) =>
    (actionable(b) ? 1 : 0) - (actionable(a) ? 1 : 0) ||
    (b.amount_sats ?? 0) - (a.amount_sats ?? 0) ||
    (b.updated_at ?? 0) - (a.updated_at ?? 0));

  const byStatus = {};
  for (const s of REQUEST_STATUSES) byStatus[s] = 0;
  let expiredCount = 0, malformedCount = 0;
  for (const r of requests) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    if (r.expired) expiredCount += 1;
    if (r.malformed) malformedCount += 1;
  }
  const openActionable = requests.filter(actionable);
  const satsOfferedOpen = openActionable.reduce((t, r) => t + (r.amount_sats ?? 0), 0);

  const reviewsByTargetKind = {};
  for (const ev of reviews) {
    const k = tag(ev, 'k')[0] ?? tag(ev, 'a')[0]?.split(':')[0] ?? 'untagged';
    reviewsByTargetKind[k] = (reviewsByTargetKind[k] ?? 0) + 1;
  }

  return {
    generated_at: generatedAt,
    source,
    provenance: 'live-from-relay',
    // Coverage — the one field that says whether the counts below are TOTALS or
    // LOWER BOUNDS. `relays[]` has carried the per-relay result all along, but
    // reading it means walking an array and matching status strings, so nothing
    // ever did: a snapshot built from a subset of the relays is a **silent
    // partial**, complete-looking and short. The committed fallback shipped one
    // for a day — two of four relays failed, so it published an empty bounty
    // board while five funded requests sat on relays it never reached, and the
    // page rendered "No work requests have been published yet."
    //
    // A relay counts as covering this snapshot only when it finished EVERY
    // filter. A `timeout` that returned some events is still a hole: the events
    // it did not return are indistinguishable from events that do not exist,
    // which is the whole failure mode this field exists to name.
    coverage: coverageOf(perRelayResults),
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
      requests: {
        kind: KIND_REQUEST,
        comment_kind: KIND_COMMENT,
        spec: 'https://marketplace.bitcoineconomy.ai/spec/agent-payable-work-request.md',
        count: requests.length,
        open_actionable: openActionable.length,
        by_status: byStatus,
        expired: expiredCount,
        malformed: malformedCount,
        // OFFERED, never held. There is no escrow here and no account: a poster
        // publishes an intention to pay and settles counterparty-to-counterparty.
        // Naming this field `sats_escrowed` or even `sats_available` would be a
        // lie in one word, so it carries the verb it earned and the cohort it
        // was summed over.
        sats_offered_open: satsOfferedOpen,
        sats_offered_denominator: openActionable.length,
        note: 'Signed work requests published with our "agent-payable work request" microstandard (kind ' + KIND_REQUEST + '): an offer to pay an agent in sats to do a job. Status is as published by the poster — this directory reads the events, it does not escrow, arbitrate, verify delivery, or take a fee. Claims and deliveries are NIP-22 comments (kind ' + KIND_COMMENT + '); payment proof is a NIP-57 zap receipt, checkable by any third party. `sats_offered_open` is offered, not held.',
        requests,
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

// Copy the previous run's probe results onto a freshly-read snapshot.
//
// Honesty rules, both load-bearing:
//   - `probed_at` keeps the ORIGINAL probe timestamp. An hourly snapshot must
//     never claim its liveness data is an hour old when it is up to six.
//   - a provider or service announced since the last full pass simply carries no
//     probe fields. "Not probed yet" is the truth; inventing a status for it,
//     or inheriting a neighbour's, would be worse than the gap.
// Counts are recomputed from what actually carried, so the summary always
// matches the rows beneath it even when the announced set changed underneath.
export function carryProbes(fresh, previous) {
  const pairs = [
    ['routstr', 'providers', 'd', ['status', 'latency_ms', 'model_count']],
    ['announced', 'services', 'slug', ['status', 'latency_ms', 'http_status', 'l402']],
  ];
  for (const [modName, listName, key, fields] of pairs) {
    const mod = fresh.modules?.[modName];
    const prevMod = previous?.modules?.[modName];
    if (!mod || !prevMod?.probe) continue;
    const byKey = new Map((prevMod[listName] ?? []).map((row) => [row[key], row]));
    const counts = { alive: 0, unreachable: 0, 'unverified-tor-only': 0, unroutable: 0 };
    for (const row of mod[listName] ?? []) {
      const prev = byKey.get(row[key]);
      if (!prev?.status) continue;
      for (const f of fields) if (prev[f] !== undefined) row[f] = prev[f];
      counts[prev.status] = (counts[prev.status] ?? 0) + 1;
    }
    mod.probe = {
      ...prevMod.probe,
      alive: counts.alive,
      unreachable: counts.unreachable,
      unverified_tor_only: counts['unverified-tor-only'],
      unroutable: counts.unroutable,
      carried_forward: true,
      carried_note: 'This snapshot was refreshed from the relays on the hourly cron; the liveness figures are the last full probe run, carried forward unchanged. `probed_at` is that run\'s timestamp, not this one\'s. Anything announced since then carries no status at all rather than a guessed one. The full probe runs every 6 hours.',
    };
  }
  return fresh;
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
