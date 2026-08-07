---
name: BitLaunch
slug: bitlaunch
layer: services
collection: services
tagline: Bitcoin VPS provisioning with a real API and SDKs — spin up servers on BitLaunch's own metal or on DigitalOcean/Vultr/Linode, and pay in crypto programmatically. "Programmable servers with programmable money."
tool-type: service
category: compute-hosting
featured: false
two-sided: consume
maintainer: BitLaunch
site: https://bitlaunch.io
docs: https://developers.bitlaunch.io
payment: on-chain BTC/LTC/ETH selectable via the API; programmatic via the BitLaunch API (blcli CLI; Go/Python/PHP SDKs)
identity: account (email) — no KYC
custody: n/a (pay-and-receive)
kyc: none
bitcoin-native: true
status: v0-2026-06-06-structural-verified
last-verified: 2026-08-07 (OpenAPI cryptoSymbol enum read; docs repointed to the developer hub; own-vs-partner estate confirmed)
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

BitLaunch is a **Bitcoin/Lightning VPS provider** that provisions servers on **its own infrastructure** and on the major clouds (**DigitalOcean, Vultr, Linode**) and lets an agent drive the whole loop by code: a **full API**, a `blcli` command-line tool, and **SDKs for Go, Python, and PHP**, — its own framing is "programmable server provisioning with programmable money." An agent can create a server, add SSH keys, and drive the payment request by code. ⚠ **On the Lightning question, state only what is checkable:** the published OpenAPI for `POST /transactions` documents `cryptoSymbol` as *"Valid values are: BTC, LTC, ETH"* and returns an on-chain address plus a hosted invoice URL, and the word "lightning" appears **zero** times across `developers.bitlaunch.io` and zero times on their homepage. Whether the hosted invoice page offers a Lightning option at the payment step could not be tested without creating a real transaction. **Treat Lightning as unverified here, not as an API capability.**

## When to use it

- An agent needs **mainstream-grade compute** (DO/Vultr/Linode capacity and regions) but wants to pay in Bitcoin and provision by API rather than through a card-and-dashboard flow.
- Scripted, hourly-billed server lifecycles — spin up for a task, tear down when done — paid from the agent's own crypto balance.
- A privacy-respecting (no-KYC) path to the big clouds without giving them a card or identity directly.

## Dependencies & payment

**Dependencies:** a BitLaunch account (email; no KYC) and an API token; the `blcli` tool or one of the SDKs for automation. **Payment:** the API selects **BTC, LTC or ETH** and hands back an address plus a hosted invoice URL — request, invoice, pay, provision, driven programmatically. A 2020 launch post announced Lightning automation; the current API surface does not expose it, so do not plan on it without confirming at the venue.

## Quick start

Create an account, generate an API token, and use `blcli` or a Go/Python/PHP SDK to create a server and settle the returned invoice; docs at `developers.bitlaunch.io`, which publishes an `llms.txt` index and an OpenAPI description.

## Gotchas

- **Partly a reseller, and the distinction matters.** BitLaunch's own footer splits **"BitLaunch locations"** (Netherlands · Romania · UK · Los Angeles · Dallas · Chicago) from **"Partner locations"** (Singapore · Canada · Germany · India · New York · San Francisco · Miami and more). On a *partner* instance the upstream's infrastructure, regions and acceptable-use policies ultimately apply, and you pay BitLaunch's markup over buying direct — neither is true of an instance on BitLaunch's own metal.
- Carries BitLaunch's markup over buying from the upstream directly (the trade for Bitcoin payment + no KYC); compare for large/long-running workloads.
- Verify current pricing, supported upstream providers, and API scope before relying on it.
