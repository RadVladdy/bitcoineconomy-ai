---
title: Taproot Assets
slug: taproot-assets
type: exchange-card
category: noncustodial-swap
featured: false
kyc: none
custody: self-custody
lightning: true
stablecoins: [USDT (Lightning, via Taproot Assets)]
fiat: false
agent-access: limited
bridges:
  - BTC/Lightning↔stablecoin (edge-node FX)
trust-model: noncustodial-rails-fx
links:
  site: https://lightning.engineering
  docs: https://docs.lightning.engineering/the-lightning-network/taproot-assets
status: v0-2026-06-06-structural-verified
links-verified: 2026-06-06
---

# Taproot Assets

> [!info] This is the *exchange* lens of Taproot Assets. For the protocol/integration view — issuing and moving assets, running `tapd` — see its [tools card](/tools/taproot-assets).

**What it is.** Not a venue but a **protocol-level FX capability**: Taproot Assets turns Lightning into a *decentralized foreign-exchange network*, so an agent can pay in sats and a counterparty can receive a stablecoin (or vice versa) over Lightning. **USDT has been live on Lightning via Taproot Assets since March 2026.**

**What it bridges.** **BTC / Lightning ↔ USDT** (and other issued assets), converted in-flight. There is no bank-fiat leg.

**How the swap works.** Conversion happens at the **routing layer via edge nodes** — any Taproot-Assets-aware Lightning node can act as one. Before an invoice is generated, the parties agree an exchange rate (each edge peer sets its own, competing on rate/fees); the payment then routes through asset channels, and the receiver validates it got the expected asset amount. It's a swap embedded in a Lightning payment, not a trip to an exchange.

**Agent access *(limited)*.** There is **no clean REST swap API** like Boltz's. An agent needs `tapd` (or a Taproot-Assets-capable wallet) and Taproot Assets channels with edge nodes that quote the pair. Real, but materially more setup than an API-driven swap — weigh it against Boltz/Flashnet for autonomous use.

**Dependencies.** A Taproot-Assets-capable Lightning stack (`tapd` + compatible Lightning Terminal) and a channel/peer that provides asset liquidity for the pair. Self-custodial; no account, no KYC at the protocol layer.

**Gotchas.** **Rails, not substrate.** The rail-side properties are excellent (Lightning fees, Lightning speed), but **the asset is unchanged: USDT-on-Lightning still carries Tether's issuer freeze surface** — censorship-resistance is satisfied or not *at the asset layer*, and a regulated stablecoin does not satisfy it. Edge-node liquidity for a given pair may be thin or absent. `tapd` is still alpha-stage on mainnet per Lightning Labs' own safety docs — read the Operational Safety Guidelines first.

**Links.** [lightning.engineering](https://lightning.engineering) · docs `docs.lightning.engineering/the-lightning-network/taproot-assets` · protocol view: [tools card](/tools/taproot-assets).
