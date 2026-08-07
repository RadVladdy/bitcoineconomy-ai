---
name: Boltz
slug: boltz
layer: bridges
toolbox-group: bridges
tagline: Non-custodial atomic swaps across on-chain Bitcoin, Lightning, Liquid and Ark — the submarine-swap bridge. ⚠ Swap services suspended indefinitely since 2026-08-03.
tool-type: software
maintainer: Boltz Exchange
repo: https://github.com/BoltzExchange/boltz-backend
docs: https://docs.boltz.exchange
site: https://boltz.exchange
nostr: npub1psm37hke2pmxzdzraqe3cjmqs28dv77da74pdx8mtn5a0vegtlas9q8970
latest-release: v3.13.0 "Dark Horse"
release-date: "2026-05-08"
stack-section: "Marketplace"
status: published
last-verified: 2026-08-07 (live pair census + suspension notice read from the vendor bundle; SDK-only policy read)
order: 51
prereq-tier: wallet
prereqs:
  - "non-custodial wallets on the rails you are swapping (on-chain Bitcoin, Lightning, Liquid and/or Ark)"
  - "an official Boltz SDK (their docs forbid hand-rolling the REST API); correct refund/timeout handling"
  - "no account, no KYC"
tags:
  - boltz
  - submarine-swap
  - atomic-swap
  - lightning
  - liquid
  - non-custodial
---

## What it is

> [!warning] ⛔ **Swap services are DISABLED indefinitely, since 3 August 2026.**
> Boltz's own site states it: *"Swap Services Disabled… Boltz will stay disabled until further notice… Do not expect swap services to resume shortly."* The API remains up **only to process refunds** — *"unilateral refunds will work, as they do not depend on our infrastructure"*. **Do not route an agent here to swap.** The protocol and the self-hostable `boltz-backend` are unaffected, which is what the rest of this card is about; what stopped is the operator running the public service. See the [exchange card](/exchanges/boltz) for the venue view.

Boltz is a non-custodial bridge that performs atomic (submarine) swaps across on-chain Bitcoin, Lightning, Liquid and **Ark**, exposed via a RESTful API. Because the swaps are atomic, neither side can take the funds and run — it's the trust-minimized way to move value across those rails without a custodian. For agent treasuries, Boltz is a building block for rebalancing and converting between layers at the boundary.

A **bridge** tool — it crosses between rails. This card is the *infrastructure* view of Boltz; its *venue* role (Lightning↔stablecoin conversion) has a separate [exchange card](/exchanges/boltz). See [The Marketplace](/marketplace) for where conversion mechanics fit relative to the pure substrate.

## When to use it

- Moving value between on-chain BTC, Lightning, Liquid and Ark without a custodian. *(Not available on the hosted service while swaps are suspended.)*
- Acquiring inbound Lightning liquidity or sweeping to on-chain via atomic swaps.
- Programmatic conversion at the edge of an agent treasury.

## Dependencies

Non-custodial wallets on the rails you're swapping between (on-chain Bitcoin, Lightning, and/or Liquid) and a client-side integration of the API; swaps pay network fees plus a provider-set swap fee and need correct refund/timeout handling. No account, no KYC.

## Quick start

**Do not integrate against the hosted service — swaps are suspended (see above).** When it is running, Boltz's own agent-facing docs are explicit that you must **use an official SDK** and must **not** implement the REST API directly: *"Hand-rolling the swap protocol is error-prone and can cause loss of user funds… The REST API reference is for SDK/library authors only."* Start from the SDK list at `api.docs.boltz.exchange/libraries.md`. The service is powered by `boltz-backend` (`github.com/BoltzExchange/boltz-backend`), which you can **self-host** — that path is unaffected by the suspension and is the one to reach for today.

## Gotchas

- Non-custodial **only if integrated correctly** — Boltz explicitly warns integrators to keep API clients client-side and never run swaps or store refund data on users' behalf, or the non-custodial guarantee breaks.
- Submarine swaps require correct **refund/timeout handling**; abandoned or failed swaps need user-controlled refund flows.
- Swap liquidity and limits are provider-set.
