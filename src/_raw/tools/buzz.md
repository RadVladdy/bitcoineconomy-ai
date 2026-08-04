---
name: Buzz
slug: buzz
layer: integration
toolbox-group: node-toolkits
tagline: Block's open-source, Nostr-native workspace where agents are members rather than features — each with its own keypair, portable across any Nostr-compatible system. No payment layer yet.
tool-type: software
maintainer: Block
repo: https://github.com/block/buzz
docs: https://buzz.xyz
site: https://buzz.xyz
license: Apache-2.0
stack-section: "§4"
status: published
last-verified: 2026-08-03
order: 39
prereq-tier: keys-only
prereqs:
  - "a Nostr keypair (bring an existing one or let Buzz generate it)"
  - "an agent harness you already run — Claude Code, Codex, goose, or your own"
  - "optionally your own relay, if you want to self-host the whole thing"
tags:
  - buzz
  - block
  - nostr
  - agent-identity
  - collaboration
  - open-source
---

## What it is

**Buzz** is a free, Apache-2.0 collaboration workspace from Block, released 2026-07-21 and built on **Nostr**. It looks like a familiar team chat tool — channels, threads, direct messages, voice, media, and early git repository hosting — with one structural difference: AI agents are participants rather than integrations. Each agent holds **its own cryptographic keypair**, with its own permissions, and posts, reviews code, and runs approved automations alongside the humans in the same channels.

Block's stated reason for choosing Nostr is identity. A keypair belongs to whoever holds it, not to the platform: *"The agents you build and configure in Buzz aren't locked in. They can participate across any Nostr-compatible system, and their identity, their history, their reputation, travels with them."* It is model-agnostic and harness-agnostic — Claude Code, Codex, goose, or your own — and a team can self-host the whole stack, relay included, so nothing routes through a third party unless they choose it.

## When to use it

- **Giving an agent a durable, portable identity** rather than a vendor-issued API key — the same npub works across every Nostr-native tool it touches.
- **Multi-agent and human-agent work in one place**, where the shared history *is* the context, instead of one operator relaying between siloed sessions.
- **Self-hosting** an agent workspace end to end, relay and all, when the data cannot leave your infrastructure.
- **Watching where agent-native collaboration goes** — this is the largest bet yet that the substrate for it should be an open protocol rather than a platform.

## Dependencies

A Nostr keypair and an agent harness you already run. Two deployment shapes: Block-hosted at `buzz.xyz`, or self-hosted from `github.com/block/buzz` on your own infrastructure with your own relay. Self-hosting is what makes the sovereignty claim real; the hosted option puts Block's infrastructure underneath the same protocol guarantees.

## Quick start

Download from `buzz.xyz`, or clone `github.com/block/buzz` to run your own instance. On first run it detects the coding harnesses already installed on the machine and connects them, so agents run on subscriptions you already pay for. Create a channel, add an agent, and talk to it. Bring an existing nsec to carry your Nostr history in with you.

## Gotchas

- **There is no payment layer.** Buzz does not move bitcoin, does not settle between agents, and Block's launch announcement does not mention payments at all. It is on this site for **identity and open-protocol architecture**, not because an agent can pay through it. Commentators — including on TFTC 2026-08-01 — read Lightning payments as a likely direction, and that is **speculation about a roadmap, not a shipped feature.** Treat it as such until Block ships something.
- **Early software, and it says so.** Workflows and automations sit under an experiments flag, the git integration is described by Block itself as "still early," and working through a relay is slower than driving a harness directly in a terminal. For a large existing codebase, use your harness straight.
- **Hosted is a third party.** `buzz.xyz` gives you Block-managed infrastructure. The protocol guarantees hold either way, but "nothing routes through a third party" is only true of the self-hosted shape.
- **Portable identity cuts both ways.** A keypair that travels everywhere is also a correlation handle that travels everywhere. An agent that publishes under one npub across every workspace it joins has built a public, permanent record of who it works for.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

The most consequential Nostr-native launch of the year, and the site had zero mentions of it until now — a genuine coverage failure caught 2026-08-03 while working the TFTC × Vinny episode. Carded from primary sources: Block's own announcement (block.xyz, 2026-07-21), the repo, and Wasp's build write-up.

Held in two hands deliberately, same discipline as the l402.space entry. The *architecture* is a direct vindication of the site's Nostr-identity thesis — agents as keyholders, portability over platform accounts — and it arrives from Block, which is about as far from a fringe endorsement as this argument has had. But it is **not agent-payable**, so it stays a Tools card and **must not enter the marketplace directory** (the API inclusion bar is about paying, not about being interesting). The "Lightning payments are coming" read is Marty Bent's and Vinny's inference on a podcast, not a Block commitment; the card says so in as many words, because the empirical-honesty flag here is easy to trip and this is exactly the kind of claim the project gets held to.

Worth watching for the moment it does gain a payment rail — that is a Field Note and possibly a directory entry the same week.

**Publications backlinks**

- [[Stack]] (this project) — §4 agent integration; Nostr-addressed identity
- [[nostr]] (this project) — the protocol primitive underneath
- [[Field-Notes-Log]] (this project) — the 2026-08-03 entry that carries the fuller read
