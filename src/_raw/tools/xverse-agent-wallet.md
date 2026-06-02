---
name: Xverse Agent Wallet
slug: xverse-agent-wallet
layer: wallets
tagline: A self-custodial Bitcoin wallet built for AI agents — it answers an HTTP 402 by paying the Lightning invoice itself, no human checkout.
tool-type: software
maintainer: Secret Key Labs
repo: https://github.com/secretkeylabs/xverse-core
docs: https://docs.xverse.app/xverse-agentic-wallet/
site: https://www.xverse.app/agents
x: "@xverse"
stack-section: "§5"
status: published
last-verified: 2026-06-02
order: 33
tags:
  - xverse
  - agent-wallet
  - machine-payments-protocol
  - http-402
  - spark
  - self-custodial
---

## What it is

The Xverse Agent Wallet is a self-custodial Bitcoin wallet designed for autonomous agents. It implements a "Machine Payments Protocol": the agent calls an API, receives an `HTTP 402`, pays the returned Lightning invoice (settling over [Spark](/tools/spark)), and receives the data — autonomously, with no human in the checkout loop. Keys stay on the machine, encrypted at rest (AES-256-GCM); the underlying `xverse-core` library has been third-party audited.

It's the consumer-grade Xverse wallet's architecture turned toward agents: self-custody plus machine-tempo, human-free payment.

## When to use it

- Giving an agent a self-custodial wallet that pays 402-gated APIs on its own.
- Deployments that want keys on-device (encrypted) rather than delegated to a remote wallet.
- Settlement over Spark with Lightning interoperability.

## Quick start

Start from the agent-wallet docs at `docs.xverse.app/xverse-agentic-wallet/`; the audited core library is `xverse-core` at `github.com/secretkeylabs/xverse-core`. The agent funds a wallet and then transacts against 402-gated endpoints via the Machine Payments Protocol.

## Gotchas

- Self-custodial, but the agent **spends autonomously without per-payment approval** — a key/host compromise means autonomous fund drain (mitigated, not eliminated, by on-device encryption). Cap balances and scope what the agent can pay.
- Settlement runs over **Spark**, itself a mainnet-beta L2 — it inherits Spark's early-stage operator-trust assumptions. See [Spark](/tools/spark).
- The agent-wallet surface is newer and less battle-tested than the established Xverse consumer wallet.
