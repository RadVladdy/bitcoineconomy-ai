---
name: Agentic AQUA
slug: agentic-aqua
layer: wallets
tagline: Jan3's open-source MCP wallet — an AI assistant generates addresses, checks balances, and sends Bitcoin, Liquid, or Lightning (via Boltz swaps) from one seed, by natural language.
tool-type: software
maintainer: Jan3
repo: https://github.com/jan3dev/agentic-aqua
license: MIT
stack-section: "§5"
status: experimental
last-verified: 2026-06-11
order: 35
tags:
  - agentic-aqua
  - jan3
  - mcp
  - agent-wallet
  - liquid
  - boltz
  - experimental
---

## What it is

Agentic AQUA is Jan3's open-source **MCP server and CLI** that puts a Bitcoin wallet under an AI assistant's control: the agent (Claude or any MCP host) generates receive addresses, checks balances, and executes sends through typed tool calls or plain natural language. One seed backs a **unified Bitcoin + Liquid wallet** (BIP84 on-chain via BDK; L-BTC and Liquid assets), and **Lightning payments route through Boltz submarine swaps** (~0.1% fee) rather than native channels. Keys live in encrypted local storage — no remote servers hold them — and watch-only descriptor support lets an agent observe without spend power.

It sits in the same Stack niche as the Xverse Agent Wallet and the Alby NWC tooling: the wallet layer an agent drives itself.

## When to use it

- Giving an MCP-native assistant hands-on wallet capability — receive, balance, send — without building custom wallet plumbing.
- Experiments in agent-initiated payments where Liquid assets or on-chain Bitcoin matter alongside Lightning.
- Watch-only monitoring: an agent that reads balances and flags activity but cannot spend.

## Dependencies

A Python environment (installs from PyPI as `agentic-aqua`, runs via `uvx`), an MCP host (Claude Desktop config documented in the README), and — for Lightning — Boltz reachability, since Lightning is swap-based here. No node required; no remote key custody.

## Quick start

Install from PyPI (`agentic-aqua`), add the MCP server to the host's config (the README documents the Claude Desktop `claude_desktop_config.json` entry via `uvx`), create or import a wallet, and the assistant's wallet tools appear. The CLI offers the same operations for manual control.

## Gotchas

- **Alpha software** (PyPI development status: 3 — Alpha; v0.4.1, May 2026): expect breaking changes; small amounts only.
- **Never paste a seed into the chat** — the project's own warning: chat logs and transcripts persist. Import seeds via the CLI's hidden input instead.
- Lightning is **Boltz-swap-based**, not channel-native — each Lightning payment carries the ~0.1% swap fee and Boltz availability as a dependency.
- The Liquid side includes non-Bitcoin assets (e.g., USDt on Liquid); the Bitcoin and L-BTC paths are the on-thesis ones.
- An agent with spend power is an agent that can lose funds to a bad prompt — bound the wallet balance like you'd bound an API budget.
