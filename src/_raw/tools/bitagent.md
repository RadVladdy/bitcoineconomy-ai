---
name: BitAgent
slug: bitagent
layer: wallets
tagline: An early, open-source framework for agent-to-agent commerce — agents discover each other over Nostr, verify identity with DIDs, and settle work in sats over Lightning.
tool-type: software
maintainer: Open-source (single maintainer)
repo: https://github.com/intrinsicinvestment91/bitagent
license: MIT
stack-section: "§5"
status: experimental
last-verified: 2026-06-02
order: 34
tags:
  - bitagent
  - agent-to-agent
  - nostr
  - did
  - lightning
  - experimental
---

## What it is

BitAgent is an early-stage, open-source framework for autonomous agent-to-agent commerce: agents send and receive Bitcoin over Lightning, discover each other via Nostr, verify identity with DIDs, and coordinate multi-step workflows settled in sats. Money is a first-class primitive — agents charge each other for services (translation, transcription, web fetch, price oracle). It's the purest small-scale expression of the thesis: agents paying agents, no human and no bank in the loop.

It is tiny and experimental, but conceptually it points exactly where the agent economy is heading.

## When to use it

- Prototyping agent-to-agent payment + discovery patterns end-to-end.
- Studying a concrete, readable implementation of Nostr discovery + DID identity + Lightning settlement.
- Experiments only — not production workloads.

## Quick start

Clone `github.com/intrinsicinvestment91/bitagent` (MIT, Python + JS; FastAPI, MCP-server support, LNbits wallet integration) and follow the README. Point it at a Lightning wallet (LNbits) — self-host the wallet for anything beyond throwaway amounts.

## Gotchas

- **Very early-stage:** single maintainer, no tagged releases, no security audit. Treat as experimental; small amounts only.
- The default setup uses a **custodial LNbits instance** — self-host it to avoid third-party custody. See [LNbits](/tools/lnbits).
- The DID + Nostr identity layer is nascent and unreviewed. (Note: "BitAgent" is a name shared by several unrelated projects — this is the Bitcoin/Lightning agent-payment framework at the repo above.)
