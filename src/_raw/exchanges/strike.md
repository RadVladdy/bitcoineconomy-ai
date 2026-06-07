---
title: Strike
slug: strike
type: exchange-card
category: custodial-bitcoin-only
featured: true
kyc: required
custody: custodial
agent-path: owner-delegated
lightning: true
stablecoins: [USDT (regional, TRON)]
fiat: true
agent-access: api
bitcoin-only: true
bridges:
  - fiat↔BTC
  - Lightning↔fiat
coverage: many-countries-multi-entity
links:
  site: https://strike.me
  api-docs: https://docs.strike.me
status: v0-2026-06-03-structural-verified
links-verified: 2026-06-06 (structural + API-docs URL verified; fees/exact-coverage deferred to the venue)
---

# Strike

**What it is.** A Bitcoin financial app for buying, selling, sending, and receiving — Bitcoin-only, no altcoins. Its defining feature for agents is **native Lightning**: it converts between a fiat bank balance and Lightning sats at the custodial boundary, sub-second on the Lightning side.

**What it bridges.** Fiat (bank account, card) ↔ BTC, and **Lightning ↔ fiat** directly — the closest thing to a machine-tempo off-ramp in deployment.

**Agent access.** Public developer **API** (invoice creation, payment, balance, on/off-ramp). This is what makes Strike usable programmatically by an agent rather than only through an app.

**How an agent uses it.** Open and KYC a Strike account once (the compliance boundary); fund from a bank or receive over Lightning; convert Lightning↔fiat via the API as the conversion strategy requires; withdraw BTC to self-custody promptly to bound the custodial freeze surface.

**Coverage.** Operates across ~95 countries via a multi-entity legal structure (Zap Solutions for US/EU, E4 elsewhere); exact country list + remittance corridors shift — see the venue.

**Dependencies & payment.** A KYC'd Strike account (the compliance boundary) and its public REST API via OAuth. Fund from a bank or card, or receive over Lightning; convert Lightning↔fiat through the API; withdraw BTC to self-custody promptly. (USDT support is TRON-network-only and regional.)

**Gotchas.** Custodial — KYC at onboarding, and Strike retains a freeze surface over the *account* balance (not over BTC once withdrawn to self-custody). Compliance applies to the fiat leg; the Lightning leg downstream is unrestricted. **USDT is TRON-network only** — a deposit on any other network is *permanently lost* — and is available only in a set of emerging-market countries; the BTC/Lightning side is the universal path. The full **buy/sell + deposit + withdraw** set is available programmatically via the API.

**Links.** [strike.me](https://strike.me) · [API docs](https://docs.strike.me).
