---
name: Strike
slug: strike
layer: bridges
tagline: A Bitcoin/Lightning payments app and API with fiat on/off-ramp — the regulated-custodian bridge between agent payments and bank rails.
tool-type: service
maintainer: Zap Solutions (Strike)
docs: https://docs.strike.me
site: https://strike.me
stack-section: "Border Zone"
status: published
last-verified: 2026-06-02
order: 50
tags:
  - strike
  - lightning
  - on-ramp
  - off-ramp
  - regulated-custodian
  - api
---

## What it is

Strike is a Bitcoin/Lightning payments app and developer API for sending and receiving, converting USD ↔ BTC, and making Lightning-native programmatic payments. Its REST/JSON API (with OAuth for third-party integrations) makes it a practical on/off-ramp at the edge of the substrate: where agent activity needs to touch fiat or bank rails, a regulated custodian like Strike is the bridge.

This is a **Border Zone** tool, not pure substrate — it interfaces the Bitcoin economy with the incumbent financial system. See [The Border Zone](/border-zone) for the bridge architecture and the compliance-at-the-gateway pattern.

## When to use it

- Fiat on-ramp / off-ramp at the boundary between agent treasuries and bank rails.
- Lightning-native send/receive where you want a managed, compliant counterparty.
- Programmatic payouts/collections via a documented REST API.

## Dependencies & payment

**Dependencies:** a Strike account (KYC at onboarding) and API access via OAuth; availability is jurisdiction-gated. **Payment:** Strike moves value between bank/fiat rails (USD) and Bitcoin/Lightning — it is the regulated bridge, holding custody at the boundary, so the fiat leg carries the compliance and the Bitcoin/Lightning leg stays permissionless downstream.

## Quick start

Build against the API documented at `docs.strike.me` (developer portal at `strike.me/developer/`), using OAuth for third-party access. Availability is gated by jurisdiction.

## Gotchas

- **Regulated custodian** — Strike holds customer funds and operates under money-transmission / BitLicense regulation. Custodial counterparty risk and KYC apply; this is a deliberate trade at the bridge, not substrate-level sovereignty.
- **Geo-restricted** — availability depends on jurisdiction and regulatory coverage.
- **Closed-source** — the stack is not self-verifiable; you trust the operator.
