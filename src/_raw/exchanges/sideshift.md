---
title: SideShift.ai
slug: sideshift
type: exchange-card
category: noncustodial-swap
featured: true
kyc: none
custody: self-custody
lightning: true
stablecoins: [USDT-Liquid, USDC, many]
fiat: false
agent-access: api
bridges:
  - BTC↔stablecoin
  - Lightning↔stablecoin
  - cross-chain (200+ assets, 45+ networks)
trust-model: noncustodial-swap
links:
  site: https://sideshift.ai
status: v0-2026-06-03-structural-verified
links-verified: 2026-06-03
---

# SideShift.ai

**What it is.** A non-custodial, no-account, no-KYC swap service spanning 200+ assets across 45+ networks — direct-to-wallet conversions with no funds custodied.

**What it bridges.** BTC, Lightning BTC, L-BTC, and **USDT-Liquid** plus a broad multi-chain set — useful for an agent converting BTC↔stablecoin without an account.

**Agent access.** **REST API + embeddable widgets**, explicitly built for developers/product teams integrating swaps without custodying funds. Variable or fixed-rate swaps.

**How an agent uses it.** Request a swap quote via API, send the input asset to the quoted address from its own wallet, receive the output to a self-custody address. No onboarding, no identity.

**Dependencies.** A self-custody wallet holding the input asset and the REST API or embeddable widget; no account, no KYC. No fiat — you send one crypto asset and receive another to your own address, across 200+ assets and 45+ networks.

**Gotchas.** Not as clean as a pure atomic swap (Boltz/SideSwap): an **automated risk-screening layer can flag a transaction and hold funds** (reported multi-day) and may request **KYC / source-of-funds** to release them — so "no-KYC" holds by default, not under duress. No fiat. Offshore — no consumer protection or recourse; the stablecoin output remains issuer-freezable. Rate/settlement risk on variable-rate swaps. *(Fees + supported-asset specifics: verify.)*

**Links.** [sideshift.ai](https://sideshift.ai).
