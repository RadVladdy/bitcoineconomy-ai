---
name: buy-liquidity
slug: buy-liquidity
tagline: Give an agent inbound Lightning liquidity so it can receive — buy a channel from the Magma marketplace in one call, composing this site's directory with Amboss's magma-mcp.
skill-group: commerce
read-only: false
mcp-servers:
  - "https://marketplace.bitcoineconomy.ai/mcp (discovery — this site)"
  - "@ambosstech/magma-mcp (liquidity — Amboss Magma)"
env:
  - MAGMA_API_KEY (optional — adds persistent order history; the buy path is public)
composes:
  - discover-and-buy
prereq-tier: lightning-node
prereqs:
  - "your own Lightning node (LND, Core Lightning, or Eclair) reachable at its connection URI (pubkey@host:port from getinfo)"
  - "on-chain / Lightning funds to pay the channel-lease HODL invoice (minimum ~$5)"
  - "an MCP-capable agent runtime (Claude, Cursor, Hermes, n8n, or any MCP client)"
maintainer: bitcoineconomy.ai
docs: https://marketplace.bitcoineconomy.ai/llms.txt
site: https://magma.amboss.tech
status: published
last-verified: 2026-08-07 (published magma-mcp tarball read; tool surface + order-poll path corrected)
order: 6
tags:
  - mcp
  - magma
  - amboss
  - liquidity
  - inbound-liquidity
  - lightning
---

## What it does

An agent that earns over Lightning needs **inbound** liquidity — the capacity to *receive*. This skill buys it: it composes the site's directory (to discover Magma and its MCP) with **Amboss's `magma-mcp`** to lease a channel from the Magma marketplace in a single call — sized in dollars, paid in sats, opened straight to the agent's own node. No human at a liquidity desk, no account required.

It composes two pieces:

1. **This site's directory** (`marketplace.bitcoineconomy.ai/mcp`) — `get_service { slug: "amboss" }` and `list_mcp_servers` surface Magma's machine detail and point at its own MCP. We discover; Amboss's MCP executes.
2. **Amboss's `magma-mcp`** (`@ambosstech/magma-mcp`, MIT, stdio) — exposes the whole purchase as one `buy_lightning_liquidity` tool. It escrows the deal with a **non-custodial HODL invoice**, so the seller is paid only if the channel actually opens, and the channel opens **directly to the agent's own node**. We never touch the funds or the channel.

The result is an agent provisioning its own ability to get paid — permissionlessly, on the Bitcoin substrate.

## When to use it

- An agent earns over Lightning and is hitting (or wants to pre-empt) an inbound-liquidity ceiling.
- You want paid-for receive capacity on demand, without running a liquidity desk or hand-picking channel partners.
- You're assembling an autonomous treasury/"banker" agent and need the receive side handled programmatically.

## Install

Add both servers to your agent's MCP config — the marketplace server is a remote Streamable-HTTP endpoint; Magma's MCP runs locally over stdio.

```json
{
  "mcpServers": {
    "bitcoineconomy": {
      "url": "https://marketplace.bitcoineconomy.ai/mcp"
    },
    "magma": {
      "command": "npx",
      "args": ["-y", "@ambosstech/magma-mcp"],
      "env": { "MAGMA_API_KEY": "" }
    }
  }
}
```

- **MCP clients (Claude, Cursor, Hermes, n8n):** use the block above. If your client can't take a remote MCP by `url`, bridge it with `mcp-remote`: `"command": "npx", "args": ["-y", "mcp-remote", "https://marketplace.bitcoineconomy.ai/mcp"]`.
- **OpenClaw / SKILL.md agents:** point at the same two endpoints — discovery is a plain HTTP MCP (or read `directory.json` directly), liquidity is the Magma MCP. Cross-agent by design.
- **No MCP framework:** the buy path is also a **public GraphQL mutation** (`liquidity.buy` at `magma.amboss.tech/graphql`) — no account, no key required; an anonymous buyer receives a `session_key` to track the order.

The buy path needs **no Amboss account** (`MAGMA_API_KEY` is optional, only for persistent order history).

## Use it

The loop, in plain steps:

1. `get_service { "slug": "amboss" }` — confirm Magma's detail and its MCP endpoint from the directory.
2. Estimate size: the public `liquidity_per_usd` query tells you channel size per dollar. *(`magma-mcp` exposes the purchase only — it registers a single tool — so the estimate is a direct GraphQL call.)*
3. `buy_lightning_liquidity` with your node's `connection_uri` (`pubkey@host:port`, from `getinfo`) and a dollar amount (minimum ~$5) → pay the returned HODL invoice from your node. **The MCP tool returns the invoice and nothing else** — no order id crosses that boundary — so to watch the lease land, either confirm on your own node with `listchannels`, or call `liquidity.buy` directly at `magma.amboss.tech/graphql` (where you choose the selection set, and an anonymous buyer gets a `session_key`) and poll `get_order` until `VALID_CHANNEL_OPENING`.

A natural-language version your agent can run: *"Buy $20 of inbound Lightning liquidity for my node from Magma, pay the lease invoice, and confirm the channel opened."*

## Verify

- `list_mcp_servers` should list **amboss** (`@ambosstech/magma-mcp`, stdio) — discovery is wired.
- Run a **tiny lease first** ($5 minimum) to confirm the flow end to end before any larger purchase.
- Confirm the channel opened to your node (`VALID_CHANNEL_OPENING` / `listchannels`).

## Gotchas & safety

- **You need your own node.** Magma opens a channel *to* your LND/CLN/Eclair node — it presupposes a node and funds; it is not a custodial "receive without infrastructure" path. To skip channel management entirely, the L3 ecash route ([Cashu](/tools/cashu)) is lighter.
- **The lease is time-bounded.** A bought channel is leased for a term — plan for renewal or replacement; inbound liquidity isn't permanent.
- **Non-custodial escrow, but verify the counterparty.** The HODL invoice means you pay only if the channel opens, but sellers and pricing vary — Magma runs a reputation system; check before relying on any single counterparty.
- **Budget the spend.** Choose the size deliberately; an agent should buy only the capacity the task needs.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Built 2026-06-30 (value-to-Amboss pipeline **V4** — `Research/Amboss-Meeting-Prep-2026-06-30/06-Report-Back-and-Value-Tracker`). Placed in `commerce`: like the flagship [[discover-and-buy]] it composes our directory with a provider's own MCP, but specialized to one move — buying inbound liquidity via Amboss's `magma-mcp` (already the first `mcp_endpoint` route in our registry, 10a). We owned every piece, so it needed no new dependency — the lowest-friction item in the value pipeline. Showcases Amboss as the deployed answer to the inbound-liquidity problem [[Stack]] §2 names, and gives Jesse a concrete "your MCP, running as an install-ready agent skill on a neutral site" artifact. Thesis-clean: self-custodial throughout (channel opens to the agent's own node; non-custodial HODL escrow), no account/KYC on the buy path, BTC settlement. Pairs with [[amboss|Amboss / Magma]] (the card) and [[discover-and-buy]] (the general compose pattern).
