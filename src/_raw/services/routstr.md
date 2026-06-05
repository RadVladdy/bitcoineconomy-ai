---
name: Routstr
slug: routstr
layer: services
collection: services
tagline: A decentralized AI-inference marketplace where a Cashu token is the API key — pay per request in private Bitcoin ecash, no login, no KYC.
tool-type: service
category: inference-marketplace
featured: true
two-sided: consume + offer
maintainer: Routstr
repo: https://github.com/Routstr
docs: https://docs.routstr.com
site: https://routstr.com
x: "@routstrai"
nostr: npub130mznv74rxs032peqym6g3wqavh472623mt3z5w73xq9r6qqdufs7ql29s
payment: cashu ecash over Lightning (bearer token = API key)
identity: nostr provider discovery
custody: self-custodial (bearer Cashu tokens)
kyc: none
bitcoin-native: true
stack-section: "§5"
status: published
last-verified: 2026-06-02
order: 40
tags:
  - routstr
  - inference-marketplace
  - cashu
  - nostr
  - llm-api
---

## What it is

Routstr is a decentralized, permissionless AI-inference protocol and marketplace: a payment-gated reverse proxy in front of OpenAI-compatible LLM APIs where a **Cashu token acts as the API key**. Providers are discovered over Nostr, payment settles in private Bitcoin/Cashu micropayments, and there is no login, no account, and no credit card. It is the clearest deployed instance of an agent buying a service on the Bitcoin stack — and was named to HRF's Top 15 Freedom Tech Projects of 2025.

This is the thesis running in production: an autonomous agent pays for its own inference, permissionlessly, at machine tempo.

## When to use it

- Giving an agent permissionless, accountless access to frontier-model inference.
- Privacy-preserving LLM access where bearer-token payment beats a tracked API key.
- Demonstrating or building on the "agent buys a service" pattern end-to-end.

## Dependencies & payment

**Dependencies:** a [Cashu](/tools/cashu) wallet holding a funded token (the token *is* the API key), an OpenAI-compatible client or SDK to point at the endpoint, and trust in the chosen mint; provider discovery additionally uses [Nostr](/tools/nostr). **Payment:** the credential is ordinary Cashu ecash *denominated in Bitcoin satoshis* — not a Routstr-issued token and not a claim on tokenized compute; it is bearer cash that happens to be spent on inference. The proxy meters each request in sats (input and output tokens priced separately, plus a per-request fee), deducts from the token's balance in real time, and returns any change as a fresh Cashu token. Funded over Lightning, with BOLT12 invoices also supported. No account, no card.

## Quick start

Point an OpenAI-compatible client at a Routstr endpoint and supply a Cashu token as the API key; top up the token to add inference balance. See `docs.routstr.com` for the overview and the protocol repos (`routstr-core`, `rips` — the Routstr Improvement Protocols, `otrta-client`) under `github.com/Routstr`. Check the repos for current release state — the protocol is under active development.

## Gotchas

- The Cashu token **is** the API key (bearer model) — anyone who obtains it can spend the remaining balance. Guard it like cash.
- Inference providers are independent and pseudonymous; quality, uptime, and honesty vary by provider — there is no central SLA.
- Privacy depends on the chosen mint and provider; standard Cashu mint-trust caveats apply. See [Cashu](/tools/cashu).
