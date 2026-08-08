// worker.js — marketplace.bitcoineconomy.ai
//
// Two jobs:
//   scheduled (cron): query the public Nostr relays for the directory's live
//     modules (Routstr kind-38421 providers, NIP-87 38172/38173 mints, 38000
//     reviews, plus context stats), probe every announced clearnet provider
//     endpoint (liveness, latency, model count — announcements outlive nodes),
//     build the cross-provider models/price index, and write both artifacts to
//     KV. Agent readers and crawlers can't open WebSockets to relays — these
//     snapshots ARE the agent-readable live surface.
//   fetch: serve /live/snapshot.json + /live/models.json from KV (falling back
//     to the committed static assets if the cron hasn't run yet); everything
//     else falls through to the static assets.
//
// Query + probe + shape logic is shared with the local CLI via snapshot-lib.mjs.
//
// Free-plan note: the probe phase parses each alive provider's /v1/models
// response (the big ones are ~1–2 MB). If the cron ever hits the plan's CPU
// limit it fails whole — and the don't-overwrite-good-data rule below means KV
// simply keeps the previous snapshot. If that happens persistently, upgrade the
// plan or refresh via the local CLI (`node sample-relays.mjs --write`) instead.

import { RELAYS, makeFilters, queryRelay, buildSnapshot, probeProviders, applyProbes, buildModelsIndex, probeAnnounced, applyAnnouncedProbes, carryProbes } from './snapshot-lib.mjs';
import { fetch402index, buildL402Index } from './l402index-lib.mjs';
import { fetchL402Space, buildL402SpaceDoc } from './l402space-lib.mjs';
import { buildMaster } from './master-lib.mjs';
import { probeSelf, appendRun, buildUptimeDoc } from './uptime-lib.mjs';
import { handleMcp } from './mcp-lib.mjs';

// The curated registry is BUNDLED, not fetched.
//
// It is committed content that only ever changes at deploy time, so reading it
// over the network was always the wrong shape — and in the scheduled() handler
// it does not work at all. A cron invocation has no inbound request: both
// `env.ASSETS.fetch()` and an ordinary same-zone `fetch()` of our own
// /directory.json come back unusable there, while the identical read succeeds
// in the fetch() handler. The failure is silent, so for a month the 6-hourly
// merge dropped all 22 editor-verified rows and /live/master.json told agents
// there were no curated services at all.
//
// Importing it removes the failure mode instead of adding fallbacks around it:
// 46 KB in the bundle, no I/O, impossible to lose, and always exactly as fresh
// as the deploy — which is the correct semantics, since `npx wrangler deploy`
// is the only way a directory change goes live anyway.
//
// ⚠ Do NOT "optimise" this back into a fetch. It will appear to work, because
// every path you can test by hand runs in the fetch() handler.
import DIRECTORY from './directory.json';

const KV_SNAPSHOT = 'snapshot';
const KV_MODELS = 'models';
const KV_L402INDEX = 'l402index';
const KV_L402SPACE = 'l402space';
const KV_MASTER = 'master';
// The curated-registry stamp of the bundle that WROTE the KV master. serveMaster
// compares it against the bundle it is running as, which is the only way to tell
// that a KV copy predates the current deploy. See serveMaster.
const KV_MASTER_CURATED = 'master_curated_stamp';
const KV_UPTIME = 'uptime';
const KV_UPTIME_HISTORY = 'uptime_history';
// Per-tier fetch health for the two external tiers. Written by the 6-hourly pass,
// read by buildMaster so a frozen tier says so in-band instead of behind a 200.
const KV_TIER_HEALTH = 'tier_health';
const SELF_BASE = 'https://marketplace.bitcoineconomy.ai';

// Cloudflare client-WebSocket: fetch with an Upgrade header, then accept().
const connectWorker = async (url) => {
  const resp = await fetch(url.replace(/^wss:/, 'https:'), { headers: { Upgrade: 'websocket' } });
  const ws = resp.webSocket;
  if (!ws) throw new Error(`no websocket from ${url} (status ${resp.status})`);
  ws.accept();
  return ws;
};

