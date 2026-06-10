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

import { RELAYS, makeFilters, queryRelay, buildSnapshot, probeProviders, applyProbes, buildModelsIndex } from './snapshot-lib.mjs';

const KV_SNAPSHOT = 'snapshot';
const KV_MODELS = 'models';

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

async function serveLive(env, origin, kvKey, fallbackPath) {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
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

    await env.SNAPSHOT.put(KV_SNAPSHOT, JSON.stringify(snapshot));
    // Same rule for the index: keep the previous one rather than store nothing.
    if (modelsIndex && modelsIndex.providers_alive > 0) {
      await env.SNAPSHOT.put(KV_MODELS, JSON.stringify(modelsIndex));
    }
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/live/snapshot.json') return serveLive(env, url.origin, KV_SNAPSHOT, '/snapshot.json');
    if (url.pathname === '/live/models.json') return serveLive(env, url.origin, KV_MODELS, '/models.json');
    return env.ASSETS.fetch(request);
  },
};
