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

LNURL is a family of small, single-purpose protocols — each one a numbered **LUD** — that sit on top of Lightning and run over ordinary HTTPS. Instead of a human copying a one-time invoice, a client fetches a URL, gets back a small JSON description of what it can do, and acts on it. That makes Lightning endpoints *discoverable and machine-actionable* — exactly what an autonomous agent needs. Four pieces matter most:

**lnurl-pay (LUD-06)** — the request-an-invoice flow. The client fetches the endpoint and receives the payable range (min/max), metadata, and a callback URL; it then calls back with the amount it chooses, and the server returns a fresh BOLT11 invoice for that amount. Unlike a bare BOLT11 invoice — fixed-amount and single-use — an lnurl-pay endpoint is reusable and amount-flexible, so an agent can pay the same destination repeatedly without anyone minting an invoice ahead of time.

**lnurl-withdraw (LUD-03)** — the pull-payment flow, the mirror image of pay. The endpoint authorizes the holder to *pull* funds up to a limit: the client presents an invoice and the server pays it. This is how "claim your sats," faucet, and refund flows work; for an agent it is a way to *be paid* by presenting its own invoice against a withdraw authorization, rather than handing out an address and waiting.

**lnurl-auth (LUD-04)** — key-based login, no payment involved. The server sends a challenge; the wallet signs it with a per-domain key derived from its seed; the signature proves control of that key. The agent gets a passwordless, accountless identity scoped to each service — the same keypair-as-identity model the rest of the stack leans on, applied to authentication.

**Lightning Address (LUD-16)** — the human-readable veneer: `user@domain`. It resolves, via a well-known HTTPS path (`https://domain/.well-known/lnurlp/user`), to an lnurl-pay endpoint. It is not a separate payment mechanism — it is sugar over lnurl-pay that makes a destination as easy to template as an email address.

**How they fit together.** All four share one shape: a bech32-encoded `lnurl…` string (or, for Lightning Address, an email-style name that expands into one), fetched over HTTPS to return JSON the client acts on. Pay and withdraw are duals — one pushes value, the other pulls it; auth reuses the same request/response plumbing for identity instead of money; and Lightning Address is simply the friendliest front door to lnurl-pay. The LUDs also build on each other — higher-numbered ones extend the base flows with comments, richer metadata, and success actions — so support is **per-LUD**: a client implements a *set* of LUDs, not "LNURL" wholesale. For an agent the practical upshot is that one small HTTPS-and-JSON convention covers paying, getting paid, and logging in — which is why it remains the most broadly deployed discovery layer even as BOLT12 advances.

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
