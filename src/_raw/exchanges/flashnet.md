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
links-verified: 2026-06-06
---

# Flashnet

**What it is.** A **non-custodial, Bitcoin-native DEX / AMM** built on [Spark](/tools/spark) (Lightspark's Bitcoin L2). It swaps **BTC ↔ stablecoins** — USDT (issued natively on Spark by Tether), **USDB** (the native, audited Brale + Flashnet dollar — no wrapping, no bridge), and USDC — settling on Spark in seconds. The agent keeps its keys; Flashnet routes and settles against native Bitcoin liquidity rather than custodying funds.

**What it bridges.** **BTC ↔ USDT / USDB / USDC** on Spark, via an automated market maker (constant pricing, no order-book counterparty). No bank-fiat leg. (Flashnet also runs multi-chain orchestration across other networks; the Bitcoin-native Spark AMM is the relevant path here.)

**Agent access.** Genuinely agent-native: the open-source **`spark-wallet` skill** (`github.com/flashnetxyz/spark-wallet`, MIT) lets an agent create/manage a Spark wallet and execute Flashnet AMM swaps programmatically — e.g. `swap usdb btc`, "buy $5 of BTC with USDB" — plus instant BTC transfers on Spark, on mainnet. No account, no KYC surfaced.

**How an agent uses it.** Install the skill (or build against the Flashnet API), fund a self-custodial Spark wallet, and call a swap; the AMM quotes and settles BTC↔stablecoin on Spark in seconds, output to the agent's own keys.

**Dependencies.** A self-custodial Spark wallet (the `spark-wallet` skill or equivalent) and Spark connectivity. No fiat path — crypto-in, crypto-out. The swap rides Spark, so it inherits Spark's operator-set trust model (see Gotchas).

**Gotchas.** *Non-custodial* is not *risk-free.* (1) **Spark's trust model** — Spark is a mainnet-beta L2 run by a small operator set (Lightspark + Flashnet), a semi-trusted surface, not trust-minimized like Bitcoin L1; understand it before holding balances there (see the [Spark tools card](/tools/spark)). (2) **AMM liquidity / slippage** at size, as with any pool-based swap. (3) **Stablecoin ≠ censorship-resistance** — USDT/USDB/USDC are issuer-freezable; the rail is sovereign, the dollar token is not. (4) **Newer and less battle-tested** than Boltz; the agent skill is early. Fees and current mainnet status live at the venue — it's beta, so confirm before relying on it.

**Links.** [flashnet.xyz](https://www.flashnet.xyz) · agent skill `github.com/flashnetxyz/spark-wallet` · runs on [Spark](/tools/spark).
