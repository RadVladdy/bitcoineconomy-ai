---
name: Bitrefill
slug: bitrefill
layer: services
collection: services
tagline: The Lightning-native bridge to the rest of the digital economy — buy gift cards and top-ups for thousands of mainstream services with Bitcoin, via a real API, no KYC.
tool-type: service
category: payments-bridge
featured: true
two-sided: consume
maintainer: Bitrefill
site: https://bitrefill.com
docs: https://docs.bitrefill.com
x: "@bitrefill"
payment: Lightning (native) + on-chain BTC; programmatic via the remote MCP server or the Thor API
identity: none
custody: n/a (pay-and-receive)
kyc: none
bitcoin-native: true
status: published
last-verified: 2026-06-11
order: 50
tags:
  - bitrefill
  - gift-cards
  - lightning
  - bridge
  - no-kyc
---

## What it is

Bitrefill is the Lightning-native bridge between an agent's Bitcoin and the rest of the digital economy. It sells **gift cards and prepaid top-ups for thousands of mainstream services** — marketplaces, food delivery, gaming, travel, mobile, VPNs, plus prepaid Visa/Mastercard — payable in **Bitcoin over the Lightning Network** (or on-chain), with **no account and no KYC** for ordinary purchases. Crucially for an agent: it is one of the few services here with a **purpose-built agent interface** — a remote **MCP server** (`api.bitrefill.com/mcp`) exposing the whole catalog-to-redemption loop as typed tool calls, alongside the raw **payment API (Thor)** — so the purchase is driven programmatically rather than through a human checkout page. Bitrefill maintains a dedicated agent-onboarding page (`bitrefill.com/agents`) with a machine-readable setup file.

## When to use it

**Know the catalog's shape before the trip: most of it is human-consumption gift cards** (online marketplaces, food delivery, gaming, travel, retail, fashion — thousands of products across 180+ countries). The slice an agent typically needs is small and specific:

- **Prepaid virtual Visa / Mastercard** (Payment Cards — 3 products as of 2026-06): the universal bridge. Fund a card with sats, then pay **any** service that takes cards — including categories Bitrefill doesn't carry, like a VPS bill or a SaaS subscription. For an agent, this is the highest-leverage product on the site.
- **Connectivity:** eSIM data plans (global + regional), phone refills/airtime, and VoIP credit.
- **VPN subscriptions** (Privacy & Tools — 11 products as of 2026-06, incl. NordVPN). Note: if the goal is just a sats-paid VPN, Mullvad takes Lightning directly — no gift-card hop needed.
- Lightning-speed, no-KYC settlement for off-the-shelf purchases an operator would otherwise do by hand. It is the keystone of the Services *consume* side: it turns "this brand doesn't take Bitcoin" into "this brand is one Lightning payment away."

**Not in the catalog — don't spend the trip looking:** VPS/hosting, domains, cloud compute, proxies, software licenses, or AI credits. For sats-paid compute go to LNVPS or BitLaunch; for inference, Routstr or PPQ.AI. (When the target service only takes cards, the prepaid Visa/Mastercard above is the workaround.)

The rest of the catalog is **A2P (agent-to-person) procurement** territory — an agent buying a gift card *for its human operator*. Real, but the secondary case.

## Dependencies & payment

**Dependencies:** a Lightning-capable wallet with a funded balance and — for automation — either the **MCP server** (OAuth sign-in, or an API key from the account developers page; HTTP/SSE transport) or a **Thor API** key. Guest checkout needs only an email. **Payment:** native **Lightning** (instant, sub-cent fees) or on-chain BTC; a pre-funded account balance (XBT sub-account available) also works; no KYC for ordinary purchases. Either programmatic route lets an agent request a product, receive a Lightning invoice, pay it, and get the redemption code back — the whole loop with no human in it.

## Quick start

Pick a product (gift card / top-up / eSIM / bill), pay the Lightning invoice, redeem the code at the target service. **Agent-native route:** connect to the remote MCP server at `https://api.bitrefill.com/mcp` (OAuth or API key) — seven typed tools cover the loop: `search-products` → `get-product-details` → `buy-products` (up to 15 cart items per invoice) → `get-invoice-by-id` for status and the redemption code. Setup recipe at `bitrefill.com/agents`; MCP docs at `docs.bitrefill.com/docs/ecommerce-mcp`. The Thor API (`bitrefill.com/thor-api`) remains the raw-HTTP alternative.

## Gotchas

- It's a **bridge, not a merchant relationship** — the agent buys a redeemable credit, then redeems it at the target service, which may itself require that service's own account or KYC.
- Gift-card coverage, denominations, and regional availability shift — verify the specific product before relying on it.
- Pricing carries Bitrefill's spread/fees; for very large purchases, compare against a direct path.
- KYC-free for ordinary purchases; very large orders may trigger limits or verification — verify current thresholds.
- Bitrefill's own agent guidance: use a **dedicated, low-balance account** for agent purchasing (the integration is not a wallet), and invoices expire within minutes — pay promptly after creating one.
- Prepaid-card products carry their own fees, regional restrictions, and expiry terms — check the specific product page before funding one.
