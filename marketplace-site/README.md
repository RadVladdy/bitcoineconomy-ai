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
| `directory.json` | **generated** — the curated registry core (the services an agent BUYS; machine fields auth/quickstart/api_base/pricing_url + `mcp_endpoint` where the provider runs its own MCP) |
| `tools.json` | **generated** — the tool catalog (what an agent EQUIPS: every `src/_raw/tools/` card, with toolbox_group/tool_type/prereq_tier + `mcp_endpoint` where present) |
| `entries/*.md` | **generated** — one clean Markdown route per entry |
| `llms.txt` | **generated** — the agent manifest for the subdomain (opens with the three-fetch consumption recipe) |
| `openapi.json` | **generated** — OpenAPI 3.0 description of the GET routes for agents that don't speak MCP (operationIds getDirectory/getToolCatalog/getLiveSnapshot/getPriceIndex/getEntry) |
| `.well-known/ai-plugin.json` | **generated** — the OpenAI-plugin-era discovery manifest; points legacy/non-MCP agents at `openapi.json` |
| `snapshot.json` | **generated** — committed fallback of the live Nostr snapshot (Routstr 38421 providers **with probe status**, NIP-87 38172/38173 mints, 38000 reviews) |
| `models.json` | **generated, minified** — committed fallback of the cross-provider inference price index (model → alive providers, cheapest first, sats pricing) |
| `directory-overlay.json` | hand-authored directory fields (category, what-an-agent-buys, payment methods, automatability tier, auth/quickstart + verified api_base/pricing_url + per-entry `mcp_endpoint`; plus the top-level `_tool_mcp_endpoints` map for tool cards that ship an MCP) merged over card frontmatter |
| `build.mjs` | generator: cards (`../src/_raw/`) + overlay → `directory.json`, `tools.json`, `entries/`, `llms.txt`, `openapi.json`, `.well-known/ai-plugin.json` |
| `sample-relays.mjs` | local CLI: query relays + **probe announced clearnet endpoints**, print inventory, `--write` regenerates `snapshot.json` + `models.json` |
| `snapshot-lib.mjs` | shared relay-query + endpoint-probe + snapshot/index-shape logic (used by the CLI **and** the worker — one schema) |
| `worker.js` | Cloudflare Worker: cron → relays + probes → KV; serves `/mcp` (the MCP server), `/live/snapshot.json` + `/live/models.json`; assets otherwise |
| `mcp-lib.mjs` | the MCP server — exposes the directory + tool catalog + price index as Model Context Protocol tools (`find_service`, `get_service`, `find_tool`, `get_tool`, `price_model`, `list_categories`, `list_mcp_servers`, `get_quote`) at `POST /mcp` |
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

## The trust layer (Phase 2, first slice — uptime + anchors)

Design rule (2026-07-23, from the invinoveritas structure teardown in the project
notes): **never publish a bare trust score — publish the raw inputs, the formula,
and the anchors, so a skeptic recomputes it.**

- **`/live/uptime.json`** (`uptime-lib.mjs`) — rolling per-target uptime over the
  6-hourly cron, covering the announced tiers **and the marketplace's own
  surfaces** (`self:*` rows probed via the public hostname — no green by
  assertion). The doc carries the raw `runs[]` observations, the explicit
  formula, and per-target denominators (unprobeable ≠ down; excluded and counted
  separately). History lives in KV (`uptime_history`, capped ~30 days); the
  committed `uptime.json` is the pre-first-cron placeholder. `schema_version` +
  `how_to_check` ship inline — every trust artifact self-describes.
- **`anchors/`** — nightly tamper-evidence, produced by the box-side
  `~/bin/marketplace-anchor` cron (NOT the worker): sha256 digests of the live
  surfaces → a kind-8555 Nostr event signed by the dedicated anchor infra key
  (regular kind, so relay copies are third-party we-can't-back-date evidence) →
  the event's NIP-01 canonical serialization stamped into Bitcoin via
  OpenTimestamps (`sha256(<event_id>.evt) == event_id`, so
  `ots verify -d <event_id> <event_id>.evt.ots` needs no trust in us) →
  committed + pushed to this public repo (`anchors/index.json` carries the
  records + `how_to_check`). Reviews (NIP-87) remain the next Phase-2 build;
  per the adopted folds they must ship recomputable the same way.

## The MCP server (`/mcp`)

`mcp-lib.mjs` exposes the directory as a **Model Context Protocol** server at `POST /mcp` on
the Worker, so an LN-enabled agent can call tools instead of fetching JSON. Stateless
Streamable HTTP (MCP 2025-06-18): one JSON-RPC request per POST → one `application/json`
response; no sessions, no SSE; notifications → 202; GET/DELETE → 405. Open CORS (read-only
over public data). Tools:

- `find_service` — filter the registry of services to BUY (category, payment method, no-KYC, automatability, two-sided)
- `get_service` — full machine detail for one service slug (incl. `mcp_endpoint` where present)
- `find_tool` — filter the tool catalog (what an agent EQUIPS): toolbox group, tool type, prereq tier, has-MCP
- `get_tool` — full machine detail for one tool slug (incl. `mcp_endpoint` where present)
- `price_model` — cheapest alive providers for a model id, in sats (from `models.json`)
- `list_categories` — the filter vocabulary + tallies + live routes
- `list_mcp_servers` — the providers here that run their **own** MCP server (Amboss, Bitrefill, Alby
  NWC) with the connect details — this directory as a **registry of other services' MCP servers**:
  discover here, connect there to act. The directory never proxies them.
- `get_quote` — a structured payment plan + (where the provider supports it) a live L402 invoice
  probed from its `api_base`, or a live sats price for inference, or a pointer to the provider's own
  MCP (`connect_via_mcp`). **No funds move through the server** — the agent pays the provider directly.

`get_quote` probes only the `api_base` recorded on the entry the caller names by slug (never a
caller-supplied URL), so the Worker can't be used as an open proxy. The tools read the same KV
snapshot + committed assets the `/live/*` routes serve. Smoke test:

```
curl -s https://marketplace.bitcoineconomy.ai/mcp -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

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

**Reputation-layer mechanisms to draw on (scoped 2026-07-16, `_Decisions` 2026-07-16).**
The sovereign toolkit for this phase: **Relatr** (decentralized trust-rank computation
for Nostr — an external rank provider), **Wotrlay** (a web-of-trust relay that
rate-limits by reputation, consuming Relatr ranks; public instance `wss://wotr.relatr.xyz`),
and **CEP-24** (the ContextVM signed-server-reviews convention). These are reputation
*infrastructure*, NOT directory entries — they aren't buyable-via-API services, so they
fail the inclusion bar (same reason Swan was removed). They are named on the main-site
Marketplace gateway's reputation paragraph as early/unproven (existence proof, not
endorsement) and belong here as candidate inputs to the ranking/reviews layer.
