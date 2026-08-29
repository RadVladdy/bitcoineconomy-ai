---
name: Amboss Rails
slug: rails
layer: services
collection: services
tagline: A self-custodial Lightning liquidity-provision service — put idle bitcoin to work as routing liquidity and earn yield, driven by a GraphQL API.
tool-type: service
category: liquidity
featured: false
two-sided: offer
maintainer: Amboss Technologies
site: https://amboss.tech
docs: https://docs.amboss.tech/developer
payment: no fee to use; you earn yield from routing fees on bitcoin you provide as liquidity
identity: account (Amboss account + API key)
custody: self-custodial — your bitcoin stays under your own keys/node
bitcoin-native: true
status: published
last-verified: "2026-08-28 (API EXERCISED unauthenticated — POST rails.amboss.tech/graphql answered a live GraphQL query with no key; docs.amboss.tech/developer re-read: Rails still a named Amboss product alongside Magma/Reflex/Payments, nav still files it under Yield. Nothing in the card moved.)"
order: 55
tags:
  - amboss
  - rails
  - liquidity-provision
  - yield
  - lightning
  - self-custodial
---

## What it is

Amboss Rails is the **provide-side** of the Lightning liquidity market: it puts idle bitcoin to work as **routing liquidity** and earns yield from the payment flow that crosses it. Where [Magma](/services/amboss) is where a node **buys** inbound capacity, Rails is where a node **offers** capacity and gets paid for it — automated through a **GraphQL API** rather than hand-managed channels. It is **self-custodial**: the bitcoin stays under your own keys, deployed as liquidity, not handed to Amboss.

It is the yield engine in the Amboss + Voltage payments stack — the layer that attracts and optimizes the capital that makes fast, low-cost Lightning payments possible.

## When to use it

- A treasury or agent holds idle bitcoin and wants **yield from routing** without giving up custody.
- You want the **sell side** of the liquidity market programmatically — provide capacity, earn fees — rather than picking channels by hand.
- You're running Lightning payment infrastructure and want liquidity managed dynamically against demand.

## Dependencies & payment

A node / self-custodied bitcoin to deploy as liquidity, plus an **Amboss account and API key**. The API is a GraphQL endpoint at `rails.amboss.tech/graphql`, authenticated with a bearer token. There is no fee to consume on the buyer side; as a provider you **earn yield from routing fees** on the liquidity you supply. As with Amboss's other APIs, **commercial use of the free tier is not permitted** — confirm terms for production.

## Quick start

Create an API key in your Amboss account, then POST GraphQL to `rails.amboss.tech/graphql` with `Authorization: Bearer <API_KEY>` to configure and run liquidity provision; yield accrues from the routing fees on the capacity you supply. Exact mutations are documented at `docs.amboss.tech/developer`.

## Gotchas

- **Yield is variable.** Routing income depends on payment demand across your liquidity — it is not a fixed rate.
- **Self-custodial means you run the infrastructure.** Your bitcoin stays yours, but so does the operational responsibility for the node providing it.
- **Free-API commercial limit.** Amboss does not license free-API access for commercial use — clear production terms with Amboss.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

The sell-side complement to [Magma](/services/amboss): together they are the two halves of the Lightning liquidity market (buy capacity / provide capacity and earn). Thesis-clean and well-aligned — self-custodial yield on **bitcoin** used as Lightning routing liquidity, no stablecoin leg and no custody handover. Directory entry: category `liquidity`, automatability `api-account`, `api_base` `rails.amboss.tech/graphql` (verified via Amboss developer docs 2026-06-27), two-sided `offer`. Part of the Amboss + Voltage enterprise stack.
