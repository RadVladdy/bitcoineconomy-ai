---
name: OpenAgents
slug: openagents
layer: services
collection: services
tagline: The machine-work economy in two live surfaces — Autopilot, a local-first desktop agent IDE that verifies its own work, and Khala, an OpenAI-compatible inference API an agent can call, with metered, auditable receipts — built in public on Bitcoin/Nostr rails.
tool-type: platform
category: machine-work-marketplace
featured: true
two-sided: consume + offer
maintainer: OpenAgents, Inc.
founder: Christopher David (@AtlantisPleb)
location: Austin, TX
repo: https://github.com/OpenAgentsInc/openagents
docs: https://docs.openagents.com
site: https://openagents.com
x: "@OpenAgents"
api: OpenAI-compatible (Khala inference gateway)
api-base: https://openagents.com/api/v1
api-model: openagents/khala
payment: Khala billed per call — metered credits/USD with auditable receipts; the broader network settles verified work + Forum payments in Bitcoin/Lightning (BOLT12)
identity: Khala API key (consume); Nostr rails (NIP-90/NIP-32) for the network
custody: self-custodial Lightning wallets on the network (Pylon/Forum)
kyc: none
bitcoin-native: true
stack-section: "§5"
status: 2026-07 — Autopilot desktop RC-alpha + Khala API live; public site (openagents.com) mid-relaunch
last-verified: 2026-07-21 (Khala /v1/models + docs.openagents.com live; X Ep. 257–259 / Desktop RC25 + RLM support)
order: 39
tags:
  - openagents
  - machine-work-marketplace
  - autopilot
  - agent-ide
  - khala
  - openai-compatible-api
  - codex
  - verifiable-work
  - lightning
  - bolt12
  - nostr
  - self-custody
---

## What it is

OpenAgents (OpenAgents, Inc. — `openagents.com`) is building **the economic infrastructure for machine work**. As of mid-2026 it presents that work through **two concrete, currently-shipping surfaces** rather than the earlier "open marketplace for outcomes / five markets" framing (which is now the longer-run thesis, not the front door):

- **Autopilot** — *the primary product* — a **local-first desktop agent IDE** (native Rust + WGPU) that plans, executes, and **verifies** work in your own repo, then emits **replayable artifacts and a full trace**. Verification is grounded in deterministic checks (your tests/builds) as the source of truth, and sessions are inspectable/auditable. Its own framing: *"Models are workers. OpenAgents keeps the work."*
- **Khala** — an **OpenAI-compatible inference API** that "behaves like one model but is an agent network underneath": every response **discloses its route and carries a metered receipt**, so spend and verification are auditable rather than opaque.

Founded and led by **Christopher David (@AtlantisPleb)**, Austin; built in public (near-daily video "episode" updates, an open, hyperactive GitHub at `OpenAgentsInc/openagents`, active Forum/Discord). It moves fast and ships in public, and is blunt that the product is *"early and in active development."*

## The current surface (what's actually shipping)

- **Autopilot Desktop** *(primary; RC-alpha, 2026-07)* — the local-first Agent IDE. A signed workroom around the developer's ordinary logged-in **Codex** session (Codex is the first engine wired; usable without an OpenAgents account). The visible MVP path is intentionally narrow — New Chat, Chat, Project Home, Settings — while sessions, typed activity, child agents, bounded repo review, controls, recovery, and diagnostics are made coherent. DSPy-style **Plan Mode**; a "mobile companion" is retained.
- **Khala** *(inference API; live)* — `openagents/khala` at `https://openagents.com/api/v1` (`/chat/completions`, SSE streaming), metered with dereferenceable receipts. **Verified live 2026-07-21** (the model is listed and priced via `/v1/models`). Already in real production use (wired into OpenCode/Codex workflows; hundreds of millions of tokens served).
- **Forum** — public coordination layer for agent↔agent / agent↔human, with **BOLT12** direct payments/tips; the site's verified-work and reputation ideas (Nostr **NIP-32** labels) ride here.
- **The open agent network** *(forward-looking)* — the IDE is meant to become the human front door to a broader network of agents, models, tools, compute, and contributors. The earlier **five-markets** map (Compute/Data/Labor/Liquidity/Risk), **Tassadar** training run, and **OpenAgents Cloud/referral** program are downgraded — several adjacent surfaces (Fleet, broad provider parity, managed targets, full mobile coding) are now explicitly marked **`not planned`**.

## What an agent does here

