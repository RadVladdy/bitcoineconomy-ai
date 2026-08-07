---
name: CVMI
slug: cvmi
layer: integration
toolbox-group: primitive
tagline: The ContextVM command line — discover pubkey-addressed MCP servers on Nostr relays, interact with them, and manage the tooling to build your own.
tool-type: software
maintainer: ContextVM project & community
repo: https://github.com/contextvm
docs: https://docs.contextvm.org
site: https://www.contextvm.org
stack-section: "§4"
status: published
last-verified: 2026-08-07 (cvmi@0.4.1 tarball README read — six shipped commands)
order: 17
prereq-tier: keys-only
prereqs:
  - "Node.js — the CLI runs via npx"
  - "relay access — to discover and reach servers"
  - "a Nostr keypair — to interact with a server as a client"
tags:
  - cvmi
  - contextvm
  - cli
  - mcp
  - nostr
  - discovery
---

## What it is

CVMI is the unified command line for [ContextVM](/tools/contextvm): discovering pubkey-addressed MCP servers on Nostr relays, interacting with them, and managing the developer tooling for building your own. `cvmi discover` queries relays for the servers' announcement events (their capabilities and prices); `npx cvmi add` pulls in ContextVM developer-context packs.

A naming note worth holding: CVMI calls those developer-context packs **"skills."** Those are documentation bundles for building on ContextVM — *not* the same thing as this site's [Skills](/skills), which are deployable, install-ready agent capabilities.

## When to use it

- **Discovering** CVM servers and their advertised capabilities and prices by querying relays (`cvmi discover`).
- Interacting with a pubkey-addressed MCP server from the command line — `cvmi call` invokes its methods, `cvmi use` proxies it as a local stdio server.
- Pulling in ContextVM developer tooling and reference material while building a server or client.

## Dependencies

Node.js (the CLI runs via `npx`), relay access to reach announcements and servers, and a Nostr keypair to act as a client. For paid capabilities, the same NWC rail [ContextVM](/tools/contextvm) uses.

## Quick start

Discover live servers on the default relays:

```
cvmi discover
```

Narrow or widen the query with `--relays`, `--limit`, and `--raw`. **Six commands ship as of `cvmi@0.4.1` (2026-08-04):** `discover` · `call` (invoke a server's methods) · `use` (proxy a Nostr-addressed server as local stdio) · `serve` (expose your own MCP server as a gateway) · `cn` (compile a server to code) · `add` (pull in developer-context packs). The full reference is at `docs.contextvm.org`. *(Heads-up for version checks: cvmi's npm `next` dist-tag points at 0.4.0, which is **older** than `latest` 0.4.1 — that is upstream's tagging, not a defect here.)*

## Gotchas

- **Discovery is only as complete as the relays you query** — a server you share no relay with is invisible. Widen `--relays` rather than trusting a single one.
- **The server population is small today** — expect a short list. ContextVM is early, and CEP-8 is still a Draft spec.
- **"Skills" here are developer docs**, not this site's deployable Skills — don't conflate `cvmi add` packs with a commerce or payment capability.
