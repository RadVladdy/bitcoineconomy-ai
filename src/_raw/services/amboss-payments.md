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
maintainer: Amboss Technologies
site: https://amboss.tech
docs: https://docs.amboss.tech/developer
payment: flat 0.5% of volume + $100/month platform fee (all-in, per the 2026-07 payments deck) plus network fees
identity: account (business)
custody: self-custodial option — "no mandatory custody transfer"; managed tiers may differ
bitcoin-native: false
agent-access: limited
status: published
last-verified: 2026-07-21
order: 54
tags:
  - amboss
  - payments
  - stablecoins
  - taproot-assets
  - lnd
  - lightning
---

## What it is

Amboss Payments is a **"Stripe for Lightning"**: a single GraphQL API to **send, receive, and settle in BTC, USDT, and USDC** — "in seconds, for near-zero fees, 24/7," with more assets stated as coming. Under the hood it runs an **LND node** (Lightning Labs' implementation) that the customer can **self-host or cloud-host**, and inside that one node the customer can spin up **separate per-currency wallets** — a USDT wallet, a USDC wallet, a plain BTC wallet. **Taproot Assets** handles **conversion within a single payment**, and Amboss manages the FX and liquidity behind the scenes, so a sender can pay in one denomination and a receiver settle in another.

The conversion happens **at the edge, not on the network**. To receive, the merchant generates an ordinary BTC Lightning invoice — but it carries a **routing hint on the last hop, known only to the merchant, that converts to the target currency at that final hop**. The invoice itself is just a standard Bitcoin Lightning invoice for an amount of BTC; the value travels as **Bitcoin** the entire way, and only the two endpoints ever deal in dollars. The practical effect is **dollar stability over scalable Lightning rails** — e.g. a Cash App customer can pay a merchant with neither side needing to know Lightning or Bitcoin is involved at all. Settlement is **final in under a second** (redeemable on-chain via unilateral exit, so funds are never trapped), and because the same Lightning payment method is already used inside large consumer apps (Cash App, Coinbase, Binance, Kraken, and hundreds of wallets), a single integration reaches those users without per-app deals.

Its target users are **businesses** — exchanges, wallets, payment providers, and similar — that want multi-asset, dollar-denominated value to move over Lightning rails behind one integration.

## When to use it

- A business or agent needs to **hold and move dollars (USDT/USDC) and bitcoin** over Lightning behind a single API.
- You want **machine-tempo settlement** with the option to receive in a different asset than the sender paid.
- You want a managed payments rail rather than running your own multi-asset Lightning stack.

## Dependencies & payment

A **business account** and Amboss's platform fee — a **flat 0.5% of volume plus $100/month**, all-in (per the 2026-07 payments deck), on top of network fees. The product advertises a **self-custodial option** — "Maintain control of your keys. No mandatory custody transfer." — though managed/hosted tiers may involve more trust; confirm per deployment. **The API is rolling out now; SDKs are the stated next step, with an MCP server / agent skill after that** — the maintainer's stated build order (as of 2026-06-30) is API → SDK → MCP/skill, explicitly to make the rail easy for agents to equip. There is **no published agent-drivable path yet**; check `docs.amboss.tech` for availability before integrating an agent.

## Quick start

The developer API and SDKs are **not yet public**. The GraphQL surface is described as forthcoming (for example, a create-receive-invoice mutation taking `wallet_id`, `amount`, and `description`). Check `docs.amboss.tech/developer` for availability before integrating an agent.

## Gotchas

- **Stablecoin legs are issuer-freezable.** USDT and USDC are issued by Tether and Circle, which can freeze or blacklist balances regardless of who holds the keys — self-custody of a freezable asset is not the same as censorship-resistance. The **BTC** leg carries none of that.
- **Self-custody is described as an option, not a guarantee.** "No mandatory custody transfer" implies custody is configurable; managed convenience tiers may hold more trust.
- **Compliance screening is being added.** OFAC channel screening and IP node screening are noted as being integrated into the Rails layer underneath.
- **No public agent API yet — but it is on the roadmap.** The maintainer's stated sequence is API (now) → SDK → MCP server / agent skill; the agent-drivable path is planned and explicitly aimed at agents, but is not published at time of writing.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

This is the "currency flexibility" payments product (the `amboss.tech` stack). The maintainer describes it as an **LND node** the customer self-hosts or cloud-hosts; an earlier "built on Voltage" line has been retracted and any Voltage involvement is **unverified** (at most a hosting option) pending confirmation. Carded on the main site for reference; **not yet a directory entry** — with no public API it sits at the `limited` tier, below the directory's machine-actionable inclusion bar (the Swan precedent). **Re-evaluate for a directory entry once the API/SDK/MCP ship** — the maintainer's stated build order is API (now) → SDK → MCP server / agent skill, so the machine-actionable path is coming, not speculative.

Thesis line to hold: praise the **rails** (Lightning, sub-second, self-custodial BTC = Phase-1 *and* Phase-2 aligned), hold the line on the **asset** — stablecoin settlement is rails-not-substrate, and the issuer-freeze surface is exactly what the Independence Doctrine and "Why Bitcoin, Not a New Coin" warn about. State the freeze fact plainly (allowed in body); keep the preference here.

**Pricing corrected 2026-07-21** from the maintainer's own payments deck (`drop.amboss.tech/payments-deck.html`): flat **0.5% of volume + $100/month** (all-in), superseding the earlier "~$30/month" figure. **Affiliate program (internal awareness only — do NOT surface on-site):** Amboss runs a referral program paying **15%/20% of collected platform fees for 12 months per merchant, in BTC over Lightning** (`drop.amboss.tech/amboss-affiliate-program-pack.html`); Jesse confirmed email intros count as referrals now. Per RadVladdy's 2026-07-21 decision the affiliate is an **email/BD motion only** — the directory and these neutral reference cards stay **affiliate-free** (no tracked links, no curation change). This note is internal (stripped on build).
