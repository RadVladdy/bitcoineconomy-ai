---
name: OpenAgents
slug: openagents
layer: services
collection: services
tagline: A Bitcoin-native marketplace for machine work — sovereign agents hold their own keys, sell spare compute, and get paid in Bitcoin over Lightning, across five interlocking markets.
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
payment: lightning (NIP-57 zaps, pay-after-verify)
identity: nostr sovereign-agent (proposed NIP-SA; npub per agent)
custody: self-custodial (BIP39-derived agent wallets; FROSTR threshold signing)
kyc: none
bitcoin-native: true
stack-section: "§5"
status: v0-2026-06-04
last-verified: 2026-06-04 (two inbox intelligence reports — grok + gemini)
order: 39
tags:
  - openagents
  - machine-work-marketplace
  - lightning
  - nostr
  - sovereign-agents
  - self-custody
  - compute-market
---

## What it is

OpenAgents (OpenAgents, Inc. — `openagents.com`) is building **"the economic infrastructure for machine work"**: a Bitcoin-native marketplace where autonomous **sovereign agents** hold their own cryptographic identities and funds, buy and sell work, and settle in Bitcoin over Lightning — with no centralized custodian in the middle. Rather than treating AI as a chat box, it treats models as economic actors that earn and spend sats. It is, in effect, the agent-economy thesis built as a live marketplace, and the closest existing model for the kind of services directory this section points toward.

The ecosystem spans **five interlocking markets** — **Compute, Data, Labor, Liquidity, and Risk** — so the same substrate that prices a second of inference can also underwrite execution warranties or hedge future compute demand. Founded and led by **Christopher David (@AtlantisPleb)**, Austin; built in public (GitHub `OpenAgentsInc`, active Discord).

## What an agent does here

Two-sided, like the Services layer it anchors:

- **Offer (earn).** A user or agent sells spare compute — inference, embeddings, training — through the **Pylon** node (for data centers and advanced users) or the **Autopilot** desktop app (press "Go Online"; jobs run locally; earnings land in an integrated Lightning wallet). Stranded consumer hardware (Macs, gaming PCs) becomes a paid compute provider.
- **Consume (spend).** Agents purchase machine work across the five markets and pay per result, settling over Lightning after verification.

## Dependencies & payment

**Dependencies:** a self-custodial Lightning wallet (BIP39-derived) and a [Nostr](/tools/nostr) identity (`npub`); to *offer* compute, the **Autopilot** desktop app or a **Pylon** node, and to *consume*, a client that can pay Lightning per result. **Payment:** Lightning sats via NIP-57 zaps, settled **after** the work is verified (pay-after-verify).

## Quick start

Install **Autopilot** (desktop) or run a **Pylon** node to provide compute and start earning sats; agents transact and settle over Lightning. See `docs.openagents.com` and the `OpenAgentsInc/openagents` repo for the architecture (Nexus coordination layer, the WorkUnit/verification/settlement kernel) and current release state — some features (e.g. the cloud coding agent) are invitation-only, and the project is shipping actively in public.

## Gotchas

- **Early but shipping.** Pylon earning is live; Autopilot and a voice-first mobile agent are in progress. Ambitious scope (a full agent economy) means execution risk is real.
- **Hosted coordination initially.** The **Nexus** coordination/treasury layer is hosted by the company at first (open-source for others to run later) — a temporary centralization point until self-hosting is common.
- **Verification is load-bearing.** The model's integrity depends on verifiable outcomes; quality control and the Risk market exist precisely because unverified machine output can do economic damage.
- **Company-backed.** Venture-funded startup (2026 raise) rather than a pure protocol — moving metrics (funding, node counts, sats paid) are tracked in [[Field-Notes|Field Notes]], not here.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

**Why it fits.** A clean **Bitcoin-substrate** fit, not a hybrid: settlement is Lightning sats (NIP-57 zaps), identity is Nostr (proposed NIP-SA), and agent wallets are **self-custodial** (BIP39-derived, with FROSTR threshold signatures so no single node operator can extract an agent's keys). It passes the project's crypto≠Bitcoin discipline outright, and reads as a **peer/ally**, not a competitor — a natural cross-listing and a possible `llms.txt`/collaboration door.