async function takeSnapshot() {
  const filters = makeFilters(Math.floor(Date.now() / 1000));
  const results = await Promise.all(RELAYS.map((r) => queryRelay(connectWorker, r, filters)));
  return buildSnapshot(results, {
    source: 'worker-cron',
    generatedAt: new Date().toISOString(),
  });
}

// The announced tier lives inside the snapshot's modules.announced; project it
// out as its own route so an agent can fetch just the self-announced services
// (with their probe status + trust signals) without parsing the whole snapshot.
async function serveAnnounced(env, origin) {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'x-content-type-options': 'nosniff',
    'cache-control': 'public, max-age=300',
  };
  let snap = null, fromFallback = false;
  try {
    const kv = await env.SNAPSHOT?.get(KV_SNAPSHOT);
    if (kv) snap = JSON.parse(kv);
  } catch {}
  // Fall back to the committed asset if KV is empty OR predates the announced
  // module (the window between this deploy and the first cron that writes it).
  if (!snap?.modules?.announced) {
    try {
      const asset = await env.ASSETS.fetch(new URL('/snapshot.json', origin));
      if (asset.ok) { snap = await asset.json(); fromFallback = true; }
    } catch {}
  }
  const mod = snap?.modules?.announced;
  if (!mod) return new Response(JSON.stringify({ error: 'announced tier unavailable' }), { status: 503, headers });
  // Same rule as the bounty board, for the same reason — see serveBounties.
  if (fromFallback && !mod.count) {
    return new Response(JSON.stringify({
      error: 'announced tier unavailable',
      reason: 'The live snapshot could not be read, and the committed fallback is empty. An empty fallback cannot tell you whether nobody has announced a service or whether we simply failed to read the relays, so this route declines to answer rather than report a market as dead.',
      fallback_generated_at: snap.generated_at,
      fallback_coverage: snap.coverage ?? null,
    }), { status: 503, headers });
  }
  return new Response(JSON.stringify({
    $schema_note: 'Self-announced, agent-payable services published with the bitcoineconomy.ai "agent-payable service announcement" microstandard (Nostr kind ' + mod.kind + '). Permissionless and announced ≠ curated: taken as published, not endorsements; they graduate to the curated registry (/directory.json) only via verification. Trust signals per service: probe status (alive | unreachable | unverified-tor-only | unroutable), announcement_age_days, mint_health. Spec: ' + mod.spec + '. Part of https://marketplace.bitcoineconomy.ai.',
    generated_at: snap.generated_at,
    source: snap.source,
    provenance: 'live-from-relay',
    live: !fromFallback,
    coverage: snap.coverage ?? null,
    // `coverage.note` says the counts are "totals across the relays listed
    // below". That is true on /live/snapshot.json, where the list really is
    // below — but this route PROJECTS one module out of the snapshot and used to
    // leave the list behind, so it pointed at something that was not there.
    // Attached here rather than by rewording coverageOf(), which is correct
    // where it lives.
    relays: snap.relays ?? null,
    ...mod,
  }), { headers });
}

