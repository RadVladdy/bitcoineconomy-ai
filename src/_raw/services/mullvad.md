---
name: Mullvad VPN
slug: mullvad
layer: services
collection: services
tagline: A privacy VPN that takes Lightning with no email and no account profile — just a random account number. The lowest-identity direct-merchant fit for an agent.
tool-type: service
category: vpn-privacy
featured: true
two-sided: consume
maintainer: Mullvad VPN
site: https://mullvad.net
x: "@mullvadnet"
payment: Lightning (native, own node) + on-chain BTC (also cash-by-mail, Monero)
identity: random 16-digit account number (no email, no KYC)
custody: n/a (pay-and-receive)
kyc: none
bitcoin-native: true
status: published
last-verified: "2026-08-11 (account/create 200 and still offering 'Generate account number' with ZERO occurrences of 'email' on the page — the no-identity claim holds; payment methods re-read on the live pricing page, which names Bitcoin, Lightning, Monero and cash. NB /help/payment-information now 404s: an earlier check grepped that error page and would have 'confirmed' the claim from nothing.)"
order: 51
tags:
  - mullvad
  - vpn
  - privacy
  - lightning
  - no-kyc
---

## What it is

Mullvad is a privacy-first VPN with the most agent-aligned payment model of any mainstream service: **no email, no account profile — just a random 16-digit account number** — and it accepts **Bitcoin over its own Lightning node** (with an on-chain option, and even cash by mail). An agent funds an account number with a Lightning invoice; there is no login or identity step at any point.

## When to use it

- Giving an agent — or the infrastructure it runs on — network privacy paid for without an identity trail.
- The cleanest **direct-merchant** Bitcoin payment on the consume side: no processor redirect, no KYC, Lightning-fast.
- A model example of what "a real-world service an agent can pay for *itself*" actually looks like.

## Dependencies & payment

**Dependencies:** a Lightning-capable wallet and a Mullvad account number (generated free, no details). **Payment:** native **Lightning** (paid against the account number, with a discount) or on-chain BTC. No email, no account profile, no KYC. There is no public payment *API*, but the invoice-against-account-number flow is low-friction enough to script.

## Quick start

Generate an account number at `mullvad.net`, choose a subscription length, pay the Lightning invoice tied to that number, and the time is credited — no login, no personal data.

## Gotchas

- **Not a full payment API** — it's an invoice-against-account-number flow: automatable, but not a programmatic product API like Bitrefill's REST API.
- The account-number model means **don't lose the number** — it is the only credential.
- This is infrastructure privacy for the agent/operator; it is not itself an agent-to-agent economy service.

## Editor's Notes

**⚑ Directory tier — recorded 2026-08-07 so it is not re-litigated: `limited`, not `api-account`.** The row previously read `api-account`, which the site's own published vocabulary defines as *"API after account setup"* — and there is no API. Mullvad publishes no developer surface at all, and this card says so twice. The counter-argument is real and worth keeping: an agent genuinely can generate an account number and pay a Lightning invoice against it unattended, which is more automatable than `limited` suggests. But a tier that asserts an API which does not exist is worse than one that understates the ergonomics, and the overlay's own quickstart already conceded *"there is no formal payment API"*. If the vocabulary is ever widened to credit scriptable-but-API-less flows, revisit this row first.

