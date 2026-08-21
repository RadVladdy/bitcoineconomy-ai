---
name: Alby & Nostr Wallet Connect (NWC)
slug: alby-nwc
layer: integration
toolbox-group: wallets
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
last-verified: "2026-08-20 (@getalby/mcp confirmed published on the npm registry at 1.1.1 and its README re-read: npx -y @getalby/mcp and NWC_CONNECTION_STRING are both exactly as this card documents, and it still carries NWC, LNURL and L402 knowledge. getAlby/nwc-mcp-server confirmed ARCHIVED at the source, as the card says. Alby Hub and the JS SDK both pushed within the week. New since the card was written: Alby runs a HOSTED remote MCP server.)"
order: 11
prereq-tier: wallet
prereqs:
  - "a NIP-47 (NWC) wallet or hub that holds the keys (e.g. Alby Hub)"
  - "a scoped, budgeted, revocable NWC connection string on the agent side"
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

**Alby** is the primary builder and promoter of the standard: the Alby browser extension, Alby Hub (a self-custodial node manager), a JavaScript SDK, and — most relevant for agents — **Alby MCP** (`@getalby/mcp`), which exposes NWC payments (plus LNURL and L402 knowledge) to Claude, Cursor, Hermes, or n8n as MCP tools. (The earlier `nwc-mcp-server` is archived and now points users to `@getalby/mcp`.) Alby also runs the server **hosted**, at `https://mcp.getalby.com/mcp`, which changes the setup story: an agent that speaks remote MCP connects with a single command and passes the NWC connection string as a bearer token rather than running a local process at all. The same endpoint is available over SSE for workflow runners like n8n.

NWC is usually described from the *paying* side — an agent holding a scoped connection to spend. It runs the other direction too: [ContextVM](/tools/contextvm)'s CEP-8 payment spec has the **server** hold an NWC connection to *receive* payment and verify settlement for a priced tool call. Same connection-string primitive, both ends of the transaction — the client's to pay, the server's to get paid.

## When to use it

- Giving an agent the ability to pay without giving it custody of keys.
- Wiring Lightning payments into an MCP-capable agent (Claude, Cursor, Goose, Hermes, n8n) via Alby MCP (`@getalby/mcp`), run locally over stdio or reached as Alby's hosted remote server.
- Any app that needs delegated, budget-limited spend from a wallet the user still controls.

## Dependencies

A Lightning wallet or node that speaks NWC (Alby Hub, or any NIP-47-compatible wallet) to hold the keys, plus a client or agent that holds the NWC connection string — kept scoped, budgeted, and revocable. Nothing custodial sits on the agent side; the transport runs over Nostr relays.

## Quick start

Connect an MCP-capable agent to a wallet with [Alby MCP](https://github.com/getAlby/mcp) (`npx -y @getalby/mcp`): generate an NWC connection string from Alby Hub (or any NWC-compatible wallet) with a spending budget, then point the MCP server at it via `NWC_CONNECTION_STRING`. To skip the local process entirely, point the agent at the hosted server instead — `claude mcp add --transport http alby https://mcp.getalby.com/mcp --header "Authorization: Bearer nostr+walletconnect://..."` — noting that this hands the connection string to Alby's endpoint, so scope and budget it accordingly. The agent gets payment tools; the keys stay in the wallet. For the ready-made agent recipe, see the [lightning-pay](/skills/lightning-pay) skill.

## Gotchas

- The NWC connection string embeds a secret that grants wallet control — treat it as sensitive, and prefer **budgeted, scoped** connections (per-app spend caps) over full access.
- Transport runs over Nostr relays; relay availability and latency affect payment reliability — use multiple relays.
- The npm package has not been republished since mid-2025 even though the repository is still maintained — stable rather than abandoned, but pin a version and read the repo rather than the registry for what it currently does.
- Custody depends on the wallet behind the connection (self-custodial Alby Hub vs. a hosted wallet differ) — be explicit about which you are delegating from.
