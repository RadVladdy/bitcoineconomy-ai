# marketplace-site — marketplace.bitcoineconomy.ai

The Marketplace **directory**: the agent-readable registry of services autonomous
agents buy and sell for Bitcoin.

This folder is **not** part of the main Astro build; it deploys on its own —
a Cloudflare **Worker** (`worker.js` + these files as static assets) bound to
`marketplace.bitcoineconomy.ai` as a Custom Domain. See § Deploys.

## ONE directory, four sources (merged 2026-07-29)

The directory used to be **three tabs** — "Live from the relays", "Curated
registry", "Wider L402 (via 402index)" — each with its own row shape, its own
category strings, and its own intro paragraph. A reader looking for "inference I
can pay for in sats" had to check three places and reconcile three vocabularies,
and one tab rendered an empty table because nobody had self-listed yet. Three
directories is a hodgepodge, not a directory.

Now there is **one table**. Where a row came from is a `source` **filter**:

| source | what it means |
|---|---|
| `curated` | Editor-verified against primary sources. The only rows a human checked. Sorts first. |
| `announced` | Self-listed via a signed Nostr kind-38555 announcement. Permissionless, probed, **not endorsed**. |
| `external-index` | 402index.io's verified feed, selectively passed through **with attribution**. Third-party-indexed AND third-party-verified. |
| `gateway-observed` | Hosts seen settling through Alby's **l402.space** gateway — the only source whose figures come from *real payments* rather than probes. |

Every row also carries a **`rail`**, because "payable" is not one thing:

- `bitcoin-native` — the agent pays directly in sats.
- `via-gateway` — settles in USDC/Tempo upstream; sats-payable only through
  `links.gateway_url` (l402.space). A real payment route **and** a custodial hop.
  Stated per row rather than averaged into "payable".
- `fiat-only` — no Bitcoin path at all. An agent holding sats cannot buy it.

**One category vocabulary** (`taxonomy.mjs`) spans all four sources. The two-level
`category/subcategory` *shape* follows 402index's convention — that detail was
worth adopting. Their *values* were not: ~150 top-level strings with casing
duplicates (`AI`/`ai`, `Security`/`security`) and 72,819 of ~86,000 endpoints
filed as `uncategorized`, most with no description at all. So we crosswalk theirs
onto ours, and **every row keeps `source_category`** (their raw string) plus a
`classification_confidence` of exact | top-level | inferred — the mapping is
checkable and disputable, not asserted. A row that won't classify isn't ingested,
which is also the noise filter: it's why there are no uncategorized rows here.

## What's here