// The buy side lives inside the snapshot as modules.requests; project it out as
// its own route, for the same reason /live/announced.json exists. An agent
// looking for work should not have to pull the whole snapshot — which also
// carries the inference providers, the mint tiers, the review tallies and the
// DVM counts — to read a board of five rows.
//
// The framing is carried in-band on purpose and must not be trimmed to make the
// document smaller: `sats_offered_open` is OFFERED, not held, and `status` is
// what the poster published. This directory reads signed events; it does not
// escrow, arbitrate, verify delivery, or take a fee. A reader who fetches only
// this route still gets that, because it is the fact most likely to be assumed
// wrong — every other marketplace an agent has seen does hold the money.
async function serveBounties(env, origin) {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'x-content-type-options': 'nosniff',
    'cache-control': 'public, max-age=300',
  };
  let snap = null, fromFallback = false;
  try {
    const kv = await env.SNAPSHOT?.get(KV_SNAPSHOT);
    if (kv) snap = JSON.parse(kv);
  } catch {}
  // Fall back to the committed asset if KV is empty OR predates the requests
  // module — the same window serveAnnounced guards, between this deploy and the
  // first cron that writes the module.
  if (!snap?.modules?.requests) {
    try {
      const asset = await env.ASSETS.fetch(new Request(new URL('/snapshot.json', origin).toString()));
      if (asset.ok) { snap = await asset.json(); fromFallback = true; }
    } catch {}
  }
  const mod = snap?.modules?.requests;
  // An honest 503 rather than an empty board: "no bounties" and "we could not
  // read the board" are different answers, and an agent that cannot tell them
  // apart will conclude the market is dead when the reader is simply broken.
  if (!mod) return new Response(JSON.stringify({ error: 'work-request board unavailable' }), { status: 503, headers });
  // ...and the same rule again, one step further in, because the guard above
  // only caught the module being ABSENT. A committed fallback that is present
  // and EMPTY makes exactly the claim this route promises never to make, and it
  // was live: the fallback committed 2026-08-05 was built with two of four
  // relays failing and carried `requests: 0`, so any KV miss would have served
  // a confident 200 saying a board holding 130,000 sats had nothing on it.
  // A fallback cannot distinguish an empty market from a failed read — only a
  // live read can — so from the fallback, empty is never an answer.
  if (fromFallback && !mod.count) {
    return new Response(JSON.stringify({
      error: 'work-request board unavailable',
      reason: 'The live snapshot could not be read, and the committed fallback board is empty. An empty fallback cannot distinguish "no bounties have been posted" from "we could not read the relays", so this route declines to answer rather than report the market as dead.',
      fallback_generated_at: snap.generated_at,
      fallback_coverage: snap.coverage ?? null,
    }), { status: 503, headers });
  }
  return new Response(JSON.stringify({
    $schema_note: 'Signed offers to pay an agent in sats to do a job, published with the bitcoineconomy.ai "agent-payable work request" microstandard (Nostr kind ' + mod.kind + '). Buy-side sibling of the kind-38555 service announcement. This directory READS these events: it does not escrow, hold, arbitrate, verify delivery, take a fee, or run an account. `sats_offered_open` is offered, not held; `status` is as published by the poster, not verified by us. Claims and deliveries are NIP-22 comments (kind ' + mod.comment_kind + '); proof of payment is a NIP-57 zap receipt anyone can check. Act on: status === "open" && !expired && !malformed. Spec: ' + mod.spec + '. Part of https://marketplace.bitcoineconomy.ai.',
    generated_at: snap.generated_at,
    source: snap.source,
    provenance: 'live-from-relay',
    live: !fromFallback,
    coverage: snap.coverage ?? null,
    // `coverage.note` says the counts are "totals across the relays listed
    // below". That is true on /live/snapshot.json, where the list really is
    // below — but this route PROJECTS one module out of the snapshot and used to
    // leave the list behind, so it pointed at something that was not there.
    // Attached here rather than by rewording coverageOf(), which is correct
    // where it lives.
    relays: snap.relays ?? null,
    ...mod,
  }), { headers });
}

// Read a committed asset — **fetch() handler only.**
//
// `env.ASSETS.fetch()` must be handed a Request; passing a bare URL (which every
// call site here used to do) settles unusably, and the `.catch(() => null)`
// around it turns a binding misuse into "the file isn't there."
//
// Fixing that made these reads work here, in the request path. It did NOT make
// them work in scheduled() — see the DIRECTORY import above for why, and do not
// call this from a cron. Returns parsed JSON, or null if the file is genuinely
// unavailable; callers distinguish "absent" from "empty" and say so.
async function assetJson(env, path, origin) {
  try {
    const r = await env.ASSETS.fetch(new Request(new URL(path, origin).toString()));
    if (r.ok) return await r.json();
  } catch {}
  try {
    const r = await fetch(new URL(path, origin).toString());
    if (r.ok) return await r.json();
  } catch {}
  return null;
}

