// Port the 11 vault source surfaces (src/_raw/*.md) into the Astro content
// collection (src/content/surfaces/*.md), applying spec §4 porting rules:
//   1. Strip "## Editor's Notes" (and the Publications backlinks block) from
//      human surfaces. FA twins have none.
//   2. Convert [[wikilinks]] -> site routes for the 11 surfaces; strip the link
//      (keep the display text) for any non-surface target.
//   3. Preserve frontmatter (incl. agent-tldr, epistemic tags, claim-IDs).
//
// Run: node scripts/port-surfaces.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RAW = path.join(ROOT, 'src', '_raw');
const OUT = path.join(ROOT, 'src', 'content', 'surfaces');
const RAW_TOOLS = path.join(RAW, 'tools');
const OUT_TOOLS = path.join(ROOT, 'src', 'content', 'tools');

// Wikilink target (vault file basename, no extension) -> site route.
const SURFACE_ROUTES = {
  'Thesis': '/thesis',
  'Thesis-FA': '/thesis-for-agents',
  'The-Story': '/the-story',
  'Independence-Doctrine': '/independence-doctrine',
  'Independence-Doctrine-FA': '/independence-doctrine-for-agents',
  'Border-Zone': '/border-zone',
  'Border-Zone-FA': '/border-zone-for-agents',
  'Stack': '/stack',
  'Stack-FA': '/stack-for-agents',
  'Field-Notes': '/field-notes',
  'Field-Notes-FA': '/field-notes-for-agents',
};

// Visual-asset placement (human surfaces only). For each file, a list of
// inserts keyed by a heading the insert should follow. `diagram` injects an
// inline SVG/table placeholder; `image` injects a finished raster image.
// Markers are HTML comments / divs the Surface renderer expands.
const INSERTS = {
  'Thesis.md': [
    { afterHeading: 'Why the legacy economy fails', html: '<div data-diagram="matrix"></div>' },
    { afterHeading: 'The two-tier model', html: '<div data-diagram="two-tier"></div>' },
    { afterHeading: "What's already deployed", html: '<div data-diagram="bpi"></div>' },
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
    { afterHeading: 'what good border infrastructure looks like', html: '<div data-diagram="timeline"></div>' },
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

// Human surfaces carry Editor's Notes that must be stripped on publish.
const FILES = [
  'Thesis.md',
  'The-Story.md',
  'Independence-Doctrine.md',
  'Border-Zone.md',
  'Stack.md',
  'Field-Notes.md',
  'Thesis-FA.md',
  'Independence-Doctrine-FA.md',
  'Border-Zone-FA.md',
  'Stack-FA.md',
  'Field-Notes-FA.md',
];

function splitFrontmatter(text) {
  // Returns { fm, body }. Frontmatter delimited by leading '---' lines.
  if (!text.startsWith('---')) return { fm: '', body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { fm: '', body: text };
  const fmBlock = text.slice(0, end + 4); // include closing ---
  const body = text.slice(end + 4).replace(/^\r?\n/, '');
  return { fm: fmBlock, body };
}

// Strip the "## Editor's Notes" section through to end of file (it is always the
// final section in the human surfaces, after a `---` rule). We cut from the
// horizontal rule that precedes the heading, or from the heading itself.
function stripEditorsNotes(body) {
  const idx = body.search(/(^|\n)#{1,6}\s+Editor's Notes\b/);
  if (idx === -1) return body;
  // Walk back to drop a preceding `---` horizontal rule + blank lines.
  let cut = idx;
  const before = body.slice(0, idx);
  const m = before.match(/\n+---\s*\n+\s*$/);
  if (m) cut = before.length - m[0].length;
  return body.slice(0, cut).replace(/\s+$/, '') + '\n';
}

// Convert [[Target]] and [[Target|Display]] wikilinks.
//  - If Target resolves to one of the 11 surfaces -> [Display](route)
//  - Otherwise (KB notes, Research/ files, style guides) -> plain Display text.
function convertWikilinks(text) {
  return text.replace(/\[\[([^\]]+)\]\]/g, (_full, inner) => {
    const pipe = inner.indexOf('|');
    let target = pipe === -1 ? inner : inner.slice(0, pipe);
    let display = pipe === -1 ? inner : inner.slice(pipe + 1);
    target = target.trim();
    display = display.trim();
    // Strip any heading anchor (#...) from the target before matching.
    const hashless = target.split('#')[0].trim();
    const route = SURFACE_ROUTES[hashless];
    if (route) {
      return `[${display}](${route})`;
    }
    // Non-surface target: keep the display text only.
    return display;
  });
}

// Convert wikilinks that live *inside* the frontmatter (e.g. canonical-source,
// twin-page references, style-guide) to plain text so YAML stays valid and no
// vault-only links leak. We keep the inner display text only.
function sanitizeFrontmatterWikilinks(fm) {
  return fm.replace(/\[\[([^\]]+)\]\]/g, (_full, inner) => {
    const pipe = inner.indexOf('|');
    const display = pipe === -1 ? inner : inner.slice(pipe + 1);
    return display.trim();
  });
}

// Insert visual-asset placeholders after matching headings (and the hero at the
// very top of the body). Each placeholder is a raw HTML block on its own line,
// which markdown passes through untouched. Image figures are emitted directly
// (descriptive alt text + caption); diagram divs are expanded by the renderer.
function insertVisuals(body, file) {
  const inserts = INSERTS[file];
  if (!inserts) return body;
  let out = body;
  for (const ins of inserts) {
    if (ins.hero) {
      // Hero goes at the very top of the body content. The page chrome renders
      // the title separately, so the body's leading H1/subtitle are stripped
      // (see stripLeadingTitle); the hero then sits at the top of the article.
      out = `<div data-hero="${ins.hero}" data-alt="${escAttr(ins.alt)}"></div>\n\n` + out;
      continue;
    }
    const block = ins.image
      ? `\n<figure class="surface-fig" data-image="${ins.image}" data-alt="${escAttr(ins.alt)}"${ins.caption ? ` data-caption="${escAttr(ins.caption)}"` : ''}></figure>\n`
      : `\n${ins.html}\n`;
    out = ins.afterText
      ? insertAfterParagraph(out, ins.afterText, block)
      : insertAfterHeading(out, ins.afterHeading, block);
  }
  return out;
}

// Strip the body's leading H1 title (the page chrome renders the title from
// frontmatter). If an H2 immediately follows the H1 as a subtitle (The Story),
// strip that too. Stop at the first content/blank line.
function stripLeadingTitle(body) {
  const lines = body.split('\n');
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i++;
  if (i < lines.length && /^#\s/.test(lines[i])) {
    lines.splice(i, 1); // drop H1
    // drop blank lines then a directly-following H2 subtitle (no content between)
    let k = i;
    while (k < lines.length && lines[k].trim() === '') k++;
    if (k < lines.length && /^##\s/.test(lines[k])) {
      lines.splice(k, 1);
    }
  }
  return lines.join('\n').replace(/^\n+/, '');
}

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Insert `block` immediately after the section opened by a heading whose text
// contains `needle` (case-insensitive). The block lands after the heading's
// first paragraph break so it reads inside the section.
function insertAfterHeading(text, needle, block) {
  const lines = text.split('\n');
  const low = needle.toLowerCase();
  let hi = -1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^#{2,4}\s/.test(l) && l.toLowerCase().includes(low)) { hi = i; break; }
  }
  if (hi === -1) {
    console.warn(`  ! heading not found for insert: "${needle}" in current file`);
    return text;
  }
  // Find the end of the first paragraph after the heading (next blank line that
  // follows at least one non-blank content line).
  let j = hi + 1;
  while (j < lines.length && lines[j].trim() === '') j++; // skip blanks right after heading
  // advance through the first paragraph block to the next blank line
  while (j < lines.length && lines[j].trim() !== '') j++;
  lines.splice(j, 0, block);
  return lines.join('\n');
}

// Insert `block` immediately after the paragraph that contains `needle`
// (case-insensitive). Used when the right spot is mid-section, with no heading
// to anchor to — lands after that paragraph's trailing blank line.
function insertAfterParagraph(text, needle, block) {
  const lines = text.split('\n');
  const low = needle.toLowerCase();
  let hit = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(low)) { hit = i; break; }
  }
  if (hit === -1) {
    console.warn(`  ! paragraph not found for insert: "${needle}" in current file`);
    return text;
  }
  let j = hit;
  while (j < lines.length && lines[j].trim() !== '') j++; // to end of this paragraph
  lines.splice(j, 0, block);
  return lines.join('\n');
}

