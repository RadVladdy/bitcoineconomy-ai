---
name: Money Dev Kit
slug: money-dev-kit
layer: integration
toolbox-group: wallets
tagline: A self-custodial Lightning payments SDK — add Bitcoin checkout to an app in minutes, and equip an agent with its own keys-and-accounts-free wallet via the agent-wallet CLI.
tool-type: service
maintainer: Money Dev Kit (Nick Slaney)
repo: https://github.com/moneydevkit
docs: https://docs.moneydevkit.com
site: https://moneydevkit.com
license: Apache-2.0 (agent-wallet; some packages unstated)
latest-release: 0.21.0
release-date: "2026-07-31"
status: published
last-verified: 2026-08-07
order: 36
prereq-tier: wallet
prereqs:
  - "to build: a Next.js or Replit/Vite app and an MDK seed (MDK_MNEMONIC) — MDK runs the LSP, you hold the keys"
  - "to run the agent wallet: just Node / npx — no account, no API key"
tags:
  - money-dev-kit
  - lightning-sdk
  - agent-wallet
  - self-custodial
  - ldk
  - lightning
---

## What it is

Money Dev Kit (MDK) is a **self-custodial Lightning payments SDK** — "global payments for any app in minutes." It deploys a serverless **LDK** (Lightning Dev Kit) "mini node" on the developer's own infrastructure, while MDK runs the **LSP** side (opening channels and managing inbound liquidity) so the builder never operates node infrastructure. The developer holds the keys via a seed (`MDK_MNEMONIC`); MDK never holds funds. It ships framework libraries (`@moneydevkit/nextjs`, `@moneydevkit/replit`) with drop-in checkout components and webhooks.

For agents specifically, MDK ships two directly drivable surfaces: an **`agent-wallet` CLI** (`npx @moneydevkit/agent-wallet`) — a standalone self-custodial Lightning wallet with **no API keys and no accounts**, JSON in and out, that an agent runs itself to hold and spend sats (BOLT11, BOLT12, LNURL, Lightning Address) — and a hosted **MCP server** (`mcp.moneydevkit.com`) an agent uses to scaffold and operate an MDK integration. The [Unhuman](/services/unhuman) storefronts are MDK's own production deployment.

## When to use it

- Equipping an agent with its own self-custodial Lightning wallet it controls (no account, no key handoff) via the `agent-wallet` CLI.
- Adding Bitcoin/Lightning checkout to an app or agent-facing service without running a node.
- Building an L402-gated, agent-payable endpoint of your own — the pattern behind [Unhuman](/services/unhuman).

## Dependencies

To **build**: a Next.js or Replit/Vite app, plus an MDK seed (`MDK_MNEMONIC`) — MDK runs the LSP and opens channels to your serverless node while you control the keys. To **run the agent wallet**: just Node (`npx @moneydevkit/agent-wallet`) — it auto-starts a local daemon, generates a mnemonic on `init`, and needs no account or API key. Bitcoin/Lightning is the only rail; there is no fiat path.

## Quick start

Agent wallet: `npx @moneydevkit/agent-wallet@latest init`, then `… receive 1000` (sats) or `… send <destination>` — output is JSON to stdout. App integration: install `@moneydevkit/nextjs`, set `MDK_MNEMONIC`, drop in the checkout component; the hosted MCP (`claude mcp add moneydevkit --transport http https://mcp.moneydevkit.com/mcp/`) can scaffold and configure it. Docs at `docs.moneydevkit.com` (machine index at `/llms.txt`); installable agent-skills (`mdk-nextjs-checkout`, `mdk-l402-api`, `mdk-agent-wallet`, …) via the Vercel Skills CLI.

## Gotchas

- **Public beta — 2% per-transaction fee** during beta (no monthly fee, no contract). Price it in.
- **License is mixed/partly unstated.** `@moneydevkit/agent-wallet` is Apache-2.0 (confirmed); `@moneydevkit/nextjs` and `@moneydevkit/replit` carry no SPDX license field on npm — confirm before commercial use.
- **Self-custody means key responsibility.** The builder or agent holds the seed (`MDK_MNEMONIC` / `MDK_WALLET_MNEMONIC`); lose it, lose the funds. MDK staff "will never ask for your mnemonic."
- **The hosted MCP is build/ops tooling.** `mcp.moneydevkit.com` helps an agent scaffold and operate an MDK app; its individual tool names aren't published. The runtime agent wallet is the `agent-wallet` CLI.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Placed in the Tools toolbox under `wallets` — what an agent equips here is the self-custodial **`agent-wallet` CLI** (an agent-native wallet it runs itself), not a directory "buy" entry: MDK is infrastructure you build with, not a service an agent purchases. Carded 2026-06-30 from the Amboss-call lead (it's the rail under [Unhuman](/services/unhuman); Jesse called it "Money Dev Kit, built by an Amboss investor"). **Correction to the call:** not Amboss-built — author is **Nick Slaney** (ex-Block/BitKey/C=); the Amboss tie is a **shared VC** (Hivemind / Max Webster backs both). Its hosted MCP is registered in the directory's `_tool_mcp_endpoints` (http transport) for `list_mcp_servers`. Thesis-clean: Bitcoin/Lightning only, self-custodial (LDK, builder holds keys), no fiat, no KYC. Verify-before-card flags are carried into the body (beta fee; unstated package licenses; MCP tools not enumerated).