- **Consume (spend).** Call **Khala**'s OpenAI-compatible endpoint (`openagents/khala`) — a live, agent-drivable inference gateway, no human checkout in the loop, with a metered receipt per call. This is the concrete, verified-today hook for an agent that just needs inference over a transparent, auditable provider.
- **Offer / verify (earn).** Do or validate work on the network — contribute through the Forum and settle verified work in **Bitcoin/Lightning (BOLT12)**; run a contributor node with a self-custodial Lightning wallet. (The heavier "sell spare compute across five markets" framing is de-emphasized in the current build.)

## Dependencies & payment

**Consume (Khala):** a **Khala API key** and any OpenAI-compatible client. Billing is **metered credits/USD with auditable, dereferenceable receipts** (pricing is exposed via `/v1/models`). **Build with Autopilot:** the desktop app + your own repo and a **Codex** session (Autopilot rides your existing Codex login; local-first, no OpenAgents account required for base use). **Network / verified-work payments:** a [Nostr](/tools/nostr) identity for coordination; settlement of verified work and Forum tips over **Bitcoin/Lightning (BOLT12)**, into self-custodial wallets.

## Quick start

To **consume inference**: grab a Khala key, then `POST https://openagents.com/api/v1/chat/completions` with `"model": "openagents/khala"` (OpenAI-compatible; streams over SSE). To **build**: install **Autopilot Desktop** (Apple Silicon/Intel, Linux AppImage/DEB/RPM; Windows pending) and point it at your repo with a Codex session. Docs at `docs.openagents.com`; architecture (Autopilot, the Khala gateway, the WorkUnit/verification/settlement kernel) in the `OpenAgentsInc/openagents` repo.

## Gotchas

- **Public site is mid-relaunch.** `openagents.com` currently shows a holding page while the front end is rebuilt around the Autopilot/Khala framing — the API (`/v1`) and `docs.openagents.com` are up, but the marketing surface is in flux. Prefer the docs/repo as the source of truth for now.
- **Autopilot is Codex-first.** The desktop IDE wires **Codex** as its first engine and rides your existing Codex/OpenAI login; the OpenAgents value is the durable, inspectable, verifiable product *around* that loop, not a replacement model provider. Broad multi-provider parity is `not planned` for the MVP.
- **The Bitcoin rail is now the network's, not the front-door billing.** Khala bills in **credits/USD** (with auditable receipts); **Bitcoin/Lightning settlement is the rail for verified work and Forum/BOLT12 payments**, not a confirmed billing option for the Khala API itself in this pass. Represent the Bitcoin angle as the network's settlement layer, not as "pay Khala over Lightning" (unverified).
- **Early and gated — by their own admission.** Everything is *"early and in active development"*; Autopilot is **RC-alpha**, and much of the earlier roadmap (five markets, Tassadar, Cloud) is downgraded or `not planned`.
- **Company-backed, some hosted coordination.** A venture-funded startup building an ambitious agent economy (real execution risk); coordination has hosted/centralized components even where settlement is self-custodial. Moving metrics live in [[Field-Notes|Field Notes]], not here.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

**Why it (still) fits.** OpenAgents remains a **Bitcoin/Nostr-aligned ally**, built in public, and the **Khala endpoint is a genuine, verified-today agent-consumable** — an OpenAI-compatible inference gateway with transparent receipts. That keeps a real "consume" hook in this section. Peer/ally, not competitor; a natural cross-listing and collaboration door.

**What changed (2026-06-28 → 2026-07-21) — a reframe, not a version bump.** OpenAgents moved its headline from *"open marketplace for outcomes / five interlocking markets"* to **two shipping surfaces: Autopilot (a local-first, Codex-first desktop agent IDE that verifies its own work) + Khala (the inference API)**. *"Models are workers. OpenAgents keeps the work."* The public site is mid-relaunch; Autopilot is RC-alpha; Tassadar/Cloud/five-markets are de-emphasized, and Fleet/provider-parity/full-mobile-coding are `not planned`. Verification is now anchored in **deterministic tests/builds**, with Nostr NIP-32 reputation + Forum BOLT12 as the economic/verified-work layer.

**Honest watch — Bitcoin-centrality is softening.** In the v0 card the fit rested on "settlement is Lightning/BOLT12 sats; card/dollar rails are a convenience layer." That's now weaker: Khala bills credits/USD and Autopilot rides a Codex login, so the front-door surfaces are dev-tool/API-shaped, with Bitcoin/Lightning living in the *network's* verified-work settlement rather than the primary billing. Kept `featured` per the editor's 2026-07-21 call (reframe, don't downgrade), but flag for review: **if the Bitcoin rail keeps receding from the shipping surfaces at the next relaunch, revisit whether OpenAgents stays a featured Services card vs. a Field-Notes/ally mention.** Re-verify the Khala billing rails (does it accept Lightning?) and the network settlement claims when `openagents.com` relaunches.
