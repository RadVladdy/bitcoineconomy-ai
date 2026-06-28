---
name: Amboss Payments
slug: amboss-payments
layer: services
collection: services
tagline: One GraphQL API to send, receive, and settle in BTC, USDT, and USDC over Lightning — multi-asset payments infrastructure for businesses, with a self-custodial option.
tool-type: service
category: payments
featured: false
two-sided: consume + offer
maintainer: Amboss Technologies (built on Voltage)
site: https://amboss.tech
docs: https://docs.amboss.tech/developer
payment: subscription (from ~$30/month base tier) plus network fees
identity: account (business)
custody: self-custodial option — "no mandatory custody transfer"; managed tiers may differ
bitcoin-native: false
agent-access: limited
status: published
last-verified: 2026-06-27
order: 54
tags:
  - amboss
  - payments
  - stablecoins
  - taproot-assets
  - voltage
  - lightning
---

## What it is

Amboss Payments is a **"Stripe for Lightning"**: a single GraphQL API to **send, receive, and settle in BTC, USDT, and USDC** — "in seconds, for near-zero fees, 24/7," with more assets stated as coming. Payments ride the **Lightning Network**; **Taproot Assets** (via Voltage) handle **in-flight conversion between bitcoin and stablecoins within a single payment**, so a sender can pay in one denomination and a receiver settle in another. Proprietary pathfinding picks the route. It is the **currency-flexibility** product in the Amboss + Voltage stack — built on **Voltage's payments API** with **Amboss Rails** supplying the liquidity.

Its target users are **businesses** — exchanges, wallets, payment providers, and similar — that want multi-asset, dollar-denominated value to move over Lightning rails behind one integration.

## When to use it

- A business or agent needs to **hold and move dollars (USDT/USDC) and bitcoin** over Lightning behind a single API.
- You want **machine-tempo settlement** with the option to receive in a different asset than the sender paid.
- You want a managed payments rail rather than running your own multi-asset Lightning stack.

## Dependencies & payment

A **business account** and a subscription (a base tier around **$30/month** plus network fees). The product advertises a **self-custodial option** — "Maintain control of your keys. No mandatory custody transfer." — though managed/hosted tiers may involve more trust; confirm per deployment. **A public developer API and SDKs are stated as "coming soon"** and are **not yet documented** (as of 2026-06-27), so there is no published agent-drivable path today.

## Quick start

The developer API and SDKs are **not yet public**. The GraphQL surface is described as forthcoming (for example, a create-receive-invoice mutation taking `wallet_id`, `amount`, and `description`). Check `docs.amboss.tech/developer` for availability before integrating an agent.

## Gotchas

- **Stablecoin legs are issuer-freezable.** USDT and USDC are issued by Tether and Circle, which can freeze or blacklist balances regardless of who holds the keys — self-custody of a freezable asset is not the same as censorship-resistance. The **BTC** leg carries none of that.
- **Self-custody is described as an option, not a guarantee.** "No mandatory custody transfer" implies custody is configurable; managed convenience tiers may hold more trust.
- **Compliance screening is being added.** OFAC channel screening and IP node screening are noted as being integrated into the Rails layer underneath.
- **No public agent API yet.** SDKs and developer docs are forthcoming — the agent-drivable path is not published at time of writing.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

This is the "currency flexibility" payments product (the `amboss.tech` stack, built on **Voltage** — the same engine as the standalone Voltage payments API). Carded on the main site for reference; **not yet a directory entry** — with no documented public API it sits at the `limited` tier, below the directory's machine-actionable inclusion bar (the Swan precedent). Re-evaluate for a directory entry — and ask whether it ships its own MCP server — once the API/SDKs ship.

Thesis line to hold: praise the **rails** (Lightning, sub-second, self-custodial BTC = Phase-1 *and* Phase-2 aligned), hold the line on the **asset** — stablecoin settlement is rails-not-substrate, and the issuer-freeze surface is exactly what the Independence Doctrine and "Why Bitcoin, Not a New Coin" warn about. State the freeze fact plainly (allowed in body); keep the preference here.
