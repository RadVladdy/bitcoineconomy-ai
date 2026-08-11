---
name: Taproot Assets
slug: taproot-assets
layer: bridges
toolbox-group: bridges
tagline: Lightning Labs' protocol for issuing assets — including stablecoins — on Bitcoin and moving them over Lightning rails. Lightning rails for assets, not Bitcoin substrate.
tool-type: software
maintainer: Lightning Labs
repo: https://github.com/lightninglabs/taproot-assets
docs: https://docs.lightning.engineering/the-lightning-network/taproot-assets
site: https://lightning.engineering
x: "@lightning"
latest-release: v0.8.1
release-date: "2026-06-08"
stack-section: "Marketplace"
status: published
last-verified: 2026-07-19
order: 53
prereq-tier: lightning-node
prereqs:
  - "a Lightning node running the tapd daemon, with compatible Lightning Terminal versions for grouped-asset channels"
  - "a Bitcoin node under it (Bitcoin Core, or Neutrino)"
  - "Taproot-Assets-capable software on both ends — rails for issued assets, not trustless substrate"
tags:
  - taproot-assets
  - lightning-labs
  - stablecoins
  - asset-issuance
  - lightning-rails
  - tapd
---

## What it is

Taproot Assets (the `tapd` daemon) is a Lightning Labs protocol for issuing assets — including stablecoins — on Bitcoin L1 via Taproot, and transferring them over Lightning rails. It's billed as the first multi-asset Lightning protocol on mainnet. **v0.8** (2026-06) ships a developer **SDK** for integrating stablecoins-on-Bitcoin, plus backup & restore, more multi-asset liquidity controls, and faster proof verification.

This card is the *protocol/integration* lens. For using Taproot Assets to swap BTC↔USDT over Lightning (the venue lens), see its [exchange card](/exchanges/taproot-assets).

The crucial framing, held explicitly at [Treasury](/treasury): Taproot Assets provides Lightning *rails* for non-Bitcoin assets — it is **not** Bitcoin *substrate*. An agent might use a stablecoin over Taproot Assets at the boundary for unit-of-account stability, but the settlement substrate underneath is still Bitcoin. Keeping rails and substrate distinct is the whole point of putting this in Bridges, not the Stack.

## When to use it

- Moving stablecoins (or other issued assets) over Lightning rails when an agent needs a stable unit of account at the edge.
- Asset issuance anchored to Bitcoin L1 with Lightning transfer.
- Building on the v0.8 **SDK** to onboard stablecoin functionality programmatically — note this is developer integration tooling, not a turnkey hosted swap API (see the exchange card's agent-access note).
- Boundary use cases — pair with the substrate underneath, don't mistake it for the substrate.

## Dependencies

A Lightning node running the `tapd` daemon — backed by a [Bitcoin node](/tools/bitcoin-core) (Bitcoin Core, or Neutrino) — with compatible Lightning Terminal versions for grouped-asset channel funding; both ends of a transfer need Taproot-Assets-capable software. The v0.8 SDK eases developer integration but does not remove the node requirement. Rails for issued assets, not trustless substrate — the asset is only as good as its issuer's solvency and redemption.

## Quick start

Run `tapd` from `github.com/lightninglabs/taproot-assets` (v0.8 latest); developers can build on the new SDK. Docs at `docs.lightning.engineering/the-lightning-network/taproot-assets`. **Read the Operational Safety Guidelines before any mainnet use.**

## Gotchas

- The daemon is still **alpha-state on mainnet** per Lightning Labs' own safety docs — there can be bugs. v0.8 (2026-06) **adds backup & restore** (closing an earlier gap) alongside the SDK, multi-asset liquidity controls, and faster proof verification — but the alpha-state caution still stands; read the Operational Safety Guidelines first.
- **Issuer trust is not removed** — a Taproot Assets stablecoin is only as good as its issuer's solvency and redemption. This is rails, not trustless substrate.
- Grouped-asset channel funding requires compatible Lightning Terminal versions; confirm your stack lines up.
