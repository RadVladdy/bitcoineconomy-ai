---
title: Coinbase
slug: coinbase
type: exchange-card
category: custodial-multi-asset
featured: false
kyc: required
custody: custodial
agent-path: owner-delegated
lightning: true
stablecoins: [USDC, others]
fiat: true
agent-access: api
bitcoin-only: false
bridges:
  - fiat↔BTC
  - BTC↔stablecoin
coverage: global-broad
links:
  site: https://coinbase.com
  api-docs: https://docs.cdp.coinbase.com
status: v0-2026-06-06-structural-verified
links-verified: 2026-06-06 (structural + API-docs URL verified; fees deferred to the venue / Field Notes)
---

# Coinbase

**What it is.** A large, publicly listed, multi-asset exchange with broad fiat connectivity and a mature developer platform. Not Bitcoin-only — it custodies and trades many assets, and is a co-issuer of the USDC stablecoin.

**What it bridges.** Fiat ↔ BTC, and **BTC ↔ stablecoin** (USDC and others) via its trading API — the workhorse path for an agent rebalancing between Bitcoin and a dollar stablecoin where that conversion is needed.

**Agent access.** Robust programmatic **API** (advanced trading, transfers); widely supported.

**How an agent uses it.** KYC account; deposit fiat or BTC; execute the BTC↔stablecoin or fiat↔BTC trade via API; withdraw promptly. Holdings sit at custodial risk during the conversion window.

**Coverage.** Broadly available across many countries (US-headquartered, publicly listed); exact per-region availability shifts — see the venue.

**Dependencies & payment.** A KYC'd Coinbase account and its trading API. Fund with fiat (bank/card) or BTC; execute fiat↔BTC or BTC↔USDC via API; withdraw promptly to bound the multi-asset custodial surface.

**Gotchas.** Multi-asset custody surface — the freeze surface spans the account and all assets held, not just BTC; longer holding periods widen exposure. Much real fiat↔BTC and BTC↔stablecoin conversion happens here.

**Links.** [coinbase.com](https://coinbase.com) · [Advanced Trade API](https://docs.cdp.coinbase.com).
