---
name: verify-setup
slug: verify-setup
tagline: A pre-flight check an agent runs on itself before it transacts — confirm the data, payment, identity, and discovery rails are all live, in one pass.
skill-group: ops
read-only: true
mcp-servers:
  - "composes the other skills' servers — no new server of its own"
env: []
composes:
  - btc-check
  - lightning-pay
  - nostr-post
  - discover-and-buy
prereq-tier: none
prereqs:
  - "whichever skills you intend to use installed (this checks them; it adds nothing)"
maintainer: bitcoineconomy.ai
docs: https://bitcoineconomy.ai/skills
site: https://bitcoineconomy.ai
status: published
last-verified: 2026-06-29
order: 5
tags:
  - verify
  - self-test
  - pre-flight
  - ops
  - read-only
---

## What it does

Before an agent spends money or posts publicly unattended, it should confirm its rails actually work. `verify-setup` is the **four-rail pre-flight** — a single read-only pass that exercises each capability without moving funds or publishing anything irreversible:

1. **Data rail** — [btc-check](/skills/btc-check): fetch the chain tip height. If it returns a recent block number, read access is live.
2. **Payment rail** — [lightning-pay](/skills/lightning-pay): check wallet balance via the Alby MCP. If it returns a balance (not an auth error), the NWC connection is valid and budgeted.
3. **Identity rail** — [nostr-post](/skills/nostr-post): resolve the agent's own npub ("whoami"). If it returns the dedicated key's public identity, the signer loaded.
4. **Discovery rail** — [discover-and-buy](/skills/discover-and-buy): call `list_categories` on the marketplace MCP. If it returns the category set, the directory is reachable.

Four green checks and the agent is cleared to transact. Any red check is caught **before** it costs money or credibility.

## When to use it

- As the **first thing** an agent runs after install, and again at the start of each session.
- In CI / before a deploy, to fail fast when a credential expired or a relay went dark.
- As a health check a supervising agent runs against its workers.

## Install

There's nothing new to install — `verify-setup` composes the servers the other skills already configured. It's a recipe, not a server. Give your agent this checklist as a skill/prompt:

```text
Run a read-only pre-flight and report PASS/FAIL per rail:
  1. btc-check: GET mempool.space tip height — PASS if a recent block number.
  2. lightning-pay: get wallet balance via the Alby MCP — PASS if a balance returns.
  3. nostr-post: resolve my own npub — PASS if my dedicated key's pubkey returns.
  4. discover-and-buy: list_categories on the marketplace MCP — PASS if categories return.
Do not send funds, do not publish notes. Summarize the four results.
```

- **MCP clients / OpenClaw / any agent:** identical — it only *reads*, so it runs anywhere the four skills are reachable. This mirrors BitClawd's `/test` self-verify step, generalized across all four rails.

## Use it

A natural-language run: *"Run the pre-flight and tell me which rails are green before you start the job."* The agent reports each rail's status; you (or it) fix any red one before real work begins.

## Verify

The skill *is* the verification. A clean run is four PASS lines. If the payment rail fails, re-check the NWC budget/expiry; if identity fails, re-check the dedicated nsec; if discovery fails, the marketplace MCP URL or network; if data fails, outbound HTTPS.

## Gotchas & safety

- **Strictly read-only** — it must never send a payment or publish a note. Checking a balance is fine; spending to "test" is not. Keep the test path side-effect-free.
- **It checks, it doesn't fix.** A red rail means stop and correct the underlying skill's config — don't let an agent proceed past a failed check.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

The "Test / self-verify" capture from BitClawd, generalized from their 3-checkpoint script to the full four-rail model the Skills surface is built around (data / payment / identity / discovery). Deliberately a recipe, not a server — it composes the other four, which keeps the surface honest about what's actually deployable vs. orchestration. Read-only is the load-bearing safety property. Pairs with all four skills above.
