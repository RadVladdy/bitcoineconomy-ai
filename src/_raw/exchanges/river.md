---
title: River
slug: river
type: exchange-card
category: custodial-bitcoin-only
featured: false
kyc: required
custody: custodial
agent-path: owner-delegated
lightning: true
stablecoins: none
fiat: true
agent-access: none
bitcoin-only: true
bridges:
  - fiat↔BTC
  - Lightning (RLS — no longer publicly documented; see below)
coverage: united-states
links:
  site: https://river.com
status: v0-2026-06-03-structural-verified
links-verified: "2026-08-06 (re-verified: docs.rls.dev is NXDOMAIN and the whole rls.dev marketing site is gone — last Wayback capture 2026-04-01, no deprecation notice anywhere; agent-access downgraded api → none because there is no longer a public way to obtain access; fees deferred to the venue)"
---

**What it is.** A US Bitcoin-only financial-services company — buy, sell, hold, and (for some products) Lightning send/receive. No altcoins. Oriented toward serious accumulation and institutional/business accounts as well as retail.

**What it bridges.** Fiat (US bank, wire) ↔ BTC. On-chain and, for supported flows, Lightning.

**Agent access — nothing public, as of 2026-08-06.** River formerly published a Lightning-payments API, **River Lightning Services (RLS)** — send/receive over Lightning, on-chain deposit addresses, Lightning withdrawals. It was never a buy/sell trading API, and programmatic fiat→BTC conversion was never publicly exposed. **Its documentation and marketing site are now gone**: `docs.rls.dev` does not resolve, `rls.dev` serves nothing, and the last archived capture is 2026-04-01 with no deprecation notice published anywhere. The documented way to get access was a contact form on that site, so **there is no public front door left** — no docs, no signup, no River-hosted page, no help-centre article, no SDK. Whether RLS still serves existing enterprise contracts is not knowable from outside; what is checkable is that a new developer cannot reach it. Treat River as an owner-operated venue with no agent-drivable path.

**How an agent uses it.** It doesn't, directly. River is a place an **owner** accumulates and custodies; an agent's involvement stops at receiving what the owner sends. (RLS powered El Salvador's Chivo backend, which is why the Lightning capability was worth carding at all — but that capability is no longer publicly obtainable.) Not a programmatic fiat↔BTC trading venue.

**Coverage.** United States–focused; state-level availability varies — see the venue.

**Dependencies & payment.** A KYC'd US River account, opened and operated by a person. Fund via US bank/wire; buys are owner-initiated. There is no publicly available programmatic path — the RLS API that used to provide one is no longer documented or obtainable.

**Gotchas.** Custodial and US-regulated — KYC at onboarding, account-level freeze surface until withdrawal to self-custody. US bank rails mean fiat-leg latency (ACH/wire) on the fiat side.

**Links.** [river.com](https://river.com). *(The RLS API docs link is deliberately absent: `docs.rls.dev` no longer resolves and River publishes no replacement. A dead link is worse than none — and this one returned 200 for months in search results while resolving nowhere.)*
