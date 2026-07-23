# Amboss Rails

> Sell-side liquidity yield — deploy idle self-custodied bitcoin as Lightning routing liquidity and earn fees on the payment flow that crosses it (the provide-side complement to Magma's buy-side)

A self-custodial Lightning liquidity-provision service — put idle bitcoin to work as routing liquidity and earn yield, driven by a GraphQL API.

- Category: liquidity
- Payment methods: lightning
- Payment detail: no fee to use; you earn yield from routing fees on bitcoin you provide as liquidity
- Custody: self-custodial — your bitcoin stays under your own keys/node; Rails automates its deployment as routing liquidity
- Automatability: api-account — API after account setup — no identity check, but a human creates the account first
- Auth: API key from an Amboss account, sent as a bearer token to rails.amboss.tech/graphql
- API base: https://rails.amboss.tech/graphql
- Quickstart: Create an API key in your Amboss account; POST GraphQL to rails.amboss.tech/graphql with Authorization: Bearer <API_KEY> to configure and run liquidity provision; yield accrues from routing fees on the capacity you supply. Exact mutations: docs.amboss.tech/developer.
- Direction: offer
- Maintainer: Amboss Technologies
- Site: https://amboss.tech
- Docs/API: https://docs.amboss.tech/developer
- Full card (verified detail, gotchas): https://bitcoineconomy.ai/services/rails
- Provenance: curated (last verified 2026-06-27)

The provide/sell-side complement to Magma's buy-side; part of the Amboss + Voltage enterprise stack. Self-custodial yield on bitcoin used as Lightning routing liquidity — no asset swap, no custody handover. Amboss does not license free-API access for commercial use — confirm terms for production.

---

Part of [The Marketplace directory](https://marketplace.bitcoineconomy.ai/) · registry JSON: https://marketplace.bitcoineconomy.ai/directory.json · full thesis: https://bitcoineconomy.ai/case
