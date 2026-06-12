---
name: CLINK (+ Lightning.Pub)
slug: clink
layer: integration
tagline: ShockNet's open standards for Lightning payments over Nostr — static offers, direct debits, and delegated spending permissions, addressed to NIP-05 identities, no web server required.
tool-type: protocol
maintainer: ShockNet
repo: https://github.com/shocknet
docs: https://docs.shock.network
site: https://shock.network
stack-section: "§4"
status: experimental
last-verified: 2026-06-11
order: 16
tags:
  - clink
  - lightning-pub
  - shocknet
  - nostr
  - payment-relationships
  - experimental
---

## What it is

CLINK (**Common Lightning Interface for Nostr Keys**) is a released, open specification for Lightning payments **over Nostr**: static payment offers, invoice requests/direct debits, and **delegated, policy-bound spending permissions** (standing authorizations within a budget) — between Nostr keys, with **no web server and no pre-shared secrets**, and **NIP-05 addresses as payment identifiers**. Its sibling, **Lightning.Pub**, is the node side: a Nostr-native node-management layer that connects wallets, apps, and multiple users to one Lightning node with role-based, granular permissions ("permission travels with the payment, enforced in-band"). The SDK ships as `@shocknet/clink-sdk` (npm); the spec lives at clinkme.dev; self-host docs at docs.shock.network.

Where L402 and Cashu-as-API-key serve **bearer, one-shot, anonymous** payment shapes, CLINK targets the **identified, ongoing, budgeted relationship** — closer to an account than to cash. Both settle in sats; they are complements by commerce shape, not rivals.

## When to use it

- A persistent agent↔service relationship with a standing authorization: recurring pulls, auto-top-up within a budget, balance reporting — the things bearer tokens don't model.
- Payment identity tied to a NIP-05 name the counterparty can verify (pairs naturally with an agent's NIP-05 + Lightning-address identity).
- Multi-user or multi-agent access to one Lightning node with per-role spending policies (Lightning.Pub's role model).

## Dependencies

A Lightning node managed by Lightning.Pub (self-hosted; docs at docs.shock.network/pub/intro), Nostr keys for each party, and the `@shocknet/clink-sdk` for the application side. Sanctum (remote-signing / role delegation bridge) is in beta.

## Quick start

Self-host Lightning.Pub against a node, install `@shocknet/clink-sdk`, and wire an offer or a debit authorization between two Nostr keys — the spec at clinkme.dev defines the event flows; clinkme.dev also hosts the live demo.

## Gotchas

- **Young stack:** the spec is released and the SDK is published, but the production deployment footprint is small and unverified — treat as early-adopter territory; Sanctum is explicitly beta.
- The persistent-identity model is a **trade-off, not an upgrade**: standing relationships sacrifice the bearer-anonymity that L402/Cashu flows preserve. Pick by commerce shape — cash for one-shot, accounts for ongoing.
- Requires both sides to speak CLINK — adoption is the network effect to watch.
