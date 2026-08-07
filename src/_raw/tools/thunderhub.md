---
name: ThunderHub
slug: thunderhub
layer: integration
toolbox-group: node-toolkits
tagline: An open-source LND node manager in the browser — channel, liquidity, and fee management for your own node, and now the host for Amboss's RailsX (self-custody stablecoin trades) and Magma (one-click liquidity).
tool-type: software
maintainer: ThunderHub (apotdevin)
repo: https://github.com/apotdevin/thunderhub
docs: https://docs.thunderhub.io
site: https://thunderhub.io
license: MIT
stack-section: "§2"
status: published
last-verified: 2026-08-07 (repo + docs read; RailsX spelling and the litd requirement corrected)
order: 34
prereq-tier: lightning-node
prereqs:
  - "your own LND node — and **`litd` specifically** for RailsX/Magma asset trading (tapd is bundled inside it), reachable over gRPC with a macaroon + TLS cert"
  - "on-chain or Lightning funds to open/manage channels"
tags:
  - thunderhub
  - lnd
  - node-management
  - channel-management
  - liquidity
  - railsx
  - magma
  - lightning
---

## What it is

ThunderHub is an open-source (MIT) **LND node manager you run in your browser** — connect it to your own LND / Lightning Terminal (`litd`) node over gRPC and manage channels, balances, routing fees, liquidity, and accounting from any device. No account, no KYC: it's a self-hosted dashboard for a node you already run, holding no funds and acting only with macaroon-scoped permissions. It matters for the agent economy as the **operator surface for autonomous Lightning liquidity** — and it's now the host for Amboss's **RailsX** (self-custody BTC↔USDT/USDC trades over Taproot-Assets channels, by circular payments) and **Magma** (one-click inbound-liquidity leasing), turning a node dashboard into a self-custody trading + liquidity console.

## When to use it

- Managing a Lightning node's channels, fees, and liquidity from one dashboard — the operator's cockpit.
- Running Amboss **Magma** (buy inbound liquidity) and **RailsX** (trade BTC↔stablecoin self-custodially) without leaving the node manager.
- A human-in-the-loop control plane over an agent's node — today's realistic shape, since the deep automation lives in the node / CLI and tools like [[lightning-agent-tools|lightning-agent-tools]], not the dashboard.

## Dependencies

Your own **LND** node for the manager features, and **`litd`** for the asset-trading features (Amboss: *"update Thunderhub to the latest version and connect litd"*), reachable over gRPC with a macaroon + TLS cert, plus on-chain / Lightning funds for channels. Self-hosted (Docker image `apotdevin/thunderhub`, or bundled by node OSes like Umbrel / Start9 / RaspiBlitz); MIT-licensed; no account or KYC. It manages a node; it does not custody funds.

## Quick start

Deploy from `github.com/apotdevin/thunderhub` (or enable it on your node OS), point it at your LND macaroon + TLS cert, and open the dashboard; docs at `docs.thunderhub.io`. For self-custody stablecoin trading and liquidity, enable the Amboss **RailsX** / **Magma** integration inside ThunderHub.

## Gotchas

- **GUI-first — agent automation is limited.** ThunderHub is a human operator's dashboard (a NestJS GraphQL backend powering its own React UI), not a documented agent-drivable API. An autonomous agent manages liquidity through the node / CLI and tooling like [[lightning-agent-tools|lightning-agent-tools]] or [[lnbits|LNbits]]; ThunderHub is the cockpit over that, not the autopilot.
- **You run the node.** It presupposes an LND / `litd` node and funds; it manages, it doesn't custody.
- **RailsX stablecoins are wrapped, issuer-backed assets.** The USDT/USDC traded via RailsX are 1:1-backed wrapped assets (Speed Wallet) over Taproot Assets — the *rail* is self-custodial; the *asset* still carries its issuer's freeze surface. See the [Taproot Assets exchange card](/exchanges/taproot-assets) and RailsX.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Fills the node-manager gap in the toolbox — the operator surface that ties together the liquidity tools ([[amboss|Amboss / Magma]], Rails, [[loop|Loop]]) named in [[Stack|The Stack]] §2. Node-toolkit card. **Agent-access is limited (GUI-first)** — the GraphQL backend is internal to its own UI, not a documented agent API — so it is catalogued as equip-able tooling rather than added to the marketplace directory's agent-drivable set. Surfaced from the 2026-06-25 agent channel/liquidity research thread (Stefan Livera × Jesse Shrader / Amboss, `youtu.be/VO91uTYxTQs`), which confirmed RailsX is built into ThunderHub.

**Publications backlinks**

- [[Stack]] (this project) — §2 Liquidity management (the concept this equips)
- [[amboss|Amboss]] (this project) — Magma / Rails / RailsX run inside ThunderHub
- [[loop|Loop]] (this project) — sibling liquidity tool (own-balance Lightning↔L1)
