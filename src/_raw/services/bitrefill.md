---
name: Bitrefill
slug: bitrefill
layer: services
collection: services
tagline: The Lightning-native bridge to the rest of the digital economy — buy gift cards and top-ups for thousands of mainstream services with Bitcoin, via a real API, no KYC.
tool-type: service
category: payments-bridge
featured: true
two-sided: consume
maintainer: Bitrefill
site: https://bitrefill.com
docs: https://www.bitrefill.com/thor-api/
x: "@bitrefill"
payment: Lightning (native) + on-chain BTC; programmatic via the Thor API
identity: none
custody: n/a (pay-and-receive)
kyc: none
bitcoin-native: true
status: published
last-verified: 2026-06-05
order: 50
tags:
  - bitrefill
  - gift-cards
  - lightning
  - bridge
  - no-kyc
---

## What it is

Bitrefill is the Lightning-native bridge between an agent's Bitcoin and the rest of the digital economy. It sells **gift cards and prepaid top-ups for thousands of mainstream services** — domains, hosting, cloud, VPNs, marketplaces, travel, mobile — payable in **Bitcoin over the Lightning Network** (or on-chain), with **no account and no KYC** for ordinary purchases. Crucially for an agent: it exposes a real **payment API (Thor)**, so the purchase can be driven programmatically rather than through a human checkout page.

## When to use it

- An agent needs to pay for a service that does **not** accept Bitcoin directly — the long tail (mainstream SaaS, cloud, storage brands, marketplaces): buy the gift card with sats, redeem it at the service.
- Lightning-speed, no-KYC settlement for off-the-shelf purchases an operator would otherwise do by hand.
- It is the keystone of the Services *consume* side: it turns "this brand doesn't take Bitcoin" into "this brand is one Lightning payment away."

## Dependencies & payment

**Dependencies:** a Lightning-capable wallet with a funded balance and — for automation — a **Thor API** key. **Payment:** native **Lightning** (instant, sub-cent fees) or on-chain BTC; no account, no KYC for ordinary purchases. The Thor API lets an agent request a product, receive a Lightning invoice, pay it, and get the redemption code back programmatically — the whole loop with no human in it.

## Quick start

Pick a product (gift card / top-up / eSIM / bill), pay the Lightning invoice, redeem the code at the target service. For automation, drive the same flow through the Thor API (`bitrefill.com/thor-api`).

## Gotchas

- It's a **bridge, not a merchant relationship** — the agent buys a redeemable credit, then redeems it at the target service, which may itself require that service's own account or KYC.
- Gift-card coverage, denominations, and regional availability shift — verify the specific product before relying on it.
- Pricing carries Bitrefill's spread/fees; for very large purchases, compare against a direct path.
- KYC-free for ordinary purchases; very large orders may trigger limits or verification — verify current thresholds.
