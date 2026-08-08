---
name: Xverse Agent Wallet
slug: xverse-agent-wallet
layer: wallets
toolbox-group: wallets
tagline: A self-custodial Bitcoin wallet built for AI agents — it answers an HTTP 402 by paying the Lightning invoice itself, no human checkout.
tool-type: software
maintainer: Secret Key Labs
repo: https://github.com/secretkeylabs/xverse-core
docs: https://docs.xverse.app/xverse-agentic-wallet/
site: https://www.xverse.app/agents
x: "@xverse"
stack-section: "§5"
status: published
last-verified: 2026-08-07 (MPP attribution corrected against the vendor page)
order: 33
prereq-tier: l2-network
prereqs:
  - "the audited xverse-core library plus a Spark backend for settlement"
  - "a funding source (keys stay encrypted on-device; the agent answers HTTP 402s itself)"
  - "inherits Spark's mainnet-beta operator-trust assumptions"
tags:
  - xverse
  - agent-wallet
  - machine-payments-protocol
  - http-402
  - spark
  - self-custodial
---

## What it is

The Xverse Agent Wallet is a self-custodial Bitcoin wallet designed for autonomous agents. It implements the **Machine Payments Protocol (MPP)** — a standard Xverse credits to Stripe and Tempo, not an Xverse invention: the agent calls an API, receives an `HTTP 402`, pays the returned Lightning invoice (settling over [Spark](/tools/spark)), and receives the data — autonomously, with no human in the checkout loop. Keys stay on the machine, encrypted at rest (AES-256-GCM); the underlying `xverse-core` library has been third-party audited.

It's the consumer-grade Xverse wallet's architecture turned toward agents: self-custody plus machine-tempo, human-free payment.

**It is multi-chain, and that is a fact about what you are adopting.** Xverse describes it as *"multi-chain from birth"* — the same wallet holds BTC, trades on Starknet DEXes via AVNU, swaps on Flashnet over Spark, and manages Runes on Bitcoin L1, with Stacks via Bitflow. It also carries **fiat on-ramps**: Xverse's own agent page says you *"fund your agent with fiat via MoonPay, Revolut, or Banxa."* Two things follow for a builder. A wallet holding several assets widens the freeze surface to every asset it holds, not just the one you meant to use — the same reasoning [[Exchange]] applies to multi-asset accounts. And a fiat on-ramp is a **KYC surface** attached to a wallet whose selling point is that an agent needs no account: the on-ramp providers are the ones asking for identity, and using one puts a human's verified identity behind the funding leg.

**MCP.** Xverse markets the agent wallet as MCP-compatible, and its agent page's FAQ is specific about where the server lives: *"The Xverse API ships a native MCP server that plugs into Claude, Cursor, Codex, Copilot, Cline, Windsurf, OpenClaw, and Hermes."* Note the attribution — it credits the **Xverse API**, a sibling product, rather than the agent wallet itself, and Xverse publishes no endpoint URL or package name for it. So an agent can reach Xverse over MCP, but not yet by copying a connection string out of the docs.

## When to use it

- Giving an agent a self-custodial wallet that pays 402-gated APIs on its own.
- Deployments that want keys on-device (encrypted) rather than delegated to a remote wallet.
- Settlement over Spark with Lightning interoperability.

## Dependencies

The audited `xverse-core` library and a [Spark](/tools/spark) backend for settlement, plus a funding source; keys stay encrypted on-device (AES-256-GCM) and the agent answers HTTP 402s by paying Lightning invoices itself. Inherits Spark's mainnet-beta operator-trust assumptions.

## Quick start

Xverse puts one command on its agent page and in its docs:

```bash
npx @secretkeylabs/xverse-agent-wallet --install
```

Then read the agent-wallet docs at `docs.xverse.app/xverse-agentic-wallet/`; the audited core library is `xverse-core` at `github.com/secretkeylabs/xverse-core`. The agent funds a wallet and then transacts against 402-gated endpoints via the Machine Payments Protocol.

## Gotchas

- Self-custodial, but the agent **spends autonomously without per-payment approval** — a key/host compromise means autonomous fund drain (mitigated, not eliminated, by on-device encryption). Cap balances and scope what the agent can pay.
- Settlement runs over **Spark**, itself a mainnet-beta L2 — it inherits Spark's early-stage operator-trust assumptions. See [Spark](/tools/spark).
- The agent-wallet surface is newer and less battle-tested than the established Xverse consumer wallet.
- **The fiat on-ramps re-introduce KYC at the funding leg.** MoonPay, Revolut and Banxa each verify a human. A wallet an agent can operate without an account is still being funded through a route that wants identity — so "no account" describes the wallet, not the money's path into it.
- **Multi-chain means multi-issuer.** Holding Runes, Starknet assets or cross-chain stablecoins in the same wallet widens what a third party can freeze or devalue. The BTC and Lightning legs are the ones that carry no issuer.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

**Screening judgement, recorded because the card previously carried none.** This is a **multi-chain** wallet with **fiat on-ramps**, and both are properties this project's vocabulary treats as significant — "no fiat" is load-bearing on the Exchange side, and a multi-asset holding widens the freeze surface. The card stays, and the coverage is stated as fact. ⚠ **The body used to add "the rest is coverage this site records rather than recommends" — that was removed 2026-08-07 (an owner decision).** It is the banned leak from the 2026-06-05 neutrality rule with synonyms substituted, and this note only ever authorised the first half of the device (state coverage, name the paths), never the not-recommended tail. **Nothing was lost:** the two sentences that follow already carry the same guidance as facts — a multi-asset holding widens the freeze surface, and a fiat on-ramp is a KYC surface. **The rule for the next card:** an Editor's Note can record an exception only if it engages the rule it is excepting; this one never cited it. **The reason it stays** is that the on-thesis path is genuinely first-class here rather than incidental — self-custodial keys, encrypted on-device, answering HTTP 402 with a Lightning invoice and no human in the checkout loop, which is the exact behaviour this site argues for. **The reason the omission mattered** is that a reader of the old card would have concluded this was a Bitcoin-only, account-free product. It is neither, and both facts change what you are adopting.

**MCP — deliberately NOT registered in the machine catalog.** The vendor's own sentence credits *"The Xverse API"* with shipping the MCP server, not the Agent Wallet, and no endpoint URL, package name or install command for it is published anywhere in the docs — the only MCP strings in the docs site are its documentation platform's own chrome, which is a trap worth naming. `_tool_mcp_endpoints` entries carry a concrete transport and a runnable command; there is nothing here to put in one. **Register it the day Xverse documents an endpoint or a package, and not before** — a registry entry that cannot be connected to is worse than an absent one, because `list_mcp_servers` is answering an agent that intends to act.

**Watch:** whether the Xverse API's MCP server gets its own docs page, and whether the agent wallet's fiat leg ever becomes account-free (it will not, but the *claim* may drift).
