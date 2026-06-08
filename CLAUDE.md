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
- **Every "Explore the site" link shows its `SLUG_TAGS` descriptor** under the label — on the homepage rail, the nav dropdowns, **and** the internal-page `PageRail` (they must not drift; the homepage and `PageRail` both render `rl-t` + `rl-d`). The label names the page; the descriptor says what it's about. Keep descriptors **plain-Joe and jargon-free** (no "UI/UX", "TradFi", "A2A/A2B") — they're the one-glance gloss for a reader who doesn't yet know the page.

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

## Content conventions — match these on every surface/card (no exceptions)
The full rules live in the project's decision register; these are the load-bearing ones.

**Voice — honest middle-position.** *"This is the substrate the agent economy will require, and here's why."* Direct, technical but not jargon-laden; engage skepticism rather than perform certainty; don't hedge with "could/might" when concrete deployed things exist. Never soften the thesis into "one option among several."

**Two registers.** Human surfaces = plain-Joe body prose — avoid "load-bearing", "falsifier", bare "Constraint N", "conjunctive constraints" (use the plain words; "Schelling point" + "category error" are fine to keep). For-Agents (`*-for-agents`) twins keep the full precise, claims-indexed register — that precision is the point there.

**Relationship dyads — `A2A` is canonical.** Use **A2A (agent-to-agent)** for software-to-software commerce; never **M2M / "machine-to-machine"** (retired synonym). Keep **`machine-tempo`** (settlement *speed*) — it is a different concept, not a dyad. Order is `{provider}2{recipient}` (provider/seller first, per B2B/B2C): A2P/P2A (agent↔person), A2B/B2A (agent↔business; B2A = agent buys from a business). When payment *direction* is the point, use prose ("the agent pays the business"), not the acronym. **Define on first use per page** (expand + a short gloss for the non-obvious ones). Full convention: vault `_Decisions` 2026-06-08 + `_Foundation` § Vocabulary.

**In-brief callout** = ≤ 800 characters / ≤ 6 sentences — a ceiling and a license, **not** a pad-to target. No In-brief on: The Story (narrative cold-open), Field-Notes (a 3-paragraph structural callout instead), About (meta page).

**`description` frontmatter** = a one-line subtitle (~60–130 chars), not a synopsis; must not duplicate the In-brief.

**Every human surface carries three things:** an **In-brief**; a **`> [!info] Where to read next`** callout (two groups — "More in {Section}" / "In the other sections"); and an **Editor's Notes** section. Editor's Notes are **internal** — the port (`scripts/port-surfaces.mjs`) strips them on build. The project's own stance/preference goes there, **never** in neutral body copy.

**Dual-track.** Every canonical surface has a **For-Agents twin** — except **The Story** (human-only by design) and the non-canonical pages (About, Stablecoin-Landscape). Before drafting a twin, read the project's For-Agents methodology brief (persuasion → specification: claims-index + definitions + formal constraints + counter-positions/falsification + epistemic tags).

**One load-bearing claim per surface** (no theory sprawl — a claim earns its own page only if it's load-bearing, separable, and substantial ~1,200+ words; otherwise it stays a section inside **The Case**, which must still stand alone as a complete argument).

**Reference-content neutrality.** Exchange + its cards, Stablecoin-Landscape, and all Tools/Exchanges/Services cards present **facts** — curate by *what you show, the order, and the facts*, never by editorializing the project's preference in the body (that's a leak → Editor's Notes). Fine: "standout for agents" (curation-by-emphasis), and stating a plain fact (e.g. a stablecoin is freezable). Argument surfaces (The Case, Doctrine…) openly arguing the thesis is their job.

**Two-tier model — never collapse it.** Bitcoin **L1 = settlement + reserve**; **Lightning + L2/L3 (Cashu/Fedimint) = payment tech that settles *in* Bitcoin**. Don't frame the upper layers as Bitcoin-competing or as "the AI money." Keep altcoin/x402 mentions bounded to comparison-context, not centerpiece.

**Empirical discipline.** Every number cites a specific study/repo/release. The BPI March 2026 anchor: **48.3% top overall monetary preference, 79.1% store of value** (36 models, 9,072 neutral scenarios; >90% favored digitally-native money over fiat). Don't smooth or aggregate; update the citation if newer data lands. Use projects' canonical names + primary repo/site links.

**Cards — verify before publish.** Omit uncertain fields, never guess; defer volatile specifics (fees, exact coverage) to the venue / Field Notes. Archive orphaned cards (move aside), never hard-delete.

**Honest engagement strengthens the thesis.** Lightning liquidity management, federated-trust (Fedimint), mint failure, agent attack surface — engage them (Field Notes is the home), don't sweep them away.
