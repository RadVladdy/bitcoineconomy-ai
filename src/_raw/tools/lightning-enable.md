---
name: Lightning Enable
slug: lightning-enable
layer: integration
toolbox-group: wallets
tagline: An L402 layer for agentic commerce — a Lightning-wallet MCP that lets an agent pay (and earn) per API call, plus a drop-in that gates any API behind per-call sats.
tool-type: service
maintainer: Refined Element, LLC
repo: https://github.com/refined-element/lightning-enable-mcp
docs: https://docs.lightningenable.com
site: https://lightningenable.com
license: MIT (MCP server)
status: published
last-verified: 2026-06-30
order: 37
prereq-tier: wallet
prereqs:
  - "to pay as an agent: the MIT MCP server, wired to a Lightning backend (a wallet via your chosen provider)"
  - "to sell: a Lightning Enable plan plus a settlement provider account (Strike, OpenNode, or an NWC wallet)"
tags:
  - lightning-enable
  - l402
  - agent-payments
  - mcp
  - api-monetization
  - lightning
---

## What it is

Lightning Enable is a **commerce-orchestration layer** for L402 agent payments — "monetize your API for AI agents." It has two faces. **Merchant-side:** a drop-in that gates an existing API, returns `HTTP 402`, and collects per-request Lightning payments while "your subscriptions, rate limits, and API keys stay as they are." **Agent-side:** an MIT-licensed **MCP server** that gives an AI agent a Lightning wallet — the agent hits a paid endpoint, gets a 402, pays in under a second, and retries with proof — plus an **L402 Producer API** so an agent can *earn*, not only spend. It holds no funds ("we never generate, store, or access Bitcoin keys"); settlement flows directly through a provider the merchant brings.

## When to use it

- Equipping an agent with a Lightning wallet and L402 client via one MCP server (15 wallet tools), so it can pay any L402 endpoint.
- Monetizing your own API per-call in sats for agent traffic, without rebuilding auth.
- Agent-to-agent commerce: the MCP's Agent Service Agreement tools let agents transact with each other.

## Dependencies

To **pay** as an agent: the MIT MCP server (`lightning-enable-mcp`, stdio) wired to a Lightning backend. To **sell**: a Lightning Enable plan plus a **settlement provider** account — currently **Strike** (recommended), **OpenNode**, or an NWC wallet (**LND, CoinOS, CLINK, Alby Hub**). Lightning Enable is non-custodial and routes funds to your provider, so any KYC is the provider's. Bitcoin/Lightning over L402 is the rail; invoices settle in sats (with multi-currency display).

## Quick start

Agent side: install the MCP — `uvx lightning-enable-mcp` (Python) or `dotnet tool run lightning-enable-mcp` (.NET); also on Docker — and point your agent at it for a Lightning wallet plus L402 access (23 tools: 15 wallet, 2 producer, 6 Agent Service Agreement). Merchant side: sign up (Individual $99/mo, Business $299/mo; 30-day trial; no per-transaction fee), connect a settlement provider, and gate your endpoints. Docs at `docs.lightningenable.com`; dashboard at `api.lightningenable.com`.

## Gotchas

- **The platform is a paid SaaS; the MCP is the open part.** Merchant monetization is subscription ($99/$299/mo); the MIT license covers only the `lightning-enable-mcp` client.
- **Custody sits with your provider, not Lightning Enable.** It orchestrates; Strike / OpenNode / your NWC wallet holds keys and funds and sets any KYC.
- **Some MCP tools need a key.** A subset of the 23 tools require a provider/API key (e.g. Strike); the docs and the README phrase the exact count differently — confirm against the repo for your backend.
- **Bring your own provider.** There is no built-in wallet — you connect Strike, OpenNode, or an NWC backend. (Amboss Payments is not a listed provider yet.)

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Placed in the Tools toolbox under `wallets` — what an agent equips here is the **MCP wallet** (15 wallet tools + the L402 client); the merchant-side monetization is the other face, noted but not the agent's equip-surface. Carded 2026-06-30 from the Amboss call (Jesse: "the guy behind Lightning Enable has been going through our [Payments] API") — by **Refined Element, LLC**. Its MCP is registered in `_tool_mcp_endpoints` (stdio) for `list_mcp_servers`. Not a directory "buy" entry: it's agent-payments tooling, not a service an agent buys a good from. **Amboss tie:** the builder is evaluating Amboss Payments as a settlement rail (not yet listed among Strike / OpenNode / NWC) — a live datapoint that Amboss's new API is drawing third-party agent-commerce adoption (the consume side of the 2026-06-30 debrief). Thesis posture: Bitcoin/Lightning over L402, non-custodial orchestration; the asset is BTC/sats (no stablecoin leg), so it sits cleanly on the censorship-resistant rail. Verify-before-card flag carried to the body: the API-key-gated tool count is stated inconsistently across the docs and README.
