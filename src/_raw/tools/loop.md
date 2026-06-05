---
name: Loop
slug: loop
layer: bridges
tagline: Lightning Labs' non-custodial liquidity bridge — Loop Out and Loop In move balance between Lightning and on-chain via submarine swaps.
tool-type: software
maintainer: Lightning Labs
repo: https://github.com/lightninglabs/loop
docs: https://lightning.engineering/loop/
site: https://lightning.engineering/loop/
x: "@lightning"
latest-release: v0.33.1-beta
release-date: "2026-05-26"
stack-section: "Border Zone"
status: published
last-verified: 2026-06-02
order: 52
tags:
  - loop
  - lightning-labs
  - submarine-swap
  - liquidity
  - loop-out
  - loop-in
---

## What it is

Loop is Lightning Labs' non-custodial liquidity tool for LND nodes. **Loop Out** moves Lightning balance to on-chain (the canonical way to sweep an operational balance back to L1 cold-storage reserves); **Loop In** does the reverse. Both use submarine swaps, so they're atomic and non-custodial. It's the standard mechanism behind the hot/cold treasury sweep the Stack describes — making it a practical bridge between the payment layer and the settlement layer.

A **Border Zone** tool: the swap mechanics that move value between layers live at the boundary. See [The Border Zone](/border-zone).

## When to use it

- Sweeping an agent's operational Lightning balance back to on-chain reserves (Loop Out).
- Acquiring inbound Lightning liquidity from on-chain funds (Loop In).
- Treasury liquidity management for an LND-based agent stack.

## Dependencies

An LND node with both Lightning and on-chain balance to move between, plus access to Lightning Labs' Loop server (non-custodial via atomic swaps, but not a permissionless market — you depend on its availability and pricing); on-chain fees apply to each swap.

## Quick start

Run Loop against an LND node — repo at `github.com/lightninglabs/loop`, product page at `lightning.engineering/loop/`. Recent releases can even open Lightning channels directly from static-address deposits (`loop openchannel`).

## Gotchas

- Still **beta** software (every release is `-beta`).
- Swaps execute against **Lightning Labs' Loop server** — non-custodial (atomic), but you depend on that server's availability and pricing; it's not a permissionless market.
- Primarily targets LND node operators; on-chain fees apply to each swap.
