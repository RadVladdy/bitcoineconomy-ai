// Sitemap <lastmod> dates, resolved from GIT COMMIT HISTORY.
//
// WHY GIT AND NOT FILE MTIME. mtime is the time a file last landed on this disk,
// which is a property of the checkout rather than of the content — a fresh clone
// or a `git clean` sets every mtime to "just now", so every page would claim to
// have changed today. That is not a missing signal but a FALSE one: Google
// learns the field carries no information and ignores lastmod site-wide, which
// is strictly worse than emitting none.
//
// WHY `src/_raw/` AND NOT `src/content/`. src/content/** is GENERATED and
// gitignored (scripts/port-surfaces.mjs wipes it on every run), so it has no git
// history to read. src/_raw/ is the authored source of truth — 98 tracked files.
// Reading the generated tree here would silently yield zero dates.
//
// ROUTES ARE DERIVED FROM `slug:` FRONTMATTER, mirroring port-surfaces.mjs
// rather than re-deriving the mapping from filenames. Filenames are Title-Case
// (`Why-Bitcoin-Not-A-New-Coin.md`) and slugs are lowercase, and the two are NOT
// mechanically related in every case — `Thesis.md` serves `/case`, `Market.md`
// serves `/marketplace`. Guessing from the basename would quietly mis-date those.
//
// SHARED SCRIPT, ONE COPY PER REPO — only urlToSources()/route-map construction
// may differ, the same convention scripts/check-pseudonymity.py follows.

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const RAW = 'src/_raw';
const CARD_COLLECTIONS = ['tools', 'services', 'exchanges', 'skills'];

/**
 * `-c core.quotePath=false` IS LOAD-BEARING, not a style choice. By default git
 * renders any non-ASCII byte in a path as a backslash escape and wraps
 * the whole path in quotes, so a filename with an umlaut, an accent or a dash
 * from outside Latin-1 never matches a lookup key. Measured on timechain.wiki:
 * exactly 3 of 400 articles silently lost their lastmod — Bohm-Bawerk, Hulsmann
 * and Walras — and nothing failed, which is what makes it worth a comment.
 */

/**
 * Last commit date for every tracked path, from ONE `git log` pass.
 * `git log` walks newest-first, so the FIRST time a path appears is its most
 * recent commit — hence the `has()` guard rather than overwriting.
 */
function gitDates() {
  const out = execSync('git -c core.quotePath=false log --format=%x00%cI --name-only --no-renames', {
    maxBuffer: 256 * 1024 * 1024,
    encoding: 'utf8',
  });
  const dates = new Map();
  let current = null;
  for (const line of out.split('\n')) {
    if (line.startsWith('\0')) { current = line.slice(1).trim(); continue; }
    const p = line.trim();
    if (p && current && !dates.has(p)) dates.set(p, current);
  }
  return dates;
}

function frontmatterSlug(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const fm = txt.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return null;
  const m = fm[1].match(/^slug:\s*["']?([A-Za-z0-9\-]+)["']?\s*$/m);
  return m ? m[1] : null;
}

/** route path (no trailing slash) -> authored source file under src/_raw/ */
function routeMap() {
  const map = new Map();
  for (const f of fs.readdirSync(RAW).filter((f) => f.endsWith('.md'))) {
    const slug = frontmatterSlug(path.join(RAW, f));
    if (slug) map.set(`/${slug}`, `${RAW}/${f}`);
  }
  for (const col of CARD_COLLECTIONS) {
    const dir = path.join(RAW, col);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const slug = frontmatterSlug(path.join(dir, f)) || f.replace(/\.md$/, '');
      map.set(`/${col}/${slug}`, `${dir}/${f}`);
    }
  }
  return map;
}

function pathOf(url) {
  let p;
  try { p = new URL(url).pathname; } catch { p = url; }
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p || '/';
}

export function buildLastmod() {
  const dates = gitDates();
  const routes = routeMap();
  const newer = (a, b) => (!a ? b : !b ? a : (a > b ? a : b));

  return (item) => {
    const p = pathOf(item.url);
    let date;
    const src = routes.get(p);
    if (src && dates.has(src)) date = dates.get(src);
    // Index/static routes with no authored surface fall back to their .astro.
    if (!date) {
      for (const c of [`src/pages${p}.astro`, `src/pages${p}/index.astro`,
                       ...(p === '/' ? ['src/pages/index.astro'] : [])]) {
        if (dates.has(c)) { date = dates.get(c); break; }
      }
    }
    // A card route is also re-rendered when its collection template changes.
    const col = p.split('/')[1];
    if (CARD_COLLECTIONS.includes(col)) {
      date = newer(date, dates.get(`src/pages/${col}/[slug].astro`));
    }
    // No date resolved => emit NO lastmod rather than a guess. A sitemap may
    // carry lastmod on some entries and not others; inventing one is the exact
    // failure this file exists to avoid.
    return date ? { ...item, lastmod: date } : item;
  };
}
