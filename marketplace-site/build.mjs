#!/usr/bin/env node
// build.mjs — generates the marketplace directory's static artifacts.
//
// Reads the main site's card files (src/_raw/{services,exchanges,tools}) — the
// single source of truth for names, links, KYC, custody, and verification dates —
// merges directory-overlay.json (category, what-an-agent-buys, payment methods,
// automatability tier), and writes:
//
//   directory.json     the curated registry core (the agent-readable registry)
//   entries/{slug}.md  one clean Markdown route per entry
//   llms.txt           the agent manifest for the subdomain
//
// Run from marketplace-site/:  node build.mjs
// Regenerate + commit whenever cards or the overlay change.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const RAW = join(HERE, '..', 'src', '_raw');
const BASE = 'https://marketplace.bitcoineconomy.ai';
const MAIN = 'https://bitcoineconomy.ai';

// --- minimal frontmatter parser (covers the card files' shapes only) ---------
function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new Error('no frontmatter');
  const fm = {};
  let nest = null;
  for (const line of m[1].split('\n')) {
    if (/^\s*-\s/.test(line)) continue; // list items (tags, bridges) — not needed
    const indented = /^\s{2,}\S/.test(line);
    const mm = line.match(/^(\s*)([\w-]+):\s*(.*)$/);
    if (!mm) continue;
    const [, , key, rawVal] = mm;
    let val = rawVal.trim();
    if (/^".*"$/.test(val) || /^'.*'$/.test(val)) val = val.slice(1, -1);
    if (indented && nest) { fm[nest][key] = val; continue; }
    if (val === '') { nest = key; fm[key] = {}; continue; }
    nest = null;
    fm[key] = val;
  }
  return { fm, body: text.slice(m[0].length) };
}

// --- load + merge -------------------------------------------------------------
const overlay = JSON.parse(readFileSync(join(HERE, 'directory-overlay.json'), 'utf8'));

const entries = overlay.entries.map((ov) => {
  const { fm } = parseFrontmatter(readFileSync(join(RAW, ov.source), 'utf8'));
  const collection = ov.source.split('/')[0];
  const links = {};
  if (fm.site || fm.links?.site) links.site = fm.site || fm.links.site;
  if (fm.docs || fm.links?.['api-docs']) links.docs = fm.docs || fm.links['api-docs'];
  if (fm.repo) links.repo = fm.repo;
  const verified = (fm['last-verified'] || fm['links-verified'] || '').slice(0, 10);
  return {
    slug: ov.slug,
    name: fm.name || fm.title,
    category: ov.category,
    summary: ov.summary || fm.tagline,
    what_an_agent_buys: ov.what_an_agent_buys,
    payment_methods: ov.payment_methods,
    payment_detail: fm.payment || undefined,
    kyc: ov.kyc || fm.kyc || undefined,
    custody: ov.custody || fm.custody || undefined,
    automatability: ov.automatability,
    two_sided: fm['two-sided'] || undefined,
    maintainer: fm.maintainer || undefined,
    links,
    card_url: `${MAIN}/${collection}/${ov.slug}`,
    entry_md: `${BASE}/entries/${ov.slug}.md`,
    provenance: 'curated',
    last_verified: verified || undefined,
    note: ov.note || undefined,
  };
});

const categories = [...new Set(entries.map((e) => e.category))];

const directory = {
  $schema_note:
    'Curated registry of agentic + Bitcoin-payable services an autonomous agent can consume. ' +
    'provenance "curated" = maintained by the editors and verified against primary sources on last_verified; ' +
    'live Nostr-announced inventory (Routstr providers, NIP-87 mints) is served separately at /live/snapshot.json ' +
    'with provenance "live-from-relay". Part of https://bitcoineconomy.ai — thesis at /case, methodology at /services-for-agents.',
  name: 'The Marketplace directory — bitcoineconomy.ai',
  url: BASE + '/',
  generated_at: new Date().toISOString(),
  entry_count: entries.length,
  categories,
  automatability_tiers: overlay._automatability_tiers,
  payment_method_vocabulary: {
    lightning: 'Lightning Network (BOLT11/BOLT12 invoices or Lightning address)',
    l402: 'L402 — HTTP 402 payment protocol over Lightning; the payment is the API credential',
    cashu: 'Cashu bearer ecash (Bitcoin-denominated); the token is the API key',
    nwc: 'Nostr Wallet Connect (NIP-47) — remote, scoped wallet control',
    zaps: 'NIP-57 Lightning zaps',
    onchain: 'Bitcoin L1 on-chain',
    liquid: 'Liquid Network (L-BTC)',
    spark: 'Spark (Bitcoin L2)',
    fiat: 'Bank/fiat leg (custodial venue)',
  },
  entries,
};

