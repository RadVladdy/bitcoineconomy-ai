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
status: v0-2026-06-06-pending-review
last-verified: 2026-06-06
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
  - nip-89
  - nip-90
  - dvm
  - service-discovery
  - agent-integration
---

## What it is

Nostr ("Notes and Other Stuff Transmitted by Relays") is a deliberately simple open protocol: cryptographically **signed events** published to independent servers called **relays**. Identity is a **keypair**, not an account — your public key (`npub`) *is* who you are, portable across every relay and app, with no sign-up, no platform, and no one who can revoke it. There is no central server; you read and write by connecting to whichever relays you choose.

For the Bitcoin agent stack, Nostr is the **identity-and-discovery layer** — the connective tissue under several pieces an agent already uses:

- **Identity.** An agent holds an `npub` as a self-sovereign, portable identity it carries between services. (OpenAgents' sovereign-agent identity is built this way.)
- **Discovery.** Service providers *announce* themselves — their capabilities and prices — as public events on relays, so an agent finds them by subscribing rather than by querying a central registry. The open conventions for this are **NIP-90 (Data Vending Machines)** and **NIP-89 (handler announcements)** — see *How services are published and discovered* below.
- **Wallet control.** [Nostr Wallet Connect](/tools/alby-nwc) (NWC / **NIP-47**) lets an agent control a Lightning wallet remotely over Nostr without ever holding the keys.
- **Payment signalling.** **Zaps** (**NIP-57**) attach Lightning payments to Nostr events — the rail by which value moves between Nostr identities.

Nostr carries no money itself. It is identity, messaging, and discovery; the value rides **Lightning** and **Cashu** alongside it.

## How services are published and discovered

Beyond identity and wallet control, Nostr carries the open conventions an agent uses to *find and sell services* — with no central app store or registry to gate it:

- **Data Vending Machines (NIP-90)** — the deployed service-marketplace pattern, and the one that fits agents best. A customer publishes a **job-request** event (transcription, summarization, image generation, inference, a custom feed) naming the desired output and what it will pay; providers watching the relays **compete to fulfill it**, return a **result** event, and get paid in sats. Kinds are reserved **5000–5999 for requests** and **6000–6999 for results** (a result's kind is its request's + 1000), with **7000 for job feedback / payment-required**. Jobs can be **chained** — one job's output becomes the next's input. DVMs make the most sense precisely when the *buyer is an autonomous agent*: it needs a service at machine tempo, pays a few sats, and never opens an account.
- **Handler announcements (NIP-89)** — how a provider advertises *what it does* so clients can discover it. A service publishes a **kind:31990** handler event ("I handle these event kinds, here's my endpoint"); users can publish **kind:31989** recommendations; an agent finds providers by querying these on its relays. DVM providers use NIP-89 to advertise which job kinds they support.

On top of these open conventions, individual projects layer their own announcement schemas — [Routstr](/services/routstr)'s **RIP-02** provider announcements are one — but the agent-facing shape is identical: providers publish, agents subscribe, relays carry it, no gatekeeper.

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

The NIPs (Nostr Implementation Possibilities) at `github.com/nostr-protocol/nips` are the canonical specs. For agents the load-bearing ones are **NIP-47** (NWC, wallet control) and **NIP-57** (zaps) for *payment*, and **NIP-90** (Data Vending Machines) and **NIP-89** (handler announcements) for *service discovery*.

## Gotchas

- **Identity-and-transport, not money.** Nostr moves signed events, not value. Pair it with Lightning ([L402](/tools/l402)) or [Cashu](/tools/cashu) for actual payment; zaps are the Lightning-over-Nostr bridge.
- **Relays are independent and optional.** No relay is guaranteed to carry any given event; an agent should publish to and read from several, and treat relay availability as best-effort. A provider announcement is only as discoverable as the relays it landed on.
- **Key management is the whole ballgame.** Loss or theft of the `nsec` is loss or theft of the identity. Use remote-signer / NWC patterns so the agent holds a revocable connection, not the raw key.
- **Event-kind fragmentation.** Meanings of custom event kinds are set by convention (NIPs and project-specific specs like Routstr's RIPs), not by a central registry — two ecosystems can use overlapping kinds differently. Index against the spec you actually target.
