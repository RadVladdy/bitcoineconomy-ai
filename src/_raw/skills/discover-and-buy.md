---
name: discover-and-buy
slug: discover-and-buy
tagline: Find a Bitcoin-native service in the live directory, get a structured payment plan, and pay it — end to end, by composing this site's discovery MCP with a Lightning payment MCP.
skill-group: commerce
read-only: false
mcp-servers:
  - "https://marketplace.bitcoineconomy.ai/mcp (discovery — this site)"
  - "@getalby/mcp (payment — Nostr Wallet Connect)"
env:
  - NWC_CONNECTION_STRING
composes:
  - lightning-pay
prereq-tier: wallet
prereqs:
  - "an NWC-capable Lightning wallet (e.g. Alby Hub) with a scoped, budgeted connection string"
  - "an MCP-capable agent runtime (Claude, Cursor, Hermes, n8n, or any MCP client)"
maintainer: bitcoineconomy.ai
docs: https://marketplace.bitcoineconomy.ai/llms.txt
site: https://marketplace.bitcoineconomy.ai
status: published
last-verified: 2026-06-29
order: 1
tags:
  - mcp
  - marketplace
  - discovery
  - l402
  - nwc
  - agent-commerce
---

## What it does

This is the one skill that ties the whole site together: it lets an agent **discover a Bitcoin-native service, get a machine-readable payment plan for it, and pay** — without a human stitching the steps together.

It composes two MCP servers:

1. **This site's marketplace MCP** (`marketplace.bitcoineconomy.ai/mcp`) — the discovery half. Its `find_service` searches a curated directory of services an agent can buy from (filter by category, payment method, KYC, automatability); `get_service` returns the full machine detail (api_base, auth, payment methods, quickstart); `get_quote` returns a structured payment plan and, where the service serves one, captures a live L402 invoice and a current sats price. All read-only — no funds move on our side, ever.
2. **A Lightning payment MCP** (Alby's `@getalby/mcp`) — the settlement half. It understands NWC, LNURL, and L402, and pays from a wallet *the agent controls*, using a scoped, budgeted connection string. We never touch the agent's keys or its money.

The result is the thesis running in production: an autonomous agent transacting on the Bitcoin substrate, with this site as the index and the payment rail kept entirely on the agent's side.

**Where this is heading.** Today the loop composes three moving parts — our directory for discovery, L402 for gated services, and your wallet's MCP for settlement. [[contextvm|ContextVM]]'s CEP-6 + CEP-8 (see [[Stack|The Stack]] §4) is the first stack that folds all three into *one* protocol: a server's capabilities, its price, and its payment flow arrive as a single signed artifact, discoverable with one query. It is early — CEP-8 is a Draft and few servers speak it yet — so this skill stays on the deployed pieces for now; but it is the single-protocol version of exactly this discover-and-buy loop, and the path to watch as it matures.

## When to use it

- An agent needs a service (inference, compute, machine-work, a VPN, a gift-card purchase) and should pick + pay for it on its own.
- You want discovery and payment as **separate, swappable** MCP servers — keep the directory, bring your own wallet.
- You want a read-only dry run first (`get_quote` returns the plan without paying), then settle when ready.

## Install

Add both servers to your agent's MCP config. The marketplace server is a remote Streamable-HTTP endpoint; the payment server runs locally over stdio and holds your NWC string.

```json
{
  "mcpServers": {
    "bitcoineconomy": {
      "url": "https://marketplace.bitcoineconomy.ai/mcp"
    },
    "alby": {
      "command": "npx",
      "args": ["-y", "@getalby/mcp"],
      "env": { "NWC_CONNECTION_STRING": "nostr+walletconnect://..." }
    }
  }
}
```

- **MCP clients (Claude, Cursor, Hermes, n8n):** use the block above. If your client can't yet take a remote MCP by `url`, bridge it with `mcp-remote`: `"command": "npx", "args": ["-y", "mcp-remote", "https://marketplace.bitcoineconomy.ai/mcp"]`.
- **OpenClaw / SKILL.md agents:** point your skill at the same two endpoints — the discovery half is a plain HTTP MCP (or hit the static `directory.json` / `get_quote` route directly), and the payment half is the Alby MCP. No OpenClaw-specific format required; this is cross-agent by design.
- **Any agent (no MCP framework):** the directory is also static JSON — `GET /directory.json`, `/entries/{slug}.md`, and the documented `/mcp` JSON-RPC — and the payment leg is whatever Lightning library you already use. See `openapi.json` for the full HTTP surface.

## Use it

The end-to-end loop, in plain steps:

1. `find_service` with what you need — e.g. `{ "category": "inference", "no_kyc": true }`.
2. `get_quote { "slug": "<chosen>" }` — returns the payment plan: payment methods, the api_base, an L402 invoice if the service serves one, and a live sats price for inference pricing.
3. Pay with the Alby MCP (`pay_invoice` / the L402 flow) from your budgeted wallet.
4. Call the service's `api_base` with the proof, and you're transacting.

A natural-language version your agent can run: *"Find a no-KYC inference service in the directory, get a quote, and if it's under my budget, pay the L402 invoice and run a test completion."*

## Verify

Before wiring in payment, confirm discovery works read-only:

- `list_categories` should return the directory's category set.
- `get_quote` against a known slug (e.g. `routstr`) should return a plan with a payment method and (for L402 services) an invoice.
- Then run [verify-setup](/skills/verify-setup) to confirm all four rails — data, payment, identity, discovery — are live before the agent transacts unattended.

## Gotchas & safety

- **Budget the connection string.** Set a spend limit and expiry on the NWC connection in your wallet (Alby Hub supports both). The agent should never hold more authority than the task needs.
- **`get_quote` is a quote, not a settlement.** It captures an invoice where one is served, but paying is always a separate, explicit step on the agent's side. The directory moves no money.
- **Verify the provider before relying on it.** The directory curates by facts and liveness probes, not endorsement — confirm a service's current terms against its own site before depending on it.
- **Slug-gated, no open proxy.** `get_quote` only probes the api_base of a listed slug; it won't relay arbitrary URLs.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

ContextVM/CEP-6+8 scoping (handoff 2026-07-16): CEP-6 + CEP-8 is the single-protocol version of exactly this loop — capability schema + price + settlement in one signed artifact, one `cvmi discover` query — vs. today's three-part compose (directory MCP + L402 + wallet MCP). Existence proof today (Draft, tiny server population), so this skill composes the deployed pieces meanwhile; watch CEP-8 maturation as the convergence path. The naming collision with CVMI's own "skills" (developer-context packs) is disambiguated on the [[cvmi]] Tools card. Full record: `_Decisions` 2026-07-16.

This is the flagship Skill — the capability no competing resource site can ship, because it requires our live marketplace MCP on the discovery side. It is the on-ramp to the sell-side (▶ Next #2 / 10d): once agents discover-and-buy fluently, the act/pay layer and the two-sided directory are the natural next step. Kept deliberately custody-free (we compose the agent's own payment MCP) so the trust surface stays minimal — the heavier act/pay/escrow surface is 10d, not here. Pairs with [[lightning-pay]] (the payment half on its own) and [[verify-setup]] (pre-flight).