writeFileSync(join(HERE, 'directory.json'), JSON.stringify(directory, null, 2) + '\n');

// --- per-entry markdown routes -------------------------------------------------
rmSync(join(HERE, 'entries'), { recursive: true, force: true });
mkdirSync(join(HERE, 'entries'), { recursive: true });

for (const e of entries) {
  const tier = overlay._automatability_tiers[e.automatability];
  const lines = [
    `# ${e.name}`,
    '',
    `> ${e.what_an_agent_buys}`,
    '',
    e.summary,
    '',
    `- Category: ${e.category}`,
    `- Payment methods: ${e.payment_methods.join(', ')}`,
    e.payment_detail ? `- Payment detail: ${e.payment_detail}` : null,
    e.kyc ? `- KYC: ${e.kyc}` : null,
    e.custody ? `- Custody: ${e.custody}` : null,
    `- Automatability: ${e.automatability} — ${tier}`,
    e.two_sided ? `- Direction: ${e.two_sided}` : null,
    e.maintainer ? `- Maintainer: ${e.maintainer}` : null,
    e.links.site ? `- Site: ${e.links.site}` : null,
    e.links.docs ? `- Docs/API: ${e.links.docs}` : null,
    e.links.repo ? `- Repo: ${e.links.repo}` : null,
    `- Full card (verified detail, gotchas): ${e.card_url}`,
    `- Provenance: curated${e.last_verified ? ` (last verified ${e.last_verified})` : ''}`,
    e.note ? `` : null,
    e.note ? `${e.note}` : null,
    '',
    `---`,
    '',
    `Part of [The Marketplace directory](${BASE}/) · registry JSON: ${BASE}/directory.json · full thesis: ${MAIN}/case`,
    '',
  ].filter((l) => l !== null);
  writeFileSync(join(HERE, 'entries', `${e.slug}.md`), lines.join('\n'));
}

// --- llms.txt -------------------------------------------------------------------
const byCat = {};
for (const e of entries) (byCat[e.category] ??= []).push(e);

const llms = [
  '# The Marketplace directory — marketplace.bitcoineconomy.ai',
  '',
  '> The agent-readable directory of services autonomous AI agents buy and sell for Bitcoin —',
  '> inference, compute, machine work, commerce bridges, swaps, liquidity, and fiat ramps.',
  '> Curated registry + a live snapshot of Nostr-announced inventory (Routstr providers, NIP-87 ecash mints).',
  '',
  `Registry (JSON, full schema): ${BASE}/directory.json`,
  `Live Nostr snapshot (kind 38421 providers + 38172/38173 mints + 38000 reviews, cron-refreshed): ${BASE}/live/snapshot.json`,
  `Static fallback snapshot: ${BASE}/snapshot.json`,
  `Part of: ${MAIN} — the case for a Bitcoin-centric AI agent economy (manifest: ${MAIN}/llms.txt)`,
  '',
  'Every entry below has a clean Markdown route. provenance: curated = editor-verified against primary',
  'sources on the date shown; the live snapshot carries provenance live-from-relay (signed Nostr events,',
  'taken as published — verify before trusting).',
  '',
];
const CAT_TITLES = {
  inference: 'Inference (LLM/API calls an agent pays for per request)',
  compute: 'Compute (servers an agent provisions and pays for in sats)',
  'machine-work': 'Machine work (agents buying and selling work)',
  commerce: 'Commerce bridge (paying non-Bitcoin merchants with sats)',
  privacy: 'Privacy / connectivity',
  swap: 'Swaps (non-custodial, no-KYC asset conversion)',
  liquidity: 'Liquidity (Lightning channel/balance management)',
  'fiat-ramp': 'Fiat ramps (custodial venues at the border; KYC noted per entry)',
};
for (const cat of categories) {
  llms.push(`## ${CAT_TITLES[cat] ?? cat}`, '');
  for (const e of byCat[cat]) {
    llms.push(`- [${e.name}](${BASE}/entries/${e.slug}.md): ${e.what_an_agent_buys}. Payment: ${e.payment_methods.join('/')}; KYC: ${e.kyc ?? 'n/a'}; automatability: ${e.automatability}.`);
  }
  llms.push('');
}
writeFileSync(join(HERE, 'llms.txt'), llms.join('\n'));

console.log(`directory.json: ${entries.length} entries across ${categories.length} categories`);
console.log(`entries/: ${entries.length} markdown routes`);
console.log('llms.txt written');