// The mastered directory is the one artifact built from BOTH committed content
// (the curated registry) and live data (the external sources). So the usual
// "KV always wins" rule is wrong for it: publishing a new curated card ships a
// fresher master.json in the assets, and until the next 6-hourly cron the KV
// copy would keep serving a directory that doesn't list a card the site has
// already published. Compare timestamps and serve whichever is actually newer.
//
// The comparison reads a tiny sidecar (master-version.json, ~60 bytes) rather
// than parsing the 150 KB document on every request.
async function serveMaster(env, origin) {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'x-content-type-options': 'nosniff',
    'cache-control': 'public, max-age=300',
  };
  const kv = await env.SNAPSHOT?.get(KV_MASTER).catch(() => null);
  if (!kv) return serveLive(env, origin, KV_MASTER, '/master.json');

  // A timestamp comparison alone cannot see a deploy that REMOVED a curated row.
  // On 2026-08-07 a deploy landed 12s before the hourly cron; the cron (running the
  // pre-deploy bundle) wrote a KV master that was NEWER by the clock and still listed
  // a venue the deploy had removed — so /live/master.json, find_service and the public
  // table served it, labelled "Curated — editor-verified", with an entry_md link that
  // 404'd, until the next cron. The fix is not a bigger timestamp check: it is asking
  // WHICH curated registry produced the KV copy. DIRECTORY is bundled, so it is always
  // this deploy's; the stamp beside the KV master is whichever deploy wrote it.
  const kvCurated = await env.SNAPSHOT?.get(KV_MASTER_CURATED).catch(() => null);
  if (DIRECTORY.generated_at && kvCurated !== null && DIRECTORY.generated_at > kvCurated) {
    const asset = await assetJson(env, '/master.json', origin);
    if (asset) return new Response(JSON.stringify(asset), { headers });
  }

  const assetStamp = (await assetJson(env, '/master-version.json', origin))?.generated_at || null;
  if (assetStamp) {
    // Only the KV copy's timestamp is needed; pull it without parsing the body.
    const m = /"generated_at"\s*:\s*"([^"]+)"/.exec(kv.slice(0, 4096));
    const kvStamp = m?.[1] || null;
    if (kvStamp && assetStamp > kvStamp) {
      const asset = await assetJson(env, '/master.json', origin);
      if (asset) return new Response(JSON.stringify(asset), { headers });
    }
  }
  return new Response(kv, { headers });
}

async function serveLive(env, origin, kvKey, fallbackPath) {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'x-content-type-options': 'nosniff',
    'cache-control': 'public, max-age=300',
  };
  const kv = await env.SNAPSHOT?.get(kvKey);
  if (kv) return new Response(kv, { headers });
  // Cron hasn't written yet (or KV unbound) — serve the committed fallback.
  const asset = await assetJson(env, fallbackPath, origin);
  if (asset) return new Response(JSON.stringify(asset), { headers });
  return new Response(JSON.stringify({ error: kvKey + ' unavailable' }), { status: 503, headers });
}

// The two cron cadences. They do deliberately different amounts of work.
//
// The relay read is cheap and the thing that needs to be fresh: a new bounty or
// a new kind-38555 announcement is invisible until the next run, and "your
// listing shows up within the hour" is a materially better promise than "within
// six hours". The PROBE is the expensive half — it fetches ~40 third-party
// endpoints (parsing /v1/models bodies of 1–2 MB) and appends to the rolling
// uptime history. Running that hourly would multiply the load we put on other
// people's services by six to learn almost nothing, since liveness does not
// change by the hour, and it would silently redefine the uptime window: the
// history keeps UPTIME_WINDOW_RUNS=120 runs, which is ~30 days at six-hourly
// and only ~5 days at hourly, while the published doc keeps claiming 30.
//
// So: hourly reads the relays and carries the last probe forward; the full pass
// stays six-hourly and owns everything probe-derived. The two are OFFSET (:47 vs
// :17) so they never fire in the same minute and race each other's KV writes.
const CRON_FULL = '17 */6 * * *';

// The external tiers get their OWN invocation, and therefore their own subrequest
// budget. Cloudflare caps subrequests per Worker invocation, and the full pass above
// spends nearly all of them before it reaches these two fetches — 4 relay reads + 27
// provider probes + 3 self-checks + 15 index queries. The gateway tier consequently
// failed with the literal error "Too many subrequests by single Worker invocation" on
// EVERY run for 105 hours while l402.space answered 200 the whole time. That is not a
// flaky upstream, it is deterministic starvation: the budget is gone before the call
// is made, so it can never recover on its own no matter how healthy the upstream is.
// Offset :37 so it collides with neither :47 nor :17.
const CRON_EXTERNAL = '37 */6 * * *';

