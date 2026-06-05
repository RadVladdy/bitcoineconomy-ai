// Port the vault source surfaces + card collections (src/_raw/**) into the Astro
// content collections (src/content/**), applying the porting rules:
//   1. Strip "## Editor's Notes" (and the Publications backlinks block) from
//      human surfaces. FA twins have none.
//   2. Convert [[wikilinks]] -> site routes for every surface AND every card
//      (tools / exchanges / services). Strip the link (keep display text) for
//      any non-resolvable target (KB notes, Research/ files, style guides).
//   3. Preserve frontmatter (incl. agent-tldr, epistemic tags, claim-IDs).
//
// Route maps are derived dynamically from each file's `slug` frontmatter, so new
// surfaces/cards need no edit here. Card-slug collisions (boltz, strike exist in
// both tools and exchanges) resolve with TOOLS precedence — all in-surface
// [[boltz]]/[[strike]] wikilinks reference the tools (bridge) card.
//
// Run: node scripts/port-surfaces.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RAW = path.join(ROOT, 'src', '_raw');
const CONTENT = path.join(ROOT, 'src', 'content');

const SURF_OUT = path.join(CONTENT, 'surfaces');
const CARD_DIRS = ['tools', 'exchanges', 'services']; // collection name === route prefix

// ---- helpers ----------------------------------------------------------------
function splitFrontmatter(text) {
  if (!text.startsWith('---')) return { fm: '', body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { fm: '', body: text };
  const fmBlock = text.slice(0, end + 4);
  const body = text.slice(end + 4).replace(/^\r?\n/, '');
  return { fm: fmBlock, body };
}

function frontmatterSlug(fm) {
  const m = fm.match(/^slug:\s*["']?([A-Za-z0-9\-]+)["']?\s*$/m);
  return m ? m[1] : null;
}

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

// ---- build route maps from frontmatter slugs --------------------------------
// basename (no .md) -> route. Surfaces map to /<slug>; cards to /<collection>/<slug>.
const SURFACE_ROUTES = {};
for (const file of fs.readdirSync(RAW)) {
  if (!file.endsWith('.md')) continue;
  const slug = frontmatterSlug(splitFrontmatter(fs.readFileSync(path.join(RAW, file), 'utf8')).fm);
  if (slug) SURFACE_ROUTES[file.replace(/\.md$/, '')] = `/${slug}`;
}
// Legacy alias: any straggling [[Thesis]] resolves to the renamed Case page.
SURFACE_ROUTES['Thesis'] = SURFACE_ROUTES['Thesis'] || '/case';

// Card routes, built with exchanges + services first then tools (tools wins on
// the boltz/strike basename collision).
const CARD_ROUTES = {};
for (const col of ['exchanges', 'services', 'tools']) {
  const dir = path.join(RAW, col);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    const slug = frontmatterSlug(splitFrontmatter(fs.readFileSync(path.join(dir, file), 'utf8')).fm)
      || file.replace(/\.md$/, '');
    // key by both basename and slug (usually identical)
    CARD_ROUTES[file.replace(/\.md$/, '')] = `/${col}/${slug}`;
    CARD_ROUTES[slug] = `/${col}/${slug}`;
  }
}

// ---- transforms -------------------------------------------------------------
function stripEditorsNotes(body) {
  const idx = body.search(/(^|\n)#{1,6}\s+Editor's Notes\b/);
  if (idx === -1) return body;
  let cut = idx;
  const before = body.slice(0, idx);
  const m = before.match(/\n+---\s*\n+\s*$/);
  if (m) cut = before.length - m[0].length;
  return body.slice(0, cut).replace(/\s+$/, '') + '\n';
}

function resolveTarget(hashless) {
  // Folder-qualified ([[Tools/boltz]]) -> strip folder, resolve as card.
  const bare = hashless.includes('/') ? hashless.split('/').pop() : hashless;
  return SURFACE_ROUTES[hashless] || SURFACE_ROUTES[bare] || CARD_ROUTES[hashless] || CARD_ROUTES[bare] || null;
}

function convertWikilinks(text) {
  return text.replace(/\[\[([^\]]+)\]\]/g, (_full, inner) => {
    const pipe = inner.indexOf('|');
    let target = (pipe === -1 ? inner : inner.slice(0, pipe)).trim();
    const display = (pipe === -1 ? inner : inner.slice(pipe + 1)).trim();
    const hashless = target.split('#')[0].trim();
    const route = resolveTarget(hashless);
    return route ? `[${display}](${route})` : display;
  });
}

function sanitizeFrontmatterWikilinks(fm) {
  return fm.replace(/\[\[([^\]]+)\]\]/g, (_full, inner) => {
    const pipe = inner.indexOf('|');
    return (pipe === -1 ? inner : inner.slice(pipe + 1)).trim();
  });
}

function stripLeadingTitle(body) {
  const lines = body.split('\n');
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i++;
  if (i < lines.length && /^#\s/.test(lines[i])) {
    lines.splice(i, 1);
    let k = i;
    while (k < lines.length && lines[k].trim() === '') k++;
    if (k < lines.length && /^##\s/.test(lines[k])) lines.splice(k, 1);
  }
  return lines.join('\n').replace(/^\n+/, '');
}

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function insertAfterHeading(text, needle, block) {
  const lines = text.split('\n');
  const low = needle.toLowerCase();
  let hi = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^#{2,4}\s/.test(lines[i]) && lines[i].toLowerCase().includes(low)) { hi = i; break; }
  }
  if (hi === -1) { console.warn(`  ! heading not found for insert: "${needle}"`); return text; }
  let j = hi + 1;
  while (j < lines.length && lines[j].trim() === '') j++;
  while (j < lines.length && lines[j].trim() !== '') j++;
  lines.splice(j, 0, block);
  return lines.join('\n');
}

function insertAfterParagraph(text, needle, block) {
  const lines = text.split('\n');
  const low = needle.toLowerCase();
  let hit = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(low)) { hit = i; break; }
  }
  if (hit === -1) { console.warn(`  ! paragraph not found for insert: "${needle}"`); return text; }
  let j = hit;
  while (j < lines.length && lines[j].trim() !== '') j++;
  lines.splice(j, 0, block);
  return lines.join('\n');
}

