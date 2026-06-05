---
name: Model Context Protocol (MCP)
slug: mcp
layer: integration
tagline: The open standard for giving agents structured access to tools and data — the rail a Lightning payment server plugs into so an agent can pay from inside its workflow.
tool-type: protocol
maintainer: Anthropic & the MCP community
repo: https://github.com/modelcontextprotocol/modelcontextprotocol
docs: https://modelcontextprotocol.io/docs
site: https://modelcontextprotocol.io
stack-section: "§4"
status: published
last-verified: 2026-06-02
order: 14
tags:
  - mcp
  - model-context-protocol
  - tools
  - agent-integration
  - lightning-mcp-server
---

## What it is

The Model Context Protocol is an open standard for connecting AI applications to external systems — data sources, tools, and workflows — through a uniform interface. Think of it as a USB-C port for agents. It matters for the Bitcoin stack because payments plug in as just another set of tools: a **Lightning MCP server** exposes node operations (pay, invoice, balance, channels) to the agent as callable tools, so an agent can transact from inside Claude, Cursor, or n8n without bespoke integration code.

MCP is the connective tissue; the Lightning MCP servers are what make payments a first-class agent capability.

## When to use it

- Exposing Lightning operations to an MCP-capable agent as structured tools.
- Standardizing how an agent reaches payment infrastructure (and everything else) through one interface.
- Building once and integrating across many clients (Claude, ChatGPT, VS Code, Cursor).

## Dependencies

An MCP-capable client (Claude, Cursor, VS Code, n8n, or custom) and — to actually transact — a Lightning MCP server paired with it (lightning-mcp-server or Alby's nwc-mcp-server), backed by a Lightning node or NWC connection. MCP carries the tools, not the money.

## Quick start

Pair MCP with a payments server. Two on-stack options: **lightning-mcp-server** (part of [lightning-agent-tools](/tools/lightning-agent-tools)) and Alby's **nwc-mcp-server** (see [Alby & NWC](/tools/alby-nwc)). Example — add a Lightning Node Connect-backed node to Claude Code:

```
claude mcp add --transport stdio lnc -- npx -y @lightninglabs/lightning-mcp-server
```

Build your own servers and clients from the docs at `modelcontextprotocol.io/docs`.

## Gotchas

- MCP itself is **transport and tooling, not payments** — it carries no money. Pair it with a Lightning MCP server to actually transact.
- Tools an agent can call are capabilities it can be tricked into using — scope server permissions tightly (read-only by default; mutating/payment tools behind deliberate, budgeted credentials).
- The spec is evolving quickly; pin to a known spec/SDK version.
