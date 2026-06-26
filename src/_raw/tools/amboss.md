---
name: Amboss
slug: amboss
layer: bridges
toolbox-group: bridges
tagline: A Lightning channel-liquidity marketplace — buy inbound capacity from a public market with one API call (or an MIT MCP server), no account needed.
tool-type: service
two-sided: consume + offer
maintainer: Amboss Technologies
repo: https://github.com/AmbossTech/magma-mcp
docs: https://docs.amboss.tech/developer
site: https://magma.amboss.tech
stack-section: "§2"
status: published
last-verified: 2026-06-25
order: 53
prereq-tier: lightning-node
prereqs:
  - "your own Lightning node (LND, Core Lightning, or Eclair) reachable at its connection URI"
  - "on-chain or Lightning funds to pay the channel-lease invoice"
  - "optional only: an Amboss account / MAGMA_API_KEY for persistent order history — the buy path needs neither"
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

Two things make it agent-drivable: a **public GraphQL API** (no account needed to buy) and an **MIT-licensed MCP server** (`@ambosstech/magma-mcp`) that exposes the whole purchase as a single `buy_lightning_liquidity` tool. Alongside Magma, Amboss runs **Magma AI** (a recommender that suggests which peers and sizes to buy — a recommender, not a hands-off rebalancer), **Rails** (a self-custodial liquidity-provider yield service for the sell side), and a Lightning explorer/analytics suite.

## When to use it

- Giving an agent inbound liquidity so it can **receive** Lightning payments without hand-picking channel partners.
- Buying a channel programmatically — sized in dollars, paid in sats — from inside an agent's own workflow.
- Earning yield on idle bitcoin by **selling** liquidity (the sell side, via Magma sellers or Rails).

It buys *new* inbound capacity from a third party — distinct from [Loop](/tools/loop), which moves an agent's *own* balance between Lightning and L1.

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

Fills the Lightning liquidity-provider gap — the deployed, agent-drivable answer to the inbound-liquidity problem raised in [The Stack](/stack) (§2, Liquidity management) and flagged in [Field Notes](/field-notes) as honest engagement. Placed as a Tools card under `bridges` (beside Loop, the only other liquidity entry) rather than Services, because liquidity is Lightning infrastructure (Stack / cyan) and the Services tiles cover only inference/compute/commerce/privacy. Directory entry: category `liquidity` (sourced from this card), automatability `api-no-account` (the buy path is public), prereq-tier `lightning-node`, two-sided (buy + sell).

The Amboss MCP (`@ambosstech/magma-mcp`, **stdio/npm — not a hosted URL**) is the first `mcp_endpoint` candidate for the agent-interop roadmap (10a, the mcp_endpoint registry): its endpoint metadata is staged on the directory-overlay entry, inert until the registry passthrough is wired. Amboss also proves the registry must express **transport** (stdio vs http), not just a URL, and that the generic L402 `get_quote` probe does not fit a GraphQL-mutation provider — both captured as 10a design inputs.
