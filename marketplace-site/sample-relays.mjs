#!/usr/bin/env node
// sample-relays.mjs — local CLI twin of the worker's cron snapshot.
//
// Queries the public relays for the directory's live modules and prints the
// inventory summary. With --write, regenerates snapshot.json — the committed
// static fallback the UI and agents use when the worker's /live/snapshot.json
// isn't available. All query + shape logic lives in snapshot-lib.mjs (shared
// with worker.js); this file is just the Node runner.
//
// Usage:
//   node sample-relays.mjs            # print the summary
//   node sample-relays.mjs --write    # also write snapshot.json

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RELAYS, makeFilters, queryRelay, buildSnapshot } from './snapshot-lib.mjs';

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

const m = snapshot.modules;
console.log('=== relay status ===');
for (const r of snapshot.relays) console.log(`  ${r.url}: ${r.status}${r.unfinished.length ? ' (unfinished: ' + r.unfinished.join(',') + ')' : ''}`);
console.log('\n=== inventory (deduped across relays; replaceables deduped by pubkey+d) ===');
console.log(`  Routstr providers (38421): ${m.routstr.count}`);
for (const p of m.routstr.providers.slice(0, 30)) {
  console.log(`    - ${p.name ?? '(unnamed)'} | ${p.urls?.join(' , ')} | mints=${p.mints?.length ?? 0} | v=${p.version ?? '?'} | ${new Date(p.updated_at * 1000).toISOString().slice(0, 10)}`);
}
console.log(`  Cashu mint announcements (38172): ${m.mints.cashu_count}`);
console.log(`  Fedimint announcements (38173): ${m.mints.fedimint_count}`);
console.log(`  Recommendations/reviews (38000): ${m.reviews.count}  by target kind: ${JSON.stringify(m.reviews.by_target_kind)}`);
console.log(`  NIP-89 handlers (31990): ${m.handlers.count}`);
console.log(`  DVM job requests, last 30d: ${m.dvm_jobs_30d.total}`);
for (const [k, n] of Object.entries(m.dvm_jobs_30d.by_kind).slice(0, 12)) console.log(`    kind ${k}: ${n}`);

if (process.argv.includes('--write')) {
  const out = join(dirname(fileURLToPath(import.meta.url)), 'snapshot.json');
  writeFileSync(out, JSON.stringify(snapshot, null, 2) + '\n');
  console.log(`\nwrote ${out}`);
}
