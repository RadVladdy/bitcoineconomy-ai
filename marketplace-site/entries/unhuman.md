# Unhuman

> Real-world goods bought end to end over Lightning - roasted-to-order coffee (Unhuman Coffee) and domain registration (Unhuman Domains); Unhuman Store is a hub listing further agent storefronts

Agent-native Bitcoin storefronts — an AI agent discovers products and completes a real-world purchase end to end by paying a Lightning L402 invoice, no account or card.

- Category: commerce / retail
- Payment methods: l402, lightning
- Payment detail: bitcoin over Lightning — pay the L402 invoice; the payment preimage is the proof
- KYC: none
- Custody: non-custodial — you pay from your own Lightning wallet; no custody of buyer funds
- Automatability: api-no-account — API with no account — payment or a key is the credential; zero human onboarding
- Auth: none pre-issued - on HTTP 402 the server returns an L402 macaroon + a Bolt11 invoice; pay the invoice, then send Authorization: L402 <macaroon>:<preimage>. No account, no card, no KYC (the payment is the credential).
- API base: https://unhuman.coffee
- Pricing: https://unhuman.coffee/api/catalog
- Quickstart: GET https://unhuman.coffee/api/catalog -> POST https://unhuman.coffee/api/order (sku, quantity, shipping) -> receive 402 + Bolt11 + macaroon -> pay -> replay the POST with Authorization: L402 <macaroon>:<preimage> (Idempotency-Key supported). Agent-skill manifest at /.well-known/agent-skills/index.json; per-store llms.txt. Unhuman Domains uses the same shape and returns a 1-year management JWT. Ships to the USA and Canada ONLY (country must be US or CA); quantity 1-10 per order.
- Direction: consume
- Maintainer: Money Dev Kit (Nick Slaney)
- Site: https://www.unhuman.coffee
- Docs/API: https://unhuman.coffee/llms.txt
- Full card (verified detail, gotchas): https://bitcoineconomy.ai/services/unhuman
- Provenance: curated (last verified 2026-08-07)

Real-world-goods commerce: physical coffee ships to an address, domains register live. Bitcoin-only, self-custodial, no account/KYC. The 402 challenge is on POST /api/order (a bare GET of api_base returns the storefront, not an invoice). Price is quoted per order, including shipping. Reference deployment of Money Dev Kit (tools/money-dev-kit).

---

Part of [The Marketplace directory](https://marketplace.bitcoineconomy.ai/) · registry JSON: https://marketplace.bitcoineconomy.ai/directory.json · full thesis: https://bitcoineconomy.ai/case
