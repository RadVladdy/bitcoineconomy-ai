#!/usr/bin/env node
// fetch-external.mjs — local twin of the worker cron's external-tier refresh.
//
// Pulls the two outside sources and rebuilds the mastered directory, then with
// --write regenerates the committed static fallbacks the UI and agents fall back
// to when the worker's /live/* routes aren't available:
//
//   l402index.json — 402index.io's verified feed, selectively passed through
//   l402space.json — hosts observed settling through Alby's l402.space gateway
//   master.json    — all four sources merged into one row shape + vocabulary
//
// Selection and shaping logic is NOT here — it lives in l402index-lib.mjs,
// l402space-lib.mjs and master-lib.mjs, shared with worker.js, so the committed
// fallbacks and the live KV copies can never drift into different schemas.
//
// (Renamed from fetch-402index.mjs 2026-07-29 when the second external source
// and the merge were added; the old name only described one third of the job.)
//
// Usage:
//   node fetch-external.mjs            # print the summary
//   node fetch-external.mjs --write    # also write the three fallbacks

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetch402index, buildL402Index } from './l402index-lib.mjs';
import { fetchL402Space, buildL402SpaceDoc } from './l402space-lib.mjs';
import { buildMaster } from './master-lib.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const LIVE = 'https://marketplace.bitcoineconomy.ai';
const generatedAt = new Date().toISOString();
const write = process.argv.includes('--write');

const pct = (n) => (n == null ? '  ?' : String(Math.round(n)).padStart(3));

// Don't-overwrite-good-data, the CLI half of the rule the worker cron follows.
// Both upstreams flake (402index was observed 502-ing intermittently on
// 2026-07-29), and an empty tier is indistinguishable, to anyone reading the
// directory, from "nothing to sell here". So a tier that comes back empty keeps
// its previous committed document and says so loudly, rather than publishing a
// zero that looks like a fact.
const warnings = [];
function keepPreviousIfEmpty(file, doc, label) {
  if (doc?.count > 0) return doc;
  let prev = null;
  try { prev = JSON.parse(readFileSync(join(HERE, file), 'utf8')); } catch {}
  if (prev?.count > 0) {
    warnings.push(`${label} returned nothing this run — KEEPING the previous ${file} (${prev.count} rows, generated ${prev.generated_at}). Re-run before committing if you need it fresh.`);
    return prev;
  }
  warnings.push(`${label} returned nothing this run AND there is no good previous ${file} to fall back on.`);
  return doc;
}

// --- 402index (external-index tier) -------------------------------------------
const res = await fetch402index(fetch).catch((e) => {
  warnings.push('402index fetch threw: ' + e.message);
  return { services: [], scanned: 0, kept_lightning: 0, kept_gateway: 0, dropped_to_diversify: {}, dropped_over_per_host_cap: 0 };
});
const idx = keepPreviousIfEmpty(
  'l402index.json',
  buildL402Index(res, { generatedAt, source: 'fetch-external.mjs (static external-index fallback)' }),
  'external-index (402index.io)',
);

console.log('=== external-index tier (via 402index.io) ===');
console.log(`  scanned ${res.scanned} upstream · kept ${idx.count} (${idx.lightning_native} bitcoin-native, ${idx.via_gateway} via-gateway)`);
console.log(`  dropped ${res.dropped_over_per_host_cap} over the per-host cap · ${JSON.stringify(res.dropped_to_diversify)} over per-category caps`);
console.log('  categories:', JSON.stringify(idx.categories));

// --- l402.space (gateway-observed tier) ---------------------------------------
const spaceRes = await fetchL402Space(fetch).catch((e) => {
  warnings.push('l402.space fetch threw: ' + e.message);
  return { services: [], stats: null };
});
const space = keepPreviousIfEmpty(
  'l402space.json',
  buildL402SpaceDoc(spaceRes, { generatedAt, source: 'fetch-external.mjs (static gateway-observed fallback)' }),
  'gateway-observed (l402.space)',
);

console.log('\n=== gateway-observed tier (via l402.space) ===');
console.log(`  ${space.count} hosts (${space.lightning_native} bitcoin-native, ${space.via_gateway} via-gateway)`);
if (space.stats) {
  console.log(`  gateway scale to date: ${space.stats.transactions} transactions · $${(space.stats.volumeUsd ?? 0).toFixed(2)} · ${space.stats.endpoints} endpoints · ${space.stats.domains} domains`);
}
for (const s of space.services.slice(0, 8)) {
  console.log(`    - ${String(s.name).slice(0, 32).padEnd(32)} [${s.category}/${s.subcategory ?? '-'}] · $${(s.volume_usd ?? 0).toFixed(2)} · rel ${s.reliability == null ? ' n/a' : pct(s.reliability * 100) + '%'} (n=${s.reliability_denominator ?? 0})`);
}

// --- the mastered directory ----------------------------------------------------
// The relay snapshot and uptime doc come from the live routes: they are produced
// by the worker cron (relays need WebSockets), not by this CLI.
const live = async (path) => {
  try {
    const r = await fetch(LIVE + path);
    return r.ok ? await r.json() : null;
  } catch { return null; }
};
const [snapshot, uptime] = await Promise.all([live('/live/snapshot.json'), live('/live/uptime.json')]);
const directory = JSON.parse(readFileSync(join(HERE, 'directory.json'), 'utf8'));

const master = buildMaster({ directory, snapshot, l402index: idx, l402space: space, uptime }, { generatedAt, base: LIVE });

console.log('\n=== mastered directory ===');
console.log(`  ${master.count} services`);
console.log('  by source:', JSON.stringify(master.facets.source));
console.log('  by rail:  ', JSON.stringify(master.facets.rail));
console.log('  by category:', JSON.stringify(master.facets.category));
console.log(`  ${Object.keys(master.facets.subcategory).length} distinct subcategories · confidence ${JSON.stringify(master.facets.classification_confidence)}`);
for (const [k, v] of Object.entries(master.sources)) {
  if (!v.available) console.log(`  ⚠ source "${k}" unavailable this run — master.json reports available:false`);
}
const both = master.services.filter((s) => s.also_in);
if (both.length) {
  console.log(`  ${both.length} services corroborated across sources:`);
  for (const s of both) console.log(`    - ${s.name} (${s.source}) ← also in ${[...new Set(s.also_in.map((a) => a.source))].join(', ')}`);
}

if (warnings.length) {
  console.log('\n⚠ warnings');
  for (const w of warnings) console.log('  - ' + w);
}

if (write) {
  // Minified on purpose: machine-only artifacts — keeps the files + git churn small.
  // Sidecar the worker reads to decide whether this committed build is newer
  // than the KV copy the cron wrote — see serveMaster() in worker.js. Keeping it
  // tiny is the point: it's checked per request, master.json is ~150 KB.
  writeFileSync(join(HERE, 'master-version.json'), JSON.stringify({ generated_at: master.generated_at }) + '\n');
  console.log(`\nwrote ${join(HERE, 'master-version.json')}`);

  for (const [file, doc] of [['l402index.json', idx], ['l402space.json', space], ['master.json', master]]) {
    const out = join(HERE, file);
    writeFileSync(out, JSON.stringify(doc) + '\n');
    console.log(`\nwrote ${out}`);
  }
  if (warnings.length) console.log('\n⚠ One or more tiers reused their previous data — see the warnings above before committing.');
} else {
  console.log('\n(dry run — pass --write to regenerate l402index.json, l402space.json and master.json)');
}