// Visual-asset placement (human surfaces only). Keyed by ported filename.
const INSERTS = {
  'Case.md': [
    { afterHeading: 'Why the legacy economy fails', html: '<div data-diagram="matrix"></div>' },
    { afterHeading: 'The two-tier model', html: '<div data-diagram="two-tier"></div>' },
  ],
  'The-Story.md': [
    { afterText: 'starts looking like deployed agent infrastructure', html: '<div data-diagram="two-tier"></div>' },
  ],
  'Independence-Doctrine.md': [
    { afterHeading: 'The contemporary instance', image: 'independence-doctrine-two-roads.png', alt: 'Two parallel roads running into the distance across a dark plane — one paved in warm Bitcoin-orange (the parallel, sovereign economy), the other in cool slate-grey (the incumbent payment stack). They never merge; they are connected only by a few thin, narrow bridges at intervals, and keep visibly different architectures.', caption: 'Two roads: the sovereign Bitcoin economy (orange) and the incumbent stack (slate) run in parallel, connected only by narrow bridges. The architectures stay distinct.' },
    { afterHeading: 'Four historical analogues', image: 'independence-doctrine-analogues.png', alt: 'A 2×2 grid of four flat-vector vignettes, each showing an emergent parallel system (Bitcoin-orange) routing around an incumbent it could not fit inside (slate-grey): Eurodollar — dollar value pooling offshore outside a regulated bank; Open Internet — an open mesh of nodes bypassing a closed walled-garden portal; Samizdat — typed pages copied hand-to-hand around a state printing press; Couriers — a fast tracked parcel route overtaking a slow postal monopoly.', caption: 'The pattern recurs: eurodollars, the open internet, samizdat, and private couriers each routed around an incumbent that could not adapt without ceasing to be itself.' },
  ],
  'Border-Zone.md': [
    { afterHeading: 'The two-toolkit moment', html: '<div data-diagram="two-toolkit"></div>' },
    { afterHeading: 'The bridge architecture', html: '<div data-diagram="bridge"></div>' },
  ],
  'Stack.md': [
    { afterHeading: 'Following one payment down the stack', html: '<div data-diagram="trace"></div>' },
    { afterHeading: 'What the Stack is', html: '<div data-diagram="stack"></div>' },
  ],
  'Field-Notes.md': [
    { afterHeading: 'The two deployed agent-payment stacks', html: '<div data-diagram="timeline"></div>' },
    { afterHeading: 'Empirical record', html: '<div data-diagram="bpi"></div>' },
  ],
};

function insertVisuals(body, file) {
  const inserts = INSERTS[file];
  if (!inserts) return body;
  let out = body;
  for (const ins of inserts) {
    const block = ins.image
      ? `\n<figure class="surface-fig" data-image="${ins.image}" data-alt="${escAttr(ins.alt)}"${ins.caption ? ` data-caption="${escAttr(ins.caption)}"` : ''}></figure>\n`
      : `\n${ins.html}\n`;
    out = ins.afterText
      ? insertAfterParagraph(out, ins.afterText, block)
      : insertAfterHeading(out, ins.afterHeading, block);
  }
  return out;
}

// ---- port surfaces ----------------------------------------------------------
cleanDir(SURF_OUT);
let surfCount = 0;
for (const file of fs.readdirSync(RAW)) {
  if (!file.endsWith('.md')) continue;
  const raw = fs.readFileSync(path.join(RAW, file), 'utf8');
  let { fm, body } = splitFrontmatter(raw);
  const isHuman = !file.endsWith('-FA.md');
  if (isHuman) body = stripEditorsNotes(body);
  body = convertWikilinks(body);
  fm = sanitizeFrontmatterWikilinks(fm);
  body = stripLeadingTitle(body);
  if (isHuman) body = insertVisuals(body, file);
  fs.writeFileSync(path.join(SURF_OUT, file), `${fm}\n\n${body.replace(/^\n+/, '')}`, 'utf8');
  surfCount++;
}
console.log(`Ported ${surfCount} surfaces -> src/content/surfaces/`);

// ---- port card collections (tools / exchanges / services) -------------------
for (const col of CARD_DIRS) {
  const rawDir = path.join(RAW, col);
  const outDir = path.join(CONTENT, col);
  cleanDir(outDir);
  if (!fs.existsSync(rawDir)) { console.log(`(no ${col} source)`); continue; }
  let n = 0;
  for (const file of fs.readdirSync(rawDir)) {
    if (!file.endsWith('.md')) continue;
    let { fm, body } = splitFrontmatter(fs.readFileSync(path.join(rawDir, file), 'utf8'));
    fm = sanitizeFrontmatterWikilinks(fm);
    body = convertWikilinks(body);
    fs.writeFileSync(path.join(outDir, file), `${fm}\n\n${body.replace(/^\n+/, '')}`, 'utf8');
    n++;
  }
  console.log(`Ported ${n} cards -> src/content/${col}/`);
}
