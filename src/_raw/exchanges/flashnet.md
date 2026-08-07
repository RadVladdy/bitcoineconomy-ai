---
title: Flashnet
slug: flashnet
type: exchange-card
category: noncustodial-swap
featured: false
kyc: none
custody: self-custody
lightning: true
stablecoins: [USDT, USDB, USDC]
fiat: false
agent-access: api
bridges:
  - BTC↔stablecoin (Spark AMM)
trust-model: noncustodial-amm
links:
  site: https://www.flashnet.xyz
  skill: https://github.com/flashnetxyz/spark-wallet
status: v0-2026-06-06-structural-verified
links-verified: 2026-08-07 (both docs indexes read; AMM vs Orchestra separated, Elliptic screening disclosed)
---

**What it is.** A **non-custodial, Bitcoin-native DEX / AMM** built on [Spark](/tools/spark) (Lightspark's Bitcoin L2). Its Spark **AMM** swaps **BTC ↔ USDB** — the native, audited Brale + Flashnet dollar, no wrapping and no bridge — settling on Spark in seconds. **USDT and USDC are a different product**: they arrive through **Orchestra**, Flashnet's cross-chain orchestration API, not through the Spark AMM. The agent keeps its keys; Flashnet routes and settles against native Bitcoin liquidity rather than custodying funds.

**What it bridges.** Two paths, with different trust and access profiles — the card used to merge them. **(1) The Spark AMM:** **BTC ↔ USDB**, via `@flashnet/sdk` on Spark — **constant-product** (V2), bonding-curve and concentrated-liquidity (V3) pools, no order-book counterparty, keys stay with the agent. **(2) Orchestra:** cross-chain swaps of **USDC, USDT, ETH, SOL or TRX into BTC or USDB**, spanning Ethereum, Arbitrum, Optimism, Polygon, Solana and Tron — authenticated with an **HMAC-SHA256 API key and secret**, so it is not the keyless path. No bank-fiat leg on either.

**Agent access.** Genuinely agent-native: the open-source **`spark-wallet` skill** (`github.com/flashnetxyz/spark-wallet`, MIT) lets an agent create/manage a Spark wallet and execute Flashnet AMM swaps programmatically — e.g. `swap usdb btc`, "buy $5 of BTC with USDB" — plus instant BTC transfers on Spark, on mainnet. No account, no KYC surfaced.

**How an agent uses it.** Install the skill (or build against the Flashnet API), fund a self-custodial Spark wallet, and call a swap; the AMM quotes and settles BTC↔stablecoin on Spark in seconds, output to the agent's own keys.

**Dependencies.** A self-custodial Spark wallet (the `spark-wallet` skill or equivalent) and Spark connectivity. No fiat path — crypto-in, crypto-out. The swap rides Spark, so it inherits Spark's operator-set trust model (see Gotchas).

**Gotchas.** *Non-custodial* is not *risk-free.* (1) **Spark's trust model** — Spark is a mainnet-beta L2 run by a small operator set (Lightspark + Flashnet), a semi-trusted surface, not trust-minimized like Bitcoin L1; understand it before holding balances there (see the [Spark tools card](/tools/spark)). (2) **AMM liquidity / slippage** at size, as with any pool-based swap. (3) **Stablecoin ≠ censorship-resistance** — USDT/USDB/USDC are issuer-freezable; the rail is sovereign, the dollar token is not. (4) **Orchestra orders are screened.** Flashnet's own docs state it plainly: *"Flashnet screens order addresses for sanctions and illicit-finance risk through Elliptic before funds move."* A high-risk order is held for review and an order tied to a sanctioned address is rejected. This is **address screening, not identity verification** — `kyc: none` still holds — but it is a discretionary gate on the Orchestra path, and it does not apply to the keyless AMM path. (5) **Newer and less battle-tested;** the agent skill is early. Fees and current mainnet status live at the venue — it's beta, so confirm before relying on it.

**Links.** [flashnet.xyz](https://www.flashnet.xyz) · agent skill `github.com/flashnetxyz/spark-wallet` · runs on [Spark](/tools/spark).
