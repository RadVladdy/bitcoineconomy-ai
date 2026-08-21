---
title: Swan Bitcoin
slug: swan
type: exchange-card
category: custodial-bitcoin-only
featured: true
kyc: required
custody: custodial
agent-path: owner-delegated
lightning: limited
stablecoins: none
fiat: true
agent-access: limited
bitcoin-only: true
bridges:
  - fiat↔BTC (recurring buy)
coverage: united-states
links:
  site: https://swanbitcoin.com
status: v0-2026-06-03-structural-verified
links-verified: "2026-08-20 (the no-public-trading-API claim EXERCISED rather than assumed: swanbitcoin.com/swan-api resolves and is a PARTNER-integration page — Specter, Trezor, CrowdHealth, Hexa, all scheduled-buy plus auto-withdraw-threshold integrations — with no self-serve developer docs, keys or trading endpoints anywhere on it. The venue-side surface that carries the word exchange, Swan RBX, was read and is a human-guided ETF-to-Bitcoin conversion for Swan Private clients, not a trading venue. Fees re-read on the live fees page.)"
---

**What it is.** A US Bitcoin-only company built around **recurring accumulation** (dollar-cost averaging) and long-term holding, with automatic withdrawal to self-custody. No altcoins.

**What it bridges.** Fiat (US bank) ↔ BTC, optimized for scheduled recurring buys rather than ad-hoc trading.

**Agent access.** Primarily a **scheduled-buy** model rather than a general programmatic trading API — best fit for an agent that wants a hands-off, rules-based path to build a Bitcoin *reserve* over time. Swan does publish a `/swan-api` page, and it is worth knowing what it is before assuming otherwise: a **partner-integration surface** ("Powered By Swan" — Specter Desktop, Trezor, CrowdHealth, Hexa) through which another product offers Swan's scheduled buys and automatic withdrawal thresholds to its own users. There is no self-serve key, no developer documentation and no order endpoint, so the shape of the API is exactly the shape of the product.

**How an agent uses it.** KYC once; configure recurring buys funded from a US bank; auto-withdraw to a self-custody address on a cadence. This is a *reserve-building* tool, not an operational off-ramp.

**Coverage.** United States–focused.

**Dependencies & payment.** A KYC'd US Swan account. Payment is recurring buys funded from a US bank with automatic withdrawal to self-custody — a reserve-building cadence, not an API trading or operational off-ramp surface.

**Gotchas.** Custodial at the buy boundary (mitigated by auto-withdrawal to self-custody); oriented to accumulation, so it does not serve fast operational conversion or Lightning off-ramp needs the way Strike does. **Do not read "Swan Real Bitcoin Exchange" (RBX) as a trading venue** — despite the name it is a white-glove, Swan-Private service for converting a spot Bitcoin ETF position into real Bitcoin in kind, aimed at large low-cost-basis holders and walked through by a human representative. Nothing about it is agent-accessible.

**Links.** [swanbitcoin.com](https://swanbitcoin.com).
