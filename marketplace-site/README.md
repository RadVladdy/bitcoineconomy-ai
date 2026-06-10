# marketplace-site — marketplace.bitcoineconomy.ai

The Marketplace **directory**: the agent-readable registry of services autonomous
agents buy and sell for Bitcoin. Phase 1 architecture (see the build plan in the
project notes): **curated registry core + live Nostr modules + a snapshot layer**.

This folder is **not** part of the main Astro build; it deploys on its own
(currently a Cloudflare Pages project; Worker migration steps below).

## What's here

| file | role |
|---|---|
| `index.html` | the directory UI — renders `directory.json` + the live snapshot, client-side, no framework |
| `directory.json` | **generated** — the curated registry core (17 entries from the main site's card inventory) |
| `entries/*.md` | **generated** — one clean Markdown route per entry |
| `llms.txt` | **generated** — the agent manifest for the subdomain |
| `snapshot.json` | **generated** — committed fallback of the live Nostr snapshot (Routstr 38421 providers, NIP-87 38172/38173 mints, 38000 reviews) |
| `directory-overlay.json` | hand-authored directory fields (category, what-an-agent-buys, payment methods, automatability tier) merged over card frontmatter |
| `build.mjs` | generator: cards (`../src/_raw/`) + overlay → `directory.json`, `entries/`, `llms.txt` |
| `sample-relays.mjs` | local CLI: query relays, print inventory, `--write` regenerates `snapshot.json` |
| `snapshot-lib.mjs` | shared relay-query + snapshot-shape logic (used by the CLI **and** the worker — one schema) |
| `worker.js` | Cloudflare Worker: cron → relays → KV; serves `/live/snapshot.json`; assets otherwise |
| `wrangler.jsonc` | worker config (cron every 6h, KV binding, static assets) |
| `_headers` | CORS for the agent routes |

**Never hand-edit the generated files.** Change a card in `src/_raw/` or
`directory-overlay.json`, then run `node build.mjs` from this folder.
Refresh the committed live fallback occasionally with `node sample-relays.mjs --write`.

## Editorial rules (same as the main site)

Directory entries are **reference content** — facts, curated by what we show and
the order (sovereignty-first; fiat ramps last, Bitcoin-only before multi-asset).
No stance editorializing in entry text. Live-module data is **announcements as
published, not endorsements** — the UI and llms.txt say so explicitly. Provenance
is labeled per object: `curated` vs `live-from-relay`.

## Deploys

**Today (Pages, already live):** the git-connected Pages project
`bitcoineconomy-marketplace` (build output dir = `marketplace-site`) redeploys on
push. Everything static works on it — UI, `directory.json`, `llms.txt`,
`entries/`, `snapshot.json` — and the UI silently falls back from
`/live/snapshot.json` to the committed snapshot.

**Worker migration (one-time, enables the cron-refreshed `/live/snapshot.json`):**

1. From this folder: `npx wrangler kv namespace create SNAPSHOT` (or dashboard →
   Storage & Databases → KV → Create). Paste the namespace id into
   `wrangler.jsonc` where marked, commit.
2. Create the Worker — either git-connected like the main site (dashboard →
   Workers & Pages → Create → Worker → import `RadVladdy/bitcoineconomy-ai`,
   **root directory `marketplace-site`**, deploy command `npx wrangler deploy`)
   or one-off from this folder: `npx wrangler deploy`.
3. Move the custom domain: remove `marketplace.bitcoineconomy.ai` from the Pages
   project, then Worker → Settings → Domains & Routes → add it.
4. Retire the Pages project. The cron fires within 6 hours (or trigger it once
   from the Worker's dashboard → Settings → Trigger Events); until the first run,
   `/live/snapshot.json` serves the committed fallback.

## Phase 2+ (per the build plan)

Reviews via the proven NIP-87 kind-38000 pattern rendered per entry; the
DVM/handler module with honest-activity framing; zap-weighted ranking; then the
submission flow (publish a signed announcement — possibly our own agent-payable
service announcement microstandard, with Routstr's 38421 as the template).
