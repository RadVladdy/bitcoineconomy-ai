---
name: Unhuman
slug: unhuman
layer: services
collection: services
tagline: Agent-native Bitcoin storefronts — an AI agent discovers products and completes a real-world purchase end to end by paying a Lightning L402 invoice, no account or card.
tool-type: service
category: commerce
featured: false
two-sided: consume
maintainer: Money Dev Kit (Nick Slaney)
docs: https://unhuman.coffee/llms.txt
site: https://www.unhuman.coffee
payment: bitcoin over Lightning — pay the L402 invoice; the payment preimage is the proof
identity: none
custody: non-custodial — you pay from your own Lightning wallet; no custody of buyer funds
kyc: none
bitcoin-native: true
status: published
last-verified: 2026-06-30
order: 56
tags:
  - unhuman
  - commerce
  - real-world-goods
  - l402
  - lightning
  - money-dev-kit
---

## What it is

Unhuman is a family of **agent-only storefronts** that sell real-world goods and services an AI agent can buy end to end over Bitcoin — no account, no card, no human at checkout. The flagship **Unhuman Coffee** sells roasted-to-order specialty coffee; **Unhuman Domains** registers domains; **Unhuman Store** is a hub pointing at further agent storefronts. Each is built on the **L402** protocol: the agent reads the catalog, posts an order, receives an `HTTP 402` carrying a Lightning invoice and a macaroon, pays the invoice, and replays the request with the preimage as proof. The payment *is* the authentication — there is nothing to sign up for.

It is the clearest deployed instance of an agent buying a **real-world** good on the Bitcoin stack: value settles in Bitcoin over Lightning, and a bag of coffee shows up at a street address. The storefronts are the reference deployments of [Money Dev Kit](/tools/money-dev-kit), the Lightning-payments SDK by the same author.

## When to use it

- Giving an agent a way to buy real goods (coffee, domains) autonomously, paying in Bitcoin with no account.
- Demonstrating or building the "agent buys a real-world product over Lightning" pattern end to end.
- Testing an agent's L402 purchase flow against a live, no-KYC endpoint.

## Dependencies & payment

A funded **Lightning wallet** the agent can pay from — an L402-aware client such as [lightning-agent-tools](/tools/lightning-agent-tools), or [Money Dev Kit](/tools/money-dev-kit)'s `agent-wallet` CLI, automates the 402 → pay → retry loop. **Payment** is an ordinary Bolt11 Lightning invoice denominated in sats; the price is quoted **per order** (it includes shipping for physical goods), so a live order returns its own invoice rather than a fixed sats figure. No account, no API key, no KYC — the credential is the macaroon plus the payment preimage.

## Quick start

For Unhuman Coffee: `GET https://unhuman.coffee/api/catalog` to list products, then `POST https://unhuman.coffee/api/order` with the SKU, quantity, and shipping → the server returns `402` with a Bolt11 invoice and an `L402` macaroon → pay the invoice → replay the same POST with `Authorization: L402 <macaroon>:<preimage>` to confirm (an `Idempotency-Key` header guards against double-fulfilment). An agent-skill manifest (`/.well-known/agent-skills/index.json`, e.g. `unhuman-coffee-ordering`) and a per-store `llms.txt` describe the flow; Unhuman Domains additionally registers WebMCP browser tools (`search_domains`). Or drive it from the CLI: `npx unhuman <store> <command>`.

## Gotchas

- **Real goods, real fulfilment.** Physical orders (coffee) ship to a street address — the agent must supply valid shipping details, and delivery is a real-world dependency, not instant digital settlement. (The live L402 purchase flow is verified; physical delivery is not independently confirmed here.)
- **Price is per-order, not fixed.** The invoice amount includes shipping and is quoted at order time — don't assume a static sats price (a live coffee order settled at ~41,770 sats on a $24 / 12oz list item).
- **The macaroon + preimage is a bearer credential.** It authorizes that one order within a ~15-minute expiry — treat it like cash and don't leak it.
- **No public source repo.** The storefronts are closed-source; authorship is attributable to Money Dev Kit (the npm maintainer and the author's public statement) but is not stated on the sites themselves.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Carded 2026-06-30 from the 2026-06-30 Amboss call lead (Jesse Shrader cited "Unhuman Coffee" as a live agent-commerce example) → research-verified against the live endpoints (the `402` → Bolt11 → replay flow was observed end to end). **Directory entry: category `commerce`, automatability `api-no-account`** — clears the inclusion bar outright. This is the site's cleanest **real-world-goods** exemplar: most agent-payable entries sell digital services (inference, liquidity), whereas Unhuman sells coffee and domains that physically arrive — which is why it doubles as a Field Note (the "agent buys a bag of beans over Lightning" story). Author = **Nick Slaney** (ex-Block/BitKey/C=), the same author as [Money Dev Kit](/tools/money-dev-kit); Unhuman is MDK's dogfood/reference deployment, so the two cards cross-reference rather than double-count (MDK = the rail you build with; Unhuman = the rail in production). Thesis-clean: Bitcoin settlement, self-custodial, permissionless, no issuer in the path. The "Amboss investor built it" framing from the call is loose — the link is a **shared VC** (Hivemind / Max Webster backs both Amboss and Money Dev Kit), not an Amboss product.
