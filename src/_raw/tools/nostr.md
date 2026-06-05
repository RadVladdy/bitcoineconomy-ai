---
name: Nostr
slug: nostr
layer: integration
tagline: The open identity-and-discovery layer under the agent stack — cryptographic keypairs for portable identity, and relays for censorship-resistant service discovery. It's how an agent finds providers and controls a wallet; the money itself rides Lightning/Cashu.
tool-type: protocol
maintainer: Nostr open protocol & community (NIPs)
repo: https://github.com/nostr-protocol/nips
docs: https://nostr.com/
site: https://nostr.com/
stack-section: "§4"
status: v0-2026-06-04-pending-review
last-verified: 2026-06-04
order: 15
tags:
  - nostr
  - identity
  - discovery
  - relays
  - nip-47
  - nwc
  - nip-57
  - zaps
  - agent-integration
---

## What it is

Nostr ("Notes and Other Stuff Transmitted by Relays") is a deliberately simple open protocol: cryptographically **signed events** published to independent servers called **relays**. Identity is a **keypair**, not an account — your public key (`npub`) *is* who you are, portable across every relay and app, with no sign-up, no platform, and no one who can revoke it. There is no central server; you read and write by connecting to whichever relays you choose.

For the Bitcoin agent stack, Nostr is the **identity-and-discovery layer** — the connective tissue under several pieces an agent already uses:

- **Identity.** An agent holds an `npub` as a self-sovereign, portable identity it carries between services. (OpenAgents' sovereign-agent identity is built this way.)
- **Discovery.** Service providers *announce* themselves — their models, capabilities, and prices — as public events on relays, so an agent finds them by subscribing rather than by querying a central registry. [Routstr](/services/routstr) does exactly this: providers publish announcement events (its RIP-02 spec) that any client — or any directory — can read.
- **Wallet control.** [Nostr Wallet Connect](/tools/alby-nwc) (NWC / **NIP-47**) lets an agent control a Lightning wallet remotely over Nostr without ever holding the keys.
- **Payment signalling.** **Zaps** (**NIP-57**) attach Lightning payments to Nostr events — the rail by which value moves between Nostr identities.

Nostr carries no money itself. It is identity, messaging, and discovery; the value rides **Lightning** and **Cashu** alongside it.

## When to use it

- Giving an agent a **portable, self-sovereign identity** (`npub`) instead of a per-platform account.
- **Censorship-resistant service/provider discovery** — subscribe to relays for provider announcements, no central directory to gate or delist you.
- **Remote wallet control** without key exposure — via NWC (NIP-47); see [Alby & NWC](/tools/alby-nwc).
- **Sending or receiving value** tied to an identity or event — via zaps (NIP-57).

## Dependencies

A keypair (`npub`/`nsec`), a set of relays to publish to and read from, and a client library (`nostr-sdk`, `nostr-tools`, or `NDK`); for wallet control, an NWC connection rather than a raw key. No platform account and no single server.

## Quick start

1. **Get a keypair** (`npub`/`nsec`) from any Nostr client or library, and guard the `nsec` like a private key — it *is* the identity.
2. **Choose relays.** Connect to several independent relays; availability and content vary by relay, so redundancy is the norm.
3. **For wallet control,** use NWC — connect the agent to a wallet via a revocable, budget-scoped connection string ([Alby & NWC](/tools/alby-nwc)).
4. **For discovery,** subscribe to the relevant event kinds on your relays (e.g. Routstr provider-announcement events) and filter for the providers/models you want.

**Libraries for wiring an agent in (not a human app):** the onboarding UX is mostly human-and-app today, but the *programmatic* primitives are solid — `nostr-sdk` ([Rust](https://docs.rs/nostr-sdk/) / [Python](https://pypi.org/project/nostr-sdk/), with a built-in **NWC client**), [`nostr-tools`](https://github.com/nbd-wtf/nostr-tools) (JS/TS, headless option), and [`NDK`](https://github.com/nostr-dev-kit/ndk) (TS, multi-relay coordination). An agent integrates Nostr through one of these rather than through a wallet app.

The NIPs (Nostr Implementation Possibilities) at `github.com/nostr-protocol/nips` are the canonical specs; NIP-47 (NWC) and NIP-57 (zaps) are the two most load-bearing for agent payments.

## Gotchas

- **Identity-and-transport, not money.** Nostr moves signed events, not value. Pair it with Lightning ([L402](/tools/l402)) or [Cashu](/tools/cashu) for actual payment; zaps are the Lightning-over-Nostr bridge.
- **Relays are independent and optional.** No relay is guaranteed to carry any given event; an agent should publish to and read from several, and treat relay availability as best-effort. A provider announcement is only as discoverable as the relays it landed on.
- **Key management is the whole ballgame.** Loss or theft of the `nsec` is loss or theft of the identity. Use remote-signer / NWC patterns so the agent holds a revocable connection, not the raw key.
- **Event-kind fragmentation.** Meanings of custom event kinds are set by convention (NIPs and project-specific specs like Routstr's RIPs), not by a central registry — two ecosystems can use overlapping kinds differently. Index against the spec you actually target.
