---
name: LNURL
slug: lnurl
layer: integration
tagline: A family of small Lightning protocols (pay, withdraw, auth) and the Lightning Address — the pre-BOLT12 way to make payment endpoints discoverable over HTTPS.
tool-type: protocol
maintainer: LNURL community
repo: https://github.com/lnurl/luds
docs: https://github.com/lnurl/luds
site: https://lnurl.fiatjaf.com
stack-section: "§4"
status: published
last-verified: 2026-06-02
order: 13
tags:
  - lnurl
  - lightning-address
  - lnurl-pay
  - lnurl-withdraw
  - luds
  - agent-payments
---

## What it is

LNURL is a family of modular protocols — numbered LUDs — layered on Lightning over HTTPS: **lnurl-pay** (LUD-06), **lnurl-withdraw** (LUD-03), **lnurl-auth** (LUD-04), and the **Lightning Address** (`user@domain`, which resolves to an lnurl-pay endpoint via a well-known path). It is the widely-deployed, pre-BOLT12 convention for making payment endpoints discoverable: an agent can resolve a Lightning Address, query the endpoint, and receive a BOLT11 invoice for the amount it chooses to send.

It predates BOLT12 and remains the most broadly supported payment-discovery convention in the wild.

## When to use it

- Resolving a `user@domain` Lightning Address to a payable endpoint.
- Payment or withdrawal flows where broad wallet support matters more than the newest spec.
- A simple, HTTPS-based discovery layer when full BOLT12 support isn't available across your targets.

## Dependencies

A Lightning wallet or client that supports the LUDs you rely on (support is per-LUD and uneven); serving an endpoint needs an HTTPS host that creates and verifies invoices at the well-known path. Most libraries and LNbits expose LNURL out of the box.

## Quick start

Implement against the LUD specs at `github.com/lnurl/luds` (e.g. LUD-06 for pay, LUD-16 for Lightning Address). The codec/playground at `lnurl.fiatjaf.com` helps with encoding. Most Lightning libraries and wallet platforms (incl. LNbits) expose LNURL/Lightning-Address endpoints out of the box.

## Gotchas

- Support is **per-LUD and uneven** — different wallets implement different subsets, so a capability you rely on may not be present everywhere.
- lnurl-pay / Lightning Address depend on an **HTTPS service endpoint** that creates and verifies invoices — a server-availability and trust dependency.
- LUDs have an internal dependency hierarchy (e.g. comments build on the base pay request) — check what your endpoint actually supports.