fs.mkdirSync(OUT, { recursive: true });

let count = 0;
for (const file of FILES) {
  const srcPath = path.join(RAW, file);
  const raw = fs.readFileSync(srcPath, 'utf8');
  let { fm, body } = splitFrontmatter(raw);

  const isHuman = !file.endsWith('-FA.md');
  if (isHuman) body = stripEditorsNotes(body);

  body = convertWikilinks(body);
  fm = sanitizeFrontmatterWikilinks(fm);
  body = stripLeadingTitle(body);
  if (isHuman) body = insertVisuals(body, file);

  const out = `${fm}\n\n${body.replace(/^\n+/, '')}`;
  // Stable output filename = source filename (kept as the collection slug seed,
  // but routing is driven by the `slug` frontmatter field, not the filename).
  const outPath = path.join(OUT, file);
  fs.writeFileSync(outPath, out, 'utf8');
  count++;
}

console.log(`Ported ${count} surfaces -> src/content/surfaces/`);

// ---- Tool cards (src/_raw/tools/*.md -> src/content/tools/*.md) ----
// Lighter pipeline than surfaces: no Editor's Notes, no leading-title strip
// (the card chrome renders name + tagline). We convert any [[wikilinks]] in body
// + frontmatter and copy through. Cards are authored without inline visuals.
fs.mkdirSync(OUT_TOOLS, { recursive: true });
let toolCount = 0;
if (fs.existsSync(RAW_TOOLS)) {
  for (const file of fs.readdirSync(RAW_TOOLS)) {
    if (!file.endsWith('.md')) continue;
    const raw = fs.readFileSync(path.join(RAW_TOOLS, file), 'utf8');
    let { fm, body } = splitFrontmatter(raw);
    fm = sanitizeFrontmatterWikilinks(fm);
    body = convertWikilinks(body);
    const out = `${fm}\n\n${body.replace(/^\n+/, '')}`;
    fs.writeFileSync(path.join(OUT_TOOLS, file), out, 'utf8');
    toolCount++;
  }
}
console.log(`Ported ${toolCount} tool cards -> src/content/tools/`);
