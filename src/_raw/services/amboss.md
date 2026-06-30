---
name: Amboss (Magma)
slug: amboss
layer: services
collection: services
tagline: A Lightning channel-liquidity marketplace — buy inbound capacity from a public market with one API call (or an MIT MCP server), no account needed.
tool-type: service
category: liquidity
featured: false
two-sided: consume + offer
maintainer: Amboss Technologies
repo: https://github.com/AmbossTech/magma-mcp
docs: https://docs.amboss.tech/developer
site: https://magma.amboss.tech
payment: lightning / on-chain — pay the channel-lease HODL invoice in sats
identity: none on the buy path (optional Amboss account adds order history)
custody: self-custodial — non-custodial HODL-invoice escrow; the leased channel opens directly to your own node
kyc: none
bitcoin-native: true
status: published
last-verified: 2026-06-27
order: 53
tags:
  - amboss
  - magma
  - liquidity-marketplace
  - inbound-liquidity
  - lightning
  - mcp
---

## What it is

Amboss is a Lightning Network infrastructure company; its agent-relevant product is **Magma**, a marketplace for **channel liquidity**. A node that needs *inbound* liquidity — the capacity to **receive** payments — buys a channel from a seller who locks up bitcoin to open it and earns yield for the lease term. Magma never takes custody: it escrows the deal with a HODL invoice, so the seller is paid only if it actually opens the channel. For an autonomous agent that earns over Lightning, this is the deployed answer to the inbound-liquidity problem — paid-for capacity to receive, on demand, without running a liquidity desk.

Two things make it agent-drivable: a **public GraphQL API** (no account needed to buy) and an **MIT-licensed MCP server** (`@ambosstech/magma-mcp`) that exposes the whole purchase as a single `buy_lightning_liquidity` tool. Magma is one product in a broader Amboss stack: **Magma AI** (a recommender that suggests which peers and sizes to buy — a recommender, not a hands-off rebalancer), [Rails](/services/rails) (self-custodial liquidity-provider yield — the sell side), [Reflex](/tools/reflex) (API automation for a node you run), [Amboss Payments](/services/amboss-payments) (multi-asset BTC/USDT/USDC send-receive-settle over an LND node), [RailsX](/exchanges/railsx) (a Lightning-native P2P DEX for BTC↔stablecoin swaps), and a Lightning explorer/analytics suite.

## When to use it

- Giving an agent inbound liquidity so it can **receive** Lightning payments without hand-picking channel partners.
- Buying a channel programmatically — sized in dollars, paid in sats — from inside an agent's own workflow.
- Earning yield on idle bitcoin by **selling** liquidity (the sell side, via Magma sellers or [Rails](/services/rails)).

It buys *new* inbound capacity from a third party — distinct from [Loop](/tools/loop), which moves an agent's *own* balance between Lightning and L1. Once you have capacity, [Reflex](/tools/reflex) is the software that automates ongoing routing and liquidity management.

## Dependencies

Your own Lightning node — **LND, Core Lightning, or Eclair** — reachable at its connection URI (`pubkey@host:port`, from `getinfo`), plus funds to pay the lease invoice. The buy path is a **public** GraphQL mutation (`liquidity.buy` at `magma.amboss.tech/graphql`): no Amboss account and no API key are required — anonymous buyers receive a `session_key` to track the order. An optional `MAGMA_API_KEY` (from an Amboss account) adds persistent history. Amboss's other GraphQL APIs (Space/Reflex analytics, Rails) are key-gated, and Amboss does not permit commercial use of its **free** APIs — confirm terms for production use.

## Quick start

Estimate with the public `liquidity_per_usd` query, then call the public `liquidity.buy` mutation with your node's `connection_uri` and `usd_cents` (minimum 500 = $5); pay the returned HODL invoice from your node and poll `get_order` until `VALID_CHANNEL_OPENING`. Or skip the GraphQL plumbing and run the MIT MCP server — `npm install -g @ambosstech/magma-mcp` — which wraps the flow as one `buy_lightning_liquidity` tool (it runs over **stdio** as a local subprocess; it is **not** a hosted endpoint). Docs at `docs.amboss.tech/developer`; marketplace at `magma.amboss.tech`.

## Gotchas

- **You still need a node.** Magma opens a channel *to* your node — it presupposes an LND/CLN/Eclair node and funds; it is not a custodial "receive without infrastructure" path. To skip channel management entirely, the L3 ecash route ([Cashu](/tools/cashu)) is the lighter alternative.
- **Magma AI is a recommender, not an autopilot.** It suggests peers and sizing; it does not continuously rebalance the node for you.
- **The lease is time-bounded.** A bought channel is leased for a term — plan for renewal or replacement rather than treating inbound liquidity as permanent.
- **Free-API commercial limit.** The public buy path is fine, but Amboss's free analytics APIs are not licensed for commercial use — clear production terms with Amboss.
- **A marketplace is not a guarantee.** Sellers and pricing vary; Magma runs a reputation system, but verify before relying on any single counterparty.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Fills the Lightning liquidity gap — the deployed, agent-drivable answer to the inbound-liquidity problem raised in [The Stack](/stack) (§2, Liquidity management) and flagged in [Field Notes](/field-notes) as honest engagement. **Re-homed to Services / The Market (2026-06-27)** from the Tools catalog. Rationale (RadVladdy's call): liquidity isn't software you *run* — buying a channel (Magma) and selling capacity for yield ([Rails](/services/rails)) are **marketplace transactions**, so they belong in The Market (where "what an agent buys and sells" lives), which is also how the directory already classified them. The software you *equip* is [Reflex](/tools/reflex) — it stays in Tools. The Stack keeps the *concept* explainer (§2) with a brief pointer here. `/tools/amboss` 301-redirects to `/services/amboss` (the Strike/Routstr re-home precedent). Directory entry: category `liquidity`, automatability `api-no-account` (the buy path is public), two-sided (buy + sell).

The Amboss MCP (`@ambosstech/magma-mcp`, **stdio/npm — not a hosted URL**) is the first `mcp_endpoint` registry route (10a): an agent discovers Magma in our directory, then connects to magma-mcp to act. Amboss also proved the registry must express **transport** (stdio vs http), not just a URL, and that the generic L402 `get_quote` probe does not fit a GraphQL-mutation provider.
