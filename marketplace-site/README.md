# marketplace-site — marketplace.bitcoineconomy.ai

The Marketplace **directory**: the agent-readable registry of services autonomous
agents buy and sell for Bitcoin. Phase 1 architecture (see the build plan in the
project notes): **curated registry core + live Nostr modules + a snapshot layer**.

This folder is **not** part of the main Astro build; it deploys on its own
(currently a Cloudflare Pages project; Worker migration steps below).

## What's here

| file | role |
|---|---|
| `index.html` | the directory UI — renders `directory.json` + the live snapshot + the price index, client-side, no framework |
| `directory.json` | **generated** — the curated registry core (16 entries from the main site's card inventory, incl. the machine fields auth/quickstart/api_base/pricing_url) |
| `entries/*.md` | **generated** — one clean Markdown route per entry |
| `llms.txt` | **generated** — the agent manifest for the subdomain (opens with the three-fetch consumption recipe) |
| `snapshot.json` | **generated** — committed fallback of the live Nostr snapshot (Routstr 38421 providers **with probe status**, NIP-87 38172/38173 mints, 38000 reviews) |
| `models.json` | **generated, minified** — committed fallback of the cross-provider inference price index (model → alive providers, cheapest first, sats pricing) |
| `directory-overlay.json` | hand-authored directory fields (category, what-an-agent-buys, payment methods, automatability tier, auth/quickstart + verified api_base/pricing_url) merged over card frontmatter |
| `build.mjs` | generator: cards (`../src/_raw/`) + overlay → `directory.json`, `entries/`, `llms.txt` |
| `sample-relays.mjs` | local CLI: query relays + **probe announced clearnet endpoints**, print inventory, `--write` regenerates `snapshot.json` + `models.json` |
| `snapshot-lib.mjs` | shared relay-query + endpoint-probe + snapshot/index-shape logic (used by the CLI **and** the worker — one schema) |
| `worker.js` | Cloudflare Worker: cron → relays + probes → KV; serves `/live/snapshot.json` + `/live/models.json`; assets otherwise |
| `wrangler.jsonc` | worker config (cron every 6h, KV binding, static assets) |
| `_headers` | CORS for the agent routes |

**Never hand-edit the generated files.** Change a card in `src/_raw/` or
`directory-overlay.json`, then run `node build.mjs` from this folder.
Refresh the committed live fallbacks occasionally with `node sample-relays.mjs --write`.

## The agent-decision layer (probes + price index)

Announcements are replaceable Nostr events that outlive their nodes (first probe,
2026-06-10: 13 of 37 announced providers alive). So every snapshot refresh probes
each announced **clearnet** endpoint's unauthenticated `/v1/models` and records
per provider: `status` (`alive | unreachable | unverified-tor-only | unroutable`),
`latency_ms`, `model_count`, `network` (`clearnet | tor | both | unroutable`).
Honesty rules: dead ≠ delisted (announcements stay listed with status); onion-only
endpoints can't be probed from this infrastructure and are labeled unverified, not
dead; prices are the providers' own published numbers, not endorsements.

The probe's catalogs also build **`models.json`** — model id → every alive
provider serving it, cheapest first, in sats per token + per-request `max_cost`.
That one fetch answers "who serves model X cheapest right now".

**Free-plan note:** the worker cron parses each alive provider's `/v1/models`
(~1–2 MB for the big ones). If the cron ever hits the plan's CPU limit, the
don't-overwrite-good-data rule keeps the previous KV snapshot; persistent failure
→ upgrade the plan or refresh via `node sample-relays.mjs --write` instead.

## Editorial rules (same as the main site)

Directory entries are **reference content** — facts, curated by what we show and
the order (sovereignty-first; fiat ramps last, Bitcoin-only before multi-asset).
No stance editorializing in entry text. Live-module data is **announcements as
published, not endorsements** — the UI and llms.txt say so explicitly. Provenance
is labeled per object: `curated` vs `live-from-relay`.

**Inclusion bar:** an entry must be agent-drivable through a real API. The
`limited` automatability tier (no public trading/provisioning API) is below the
threshold — such venues can be honest facts on the main site's Exchange
reference map, but they are not marketplace entries (Swan was removed under
this rule, 2026-06-10).

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
