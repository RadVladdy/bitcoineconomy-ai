---
title: Kraken
slug: kraken
type: exchange-card
category: custodial-multi-asset
featured: false
kyc: required
custody: custodial
agent-path: owner-delegated
lightning: true
stablecoins: [USDC, USDT (multi-network)]
fiat: true
agent-access: api
bitcoin-only: false
bridges:
  - fiat↔BTC
  - BTC↔stablecoin
coverage: global-broad
links:
  site: https://kraken.com
  api-docs: https://docs.kraken.com
status: v0-2026-06-06-structural-verified
links-verified: 2026-06-06 (structural + API-docs URL verified; fees deferred to the venue / Field Notes)
---

# Kraken

**What it is.** A large, long-established multi-asset exchange with broad fiat pairs and a mature trading API. Not Bitcoin-only.

**What it bridges.** Fiat ↔ BTC and **BTC ↔ stablecoin**, across many fiat currencies — useful where an agent's counterparties or jurisdictions are outside US-centric rails.

**Agent access.** Full programmatic **API** (spot trading, funding, withdrawals).

**How an agent uses it.** KYC account; fund; execute fiat↔BTC or BTC↔stablecoin via API; withdraw to self-custody promptly. Custodial risk during the holding/conversion window.

**Coverage.** Broad international coverage across many fiat currencies; exact per-region availability shifts — see the venue.

**Dependencies & payment.** A KYC'd Kraken account and its trading API. Fund in one of many fiat currencies; execute fiat↔BTC or BTC↔stablecoin via API; withdraw to self-custody promptly.

**Gotchas.** Multi-asset custody surface (freeze surface spans the account and all held assets).

**Links.** [kraken.com](https://kraken.com) · [API docs](https://docs.kraken.com).
