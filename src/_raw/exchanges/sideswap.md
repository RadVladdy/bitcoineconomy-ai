---
title: SideSwap
slug: sideswap
type: exchange-card
category: noncustodial-swap
featured: false
kyc: none
custody: self-custody
lightning: false
stablecoins: [L-USDt]
fiat: false
agent-access: api
bridges:
  - L-BTC↔L-USDt
  - Liquid asset↔asset
trust-model: noncustodial-swap-liquid
links:
  site: https://sideswap.io
  api-docs: https://sideswap.io/docs/
status: v0-2026-06-03-structural-verified
links-verified: 2026-06-03
---

# SideSwap

**What it is.** A non-custodial, KYC-free swap platform native to the **Liquid Network** — settlement infrastructure for L-BTC, L-USDt, and tokenized assets, with public order books (maker limit orders, taker market orders).

**What it bridges.** L-BTC ↔ L-USDt and direct asset-to-asset swaps on Liquid (no intermediate conversion).

**Agent access.** Documented **API** (`sideswap.io/docs`) over the Liquid order book. Self-custody throughout.

**How an agent uses it.** An agent holding Liquid assets (L-BTC, L-USDt) swaps between them via the order book API. Best fit for an agent already operating on Liquid for the gas-free USDt properties.

**Dependencies.** A self-custody wallet holding Liquid assets (L-BTC, L-USDt) and the order-book API; no account or KYC, but you must already be on Liquid (bridge in first). No fiat; Liquid-network-scoped.

**Gotchas.** Liquid-network-scoped (not Lightning, not L1 BTC directly — bridge to Liquid first). L-USDt still carries Tether's freeze surface. No fiat. Order-book liquidity/spread risk. *(Fees: verify.)*

**Links.** [sideswap.io](https://sideswap.io) · API docs `sideswap.io/docs`.
