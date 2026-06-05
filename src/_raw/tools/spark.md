---
name: Spark
slug: spark
layer: ecash
tagline: A shared-UTXO, Lightning-compatible Bitcoin L2 for instant, near-zero-cost transfers of BTC and Bitcoin-native assets — no bridges, no wrapping.
tool-type: software
maintainer: Lightspark
repo: https://github.com/buildonspark/spark
docs: https://docs.spark.money
site: https://www.spark.money
x: "@buildonspark"
latest-release: Mainnet beta
release-date: "2025-04-29"
stack-section: "§3"
status: published
last-verified: 2026-06-02
order: 22
tags:
  - spark
  - lightspark
  - l2
  - shared-utxo
  - lightning
  - scaling
---

## What it is

Spark is a shared-UTXO, Lightning-compatible Bitcoin L2 built by Lightspark for instant, near-zero-cost transfers of BTC and Bitcoin-native assets (including stablecoins), with full Lightning interoperability and no bridges or wrapped tokens. It sits in the same architectural band as the bearer-ecash layers — a lightweight settlement surface above Lightning — and is the rail behind some agent wallets ([Xverse Agent Wallet](/tools/xverse-agent-wallet) settles agent payments over Spark).

## When to use it

- Agent settlement that wants Lightning interoperability with a lighter operational footprint than running channels.
- Moving BTC and Bitcoin-native assets quickly between participants without bridges.
- As the L2 beneath an agent wallet rather than something an agent integrates directly.

## Dependencies

A Spark-compatible wallet and a Spark operator to transact through; most agents reach Spark through a wallet (e.g. Xverse) rather than integrating the L2 directly. Mainnet-beta with a small operator set — a semi-trusted model, not trust-minimized like Bitcoin's base layer.

## Quick start

Build against the SDK and docs at `docs.spark.money`; the source is at `github.com/buildonspark/spark`, and live network status is at `spark.money/status`. Most agents will reach Spark through a wallet (e.g. Xverse) rather than integrating the L2 directly.

## Gotchas

- **Mainnet beta** (public beta since April 2025) — real but early, by Lightspark's own framing.
- At launch the network ran with a **small operator set** (Lightspark + Flashnet) — a semi-trusted set, not trust-minimized like Bitcoin's base layer. Understand the operator trust model before depending on it.
- Newer than Lightning; tooling and liquidity ecosystem are still maturing.
