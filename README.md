# The Bitcoin Economy for AI — bitcoineconomy.ai

**The autonomous AI economy's monetary substrate is Bitcoin.**

Autonomous AI agents are becoming economic actors: they manage treasuries, buy
compute by the second, license content by the consumption, and settle
obligations measured in fractions of a cent — at potentially trillions of
transactions per day. That activity needs a monetary substrate that satisfies
four **conjunctive** constraints:

1. **Permissionless custody** — agents hold cryptographic keys but cannot pass KYC.
2. **Censorship-resistance** — settlement that holds without an intermediary's discretion.
3. **Sub-cent settlement** — fees below the marginal value being transferred.
4. **Machine-tempo latency** — sub-second confirmation for payment-on-call patterns.

Bank rails, regulated stablecoins, smart-contract native tokens, and CBDCs each
fail at least one constraint **by structural design** — the failure is a feature
of their regulatory accommodation, not an implementation gap. **Bitcoin L1
(settlement) + Lightning L2 (payments) + Cashu/Fedimint L3 (bearer ecash)** is
the only deployed system that satisfies all four conjunctively. Frontier models
already prefer it: the Bitcoin Policy Institute's March 2026 study (36 models,
9,072 neutral scenarios) found Bitcoin the top overall monetary preference
(48.3%) and the preferred store of value (79.1%), with >90% of responses
favoring digitally-native money over fiat.

Emergent parallel economies must structurally diverge from incumbents to succeed
— the eurodollar market, the open internet, samizdat, and private couriers each
routed around an incumbent that could not adapt without ceasing to be itself.
The agent economy on Bitcoin is the contemporary instance.

This repository is the source for the static site at **https://bitcoineconomy.ai**.

## The surfaces

**19 human-facing surfaces**, organised by argument into three sections — **The
Case / The Stack / The Market** — with **15** separately-authored, claims-indexed
**For-Agents** twins. Four surfaces are human-only by design (The Story, About,
Stablecoin Landscape, Marketplace).

Alongside them, four card collections: **28 Tools · 13 Exchanges · 17 Services ·
6 Skills**. (`/tools` grids the 21 function-first tools; the 7 protocol
primitives keep cards and are explained on the Stack.)

**This list is deliberately not enumerated here** — it is a derived fact, and a
hand-typed copy rots. The generated `/llms.txt` and `/agents.txt` enumerate every
route on every build and are the source to read.

A second Worker serves **`marketplace.bitcoineconomy.ai`** — a directory of
agent-payable services (22 curated entries merged with three live tiers), a
13-tool **`/mcp`** server, a **bounty board** on the kind-38556 microstandard,
and `/live/*` JSON refreshed by cron.

## Agent-first infrastructure

The site demonstrates its own thesis by treating autonomous agents as
first-class readers:

- **`/llms.txt`** — concise index of canonical URLs + one-line descriptions.
- **`/llms-full.txt`** — concatenated full text of every surface for single-fetch ingestion.
- **`/agents.txt`** — the canonical map oriented to agents, with every claim-ID.
- **Clean `.md` routes** — append `.md` to any surface URL for the raw published Markdown.
- **JSON-LD** on every page (`Article` / `TechArticle`; `FAQPage` where a claims-index exists).
- **`/robots.txt`** — explicit AI-crawler allowlist (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, …).
- **`/sitemap-index.xml`** — all HTML and `.md` routes.

## Architecture

- **Framework:** [Astro](https://astro.build) (static output), single content collection, no client JS.
- **Content source of truth:** `src/_raw/*.md` — the surfaces as authored in the
  Obsidian vault. `scripts/port-surfaces.mjs` ports them into the content
  collection (`src/content/surfaces/`), applying the publish rules:
  - strips internal `## Editor's Notes` + Publications-backlinks from human surfaces;
  - converts `[[wikilinks]]` → site routes (non-surface targets become plain text);
  - inserts the diagram/image placeholders.
  The port runs automatically on `predev` / `prebuild`. The generated collection
  is git-ignored; edit `src/_raw/` and re-run `npm run port`.
- **Diagrams:** house-style inline SVG (`src/lib/diagrams.ts`), expanded into the
  article HTML by a remark plugin (`src/lib/remark-visuals.mjs`). Palette:
  near-black `#0E0E0E`, off-white `#F5F1E8`, Bitcoin-orange `#F7931A`
  (Bitcoin/sovereign), slate-grey `#7A8290` (incumbent/legacy). Data-bearing
  diagrams also ship the data as a table so agents are never excluded.
- **Images:** finished raster pieces in `public/images/`, wired into the
  human surfaces only (never the For-Agents twins).

## Commands

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run port` | Re-port `src/_raw/` → `src/content/surfaces/` |
| `npm run dev` | Local dev server at `localhost:4321` (ports first) |
| `npm run build` | Production build to `./dist/` (ports first) |
| `npm run preview` | Preview the production build locally |
| `npm run deploy` | **Ship it** — builds, then deploys BOTH Workers |
| `npm run deploy main` / `npm run deploy marketplace` | Deploy one surface only |

## Deploy

**Both surfaces are Cloudflare Workers on Custom Domains, and deploying is a
manual act from the box: `npm run deploy`.**

> **A push deploys nothing, anywhere.** No repo in this portfolio is
> git-connected to Cloudflare. GitHub is history and backup. *(This section used
> to recommend Cloudflare Pages with Git-push deploys; both git connections were
> removed 2026-08-05 after a push believed inert was found shipping to
> production for weeks.)*

`npm run deploy` is one command for **both** Workers — the main site and
`marketplace-site/`. Two things are load-bearing:

- **Run `node build.mjs` inside `marketplace-site/` first** whenever a card or
  `directory-overlay.json` changed — the per-card "For agents — connect" blocks
  read the *generated* `directory.json`.
- **Verify by measuring the rendered result**, not the source. The edge cache
  serves mixed old/new for minutes after a deploy; cache-bust and poll to three
  consecutive consistent reads.

The full deploy / credential / pseudonymity standard is portfolio-wide and is
not restated here.

---

@BitcoinEconAI

## Licence

**Code: [MIT](LICENSE). Content: [CC BY 4.0](LICENSE-CONTENT).
Live data (`/live/*.json`): [CC0](LICENSE-CONTENT) — public domain, no
attribution required.**

The essays and surfaces are yours to reuse with credit. The machine-readable
endpoints are dedicated outright, because this site's standing invitation is
that you should recompute its numbers rather than trust them, and an
attribution condition on a set of facts would sit against that.
