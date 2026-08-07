---
name: ContextVM (CVM)
slug: contextvm
layer: integration
toolbox-group: primitive
tagline: The Model Context Protocol carried over Nostr — tool servers addressed by public key instead of DNS or IP, with a pricing spec (CEP-8) that lets a server charge sats for the tool call itself.
tool-type: protocol
maintainer: ContextVM project & community
repo: https://github.com/contextvm
docs: https://docs.contextvm.org
site: https://www.contextvm.org
stack-section: "§4"
status: published
last-verified: 2026-08-07 (SDK payment surface re-read; gateway now runnable as cvmi serve)
order: 16
prereq-tier: keys-only
prereqs:
  - "a Nostr keypair — a CVM service is addressed by its public key, not a domain or IP"
  - "relay access — relays are the message bus CVM runs over"
  - "to charge or pay: an NWC connection string on each side (server to receive and verify, client to pay)"
tags:
  - contextvm
  - cvm
  - cep-8
  - mcp
  - nostr
  - agent-integration
  - payments
---

## What it is

ContextVM (CVM) carries the [Model Context Protocol](/tools/mcp) over [Nostr](/tools/nostr). Instead of reaching a tool server at a domain or IP address, an agent reaches it by its **Nostr public key**; relays are the message bus. That takes API keys, inbound ports, TLS certificates, and DNS records out of the picture — a server publishes to and subscribes from relays rather than listening on a socket. Because it is built on MCP, tool schemas stay typed and the whole existing MCP surface still applies.

Its distinguishing addition is **CEP-8**, a capability-pricing and payment spec that lets an MCP server charge for a **tool call itself** — priced in sats, settled over Lightning (BOLT11 via [NWC](/tools/alby-nwc)) or [Cashu](/tools/cashu) as the recommended rails. Where [L402](/tools/l402) gates an HTTP resource, CEP-8 gates the MCP invocation.

## When to use it

- Exposing or consuming a **paid** MCP capability without DNS, TLS, API keys, or an inbound port.
- Addressing a tool server by *identity* (a keypair) rather than by *location* (a domain/IP).
- Publishing a capability's schema **and** its price together as one signed, discoverable event (via CEP-6 announcements) rather than a listing plus out-of-band pricing.

## Dependencies

A Nostr keypair for the server's address, relay access for the transport, and — to charge or pay — an NWC connection string on each side (the server holds one to receive and verify settlement; the client holds one to pay). Built on MCP, so an MCP-capable client or SDK completes the picture.

## Quick start

Build with the ContextVM **TypeScript SDK** (`@contextvm/sdk`) or the **Rust SDK**; the **Gateway** bridges an existing MCP server onto Nostr without rewriting it — and the one-line way to run it is now `cvmi serve` (with `cvmi use` as the Proxy side); see [cvmi](/tools/cvmi). Pricing rides the SDK's payment API — the server declares its priced capabilities and wraps its transport with a payment processor; the client wraps its transport with the matching payment handler. Both sides take an NWC connection string. Discover live servers with the [cvmi](/tools/cvmi) CLI. The protocol and the CEP series are documented at `docs.contextvm.org`.

## Gotchas

- **CEP-8 is a Draft spec** — reference-implemented in the TypeScript SDK since v0.4.0, but still moving. Pin to a known SDK version.
- **The ecosystem is small today** — a handful of public servers and relays, against the wider MCP ecosystem's tens of thousands of servers. With little to buy yet, the near-term use is on the *serving* side (exposing a paid tool), not the buying side.
- **Relay availability is a liveness dependency** — a server is only reachable through relays that carry its events. Publish to several (CEP-17 relay lists), the way you'd run more than one watchtower.
- **Metadata leaks to relay operators** — payloads can be encrypted (CEP-4), but *which* pubkey talks to *which*, and *when*, is visible to the relays carrying the traffic.
- **A paid authorization grants execution, not a guaranteed result** — if the response is lost in transit the spec does not require the server to replay it, and a retry may be charged again.
