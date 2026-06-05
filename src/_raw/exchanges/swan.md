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
links-verified: 2026-06-03 (structural; API/automation scope pending)
---

# Swan Bitcoin

**What it is.** A US Bitcoin-only company built around **recurring accumulation** (dollar-cost averaging) and long-term holding, with automatic withdrawal to self-custody. No altcoins.

**What it bridges.** Fiat (US bank) ↔ BTC, optimized for scheduled recurring buys rather than ad-hoc trading.

**Agent access.** Primarily a **scheduled-buy** model rather than a general programmatic trading API — best fit for an agent that wants a hands-off, rules-based path to build a Bitcoin *reserve* over time. *(Confirm any current API/automation surface before publish.)*

**How an agent uses it.** KYC once; configure recurring buys funded from a US bank; auto-withdraw to a self-custody address on a cadence. This is a *reserve-building* tool, not an operational off-ramp.

**Coverage.** United States–focused. *(Verify.)*

**Dependencies & payment.** A KYC'd US Swan account. Payment is recurring buys funded from a US bank with automatic withdrawal to self-custody — a reserve-building cadence, not an API trading or operational off-ramp surface.

**Gotchas.** Custodial at the buy boundary (mitigated by auto-withdrawal to self-custody); oriented to accumulation, so it does not serve fast operational conversion or Lightning off-ramp needs the way Strike does.

**Links.** [swanbitcoin.com](https://swanbitcoin.com) *(verify).*
