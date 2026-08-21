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
links-verified: "2026-08-20 (public API EXERCISED unauthenticated — GET api.kraken.com/0/public/Ticker?pair=XBTUSD returned 200 with a live book, no key. docs.kraken.com re-read at the source: Kraken now ships an official CLI and an MCP server exposing 151 commands, whose market and paper services need no credentials. Lightning deposits/withdrawals still documented by the venue. Fees still deferred to the venue / Field Notes.)"
---

**What it is.** A large, long-established multi-asset exchange with broad fiat pairs and a mature trading API. Not Bitcoin-only.

**What it bridges.** Fiat ↔ BTC and **BTC ↔ stablecoin**, across many fiat currencies — useful where an agent's counterparties or jurisdictions are outside US-centric rails.

**Agent access.** Full programmatic **API** (spot trading, funding, withdrawals) over REST, WebSocket and FIX — and, since this card was first written, an official **CLI with a built-in MCP server** that exposes all 151 commands as tools any MCP-capable agent can call. The MCP layer is the notable part for agents: services are scoped explicitly (`market`, `account`, `paper`, `trade`, `funding`, …), the default set is the safe one, and **`market` and `paper` require no credentials at all** — so an agent can read live books and paper-trade against real prices before an account exists anywhere. Tools that move money are marked dangerous and refuse to fire unless the caller passes `acknowledged: true`, which puts the confirmation gate in the protocol rather than in the model's judgement.

**How an agent uses it.** Public market data needs nothing; everything that touches an account or an order needs KYC. KYC account; fund; execute fiat↔BTC or BTC↔stablecoin via API or MCP tool call; withdraw to self-custody promptly. Custodial risk during the holding/conversion window.

**Coverage.** Broad international coverage across many fiat currencies; exact per-region availability shifts — see the venue.

**Dependencies & payment.** A KYC'd Kraken account and its trading API. Fund in one of many fiat currencies; execute fiat↔BTC or BTC↔stablecoin via API; withdraw to self-custody promptly.

**Gotchas.** Multi-asset custody surface (freeze surface spans the account and all held assets).

**Links.** [kraken.com](https://kraken.com) · [API docs](https://docs.kraken.com) · [MCP server](https://docs.kraken.com/home/mcp).
