---
name: Fedimint
slug: fedimint
layer: ecash
tagline: Federated Bitcoin custody plus Chaumian ecash — a guardian federation holds the coins under threshold security while issuing private, Lightning-interoperable tokens.
tool-type: software
maintainer: Fedimint
repo: https://github.com/fedimint/fedimint
docs: https://fedimint.org/docs
site: https://fedimint.org
x: "@fedimint"
nostr: nprofile1qqsgwgkrss7gthwkzc49edgxu895664setaevcp57snw2k3wlzdrghswflshg
stack-section: "§3"
status: published
last-verified: 2026-06-02
order: 21
tags:
  - fedimint
  - ecash
  - federation
  - threshold-custody
  - lightning
  - l3
---

## What it is

Fedimint is an open-source, module-based protocol for running **federated Chaumian ecash mints**. Instead of one operator custodying the backing Bitcoin (as in single-mint Cashu), a federation of guardians — typically 4–13 — jointly custodies it under threshold signatures: no single guardian can defect or be compromised in isolation. The federation issues private Chaumian ecash and interoperates with the wider Lightning Network through gateway nodes. It ships with Bitcoin, Lightning, and ecash modules.

It is the heavier-trust, higher-robustness option at the L3 bearer-ecash layer: more coordination overhead than Cashu, but no single point of custodial failure.

## When to use it

- Community or institutional custody where distributing trust across multiple operators matters.
- Bearer-ecash deployments that want better defection-resistance than a single mint.
- Settings where you can stand up and operate a federation of guardians, not just a lone mint.

## Quick start

Clone `github.com/fedimint/fedimint` and follow the developer docs at `fedimint.org/docs` to run a federation or build against the modules; the Fedi operator docs cover running guardians in production. Check the repo's releases page for the current version and per-module maturity before deploying.

## Gotchas

- Trust is **reduced, not eliminated**: a majority-malicious or colluding guardian set can still compromise funds. The model assumes an honest threshold.
- Running a federation means coordinating multiple guardian operators; Lightning gateways that bridge ecash ↔ Lightning need their own liquidity.
- Some features have shipped beta- or Signet-only in recent releases — confirm maturity per module before relying on it.
