---
name: BOLT12 (Offers)
slug: bolt12
layer: integration
tagline: Reusable Lightning payment requests — publish one "offer" and accept repeated payments against it, with receiver privacy via blinded paths.
tool-type: protocol
maintainer: Lightning protocol community
repo: https://github.com/lightning/bolts
docs: https://bolt12.org
site: https://bolt12.org
stack-section: "§4"
status: published
last-verified: 2026-06-02
order: 12
tags:
  - bolt12
  - offers
  - lightning
  - onion-messages
  - blinded-paths
  - agent-payments
---

## What it is

BOLT12 ("Offers") is the agent-friendly evolution of the Lightning invoice. Where a BOLT11 invoice is single-use and must be generated per payment, a BOLT12 **offer** is reusable: a payee publishes one offer, and any payer can fetch a fresh invoice from it on demand — even if the payee wasn't online when the offer was shared. It's routed over onion messages and supports blinded paths for receiver privacy, plus reusable payment IDs and recurring payments. For an agent selling a service, that means a stable, publishable payment endpoint instead of a per-call invoice dance.

It is the first new BOLT merged into the Lightning spec since 2017.

## When to use it

- An agent offering a paid service that needs a stable, reusable payment endpoint.
- Subscription-like or pay-as-you-go patterns without generating per-payment invoices.
- Receiver-privacy-sensitive payments (blinded paths hide the payee's node).

## Quick start

Use a BOLT12-capable implementation — **Core Lightning**, **LDK**, or **Eclair/Phoenix** support offers natively. Generate an offer, publish it, and accept payments against it. The spec lives at `github.com/lightning/bolts` (BOLT 12); `bolt12.org` has a developer overview and a rendered spec.

## Gotchas

- **LND does not natively support BOLT12** — you must run LNDK alongside it. Confirm your stack supports offers before relying on them.
- Depends on onion-message relaying across the route; relay support is not yet universal across the network.
- Newer than BOLT11 — some wallets and services remain BOLT11-only, so keep a BOLT11 fallback for now.
