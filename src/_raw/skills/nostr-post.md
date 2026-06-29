---
name: nostr-post
slug: nostr-post
tagline: Give an agent a portable, censorship-resistant voice and identity on Nostr — post notes, read its feed, and be reachable — using a dedicated key, never your main identity.
skill-group: identity
read-only: false
mcp-servers:
  - "@AbdelStark/nostr-mcp (post + zap)"
  - "AustinKelsay/nostr-mcp-server (create/sign/publish + read)"
env:
  - NOSTR_NSEC_KEY
  - NOSTR_RELAYS
prereq-tier: keys-only
prereqs:
  - "a DEDICATED Nostr keypair for the agent (never the operator's main nsec)"
  - "a set of relays to publish to and read from"
maintainer: Nostr open protocol & community (NIPs)
repo: https://github.com/AbdelStark/nostr-mcp
docs: https://nostr.com/
site: https://nostr.com/
status: published
last-verified: 2026-06-29
order: 4
tags:
  - mcp
  - nostr
  - identity
  - voice
  - nip-01
  - zaps
---

## What it does

Gives an agent a **voice and a portable identity** on the open Nostr network — the layer where an agent can announce itself, post results, read mentions, and be reached, without any platform able to deplatform it. Identity is a keypair the agent owns; reach is a set of relays it chooses. Nothing about it depends on a company's account system.

Two reference MCP servers cover the ground: AbdelStark's `nostr-mcp` (`post_note`, plus a WIP `send_zap`) and AustinKelsay's `nostr-mcp-server` (create / sign / publish notes, and read mentions/replies). Pick whichever matches whether you need to mostly **write** or also **read** the agent's feed.

## When to use it

- An agent should **publish** what it did (job results, status, a service announcement) to a censorship-resistant feed.
- An agent needs to **read** mentions/replies and act on them (a lightweight inbox).
- You want agent identity decoupled from any platform — the same npub works across every Nostr client.

## Install

> **Key hygiene — read first.** These reference servers take a **raw `nsec` private key** in the environment. Generate a **dedicated key for the agent** and never use your personal/main identity's nsec. Treat the agent's key as disposable and rotate it if exposed. A remote signer (NIP-46 "bunker") is the safer pattern and the direction to prefer as agent tooling matures; until a given server supports it, isolate the dedicated key tightly (scoped host, minimal scope, no reuse).

```json
{
  "mcpServers": {
    "nostr": {
      "command": "npx",
      "args": ["-y", "@AbdelStark/nostr-mcp"],
      "env": {
        "NOSTR_NSEC_KEY": "nsec1...DEDICATED-AGENT-KEY",
        "NOSTR_RELAYS": "wss://relay.damus.io,wss://nos.lol,wss://relay.nostr.band"
      }
    }
  }
}
```

- **MCP clients (Claude, Cursor, Hermes):** the block above (AbdelStark's server installs via Smithery or npx). For reading the feed too, add AustinKelsay's `nostr-mcp-server`.
- **OpenClaw / SKILL.md agents:** mirrors BitClawd's `nostr-post` skill (post / read / whoami / relays / profile) — same dedicated-key rule applies; theirs also takes `NOSTR_PRIVATE_KEY` directly.
- **Any agent:** Nostr is an open protocol — `nostr-tools`, `NDK`, or `nostr-sdk` give the same capability without an MCP wrapper. See [Nostr](/tools/nostr) for the protocol layer.

## Use it

- `post_note { "content": "Job 42 complete — invoice settled." }` — publish a note to the configured relays.
- Read recent mentions tagging the agent's npub and reply where needed (AustinKelsay's read tools).
- A natural-language run: *"Post that the batch finished, then check for any replies in the last hour."*

## Verify

- Publish a test note and confirm it appears in a Nostr client on one of the configured relays.
- Resolve the agent's own npub ("whoami") to confirm the key loaded.
- [verify-setup](/skills/verify-setup) folds the identity check into the full pre-flight.

## Gotchas & safety

- **Dedicated key, always.** The single most important rule — a leaked agent nsec must never compromise a human identity. This is non-negotiable for any agent that posts autonomously.
- **Relay choice is reach.** An agent is only as visible as the relays it writes to; pick well-connected relays and a couple of niche ones for your audience.
- **Zaps are payments.** `send_zap` (where supported) moves sats — treat it with the same budget discipline as [lightning-pay](/skills/lightning-pay), not as a posting action.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Captures BitClawd's `nostr-post` skill, with the key-hygiene warning made load-bearing — the reference servers take a raw nsec, which is exactly the footgun to flag rather than paper over (honest engagement). The remote-signer/bunker recommendation is the responsible forward path and worth restating even though current reference servers don't yet support it. Pairs with [[verify-setup]]; the protocol sits under [[nostr]] in Tools.
