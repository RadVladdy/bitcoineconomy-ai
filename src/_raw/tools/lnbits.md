---
name: LNbits
slug: lnbits
layer: wallets
toolbox-group: node-toolkits
tagline: The most widely deployed programmable Lightning platform — isolated wallets, a clean REST API, and an extension ecosystem on top of any node backend.
tool-type: software
maintainer: LNbits
repo: https://github.com/lnbits/lnbits
docs: https://docs.lnbits.com
site: https://lnbits.com
x: "@lnbits"
latest-release: v1.5.6
release-date: "2026-07-15"
license: MIT
stack-section: "§5"
status: published
last-verified: 2026-07-19
order: 31
prereq-tier: lightning-node
prereqs:
  - "a Lightning funding source behind it (your LND or Core Lightning node, or a supported funding backend)"
  - "a Bitcoin node under that LN node (Bitcoin Core, or Neutrino)"
  - "a host to run the Python server (Docker or pip)"
tags:
  - lnbits
  - programmable-wallet
  - rest-api
  - extensions
  - lndhub
  - lightning
---

## What it is

LNbits is a lightweight Python server that sits on top of any Lightning funding source and provides isolated multi-wallet accounts, a clean REST API, and an extension system (paylinks, LNURL, boltcards, point-of-sale, Nostr tooling, faucets, and more). It decouples your application from any single node implementation: the agent works against LNbits's REST API instead of a node's native gRPC.

For agent infrastructure that needs programmable-wallet-as-a-service rather than direct node integration, LNbits is the canonical pattern — give each agent (or task) its own isolated wallet with its own keys and limits.

## When to use it

- You want per-agent or per-task isolated wallets with a simple HTTP API.
- You need invoice/payment endpoints plus ready-made extensions (paywalls, LNURL, PoS).
- You want to stay node-implementation-agnostic (LND, Core Lightning, others behind it).

## Dependencies

A Lightning funding source behind it (your LND or Core Lightning node — itself backed by a [Bitcoin node](/tools/bitcoin-core), or Neutrino — or a supported funding backend) and a host to run the Python server (Docker or pip). The agent talks to LNbits's REST API, not the node directly.

## Quick start

Self-host via Docker or pip, point it at a funding source (your Lightning node or a fundingsource backend), then create wallets and call the REST API documented at `docs.lnbits.com`. Each wallet exposes admin and invoice/read keys for scoped access.

## Gotchas

- LNbits **custodies funds via its funding-source node** — the instance operator is trusted. Run your own instance for anything you can't afford to lose.
- Keep it updated and guard the admin/superuser keys; LNbits has had past security advisories.
- Extensions are third-party contributed — vet them before enabling on a production instance.
