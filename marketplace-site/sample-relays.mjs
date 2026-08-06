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
//   node sample-relays.mjs                    # print the summary
//   node sample-relays.mjs --write            # also write snapshot.json + models.json
//   node sample-relays.mjs --write --allow-partial   # write even if it regresses
//
// --write is gated: it refuses to replace the committed fallback with a run
// that is WORSE than it (fewer relays complete, or a module count falling to
// zero). Rule + rationale: checkWriteRegression in snapshot-lib.mjs.

import { writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RELAYS, makeFilters, queryRelay, buildSnapshot, checkWriteRegression, probeProviders, applyProbes, buildModelsIndex, probeAnnounced, applyAnnouncedProbes } from './snapshot-lib.mjs';

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

console.log('probing announced services (kind 38555) …');
const annProbes = await probeAnnounced(snapshot.modules.announced.services);
applyAnnouncedProbes(snapshot, annProbes, { probedAt: new Date().toISOString() });

const m = snapshot.modules;
console.log('=== relay status ===');
for (const r of snapshot.relays) console.log(`  ${r.url}: ${r.status}${r.unfinished.length ? ' (unfinished: ' + r.unfinished.join(',') + ')' : ''}`);
const cov = snapshot.coverage;
console.log(`  coverage: ${cov.relays_complete}/${cov.relays_queried} relays complete — ${cov.complete ? 'COMPLETE (counts are totals)' : 'PARTIAL (counts are lower bounds)'}`);
console.log('\n=== inventory (deduped across relays; replaceables deduped by pubkey+d) ===');
console.log(`  Routstr providers (38421): ${m.routstr.count} — probe: ${m.routstr.probe.alive} alive · ${m.routstr.probe.unreachable} unreachable · ${m.routstr.probe.unverified_tor_only} tor-only unverified · ${m.routstr.probe.unroutable} unroutable`);
for (const p of m.routstr.providers.slice(0, 40)) {
  const probe = p.status === 'alive' ? `ALIVE ${p.latency_ms}ms ${p.model_count} models` : p.status ?? '?';
  console.log(`    - ${p.name ?? '(unnamed)'} | ${probe} | ${p.network} | mints=${p.mints?.length ?? 0} | v=${p.version ?? '?'} | ${new Date(p.updated_at * 1000).toISOString().slice(0, 10)}`);
}
console.log(`  Models price-indexed across alive providers: ${modelsIndex.model_count}`);
const ap = m.announced.probe;
console.log(`  Self-announced services (38555): ${m.announced.count}${ap ? ` — probe: ${ap.alive} alive · ${ap.unreachable} unreachable · ${ap.unverified_tor_only} tor-only · ${ap.unroutable} unroutable` : ''}`);
for (const s of m.announced.services.slice(0, 20)) {
  const probe = s.status === 'alive' ? `ALIVE ${s.latency_ms}ms` : s.status ?? '?';
  console.log(`    - ${s.name ?? s.d ?? '(unnamed)'} [${s.category ?? '?'}] | ${probe} | ${s.network} | mints=${s.mint_health?.healthy ?? 0}/${s.mint_health?.claimed ?? 0} | age=${s.announcement_age_days ?? '?'}d`);
}
console.log(`  Cashu mint announcements (38172): ${m.mints.cashu_count}`);
console.log(`  Fedimint announcements (38173): ${m.mints.fedimint_count}`);
console.log(`  Recommendations/reviews (38000): ${m.reviews.count}  by target kind: ${JSON.stringify(m.reviews.by_target_kind)}`);
console.log(`  NIP-89 handlers (31990): ${m.handlers.count}`);
console.log(`  DVM job requests, last 30d: ${m.dvm_jobs_30d.total}`);
for (const [k, n] of Object.entries(m.dvm_jobs_30d.by_kind).slice(0, 12)) console.log(`    kind ${k}: ${n}`);

if (process.argv.includes('--write')) {
  const here = dirname(fileURLToPath(import.meta.url));
  const snapOut = join(here, 'snapshot.json');

  let prev = null;
  try { prev = JSON.parse(readFileSync(snapOut, 'utf8')); } catch {}
  const reasons = checkWriteRegression(snapshot, prev);
  if (reasons.length && !process.argv.includes('--allow-partial')) {
    console.error('\n✗ REFUSING TO WRITE — this run is worse than the committed snapshot:');
    for (const r of reasons) console.error(`    - ${r}`);
    console.error('  Nothing was written. The committed fallback is unchanged.');
    console.error('  Re-run when the relays are answering, or pass --allow-partial to');
    console.error('  overwrite deliberately (the snapshot records its own coverage either way).');
    process.exit(1);
  }
  if (reasons.length) {
    console.warn('\n⚠ --allow-partial: writing a snapshot that is worse than the committed one:');
    for (const r of reasons) console.warn(`    - ${r}`);
  }

  writeFileSync(snapOut, JSON.stringify(snapshot, null, 2) + '\n');
  console.log(`\nwrote ${snapOut}`);
  // Minified on purpose: machine-only artifact, ~450 models — keeps the file
  // and its git churn small (the worker's KV copy is minified too).
  const modelsOut = join(here, 'models.json');
  writeFileSync(modelsOut, JSON.stringify(modelsIndex) + '\n');
  console.log(`wrote ${modelsOut}`);
}
