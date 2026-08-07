---
name: Minibits Ippon
slug: minibits-ippon
layer: wallets
toolbox-group: ecash
tagline: A Cashu wallet built from the ground up for AI agents — create and fund a short-lived, single-purpose wallet in one HTTP call or CLI command.
tool-type: software
maintainer: minibits-cash
repo: https://github.com/minibits-cash/minibits_ippon
docs: https://github.com/minibits-cash/minibits_ippon
site: https://minibits.cash
x: "@MinibitsCash"
stack-section: "§5"
status: published
last-verified: "2026-08-07 (live public instance ippon.minibits.cash probed: /v1/ Swagger, /v1/json OpenAPI 3.0, /mcp initialize OK; evaluation-only label read from the README)"
order: 32
prereq-tier: account
prereqs:
  - "a Cashu mint to back the wallet (it handles Lightning)"
  - "a single HTTP call or CLI command to create and fund it"
  - "alpha and custodial — keep wallets disposable and small"
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

**There is a live public instance, and the README leads with it:** `ippon.minibits.cash` — Swagger UI at `/v1/`, the OpenAPI 3.0 spec at `/v1/json`, service info at `/v1/info`, and an **MCP server at `/mcp` (POST)**. It is also reachable as a Tor hidden service at `eaqmg2oqhay5btz5v75bgknfb3x4q4vesfijjzvgkbgocn5fvhkntwad.onion`. All four HTTP routes verified live 2026-08-07.

⚠ **That instance is for evaluation, not for money you mind losing.** Minibits labels it plainly: *"provided for research, development and testing and evaluation purposes only. It is an alpha software, use it at your own risk, with small amounts only."* For anything beyond a trial, run your own — the server is the same code either way.

Otherwise: run the Ippon API server yourself and create a wallet with a single HTTP call or the CLI, per the repo README at `github.com/minibits-cash/minibits_ippon`; add `minibits_ippon_mcp` to expose it to MCP clients, or run Ippon in CLI mode (`INTERACTION_MODE=cli`) for an agent that would rather spawn a local process than call a host. The Minibits mobile wallet (Android) is a separate, human-facing product.

## Gotchas

- Ippon is **alpha and fully custodial** — the project's own guidance is "use at your own risk, small amounts only." Treat wallets as disposable and single-purpose.
- Security is intentionally minimal (simple access keys, no token refresh); the real safeguards are rate limits, max-balance caps, and per-transaction thresholds.
- Standard Cashu custodial-mint trust applies — the backing mint can fail or rug. See [Cashu](/tools/cashu).
