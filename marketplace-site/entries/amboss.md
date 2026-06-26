# Amboss

> Inbound Lightning liquidity — buy a channel opened to your node so the agent can receive payments; sized in dollars, leased for a term, paid in sats

A Lightning channel-liquidity marketplace — buy inbound capacity from a public market with one API call (or an MIT MCP server), no account needed.

- Category: liquidity
- Payment methods: lightning, onchain
- KYC: none
- Custody: self-custodial — non-custodial HODL-invoice escrow; the leased channel opens directly to your own node
- Automatability: api-no-account — API with no account — payment or a key is the credential; zero human onboarding
- Auth: none on the buy path — liquidity.buy is a public GraphQL mutation; anonymous buyers get a session_key to track the order. Optional MAGMA_API_KEY (Amboss account) adds persistent history.
- Quickstart: Estimate with the public liquidity_per_usd query, then call the public liquidity.buy mutation (magma.amboss.tech/graphql) with your node's connection_uri (pubkey@host:port) and usd_cents (min 500); pay the returned HODL invoice from your LND/CLN/Eclair node; poll get_order to VALID_CHANNEL_OPENING. Or run the MIT magma-mcp server (npm @ambosstech/magma-mcp) — one buy_lightning_liquidity tool over stdio.
- Direction: consume + offer
- Maintainer: Amboss Technologies
- Site: https://magma.amboss.tech
- Docs/API: https://docs.amboss.tech/developer
- Repo: https://github.com/AmbossTech/magma-mcp
- Full card (verified detail, gotchas): https://bitcoineconomy.ai/tools/amboss
- Provenance: curated (last verified 2026-06-25)

Magma is a leading Lightning channel-liquidity marketplace; the buy side is agent-drivable with no account. Two-sided — sellers earn yield providing liquidity (Magma sell-side / Rails). Magma AI recommends peers/sizing (a recommender, not an auto-rebalancer).

---

Part of [The Marketplace directory](https://marketplace.bitcoineconomy.ai/) · registry JSON: https://marketplace.bitcoineconomy.ai/directory.json · full thesis: https://bitcoineconomy.ai/case
