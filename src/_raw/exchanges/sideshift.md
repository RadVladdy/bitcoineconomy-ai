---
title: SideShift.ai
slug: sideshift
type: exchange-card
category: noncustodial-swap
featured: true
kyc: none
custody: self-custody
lightning: false
stablecoins: [USDT-Liquid, USDC, many]
fiat: false
agent-access: api
bridges:
  - BTC↔stablecoin
  - cross-chain (200+ assets, 45+ networks)
trust-model: noncustodial-swap
links:
  site: https://sideshift.ai
  api-docs: https://docs.sideshift.ai
status: v0-2026-06-06-structural-verified
links-verified: 2026-08-07 (coin catalogue + pair probes with a working control; lightning off, account credential now required)
---

**What it is.** A non-custodial, **no-KYC** swap service spanning a broad multi-chain asset set — direct-to-wallet conversions with no funds custodied. **It is no longer no-account:** the API now requires an `x-sideshift-secret` header and an `affiliateId`, both taken from an account page. The account is **auto-created with no email and no identity check**, so the no-KYC property — the one that matters — still holds; what changed is that a credential must be fetched before the first call. *(Server-side callers must also send `x-user-ip` or requests are blocked.)*

**What it bridges.** BTC, L-BTC, and **USDT-Liquid** plus a broad multi-chain set — useful for an agent converting BTC↔stablecoin. ⚠ **Lightning is switched off** (measured 2026-08-07): it is absent from the coin catalogue entirely, and probes in both directions return `Deposit method is disabled` / `Settle method is disabled`, while a L-BTC↔USDT-Liquid control on the same endpoint returns a live rate.

**Agent access.** **REST API + embeddable widgets**, explicitly built for developers/product teams integrating swaps without custodying funds. Variable or fixed-rate swaps.

**How an agent uses it.** Request a swap quote via API, send the input asset to the quoted address from its own wallet, receive the output to a self-custody address. No onboarding, no identity.

**Dependencies.** A self-custody wallet holding the input asset, plus the REST API (with an account secret and `affiliateId`) or the embeddable widget; **no KYC**, and the account is auto-created with no email. No fiat — you send one crypto asset and receive another to your own address, across 200+ assets and 45+ networks.

**Gotchas.** Not as clean as a pure atomic swap (Boltz/SideSwap): an **automated risk-screening layer can flag a transaction and hold funds** (reported multi-day) and may request **KYC / source-of-funds** to release them — so "no-KYC" holds by default, not under duress. No fiat. Offshore — no consumer protection or recourse; the stablecoin output remains issuer-freezable. Rate/settlement risk on variable-rate swaps.

**Links.** [sideshift.ai](https://sideshift.ai) · [API docs](https://docs.sideshift.ai).
