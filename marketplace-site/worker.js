// worker.js — marketplace.bitcoineconomy.ai
//
// Two jobs:
//   scheduled (cron): query the public Nostr relays for the directory's live
//     modules (Routstr kind-38421 providers, NIP-87 38172/38173 mints, 38000
//     reviews, plus context stats) and write the snapshot to KV. Agent readers
//     and crawlers can't open WebSockets to relays — this snapshot IS the
//     agent-readable live surface.
//   fetch: serve /live/snapshot.json from KV (falling back to the committed
//     static snapshot.json asset if the cron hasn't run yet); everything else
//     falls through to the static assets.
//
// Query + snapshot-shape logic is shared with the local CLI via snapshot-lib.mjs.

import { RELAYS, makeFilters, queryRelay, buildSnapshot } from './snapshot-lib.mjs';

const KV_KEY = 'snapshot';

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

export default {
  async scheduled(controller, env, ctx) {
    const snapshot = await takeSnapshot();
    // Don't overwrite a good snapshot with an empty one if every relay failed.
    const gotData = snapshot.modules.routstr.count > 0 || snapshot.modules.mints.cashu_count > 0;
    if (gotData) {
      await env.SNAPSHOT.put(KV_KEY, JSON.stringify(snapshot));
    }
  },

  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/live/snapshot.json') {
      const headers = {
        'content-type': 'application/json; charset=utf-8',
        'access-control-allow-origin': '*',
        'cache-control': 'public, max-age=300',
      };
      const kv = await env.SNAPSHOT?.get(KV_KEY);
      if (kv) return new Response(kv, { headers });
      // Cron hasn't written yet (or KV unbound) — serve the committed fallback,
      // relabeled so consumers can tell which path they got.
      const asset = await env.ASSETS.fetch(new URL('/snapshot.json', url.origin));
      if (asset.ok) return new Response(asset.body, { headers });
      return new Response(JSON.stringify({ error: 'snapshot unavailable' }), { status: 503, headers });
    }

    return env.ASSETS.fetch(request);
  },
};
