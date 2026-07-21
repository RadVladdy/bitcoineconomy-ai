#!/usr/bin/env node
// fetch-402index.mjs — local twin of the worker's Wider-L402 refresh.
//
// Pulls 402index.io's verified-L402 feed, applies the selective curation filter
// (l402index-lib.mjs — shared with the worker cron), prints a summary, and with
// --write regenerates l402index.json: the committed static fallback the UI and
// agents use when the worker's /live/l402index.json route isn't available.
//
// Usage:
//   node fetch-402index.mjs            # print the summary
//   node fetch-402index.mjs --write    # also write l402index.json

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetch402indexL402, buildL402Index } from './l402index-lib.mjs';

const res = await fetch402indexL402(fetch);
const doc = buildL402Index(res, { generatedAt: new Date().toISOString(), source: 'fetch-402index.mjs (static Wider-L402 index)' });

console.log('=== Wider L402 index (via 402index.io) ===');
console.log(`  scanned ${res.scanned} verified-L402 upstream (top-N by reliability) · kept ${doc.count} after filter (cap ${doc.filter.cap}, min reliability ${doc.filter.min_reliability})`);
console.log('  categories:', JSON.stringify(doc.categories));
for (const s of doc.services.slice(0, 15)) {
  console.log(`    - ${String(s.name).slice(0, 44).padEnd(44)} [${s.category}] · ${s.price_sats ?? '?'} sats · rel ${s.reliability_score ?? '?'} · ${s.host}`);
}

if (process.argv.includes('--write')) {
  const here = dirname(fileURLToPath(import.meta.url));
  const out = join(here, 'l402index.json');
  // Minified on purpose: machine-only artifact — keeps the file + its git churn small.
  writeFileSync(out, JSON.stringify(doc) + '\n');
  console.log(`\nwrote ${out}`);
}
