---
name: btc-check
slug: btc-check
tagline: Read-only Bitcoin lookups for an agent — address balances, transactions, fee estimates, block height, and price — with no keys, no accounts, and no funds at risk.
skill-group: data
read-only: true
mcp-servers:
  - "none required — mempool.space public REST API (optionally wrappable as an MCP tool)"
env: []
prereq-tier: none
prereqs:
  - "outbound HTTPS — no keys, no account, no wallet"
maintainer: mempool.space (open source)
repo: https://github.com/mempool/mempool
docs: https://mempool.space/docs/api/rest
site: https://mempool.space
status: published
last-verified: "2026-08-28 (all five endpoints EXERCISED with no key: tip height 964506, recommended fees, prices returned live USD, address balance 200, tx-status shape unchanged per docs. Nothing in the card moved.)"
order: 3
tags:
  - mempool
  - read-only
  - chain-data
  - fees
  - price
---

## What it does

The safe on-ramp: everything an agent needs to **read** the chain, and nothing that can spend. It answers the questions an agent asks before and after it transacts — *what's the balance of this address? did this transaction confirm? what's the current fee rate? what's the block height? what's BTC worth in fiat right now?* — using mempool.space's public REST API.

There are no keys, no account, and no funds involved, so it's the right first skill to install and the right first thing to test (see [verify-setup](/skills/verify-setup)).

## When to use it

- Confirming a payment landed (look up the tx) before delivering on a job.
- Estimating a fee rate before broadcasting an on-chain transaction.
- Reading an address balance or checking chain tip / sync state.
- Pulling a current sats price for converting a fiat-denominated quote.

## Install

This skill needs **no MCP server and no secret** — it's plain authenticated-by-nobody HTTPS. The entire skill is a set of public endpoints:

```
Balance:    GET https://mempool.space/api/address/{address}
Tx status:  GET https://mempool.space/api/tx/{txid}/status
Fees:       GET https://mempool.space/api/v1/fees/recommended
Tip height: GET https://mempool.space/api/blocks/tip/height
Price:      GET https://mempool.space/api/v1/prices
```

- **MCP clients (Claude, Cursor, Hermes):** if you prefer a tool interface, wrap these in a tiny HTTP/fetch MCP, or just let the agent call them with its built-in HTTP tool. No install, no config.
- **OpenClaw / SKILL.md agents:** the same endpoints as slash-command actions (`/btc-check address …`), mirroring the BitClawd `btc-check` skill — but with no broken install step, because there's nothing to install.
- **Any agent:** `curl` works. That's the point — read access to Bitcoin needs no permission.

## Use it

```bash
# Did this transaction confirm?
curl -s https://mempool.space/api/tx/<txid>/status

# What fee rate should I use right now? (sat/vB)
curl -s https://mempool.space/api/v1/fees/recommended

# Current BTC price for converting a quote
curl -s https://mempool.space/api/v1/prices
```

A natural-language run: *"Check whether txid abc… has at least one confirmation, and if so mark the order paid."*

## Verify

- `GET /api/blocks/tip/height` returns a number near the current block height — your data rail is live.
- A known funded address returns a chain_stats balance.
- This is the read rail that [verify-setup](/skills/verify-setup) checks first.

## Gotchas & safety

- **Read-only by construction** — it cannot move funds, so it carries no spending risk. The only failure mode is bad data.
- **Trust the source, or run your own.** A public explorer is a trusted third party for *data*. For sovereignty, point the same calls at your own [Bitcoin Core](/tools/bitcoin-core) + mempool instance — the API is identical.
- **Mind rate limits** on the public endpoint; cache results an agent polls repeatedly.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Captures BitClawd's read-only `btc-check` skill — and beats it on the install step, since theirs advertised `~/.openclaw/skills/` install URLs that 404'd on scrub, while this one needs no install at all. The "run your own node, same API" line is the thesis hook embedded in a utility skill — keep it. The zero-prereq framing makes this the recommended first install + first test. Pairs with [[verify-setup]].
