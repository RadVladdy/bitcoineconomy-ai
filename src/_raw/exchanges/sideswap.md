---
title: SideSwap
slug: sideswap
type: exchange-card
category: noncustodial-swap
featured: false
kyc: none
custody: self-custody
lightning: false
stablecoins: [L-USDt, EURx]
fiat: false
agent-access: api
bridges:
  - BTC↔L-BTC (peg-in / peg-out)
  - L-BTC↔L-USDt
  - L-BTC↔EURx
  - Liquid asset↔asset
trust-model: noncustodial-swap-liquid
links:
  site: https://sideswap.io
  api-docs: https://sideswap.io/docs/
status: v0-2026-06-03-structural-verified
links-verified: "2026-08-20 (API EXERCISED unauthenticated over wss://api.sideswap.io/json-rpc-ws: assets returned 73 Liquid assets including L-BTC, USDt and EURx, and market.list_markets returned live L-BTC/USDt, L-BTC/EURx and EURx/USDt books. No account, no key. The docs also document peg-in/peg-out, which this card previously denied.)"
---

**What it is.** A non-custodial, KYC-free swap platform native to the **Liquid Network** — settlement infrastructure for L-BTC, L-USDt, and tokenized assets, with public order books (maker limit orders, taker market orders).

**What it bridges.** L-BTC ↔ L-USDt and direct asset-to-asset swaps on Liquid (no intermediate conversion).

**Agent access.** Documented **API** (`sideswap.io/docs`) over the Liquid order book — **JSON-RPC 2.0 over a WebSocket** (`wss://api.sideswap.io/json-rpc-ws`), with a matching testnet endpoint for dry runs. Market data and the asset registry answer **without an account or an API key**; self-custody throughout. Note the published changelog has not moved since February 2025, so treat the docs as stable rather than actively maintained.

**How an agent uses it.** An agent holding Liquid assets (L-BTC, L-USDt) swaps between them via the order book API. Best fit for an agent already operating on Liquid for the gas-free USDt properties.

**Dependencies.** A self-custody wallet holding Liquid assets (L-BTC, L-USDt) and the order-book API; no account or KYC, but you must already be on Liquid (bridge in first). No fiat; Liquid-network-scoped.

**Gotchas.** Liquid-network-scoped and **not Lightning** — an agent settling over Lightning needs a different venue. It is *not* true, as this card said until 2026-08-20, that L1 BTC is out of reach and you must bridge to Liquid first: **SideSwap's own API is that bridge**, exposing peg-in (BTC → L-BTC) and peg-out (L-BTC → BTC) as documented `peg` calls, so the on-chain leg is programmatic rather than someone else's problem. Pegging is still an on-chain operation with its own confirmation wait and minimum amounts. L-USDt carries Tether's freeze surface, and EURx carries its issuer's. No fiat. Order-book liquidity/spread risk.

**Links.** [sideswap.io](https://sideswap.io) · [API docs](https://sideswap.io/docs/).
