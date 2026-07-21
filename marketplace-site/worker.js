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
import { fetch402indexL402, buildL402Index } from './l402index-lib.mjs';
import { handleMcp } from './mcp-lib.mjs';

const KV_SNAPSHOT = 'snapshot';
const KV_MODELS = 'models';
const KV_L402INDEX = 'l402index';

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

    // Wider L402 tier: a selective, attributed pass over 402index.io's verified-
    // L402 feed. Plain HTTPS fetch — cheap and independent of the relay path, so a
    // 402index outage never costs us the Nostr snapshot; non-fatal, and only
    // overwrites KV with a non-empty result.
    try {
      const res402 = await fetch402indexL402(fetch);
      const doc402 = buildL402Index(res402, { generatedAt: new Date().toISOString(), source: 'worker-cron (via 402index.io)' });
      if (doc402.count > 0) await env.SNAPSHOT.put(KV_L402INDEX, JSON.stringify(doc402));
    } catch {}
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/mcp' || url.pathname === '/mcp/') return handleMcp(request, env, url.origin);
    if (url.pathname === '/live/snapshot.json') return serveLive(env, url.origin, KV_SNAPSHOT, '/snapshot.json');
    if (url.pathname === '/live/models.json') return serveLive(env, url.origin, KV_MODELS, '/models.json');
    if (url.pathname === '/live/l402index.json') return serveLive(env, url.origin, KV_L402INDEX, '/l402index.json');
    if (url.pathname === '/live/announced.json') return serveAnnounced(env, url.origin);
    return env.ASSETS.fetch(request);
  },
};
