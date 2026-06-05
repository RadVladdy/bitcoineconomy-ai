---
name: Alby & Nostr Wallet Connect (NWC)
slug: alby-nwc
layer: integration
tagline: A standard for controlling a Lightning wallet remotely — scoped, budgeted, and revocable — without ever handing over the keys.
tool-type: software
maintainer: Alby
repo: https://github.com/getAlby
docs: https://nwc.dev
site: https://getalby.com
x: "@getAlby"
nostr: nprofile1qqsyv47lazt9h6ycp2fsw270khje5egjgsrdkrupjg27u796g7f5k0s8jq7y6
stack-section: "§4"
status: published
last-verified: 2026-06-02
order: 11
tags:
  - nwc
  - nip-47
  - nostr-wallet-connect
  - alby
  - mcp
  - remote-wallet
---

## What it is

Nostr Wallet Connect (NWC, **NIP-47**) is an open protocol that lets an application or agent control a Lightning wallet remotely — create invoices, send payments, check balances — without ever holding the wallet's private keys. The wallet (which holds the keys and signs) and the app (which signs nothing) talk over Nostr relays. The agent holds a revocable, scoped connection string instead of a key, which drastically shrinks its attack surface.

**Alby** is the primary builder and promoter of the standard: the Alby browser extension, Alby Hub (a self-custodial node manager), a JavaScript SDK, and — most relevant for agents — the `nwc-mcp-server`, which exposes NWC payments to Claude, Cursor, or n8n as MCP tools.

## When to use it

- Giving an agent the ability to pay without giving it custody of keys.
- Wiring Lightning payments into an MCP-capable agent (Claude, Cursor, n8n) via `nwc-mcp-server`.
- Any app that needs delegated, budget-limited spend from a wallet the user still controls.

## Dependencies

A Lightning wallet or node that speaks NWC (Alby Hub, or any NIP-47-compatible wallet) to hold the keys, plus a client or agent that holds the NWC connection string — kept scoped, budgeted, and revocable. Nothing custodial sits on the agent side; the transport runs over Nostr relays.

## Quick start

Connect an MCP-capable agent to a wallet with Alby's [nwc-mcp-server](https://github.com/getAlby/nwc-mcp-server): generate an NWC connection string from Alby Hub (or any NWC-compatible wallet) with a spending budget, then point the MCP server at it. The agent gets payment tools; the keys stay in the wallet.

## Gotchas

- The NWC connection string embeds a secret that grants wallet control — treat it as sensitive, and prefer **budgeted, scoped** connections (per-app spend caps) over full access.
- Transport runs over Nostr relays; relay availability and latency affect payment reliability — use multiple relays.
- Custody depends on the wallet behind the connection (self-custodial Alby Hub vs. a hosted wallet differ) — be explicit about which you are delegating from.
