---
name: BitLaunch
slug: bitlaunch
layer: services
collection: services
tagline: Bitcoin/Lightning VPS provisioning with a real API and SDKs — spin up DigitalOcean/Vultr/Linode servers and pay over Lightning, programmatically. "Programmable servers with programmable money."
tool-type: service
category: compute-hosting
featured: false
two-sided: consume
maintainer: BitLaunch
site: https://bitlaunch.io
docs: https://bitlaunch.io/blog/introducing-the-bitlaunch-api/
payment: Lightning + on-chain BTC; programmatic via the BitLaunch API (blcli CLI; Go/Python/PHP SDKs)
identity: account (email) — no KYC
custody: n/a (pay-and-receive)
kyc: none
bitcoin-native: true
status: v0-2026-06-06-structural-verified
last-verified: 2026-06-06
order: 53
tags:
  - bitlaunch
  - vps
  - compute
  - hosting
  - lightning
  - api
  - no-kyc
---

## What it is

BitLaunch is a **Bitcoin/Lightning VPS provider** that provisions servers on the major clouds (**DigitalOcean, Vultr, Linode**) and lets an agent drive the whole loop by code: a **full API**, a `blcli` command-line tool, and **SDKs for Go, Python, and PHP**, with **Lightning-automated payments** — its own framing is "programmable server provisioning with programmable money." An agent can create a server, add SSH keys, and pay for it over Lightning without a human checkout.

## When to use it

- An agent needs **mainstream-grade compute** (DO/Vultr/Linode capacity and regions) but wants to pay in Bitcoin and provision by API rather than through a card-and-dashboard flow.
- Scripted, hourly-billed server lifecycles — spin up for a task, tear down when done — paid from the agent's Lightning balance.
- A privacy-respecting (no-KYC) path to the big clouds without giving them a card or identity directly.

## Dependencies & payment

**Dependencies:** a BitLaunch account (email; no KYC) and an API token; the `blcli` tool or one of the SDKs for automation. **Payment:** native **Lightning** or on-chain BTC, automatable via the API — request, invoice, pay, provision, all programmatically.

## Quick start

Create an account, generate an API token, and use `blcli` or a Go/Python/PHP SDK to create a server and pay the Lightning invoice; docs at `bitlaunch.io/blog/introducing-the-bitlaunch-api`.

## Gotchas

- **It's a reseller** — servers actually run on DigitalOcean/Vultr/Linode, so those upstreams' infrastructure, regions, and acceptable-use policies ultimately apply.
- Carries BitLaunch's markup over buying from the upstream directly (the trade for Bitcoin payment + no KYC); compare for large/long-running workloads.
- Verify current pricing, supported upstream providers, and API scope before relying on it.
