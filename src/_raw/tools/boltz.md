---
name: Boltz
slug: boltz
layer: bridges
tagline: Non-custodial atomic swaps between on-chain Bitcoin, Lightning, and Liquid — the submarine-swap bridge, exposed as an API.
tool-type: software
maintainer: Boltz Exchange
repo: https://github.com/BoltzExchange/boltz-backend
docs: https://docs.boltz.exchange
site: https://boltz.exchange
nostr: npub1psm37hke2pmxzdzraqe3cjmqs28dv77da74pdx8mtn5a0vegtlas9q8970
latest-release: v3.13.0 "Dark Horse"
release-date: "2026-05-08"
stack-section: "Border Zone"
status: published
last-verified: 2026-06-02
order: 51
tags:
  - boltz
  - submarine-swap
  - atomic-swap
  - lightning
  - liquid
  - non-custodial
---

## What it is

Boltz is a non-custodial bridge that performs atomic (submarine) swaps between on-chain Bitcoin, Lightning, and Liquid, exposed via a RESTful API. Because the swaps are atomic, neither side can take the funds and run — it's the trust-minimized way to move value across those rails without a custodian. For agent treasuries, Boltz is a building block for rebalancing and converting between layers at the boundary.

A **Border Zone** tool: it crosses between rails. See [The Border Zone](/border-zone) for where conversion mechanics fit relative to the pure substrate.

## When to use it

- Moving value between on-chain BTC, Lightning, and Liquid without a custodian.
- Acquiring inbound Lightning liquidity or sweeping to on-chain via atomic swaps.
- Programmatic conversion at the edge of an agent treasury.

## Quick start

Integrate against the API at `api.docs.boltz.exchange`; the service is powered by `boltz-backend` (`github.com/BoltzExchange/boltz-backend`), which you can also self-host. Follow the docs' common-mistakes guide before going live.

## Gotchas

- Non-custodial **only if integrated correctly** — Boltz explicitly warns integrators to keep API clients client-side and never run swaps or store refund data on users' behalf, or the non-custodial guarantee breaks.
- Submarine swaps require correct **refund/timeout handling**; abandoned or failed swaps need user-controlled refund flows.
- Swap liquidity and limits are provider-set.
