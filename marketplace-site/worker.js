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

import { RELAYS, makeFilters, queryRelay, buildSnapshot, probeProviders, applyProbes, buildModelsIndex, probeAnnounced, applyAnnouncedProbes } from './snapshot-lib.mjs';
import { fetch402index, buildL402Index } from './l402index-lib.mjs';
import { fetchL402Space, buildL402SpaceDoc } from './l402space-lib.mjs';
import { buildMaster } from './master-lib.mjs';
import { probeSelf, appendRun, buildUptimeDoc } from './uptime-lib.mjs';
import { handleMcp } from './mcp-lib.mjs';

const KV_SNAPSHOT = 'snapshot';
const KV_MODELS = 'models';
const KV_L402INDEX = 'l402index';
const KV_L402SPACE = 'l402space';
const KV_MASTER = 'master';
const KV_UPTIME = 'uptime';
const KV_UPTIME_HISTORY = 'uptime_history';
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
  let snap = null;
  try {
    const kv = await env.SNAPSHOT?.get(KV_SNAPSHOT);
    if (kv) snap = JSON.parse(kv);
  } catch {}
  // Fall back to the committed asset if KV is empty OR predates the announced
  // module (the window between this deploy and the first cron that writes it).
  if (!snap?.modules?.announced) {
    try {
      const asset = await env.ASSETS.fetch(new URL('/snapshot.json', origin));
      if (asset.ok) snap = await asset.json();
    } catch {}
  }
  const mod = snap?.modules?.announced;
  if (!mod) return new Response(JSON.stringify({ error: 'announced tier unavailable' }), { status: 503, headers });
  return new Response(JSON.stringify({
    $schema_note: 'Self-announced, agent-payable services published with the bitcoineconomy.ai "agent-payable service announcement" microstandard (Nostr kind ' + mod.kind + '). Permissionless and announced ≠ curated: taken as published, not endorsements; they graduate to the curated registry (/directory.json) only via verification. Trust signals per service: probe status (alive | unreachable | unverified-tor-only | unroutable), announcement_age_days, mint_health. Spec: ' + mod.spec + '. Part of https://marketplace.bitcoineconomy.ai.',
    generated_at: snap.generated_at,
    source: snap.source,
    provenance: 'live-from-relay',
    ...mod,
  }), { headers });
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
  const asset = await env.ASSETS.fetch(new URL(fallbackPath, origin));
  if (asset.ok) return new Response(asset.body, { headers });
  return new Response(JSON.stringify({ error: kvKey + ' unavailable' }), { status: 503, headers });
}

export default {
  async scheduled(controller, env, ctx) {
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
    let doc402 = null;
    let docSpace = null;
    try {
      const d = buildL402Index(await fetch402index(fetch), { generatedAt: new Date().toISOString(), source: 'worker-cron (via 402index.io)' });
      if (d.count > 0) { doc402 = d; await env.SNAPSHOT.put(KV_L402INDEX, JSON.stringify(d)); }
    } catch {}
    try {
      const d = buildL402SpaceDoc(await fetchL402Space(fetch), { generatedAt: new Date().toISOString(), source: 'worker-cron (via l402.space)' });
      if (d.count > 0) { docSpace = d; await env.SNAPSHOT.put(KV_L402SPACE, JSON.stringify(d)); }
    } catch {}

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
      const [directory, uptimeDoc, idx, space] = await Promise.all([
        env.ASSETS.fetch(new URL('/directory.json', SELF_BASE)).then((r) => (r.ok ? r.json() : null)).catch(() => null),
        lastGood(KV_UPTIME, null),
        lastGood(KV_L402INDEX, doc402),
        lastGood(KV_L402SPACE, docSpace),
      ]);
      const master = buildMaster(
        { directory, snapshot, l402index: idx, l402space: space, uptime: uptimeDoc },
        { generatedAt: new Date().toISOString(), base: SELF_BASE },
      );
      if (master.count > 0) await env.SNAPSHOT.put(KV_MASTER, JSON.stringify(master));
    } catch {}
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/mcp' || url.pathname === '/mcp/') return handleMcp(request, env, url.origin);
    if (url.pathname === '/live/master.json') return serveLive(env, url.origin, KV_MASTER, '/master.json');
    if (url.pathname === '/live/snapshot.json') return serveLive(env, url.origin, KV_SNAPSHOT, '/snapshot.json');
    if (url.pathname === '/live/models.json') return serveLive(env, url.origin, KV_MODELS, '/models.json');
    if (url.pathname === '/live/l402index.json') return serveLive(env, url.origin, KV_L402INDEX, '/l402index.json');
    if (url.pathname === '/live/l402space.json') return serveLive(env, url.origin, KV_L402SPACE, '/l402space.json');
    if (url.pathname === '/live/uptime.json') return serveLive(env, url.origin, KV_UPTIME, '/uptime.json');
    if (url.pathname === '/live/announced.json') return serveAnnounced(env, url.origin);
    return env.ASSETS.fetch(request);
  },
};