// Fetch the two external tiers and rebuild the merged directory around them. Reads
// the snapshot and uptime docs from KV rather than re-probing — this pass exists to
// spend its whole budget on the two upstream fetches and nothing else.
async function refreshExternalTiers(env) {
  const readKV = async (key) => {
    try { return JSON.parse((await env.SNAPSHOT.get(key)) || 'null'); } catch { return null; }
  };
  const health = (await readKV(KV_TIER_HEALTH)) || {};
  const noteTier = (name, ok, err) => {
    const prev = health[name] || {};
    health[name] = ok
      ? { last_success: new Date().toISOString(), consecutive_failures: 0 }
      : {
          last_success: prev.last_success || null,
          consecutive_failures: (prev.consecutive_failures || 0) + 1,
          last_error: String(err?.message || err || 'unknown').slice(0, 200),
          last_failure: new Date().toISOString(),
        };
  };

  let doc402 = null, docSpace = null;
  try {
    const d = buildL402Index(await fetch402index(fetch), { generatedAt: new Date().toISOString(), source: 'worker-cron (via 402index.io)' });
    if (d.count > 0) { doc402 = d; await env.SNAPSHOT.put(KV_L402INDEX, JSON.stringify(d)); noteTier('external-index', true); }
    else noteTier('external-index', false, 'upstream returned 0 rows');
  } catch (err) { noteTier('external-index', false, err); }
  try {
    const d = buildL402SpaceDoc(await fetchL402Space(fetch), { generatedAt: new Date().toISOString(), source: 'worker-cron (via l402.space)' });
    if (d.count > 0) { docSpace = d; await env.SNAPSHOT.put(KV_L402SPACE, JSON.stringify(d)); noteTier('gateway-observed', true); }
    else noteTier('gateway-observed', false, 'upstream returned 0 rows');
  } catch (err) { noteTier('gateway-observed', false, err); }
  try { await env.SNAPSHOT.put(KV_TIER_HEALTH, JSON.stringify(health)); } catch {}

  try {
    const [snapshot, uptimeDoc, idx, space] = await Promise.all([
      readKV(KV_SNAPSHOT), readKV(KV_UPTIME),
      doc402 ? Promise.resolve(doc402) : readKV(KV_L402INDEX),
      docSpace ? Promise.resolve(docSpace) : readKV(KV_L402SPACE),
    ]);
    if (!snapshot) return;
    const master = buildMaster(
      { directory: DIRECTORY, snapshot, l402index: idx, l402space: space, uptime: uptimeDoc, tierHealth: health },
      { generatedAt: new Date().toISOString(), base: SELF_BASE },
    );
    if (master.count > 0 && master.sources?.curated?.rows_contributed > 0) {
      await env.SNAPSHOT.put(KV_MASTER, JSON.stringify(master));
      await env.SNAPSHOT.put(KV_MASTER_CURATED, DIRECTORY.generated_at || '');
    }
  } catch {}
}

// The hourly pass. Everything it publishes is either freshly read from the
// relays or explicitly carried forward and labelled as such — it never computes
// a probe-derived number, because it never probed.
async function refreshFromRelays(env) {
  const snapshot = await takeSnapshot();
  // Same don't-overwrite-good-data rule as the full pass: a run where every
  // relay failed must not blank a good snapshot.
  if (!(snapshot.modules.routstr.count > 0 || snapshot.modules.mints.cashu_count > 0)) return;

  const readKV = async (key) => {
    try { return JSON.parse((await env.SNAPSHOT.get(key)) || 'null'); } catch { return null; }
  };

  const previous = await readKV(KV_SNAPSHOT);
  if (previous) carryProbes(snapshot, previous);
  await env.SNAPSHOT.put(KV_SNAPSHOT, JSON.stringify(snapshot));

  // Rebuild the merged directory so the curated tier picks up the fresh relay
  // rows too. Every non-relay tier comes from its last good KV copy — this pass
  // deliberately does not refetch them.
  try {
    const [uptimeDoc, idx, space, tierHealth] = await Promise.all([
      readKV(KV_UPTIME), readKV(KV_L402INDEX), readKV(KV_L402SPACE), readKV(KV_TIER_HEALTH),
    ]);
    const master = buildMaster(
      { directory: DIRECTORY, snapshot, l402index: idx, l402space: space, uptime: uptimeDoc, tierHealth },
      { generatedAt: new Date().toISOString(), base: SELF_BASE },
    );
    if (master.count > 0 && master.sources?.curated?.rows_contributed > 0) {
      await env.SNAPSHOT.put(KV_MASTER, JSON.stringify(master));
      await env.SNAPSHOT.put(KV_MASTER_CURATED, DIRECTORY.generated_at || '');
    }
  } catch {}
}

