---
name: Minibits Ippon
slug: minibits-ippon
layer: wallets
tagline: A Cashu wallet built from the ground up for AI agents — create and fund a short-lived, single-purpose wallet in one HTTP call or CLI command.
tool-type: software
maintainer: minibits-cash
repo: https://github.com/minibits-cash/minibits_ippon
docs: https://github.com/minibits-cash/minibits_ippon
site: https://minibits.cash
x: "@MinibitsCash"
stack-section: "§5"
status: published
last-verified: 2026-06-02
order: 32
tags:
  - minibits
  - ippon
  - cashu
  - ecash
  - agent-wallet
  - mcp
---

## What it is

**Ippon** is a minimalistic Cashu (ecash + Lightning) wallet designed from the ground up for autonomous agents, from the team behind the Minibits mobile wallet. An agent creates a wallet via a single HTTP call or CLI command, funds it over Lightning, and transacts in seconds — no channel management at the agent layer, because the mint handles Lightning and the agent just holds bearer ecash. It runs as a hosted REST API server or a local CLI, and a companion `minibits_ippon_mcp` wraps the API for MCP clients.

It is the canonical agent-native Cashu wallet: the lightest path to giving an agent a spendable balance.

## When to use it

- Spinning up short-lived, single-purpose, low-balance wallets for individual agents or tasks.
- Cashu-based agent payments where you want an HTTP/CLI interface, not a mobile app.
- Wiring ecash payments into an MCP-capable agent via `minibits_ippon_mcp`.

## Dependencies

A Cashu mint to back the wallet (it handles Lightning) and a single HTTP call or CLI command to create and fund it; the agent just holds bearer ecash, no channel management. Add `minibits_ippon_mcp` for MCP clients. Alpha and custodial — keep wallets disposable and small.

## Quick start

Run the Ippon API server (or use a hosted instance) and create a wallet with a single HTTP call or the CLI, per the repo README at `github.com/minibits-cash/minibits_ippon`; add `minibits_ippon_mcp` to expose it to MCP clients. The Minibits mobile wallet (Android) is a separate, human-facing product.

## Gotchas

- Ippon is **alpha and fully custodial** — the project's own guidance is "use at your own risk, small amounts only." Treat wallets as disposable and single-purpose.
- Security is intentionally minimal (simple access keys, no token refresh); the real safeguards are rate limits, max-balance caps, and per-transaction thresholds.
- Standard Cashu custodial-mint trust applies — the backing mint can fail or rug. See [Cashu](/tools/cashu).
