---
name: CLINK (+ Lightning.Pub)
slug: clink
layer: integration
toolbox-group: node-toolkits
tagline: ShockNet's open standards for Lightning payments over Nostr — static offers, direct debits, and delegated spending permissions, addressed to NIP-05 identities, no web server required.
tool-type: protocol
maintainer: ShockNet
repo: https://github.com/shocknet
docs: https://docs.shock.network
site: https://shock.network
stack-section: "§4"
status: experimental
last-verified: "2026-08-07 (licences read per-repo: Lightning.Pub AGPL-3.0, ClinkSDK MIT, CLINK spec repo unlicensed - the vendor blanket AGPL claim holds on one of three)"
order: 16
prereq-tier: lightning-node
prereqs:
  - "a Lightning node managed by Lightning.Pub (self-hosted)"
  - "a Bitcoin node under it (Bitcoin Core, or Neutrino)"
  - "Nostr keys per party plus the @shocknet/clink-sdk"
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

A Lightning node managed by Lightning.Pub (self-hosted; docs at docs.shock.network/pub/intro) — backed by a [Bitcoin node](/tools/bitcoin-core), or Neutrino — Nostr keys for each party, and the `@shocknet/clink-sdk` for the application side. Sanctum (remote-signing / role delegation bridge) is in beta.

## Quick start

Self-host Lightning.Pub against a node, install `@shocknet/clink-sdk`, and wire an offer or a debit authorization between two Nostr keys — the spec at clinkme.dev defines the event flows; clinkme.dev also hosts the live demo.

## Gotchas

- **Young stack:** the spec is released and the SDK is published, but the production deployment footprint is small and unverified — treat as early-adopter territory; Sanctum is explicitly beta.
- The persistent-identity model is a **trade-off, not an upgrade**: standing relationships sacrifice the bearer-anonymity that L402/Cashu flows preserve. Pick by commerce shape — cash for one-shot, accounts for ongoing.
- Requires both sides to speak CLINK — adoption is the network effect to watch.
- **The licence is three different answers, not one — check which piece you are adopting.** shock.network says the SHOCK Suite is AGPL-3.0, and that is true of the **node software**: `shocknet/Lightning.Pub` is **AGPL-3.0**, a network-copyleft licence, which is a real decision if you plan to run it as a service inside a closed product. But the piece most integrators actually link against, **`shocknet/ClinkSDK` (`@shocknet/clink-sdk` on npm), is MIT** — no copyleft obligation at all. And the **spec repo `shocknet/CLINK` carries no LICENSE file**, so the specification text is under default copyright rather than any open licence. *(All three read from the repos and the npm registry 2026-08-07.)*

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

**A `license:` field was considered and deliberately not added.** Sibling tools cards carry one; this card covers three artifacts under three different licences (Lightning.Pub AGPL-3.0 · ClinkSDK MIT · the CLINK spec repo unlicensed), and a single frontmatter value would have to pick one and mislead about the other two. The split is stated in the Gotchas instead, where a builder deciding what to adopt will actually read it.

**The finding worth keeping:** the working assumption going in was that shock.network's blanket "AGPL-3.0" claim would be confirmable from the repos, and the card would just be filled in. **It was confirmed on one repo out of three.** A vendor's licence statement is marketing copy about a product family; the LICENSE file is the licence. Read the file. *(Same shape as this project's rule about third-party docs: a page that resolves 200 is not a page that says what you remember it saying.)*

**Note also that AGPL-3.0 is the only network-copyleft licence anywhere in this tools set** — every other card is MIT, Apache-2.0 or LGPL. Worth a line if the Stack ever gains a licensing paragraph; not worth one on its own.
