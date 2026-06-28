---
title: RailsX
slug: railsx
type: exchange-card
category: noncustodial-swap
featured: false
kyc: none
custody: self-custody
lightning: true
stablecoins: [USDT, USDC]
fiat: false
agent-access: limited
bridges:
  - Lightning BTC↔stablecoin (P2P atomic swap)
trust-model: cryptographic-atomic
links:
  site: https://amboss.tech
status: v0-2026-06-27-structural-verified
links-verified: 2026-06-27 (structural; no public trading API documented — app/venue-driven)
---

# RailsX

**What it is.** Amboss's Lightning-native, peer-to-peer decentralized exchange (launched January 2026), executing **bitcoin ↔ stablecoin** trades entirely over the Lightning Network — no separate chain and no custodial order book.

**What it bridges.** Bitcoin ↔ stablecoins, connecting those pairs toward the global FX market. (Confirm the exact supported pairs on the venue — the asset list above reflects the Amboss stack's stablecoins and should be re-verified.)

**How it works.** Trades execute as **circular self-payments**: funds route out through existing Lightning channels, swap atomically, and loop back to the sender — so either the swap completes or it doesn't, with no custody handover in between.

**Agent access.** **No public trading API is documented yet** — the venue is app/flow-driven for now. Carded here for reference; it sits below the directory's machine-actionable bar until a programmatic path is published.

**Custody.** Self-custodial / Lightning-native — you trade from your own channels, not a venue-held balance.

**Dependencies.** Lightning capacity to route the swap and a self-custody wallet/node. Verify supported pairs, fees, and regional availability on the venue.

**Gotchas.** The atomic Lightning execution protects **custody** (you don't hand funds to a counterparty mid-swap) — it does **not** make the stablecoin legs censorship-resistant: USDT/USDC remain issuer-freezable by Tether/Circle. New as of January 2026; no public API yet; confirm pairs, fees, and availability before relying on it.

**Links.** [amboss.tech](https://amboss.tech).
