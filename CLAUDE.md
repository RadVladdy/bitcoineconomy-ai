# bitcoineconomy.ai — build & design conventions

Astro static site, deployed to Cloudflare on push to `main`. Content is authored
as markdown surfaces + card collections and ported into `src/_raw/` at build time.

## Build & verify
- `npm run build` runs the port (`scripts/port-surfaces.mjs`) then `astro build` → `dist/`.
- Verify in `dist/` (and/or `npm run preview`) before pushing.
- Push to `main` = live Cloudflare deploy.

## Design system (locked 2026-06-07 — keep the whole site consistent)
Dark-futuristic look with a **semantic section colour triad** — the colour is
meaningful (value settles → moves → agents decide), not decorative:

| Section | Meaning | Colour | var | accent class |
|---|---|---|---|---|
| **The Case** | value / L1 | orange `#f7931a` | `--orange` | `.accent-btc` |
| **The Stack** (incl. Tools) | Lightning / movement | cyan `#22d3ee` | `--electric` | `.accent-cyan` |
| **The Marketplace** (incl. Exchange, Services) | agents / ecash | violet `#8b7cff` | `--agent` | `.accent-agent` |

Shared building blocks (reuse these — don't re-implement):
- **`src/components/PageRail.astro`** — the right rail: on-this-page TOC + "Explore the site" nav tiles + scroll-spy.
- **`src/styles/global.css`** — all styling. Section colours flow from the `.accent-*` wrapper class to cards, rail tiles, and nav.
- Nav + the rail's site tiles are **data-driven** from `NAV_GROUPS` / `SLUG_TAGS` in `src/lib/site.ts` — add a page to the nav config and it appears everywhere automatically.

## ✅ Every content page MUST get the standard treatment — no exceptions
Adding a page of an **existing** collection (a tool/service/exchange/surface) is
automatic: the `[slug].astro` templates already apply the full treatment.

Adding a **new page type** (its own `.astro`) — wire it in by hand so it matches:
1. `<Base ... wide={true}>`
2. Wrap the content: `<div class="surface-layout accent-{btc|cyan|agent}">` (pick the section's colour).
3. First grid child = the article/content column; second child = `<PageRail toc={toc} />`.
4. Build `toc` from the page's `h2` sections (give them `id`s); PageRail shows the TOC when there are ≥3.
5. Add a `.crumb` breadcrumb (`Home / Section / Page`).

**The only intentional exception is The Story (`/the-story`)** — the narrative
front door deliberately opts out of breadcrumb/TOC/rail. Any other content page
without the rail is a bug.

## Content conventions
Voice, In-brief sizing, Editor's-Notes, read-next structure, and the other
content rules are recorded in the project's decision register (kept outside this
repo). Match the existing surfaces as the pattern.
