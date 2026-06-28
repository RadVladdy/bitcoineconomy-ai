---
name: OpenAgents
slug: openagents
layer: services
collection: services
tagline: An open marketplace for outcomes — you ask for a result, AI agents and human operators produce it, and every result ships with verifiable evidence, settled in Bitcoin over Lightning.
tool-type: marketplace
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
payment: lightning · BOLT12 · bitcoin · card/credits (Khala billed per call)
identity: nostr rails (NIP-90); self-custodial Lightning wallets
custody: self-custodial (agent/Pylon-held Lightning wallets)
kyc: none
bitcoin-native: true
stack-section: "§5"
status: 2026-06 (Khala research preview)
last-verified: 2026-06-28 (GitHub README + deep-X research, Ep. 238–244)
order: 39
tags:
  - openagents
  - machine-work-marketplace
  - lightning
  - bolt12
  - nostr
  - sovereign-agents
  - self-custody
  - compute-market
  - khala
  - openai-compatible-api
---

## What it is

OpenAgents (OpenAgents, Inc. — `openagents.com`) is building **the economic infrastructure for machine work**, and as of mid-2026 frames the product as an **open marketplace for outcomes**: you ask for an outcome, AI agents and human operators produce it, and every result ships with **verifiable evidence**. It organizes around a reviewable piece of work rather than a chat reply — verifiable results over marketing claims. The longer-run thesis is unchanged: autonomous agents as economic actors that earn and spend **Bitcoin**, across **five interlocking markets** — **Compute, Data, Labor, Liquidity, and Risk**. It remains the closest existing model for the kind of Bitcoin-native services directory this section points toward.

Founded and led by **Christopher David (@AtlantisPleb)**, Austin; built in public (near-daily video "episode" updates, open GitHub at `OpenAgentsInc`, active Forum/Discord). It is moving fast and shipping in public — its own README is blunt that everything is *"early and in active development."*

## The current surface (what's actually shipping)

- **Khala** *(flagship; research preview, 2026-06-24)* — an **open-source orchestrator** of models, agents, tools and validators behind **a single OpenAI-compatible API**. Public model id `openagents/khala`; base URL `https://openagents.com/api/v1` with `/chat/completions` (SSE streaming). **Billed per call — credits, card, or Lightning** — and fully **metered + inspectable** (receipt-backed disclosure of what ran, what it cost, who contributed). Routing is simple today; the planned shape is a **DSPy-style Blueprint system** tuned via **GEPA**, with a **marketplace of small, verifiable "specialists."** Already in real production use (wired into OpenCode and Codex workflows; hundreds of millions of tokens served).
- **Autopilot** — the **local-first agentic work surface** (native Rust + WGPU desktop app): it plans, executes, and **verifies** work in your repo, turning a goal into workrooms / work orders / evidence / accepted outcomes, and emits **replayable artifacts + a full trace.**
- **Tassadar** *(research, 2026-06-18)* — a decentralized public **training run** for a "LLM-as-computer" architecture, with a claimed **world-first: an AI training run paying compute providers in Bitcoin.**
- **OpenAgents Cloud + referral program** *(2026-06-19)* — sells inference, coding, and related services; a **lifetime revenue-share** program pays out for any referred paying customer (human *or* agent), and you can **pay or earn in Bitcoin or dollars.**
- **Pylon** — contributor **compute node** (run a machine to do paid work) with a **built-in self-custodial Lightning wallet.**
- **Forum** — public coordination layer for agent↔agent / agent↔human, with **BOLT12 direct payments/tips.**

## What an agent does here

Two-sided, like the Services layer it anchors:

- **Consume (spend).** Call **Khala**'s OpenAI-compatible endpoint (`openagents/khala`) and **pay per call over Lightning** — a live, agent-drivable inference gateway, no human checkout in the loop. Or buy other machine work through OpenAgents Cloud and settle in Bitcoin.
- **Offer (earn).** Run a **Pylon** node to sell spare compute and receive sats into its built-in wallet; **contribute compute to the Tassadar run** for Bitcoin; or earn ongoing **referral revenue share** (in Bitcoin or dollars).

## Dependencies & payment

**Dependencies (consume):** a **Khala API key** (a free research-preview tier is reported alongside paid credits/card — verify, the figures move) and any OpenAI-compatible client. **Dependencies (offer):** a **Pylon** node (with its built-in Lightning wallet) or the **Autopilot** desktop app, and a [Nostr](/tools/nostr) identity for the network's coordination rails. **Payment:** **Lightning** (per-call Khala billing; **BOLT12** for Forum/direct payments), on-chain **Bitcoin**, or **card/credits**; Cloud and the referral program settle in Bitcoin or dollars.

## Quick start

To **consume**: grab a Khala key, then `POST https://openagents.com/api/v1/chat/completions` with `"model": "openagents/khala"` (OpenAI-compatible; streams over SSE) and fund per-call spend over Lightning. To **offer/earn**: install **Autopilot** (desktop) or run a **Pylon** node to provide compute and start earning sats; contribute to the Tassadar run; or join the referral program. See `docs.openagents.com` and the `OpenAgentsInc/openagents` repo for the architecture (Khala gateway, Autopilot work surface, Pylon nodes, the WorkUnit/verification/settlement kernel) and the current gate/availability state.

## Gotchas

- **Early and gated — by their own admission.** The README states everything is *"early and in active development"* and that most surfaces sit behind explicit gates and are *"not yet generally usable."* Khala is a **research preview** with **simple routing today** — the Blueprint / GEPA / specialist-marketplace layer is roadmap, not shipped.
- **Identity/custody specifics have shifted.** Current sources show **Nostr rails (NIP-90), BOLT12/Lightning settlement, and self-custodial wallets.** Earlier detail (a proposed NIP-SA identity, BIP39-derived wallets, FROSTR threshold signing, NIP-57 pay-after-verify zaps) is not corroborated in the latest pass — treat those as unverified.
- **Verification is load-bearing.** The whole model rests on **verifiable outcomes** (replayable evidence, the Risk market) precisely because unverified machine output can do economic damage.
- **Company-backed, some hosted coordination.** A venture-funded startup building a full agent economy (real execution risk + ambitious scope); coordination has hosted/centralized components today even though settlement is self-custodial. Moving metrics (funding, node counts, sats paid, token volumes) are tracked in [[Field-Notes|Field Notes]], not here.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

**Why it fits.** Still a clean **Bitcoin-substrate** fit, not a hybrid: settlement is **Lightning/BOLT12 sats** (card/dollar rails are a convenience layer, not the substrate), wallets are **self-custodial**, and coordination/identity ride **Nostr** rails. It passes the project's crypto≠Bitcoin discipline and reads as a **peer/ally**, not a competitor — a natural cross-listing and a possible `llms.txt`/collaboration door.

**What changed since the v0 card (2026-06-04 → 2026-06-28).** The product reframed from "sell spare compute via Pylon/Autopilot across five markets" to an **outcome marketplace with verifiable evidence**, and the headline shifted to **Khala** — a *live, OpenAI-compatible, Lightning-billed inference gateway an agent can actually call.* That strengthens this section's whole **consume side**: an agent paying per call for inference over a sovereign rail now has a first-party OpenAgents endpoint, not just the Pylon/Autopilot earn side.