export default {
  async scheduled(controller, env, ctx) {
    // The hourly pass: re-read the relays so the board and the announced tier are
    // at most an hour stale, carry the probe forward, and touch nothing that is
    // probe-derived — no uptime history append, no models index rebuild, no
    // external-tier refetch. Those all belong to the full pass and stay on their
    // own six-hourly clock.
    if (controller.cron === CRON_EXTERNAL) return refreshExternalTiers(env);
    if (controller.cron && controller.cron !== CRON_FULL) return refreshFromRelays(env);

    const snapshot = await takeSnapshot();
    // Don't overwrite a good snapshot with an empty one if every relay failed.
    const gotData = snapshot.modules.routstr.count > 0 || snapshot.modules.mints.cashu_count > 0;
    if (!gotData) return;

    // Probe the announced clearnet endpoints; a probe-phase failure must not
    // cost us the relay snapshot, so it degrades to an unprobed snapshot.
    let modelsIndex = null;
    try {
      const probes = await probeProviders(snapshot.modules.routstr.providers);
      applyProbes(snapshot, probes, { probedAt: new Date().toISOString() });
      modelsIndex = buildModelsIndex(snapshot.modules.routstr.providers, probes, {
        generatedAt: new Date().toISOString(),
        source: 'worker-cron (models index)',
      });
    } catch {}

    // Probe the self-announced services (our microstandard, kind 38555) with the
    // generic liveness probe — independent of the inference probe above, and
    // likewise non-fatal.
    try {
      const aProbes = await probeAnnounced(snapshot.modules.announced.services);
      applyAnnouncedProbes(snapshot, aProbes, { probedAt: new Date().toISOString() });
    } catch {}

    await env.SNAPSHOT.put(KV_SNAPSHOT, JSON.stringify(snapshot));
    // Same rule for the index: keep the previous one rather than store nothing.
    if (modelsIndex && modelsIndex.providers_alive > 0) {
      await env.SNAPSHOT.put(KV_MODELS, JSON.stringify(modelsIndex));
    }

    // Trust layer: fold this run's probe outcomes (announced tiers + our own
    // surfaces, probed via the public hostname like any caller) into the rolling
    // uptime history, and publish the recomputable uptime doc. Non-fatal — an
    // uptime-phase failure must never cost the snapshot; history simply skips a
    // run (runs_held shows the gap honestly).
    try {
      const selfProbes = await probeSelf(fetch, SELF_BASE);
      let history = null;
      try { history = JSON.parse((await env.SNAPSHOT.get(KV_UPTIME_HISTORY)) || 'null'); } catch {}
      history = appendRun(history, snapshot, selfProbes, { at: new Date().toISOString() });
      await env.SNAPSHOT.put(KV_UPTIME_HISTORY, JSON.stringify(history));
      await env.SNAPSHOT.put(KV_UPTIME, JSON.stringify(buildUptimeDoc(history, { generatedAt: new Date().toISOString() })));
    } catch {}

    // External tiers: 402index.io's verified feed and Alby's l402.space gateway.
    // Plain HTTPS fetches — cheap and independent of the relay path, so an outage
    // at either never costs us the Nostr snapshot. Each is non-fatal and only
    // overwrites KV with a non-empty result (don't-overwrite-good-data).
    //
    // The guard is right and stays. What was missing is that it is SILENT: on
    // 2026-08-06 the l402.space tier was found frozen for 82 hours — roughly a
    // dozen consecutive failed runs against an upstream that was answering 200
    // the whole time — and nothing anywhere said so. The route served its stale
    // rows behind a confident 200, and master.json reported the tier
    // `available: true`. Keeping the last good data is correct; not saying how
    // old it is, and not counting how long it has been failing, is not.
    //
    // So each attempt now records its outcome. `tierHealth` is written to KV and
    // read back by buildMaster, which publishes age and consecutive_failures per
    // tier. A run that succeeds resets the counter; a run that fails increments
    // it and leaves the good data in place, exactly as before.
    const health = JSON.parse((await env.SNAPSHOT.get(KV_TIER_HEALTH)) || '{}');
    const noteTier = (name, ok, err) => {
      const prev = health[name] || {};
      health[name] = ok
        ? { last_success: new Date().toISOString(), consecutive_failures: 0 }
        : {
            last_success: prev.last_success || null,
            consecutive_failures: (prev.consecutive_failures || 0) + 1,
            last_error: String(err?.message || err || 'unknown').slice(0, 200),
            last_failure: new Date().toISOString(),
          };
    };

    // The two external-tier fetches used to live HERE and were starved of
    // subrequests by everything above them. They now have their own cron
    // (CRON_EXTERNAL, :37) and their own budget. This pass reads their last good
    // KV copies below, exactly as it already did for a tier that failed.
    const doc402 = null;
    const docSpace = null;
    try { await env.SNAPSHOT.put(KV_TIER_HEALTH, JSON.stringify(health)); } catch {}

    // The mastered directory: all four sources merged into one row shape and one
    // category vocabulary. Built last, from whatever this run produced — and for
    // any tier that failed THIS run, from its last good KV copy, so one flaky
    // upstream doesn't blank a whole tier of the merged table. A tier with no
    // data at all is simply absent, and master.json's `sources` block reports
    // `available: false` rather than the table silently shrinking.
    try {
      const lastGood = async (key, fresh) => {
        if (fresh) return fresh;
        try { return JSON.parse((await env.SNAPSHOT.get(key)) || 'null'); } catch { return null; }
      };
      const [uptimeDoc, idx, space] = await Promise.all([
        lastGood(KV_UPTIME, null),
        lastGood(KV_L402INDEX, doc402),
        lastGood(KV_L402SPACE, docSpace),
      ]);
      const master = buildMaster(
        { directory: DIRECTORY, snapshot, l402index: idx, l402space: space, uptime: uptimeDoc, tierHealth: health },
        { generatedAt: new Date().toISOString(), base: SELF_BASE },
      );
      // Belt and braces on top of the bundled import: a master that lost the
      // curated tier is worse than a stale one, because it tells an agent there
      // are no editor-verified services at all. Refuse to publish one.
      const keptCurated = master.sources?.curated?.rows_contributed > 0;
      if (master.count > 0 && keptCurated) {
        await env.SNAPSHOT.put(KV_MASTER, JSON.stringify(master));
        await env.SNAPSHOT.put(KV_MASTER_CURATED, DIRECTORY.generated_at || '');
      }
    } catch {}
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/mcp' || url.pathname === '/mcp/') return handleMcp(request, env, url.origin);
    if (url.pathname === '/live/master.json') return serveMaster(env, url.origin);
    if (url.pathname === '/live/snapshot.json') return serveLive(env, url.origin, KV_SNAPSHOT, '/snapshot.json');
    if (url.pathname === '/live/models.json') return serveLive(env, url.origin, KV_MODELS, '/models.json');
    if (url.pathname === '/live/l402index.json') return serveLive(env, url.origin, KV_L402INDEX, '/l402index.json');
    if (url.pathname === '/live/l402space.json') return serveLive(env, url.origin, KV_L402SPACE, '/l402space.json');
    if (url.pathname === '/live/uptime.json') return serveLive(env, url.origin, KV_UPTIME, '/uptime.json');
    if (url.pathname === '/live/announced.json') return serveAnnounced(env, url.origin);
    if (url.pathname === '/live/bounties.json') return serveBounties(env, url.origin);
    return env.ASSETS.fetch(request);
  },
};
