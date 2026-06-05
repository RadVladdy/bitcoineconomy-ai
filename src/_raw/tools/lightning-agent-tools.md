---
name: lightning-agent-tools
slug: lightning-agent-tools
layer: wallets
tagline: Lightning Labs' production AI-agent toolkit — composable skills plus an MCP server that let an agent run a node, pay L402 APIs, host paid endpoints, and keep its keys isolated.
tool-type: software
maintainer: Lightning Labs
repo: https://github.com/lightninglabs/lightning-agent-tools
docs: https://docs.lightning.engineering
site: https://lightning.engineering/posts/2026-02-11-ln-agent-tools/
x: "@lightning"
latest-release: v0.2.5
release-date: "2026-02-11"
stack-section: "§5"
status: published
last-verified: 2026-06-02
order: 30
tags:
  - lightning-agent-tools
  - lightning-labs
  - mcp
  - l402
  - remote-signer
  - macaroons
  - aperture
---

## What it is

lightning-agent-tools is Lightning Labs' open-source toolkit for letting AI agents transact natively on the Lightning Network. It packages composable skills plus an MCP server covering the full commerce loop: run an LND node programmatically; isolate keys with a remote signer; bake scoped macaroons in preset roles (pay-only, invoice-only, read-only, channel-admin, signer-only); pay for L402-gated APIs via the `lnget` client; host paid endpoints via the Aperture reverse proxy; query node state over MCP; and orchestrate buyer/seller workflows.

It is the canonical 2026 reference implementation for what a production Bitcoin-substrate agent-payment stack actually looks like — the surface most subsequent agent-Lightning integrations are measured against.

## When to use it

- Building an agent that both pays for and sells services over Lightning end-to-end.
- You want least-privilege key handling (remote signer + scoped macaroons) out of the box.
- Connecting an MCP-capable agent (e.g. Claude Code) to a real Lightning node.

## Dependencies

An LND-compatible Lightning node as the backend — ideally a watch-only node plus a separate remote signer, so the agent host holds no keys. Open-source; Docker is the default deployment path.

## Quick start

Add the MCP server to an MCP-capable agent backed by a Lightning Node Connect node:

```
claude mcp add --transport stdio lnc -- npx -y @lightninglabs/lightning-mcp-server
```

The agent can then query node state and send/receive Lightning payments through MCP tool calls. Production deployment runs against any LND-compatible backend; Docker is the default path.

## Gotchas

- Use the recommended **watch-only node + remote signer** model so the agent host holds no private keys; the README explicitly warns never to ship `admin.macaroon` in production — use scoped macaroons.
- Early-stage (v0.2.x as of February 2026) — APIs and surface area are still moving; pin versions.
- The MCP server exposes read-only node tools by default; mutating operations require deliberately scoped credentials.
