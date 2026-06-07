---
name: Taproot Assets
slug: taproot-assets
layer: bridges
tagline: Lightning Labs' protocol for issuing assets — including stablecoins — on Bitcoin and moving them over Lightning rails. Lightning rails for assets, not Bitcoin substrate.
tool-type: software
maintainer: Lightning Labs
repo: https://github.com/lightninglabs/taproot-assets
docs: https://docs.lightning.engineering/the-lightning-network/taproot-assets
site: https://lightning.engineering
x: "@lightning"
latest-release: v0.7.2
stack-section: "Marketplace"
status: published
last-verified: 2026-06-02
order: 53
tags:
  - taproot-assets
  - lightning-labs
  - stablecoins
  - asset-issuance
  - lightning-rails
  - tapd
---

## What it is

Taproot Assets (the `tapd` daemon) is a Lightning Labs protocol for issuing assets — including stablecoins — on Bitcoin L1 via Taproot, and transferring them over Lightning rails. It's billed as the first multi-asset Lightning protocol on mainnet.

This card is the *protocol/integration* lens. For using Taproot Assets to swap BTC↔USDT over Lightning (the venue lens), see its [exchange card](/exchanges/taproot-assets).

The crucial framing, held explicitly at [The Marketplace](/marketplace): Taproot Assets provides Lightning *rails* for non-Bitcoin assets — it is **not** Bitcoin *substrate*. An agent might use a stablecoin over Taproot Assets at the boundary for unit-of-account stability, but the settlement substrate underneath is still Bitcoin. Keeping rails and substrate distinct is the whole point of putting this in Bridges, not the Stack.

## When to use it

- Moving stablecoins (or other issued assets) over Lightning rails when an agent needs a stable unit of account at the edge.
- Asset issuance anchored to Bitcoin L1 with Lightning transfer.
- Boundary use cases — pair with the substrate underneath, don't mistake it for the substrate.

## Dependencies

A Lightning node running the `tapd` daemon, with compatible Lightning Terminal versions for grouped-asset channel funding; both ends of a transfer need Taproot-Assets-capable software. Rails for issued assets, not trustless substrate — the asset is only as good as its issuer's solvency and redemption.

## Quick start

Run `tapd` from `github.com/lightninglabs/taproot-assets`; docs at `docs.lightning.engineering/the-lightning-network/taproot-assets`. **Read the Operational Safety Guidelines before any mainnet use.**

## Gotchas

- The daemon is still **alpha-state on mainnet** per Lightning Labs' own safety docs — there can be bugs and not all backup/safety mechanisms are implemented.
- **Issuer trust is not removed** — a Taproot Assets stablecoin is only as good as its issuer's solvency and redemption. This is rails, not trustless substrate.
- Grouped-asset channel funding requires compatible Lightning Terminal versions; confirm your stack lines up.
