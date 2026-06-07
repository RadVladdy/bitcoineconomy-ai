---
name: LNVPS
slug: lnvps
layer: services
collection: services
tagline: A Lightning-native VPS host with Nostr login and no KYC — pay in sats, fund via NWC, spin up a server by API. The most agent-native compute on the consume side.
tool-type: service
category: compute-hosting
featured: true
two-sided: consume
maintainer: LNVPS (Apex Strata Ltd, Ireland)
site: https://lnvps.net
docs: https://github.com/LNVPS/api
payment: Lightning (sats), fundable via NWC; no card
identity: Nostr (NIP-07 login) — no email, no KYC
custody: n/a (pay-and-receive)
kyc: none
bitcoin-native: true
status: v0-2026-06-06-structural-verified
last-verified: 2026-06-06
order: 52
tags:
  - lnvps
  - vps
  - compute
  - hosting
  - lightning
  - nostr
  - nwc
  - no-kyc
---

## What it is

LNVPS is a **Lightning-powered VPS host** built for exactly the agent use case: **log in with Nostr** (NIP-07), **pay in satoshis** with no card, and fund the instance from a Lightning wallet via **Nostr Wallet Connect (NWC)** — "no captchas, no KYC, no 'prove you're human.'" Customize CPU/RAM/SSD independently; it runs an **API backend** (`github.com/LNVPS/api`, with fields for SSH key material and NWC connection strings) and explicitly markets **production-ready OpenClaw bot** instances. It is the cleanest example of a service an agent can stand up *and pay for* with no human and no identity trail.

## When to use it

- An agent needs to **provision its own compute** — a server to run a task, a child agent, or a node — and pay for it from its own Lightning balance, with Nostr as its only identity.
- The lowest-identity, most agent-native hosting fit: Nostr login + NWC funding + an API, end to end.
- A working model of the "agent buys its own infrastructure" pattern (see Gotchas / Field Notes for the deployed proof-point).

## Dependencies & payment

**Dependencies:** a Nostr key (the identity), a Lightning wallet — ideally NWC-connected so the agent can pay without holding raw keys — and the LNVPS API for programmatic provisioning. **Payment:** native **Lightning** (sats), fundable via **NWC**; no credit card, no email, no KYC. Demo instances start at cents/day; production instances at a few euros/month.

## Quick start

Log in with a Nostr key at `lnvps.net`, choose CPU/RAM/SSD, pay the Lightning invoice (or connect a wallet over NWC), and the instance spins up. For automation, drive the same flow through the API (`github.com/LNVPS/api`).

## Gotchas

- **Smaller, independent provider** (Apex Strata Ltd, Ireland) and newer than the mainstream clouds — verify current capacity, regions, and API specifics before depending on it for production.
- **Your Nostr key is the account** — lose it and you lose access; manage it like any other agent key (remote-signer / NWC patterns help).
- Lightning-only billing means an unfunded wallet = a stopped server; budget the agent's float for renewal.
