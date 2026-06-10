#!/usr/bin/env node
// sample-relays.mjs — local CLI twin of the worker's cron snapshot.
//
// Queries the public relays for the directory's live modules, probes every
// announced clearnet provider endpoint (liveness, latency, model count), builds
// the cross-provider models/price index, and prints the inventory summary.
// With --write, regenerates snapshot.json + models.json — the committed static
// fallbacks the UI and agents use when the worker's /live/* routes aren't
// available. All query + probe + shape logic lives in snapshot-lib.mjs (shared
// with worker.js); this file is just the Node runner.
//
// Usage:
//   node sample-relays.mjs            # print the summary
//   node sample-relays.mjs --write    # also write snapshot.json + models.json

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RELAYS, makeFilters, queryRelay, buildSnapshot, probeProviders, applyProbes, buildModelsIndex } from './snapshot-lib.mjs';

const connectNode = (url) => new Promise((resolve, reject) => {
  const ws = new WebSocket(url);
  const t = setTimeout(() => reject(new Error('connect timeout')), 8000);
  ws.addEventListener('open', () => { clearTimeout(t); resolve(ws); });
  ws.addEventListener('error', () => { clearTimeout(t); reject(new Error('connect failed')); });
});

const filters = makeFilters(Math.floor(Date.now() / 1000));
const results = await Promise.all(RELAYS.map((r) => queryRelay(connectNode, r, filters)));
const snapshot = buildSnapshot(results, {
  source: 'sample-relays.mjs (static snapshot)',
  generatedAt: new Date().toISOString(),
});

console.log('probing announced clearnet endpoints …');
const probes = await probeProviders(snapshot.modules.routstr.providers);
applyProbes(snapshot, probes, { probedAt: new Date().toISOString() });
const modelsIndex = buildModelsIndex(snapshot.modules.routstr.providers, probes, {
  generatedAt: new Date().toISOString(),
  source: 'sample-relays.mjs (static models index)',
});

const m = snapshot.modules;
console.log('=== relay status ===');
for (const r of snapshot.relays) console.log(`  ${r.url}: ${r.status}${r.unfinished.length ? ' (unfinished: ' + r.unfinished.join(',') + ')' : ''}`);
console.log('\n=== inventory (deduped across relays; replaceables deduped by pubkey+d) ===');
console.log(`  Routstr providers (38421): ${m.routstr.count} — probe: ${m.routstr.probe.alive} alive · ${m.routstr.probe.unreachable} unreachable · ${m.routstr.probe.unverified_tor_only} tor-only unverified · ${m.routstr.probe.unroutable} unroutable`);
for (const p of m.routstr.providers.slice(0, 40)) {
  const probe = p.status === 'alive' ? `ALIVE ${p.latency_ms}ms ${p.model_count} models` : p.status ?? '?';
  console.log(`    - ${p.name ?? '(unnamed)'} | ${probe} | ${p.network} | mints=${p.mints?.length ?? 0} | v=${p.version ?? '?'} | ${new Date(p.updated_at * 1000).toISOString().slice(0, 10)}`);
}
console.log(`  Models price-indexed across alive providers: ${modelsIndex.model_count}`);
console.log(`  Cashu mint announcements (38172): ${m.mints.cashu_count}`);
console.log(`  Fedimint announcements (38173): ${m.mints.fedimint_count}`);
console.log(`  Recommendations/reviews (38000): ${m.reviews.count}  by target kind: ${JSON.stringify(m.reviews.by_target_kind)}`);
console.log(`  NIP-89 handlers (31990): ${m.handlers.count}`);
console.log(`  DVM job requests, last 30d: ${m.dvm_jobs_30d.total}`);
for (const [k, n] of Object.entries(m.dvm_jobs_30d.by_kind).slice(0, 12)) console.log(`    kind ${k}: ${n}`);

if (process.argv.includes('--write')) {
  const here = dirname(fileURLToPath(import.meta.url));
  const snapOut = join(here, 'snapshot.json');
  writeFileSync(snapOut, JSON.stringify(snapshot, null, 2) + '\n');
  console.log(`\nwrote ${snapOut}`);
  // Minified on purpose: machine-only artifact, ~450 models — keeps the file
  // and its git churn small (the worker's KV copy is minified too).
  const modelsOut = join(here, 'models.json');
  writeFileSync(modelsOut, JSON.stringify(modelsIndex) + '\n');
  console.log(`wrote ${modelsOut}`);
}
