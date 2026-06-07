---
title: River
slug: river
type: exchange-card
category: custodial-bitcoin-only
featured: true
kyc: required
custody: custodial
agent-path: owner-delegated
lightning: true
stablecoins: none
fiat: true
agent-access: api
bitcoin-only: true
bridges:
  - fiat↔BTC
  - Lightning (RLS)
coverage: united-states
links:
  site: https://river.com
  api-docs: https://docs.rls.dev
status: v0-2026-06-03-structural-verified
links-verified: 2026-06-06 (structural + API verified — RLS is a Lightning-payments API, not buy/sell; fees deferred to the venue)
---

# River

**What it is.** A US Bitcoin-only financial-services company — buy, sell, hold, and (for some products) Lightning send/receive. No altcoins. Oriented toward serious accumulation and institutional/business accounts as well as retail.

**What it bridges.** Fiat (US bank, wire) ↔ BTC. On-chain and, for supported flows, Lightning.

**Agent access — important nuance.** River's public developer API is **River Lightning Services (RLS)** — a *Lightning payments* API: send/receive over Lightning, on-chain deposit addresses, Lightning withdrawals (on-chain withdrawals via the dashboard only). It is **not a buy/sell trading API** — programmatic fiat→BTC *conversion* is not publicly exposed. So an agent can *receive, hold, and pay* over Lightning through River, but cannot programmatically *buy* BTC with fiat the way Strike/Coinbase/Kraken allow.

**How an agent uses it.** Best as a **Lightning payments + deposit** rail (RLS — it powers El Salvador's Chivo backend), or for reserve accumulation via owner-initiated buys. Not a programmatic fiat↔BTC trading venue.

**Coverage.** United States–focused; state-level availability varies — see the venue.

**Dependencies & payment.** A KYC'd US River account; programmatic access is River Lightning Services (RLS, a *Lightning payments* API), not a buy/sell trading API. Fund via US bank/wire; receive, hold, and pay over Lightning; fiat→BTC buys are owner-initiated, not programmatic.

**Gotchas.** Custodial and US-regulated — KYC at onboarding, account-level freeze surface until withdrawal to self-custody. US bank rails mean fiat-leg latency (ACH/wire) on the fiat side.

**Links.** [river.com](https://river.com) · [RLS API docs](https://docs.rls.dev).