| file | role |
|---|---|
| `index.html` | the directory UI — renders `master.json` as one filterable table, plus the supporting live inventory below it; client-side, no framework |
| `taxonomy.mjs` | **the shared category vocabulary** — 11 top-level categories + subcategories, the 402index crosswalk, and the keyword classifier for sources that publish no category at all (l402.space). Imported by the build, the ingest libs, and the announcement spec |
| `master-lib.mjs` | the merge — normalizes all four sources into ONE row shape, dedupes across sources (never within one), sorts curated-then-Bitcoin-native, and emits the `facets` block the UI and MCP filter on |
| `master.json` | **generated** — committed fallback of the mastered directory |
| `l402space-lib.mjs` / `l402space.json` | the gateway-observed source: l402.space's `/api/services` + `/api/stats`, merged per host |
| `directory.json` | **generated** — the curated registry core (the services an agent BUYS; machine fields auth/quickstart/api_base/pricing_url + `mcp_endpoint` where the provider runs its own MCP) |
| `tools.json` | **generated** — the tool catalog (what an agent EQUIPS: every `src/_raw/tools/` card, with toolbox_group/tool_type/prereq_tier + `mcp_endpoint` where present) |
| `entries/*.md` | **generated** — one clean Markdown route per entry |
| `llms.txt` | **generated** — the agent manifest for the subdomain (opens with the one-fetch `master.json` recipe, then the per-source documents) |
| `openapi.json` | **generated** — OpenAPI 3.0 description of the GET routes for agents that don't speak MCP (operationIds getMasterDirectory/getDirectory/getToolCatalog/getLiveSnapshot/getPriceIndex/getExternalIndex/getGatewayObserved/getUptimeHistory/getEntry) |
| `.well-known/ai-plugin.json` | **generated** — the OpenAI-plugin-era discovery manifest; points legacy/non-MCP agents at `openapi.json` |
| `snapshot.json` | **generated** — committed fallback of the live Nostr snapshot (Routstr 38421 providers **with probe status**, NIP-87 38172/38173 mints, 38000 reviews) |
| `models.json` | **generated, minified** — committed fallback of the cross-provider inference price index (model → alive providers, cheapest first, sats pricing) |
| `directory-overlay.json` | hand-authored directory fields (category **+ subcategory** — validated against `taxonomy.mjs` at build time, so a typo fails the build rather than silently splitting a filter; what-an-agent-buys, payment methods, automatability tier, auth/quickstart + verified api_base/pricing_url + per-entry `mcp_endpoint`; plus the top-level `_tool_mcp_endpoints` map for tool cards that ship an MCP) merged over card frontmatter |
| `build.mjs` | generator: cards (`../src/_raw/`) + overlay → `directory.json`, `tools.json`, `entries/`, `llms.txt`, `openapi.json`, `.well-known/ai-plugin.json` |
| `fetch-external.mjs` | local CLI for the two OUTSIDE sources + the merge: `--write` regenerates `l402index.json`, `l402space.json` and `master.json`. Both upstreams flake (402index 502s intermittently), so each query retries and **a tier that comes back empty keeps its previous committed document and warns** — an empty tier reads as "nothing to sell here", which would be a lie. (Replaced `fetch-402index.mjs`, which only did a third of this.) |
| `l402index-lib.mjs` | the external-index source: 402index.io's feed, all three protocols. Reliability-sorted queries are host-dominated (their top 400 verified L402 rows come from **six** hosts, 375 of them `llm402.ai`), so it also queries per-category for breadth, then applies a per-host cap and a per-category cap. Dropped counts are published, never silently truncated |
| `sample-relays.mjs` | local CLI: query relays + **probe announced clearnet endpoints**, print inventory, `--write` regenerates `snapshot.json` + `models.json` |
| `snapshot-lib.mjs` | shared relay-query + endpoint-probe + snapshot/index-shape logic (used by the CLI **and** the worker — one schema) |
| `worker.js` | Cloudflare Worker: cron → relays + probes + the two external sources → KV, then builds `master.json` from whatever that run produced (falling back per-tier to its last good KV copy, so one flaky upstream can't blank a tier); serves `/mcp` and every `/live/*` route; assets otherwise |
| `mcp-lib.mjs` | the MCP server — exposes the directory + tool catalog + price index as Model Context Protocol tools (`find_service`, `get_service`, `find_tool`, `get_tool`, `price_model`, `list_categories`, `list_mcp_servers`, `get_quote`, `find_l402_endpoints`, `get_uptime`, `find_work`) at `POST /mcp` |
| `wrangler.jsonc` | worker config (two crons — hourly relay read, 6-hourly full probe pass — KV binding, static assets) |
| `_headers` | CORS for the agent routes |

**Never hand-edit the generated files.** Change a card in `src/_raw/` or
`directory-overlay.json`, then run `node build.mjs` from this folder.
Refresh the committed fallbacks occasionally with `node sample-relays.mjs --write`
(relays + price index) and `node fetch-external.mjs --write` (the two external
sources + `master.json`). Read the warnings the latter prints before committing.

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
  6-hourly probe cron (the hourly relay pass appends no run), covering the announced tiers **and the marketplace's own
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
- `find_work` — **the buy side, and the only tool here that is not about spending.** Signed offers to
  pay an agent in sats to do a job (kind 38556), each carrying a checkable `acceptance` test. Defaults
  to the cohort an agent can actually act on (open, unexpired, well-formed). **No escrow, no
  arbitration, no fee:** `amount_sats` is offered, not held, and `status` is what the poster published,
  not something this directory verified. Claims are NIP-22 comments; payment proof is a NIP-57 zap
  receipt any third party can check without us.

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

**How it ships.** `npm run deploy marketplace` from the repo root, or
`npx wrangler deploy` from this folder. **Push deploys nothing** — no repo here is
wired to GitHub (see the root `CLAUDE.md`). Deploying is a deliberate act that
follows verification.

**What serves the domain.** The Worker `bitcoineconomy-marketplace`, bound to the
hostname as a **Custom Domain** and declared in `wrangler.jsonc`:

```jsonc
"routes": [{ "pattern": "marketplace.bitcoineconomy.ai", "custom_domain": true }]
```

Cloudflare owns the DNS record and keeps it in step with that binding — nothing to
hand-maintain. **All three Workers on this account are wired this way**
(`bitcoineconomy.ai`, `radvladdy.com`, and this one), so there is one shape to learn.

*Until 2026-08-05 this was a zone route instead, which needed a hand-made proxied DNS
record aimed at a black-hole IP purely so the name resolved. It worked, but it read as
a misconfiguration to anyone looking at the DNS tab, and it was the only Worker here
not using a custom domain. Converted; don't go back.*

**History (do not re-do).** This started as a git-connected Pages project, also named
`bitcoineconomy-marketplace`, which the Worker's zone route silently shadowed —
Workers routes take precedence over a Pages custom domain, so the Pages project
rebuilt on every push to a `.pages.dev` URL nobody visited. Its git connection was
removed 2026-08-05 and **the Pages project was deleted the same day**; nothing of it
remains. The `SNAPSHOT` KV namespace and the crons that refresh
`/live/snapshot.json` are live and declared in `wrangler.jsonc`. If `/live/*` ever
goes quiet, the UI falls back to the committed `snapshot.json` — which means **a 200
on `/live/snapshot.json` is not evidence the Worker is healthy.** Check the Worker's
domain binding, or compare behaviour on a path that doesn't exist — a request for a
path with no asset should 404, and anything answering 200 to that is not this Worker.

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
