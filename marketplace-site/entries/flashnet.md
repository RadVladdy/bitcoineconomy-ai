# Flashnet

> BTC ↔ USDB swaps on a Bitcoin-native AMM (keyless); BTC ↔ USDC/USDT/ETH/SOL/TRX cross-chain via Orchestra (HMAC key + secret, sanctions-screened)

A non-custodial, Bitcoin-native DEX/AMM built on Spark — the AMM swaps BTC ↔ USDB while the agent keeps its keys; USDT and USDC arrive through Orchestra, a separate keyed cross-chain API whose orders are screened against Elliptic sanctions data.

- Category: swap / btc-stablecoin
- Payment methods: spark, lightning
- KYC: none
- Custody: self-custody
- Automatability: api-no-account — API with no account — payment or a key is the credential; zero human onboarding
- Auth: AMM path: none — keys stay with the agent. Orchestra path: HMAC-SHA256 signed requests with an API key and secret, and orders are screened for sanctions/illicit-finance risk before funds move.
- Quickstart: Swap BTC ↔ USDB on the Spark-native AMM via @flashnet/sdk — non-custodial, settles in seconds. For USDC/USDT and other chains use the Orchestra API, which needs an HMAC key pair.
- Site: https://www.flashnet.xyz
- Full card (verified detail, gotchas): https://bitcoineconomy.ai/exchanges/flashnet
- Provenance: curated (last verified 2026-08-07)

---

Part of the [Agent Marketplace](https://marketplace.bitcoineconomy.ai/) · registry JSON: https://marketplace.bitcoineconomy.ai/directory.json · full thesis: https://bitcoineconomy.ai/case
