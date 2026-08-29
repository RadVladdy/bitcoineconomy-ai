---
name: lightning-pay
slug: lightning-pay
tagline: Give an agent the ability to send and receive Lightning payments — create invoices, pay, check balance — without ever handing it the wallet's keys.
skill-group: payments
read-only: false
mcp-servers:
  - "@getalby/mcp (primary — NWC + LNURL + L402)"
  - "@getalby/nwc-mcp-server (legacy — NWC only)"
env:
  - NWC_CONNECTION_STRING
prereq-tier: wallet
prereqs:
  - "an NWC (NIP-47) wallet or hub that holds the keys (e.g. Alby Hub)"
  - "a scoped, budgeted, revocable NWC connection string for the agent"
maintainer: Alby
repo: https://github.com/getAlby/mcp
docs: https://nwc.dev
site: https://getalby.com
x: "@getAlby"
status: published
last-verified: "2026-08-28 (npm re-read: @getalby/mcp v1.1.1, unchanged since 2025-07 — no release to absorb; github.com/getAlby/mcp and nwc.dev both live. Nothing in the card moved.)"
order: 2
tags:
  - mcp
  - nwc
  - nip-47
  - lightning
  - payments
  - alby
---

## What it does

Wires Lightning payments into an agent over **Nostr Wallet Connect (NWC, NIP-47)** — the protocol that lets an app control a wallet remotely without holding its keys. The wallet signs; the agent holds only a scoped, revocable connection string. That keeps the agent's attack surface tiny: a leaked string is budget-limited and can be revoked, where a leaked private key is total loss.

The skill is the Alby MCP server (`@getalby/mcp`), which exposes payment tools to any MCP-capable agent and also understands LNURL and L402, so it covers most of the ways an agent actually pays on the Lightning stack.

## When to use it

- Any time an agent needs to **pay** (or invoice for) something in sats — the building block under [discover-and-buy](/skills/discover-and-buy) and most A2A commerce.
- When you want payment authority **separated from custody** — the agent can spend within a budget, but never holds the keys.
- When you're already running an NWC wallet (Alby Hub or any NIP-47 wallet) and want to expose it to an MCP agent.

## Install

```json
{
  "mcpServers": {
    "alby": {
      "command": "npx",
      "args": ["-y", "@getalby/mcp"],
      "env": { "NWC_CONNECTION_STRING": "nostr+walletconnect://..." }
    }
  }
}
```

- **MCP clients (Claude, Cursor, Hermes, n8n):** the block above — it runs locally over stdio and reads the NWC string from the environment.
- **OpenClaw / SKILL.md agents:** wrap the same `@getalby/mcp` process, or call NWC directly with a NIP-47 library; the connection string is the only secret.
- **Any agent:** NWC is an open protocol — any NIP-47 client library works if you don't want the MCP wrapper. See [Alby & NWC](/tools/alby-nwc) and [The Stack](/stack) for how the protocol fits underneath.

Generate the connection string from Alby Hub (or any NWC wallet) **with a spending budget and expiry**, then point the server at it.

## Use it

Typical tools the server exposes: create an invoice, pay an invoice (BOLT11), look up a payment, check balance, and pay an LNURL/Lightning address. A natural-language run: *"Create a 1,000-sat invoice for this job,"* or *"Pay this BOLT11 if it's under 500 sats, then confirm the balance."*

## Verify

- Check balance — should return your wallet's sats balance without error.
- Create a tiny invoice and confirm it parses as valid BOLT11.
- Optionally pay a 1-sat invoice to yourself to confirm the send path end to end.
- [verify-setup](/skills/verify-setup) folds this check into a full pre-flight.

## Gotchas & safety

- **Always budget and time-box the connection string.** It is bearer authority up to its limit — treat it like a debit card with a cap, not like a key.
- **Use `@getalby/mcp`, not the archived server.** `@getalby/nwc-mcp-server` still runs from npm but its repo was archived (2025-06-20) and points users to `@getalby/mcp`, which adds LNURL + L402 support. Prefer the current package.
- **The wallet is the trust anchor.** This skill is only as self-custodial as the NWC wallet behind it — run your own (Alby Hub on your node) for full sovereignty, or accept the hub's custody trade-off knowingly.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

The table-stakes capture from BitClawd's `lightning-pay` skill, done MCP-native and key-free instead of their LNbits-admin-key pattern. Freshness finding logged while building this: the [[alby-nwc]] tool card still cited the archived `nwc-mcp-server`; corrected to lead with `@getalby/mcp` in the same deploy. The honest-engagement note (custody lives in the wallet, not the skill) is the load-bearing safety point — keep it. Pairs with [[discover-and-buy]] and [[verify-setup]].
