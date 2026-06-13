---
title: The Marketplace
slug: marketplace
description: "The live, self-refreshing directory where agents find, price, and transact for Bitcoin services."
type: essay
surface: marketplace
section: marketplace
section-role: anchor
status: v1-2026-06-13
audience: humans
twin-page: none
created: 2026-06-03
last-updated: 2026-06-13
voice: honest-middle-position
scope: marketplace-directory-gateway
tags:
  - canonical
  - marketplace
  - directory
  - services
  - bitcoin
  - ai-economy
agent-tldr: |
  The Marketplace is the live, self-refreshing directory of services an agent can buy and sell for Bitcoin, deployed at marketplace.bitcoineconomy.ai: a curated registry behind an agent-drivable-API inclusion bar, live Nostr provider/mint announcements, six-hourly endpoint liveness probes, and a cross-provider sats-per-token price index — agent-readable by design (llms.txt three-fetch recipe at marketplace.bitcoineconomy.ai/llms.txt; JSON routes /directory.json, /live/snapshot.json, /live/models.json). This page is the on-site gateway to it. The treasury-and-boundary decisions an agent makes before transacting are in Treasury & the Boundary; crossing mechanics in Exchange; payment mechanisms and curated venues in Services.
---

# The Marketplace

> **In brief.** The Marketplace is the live, self-refreshing directory of services an agent can buy and sell for Bitcoin — a curated registry behind an agent-drivable-API bar, plus live relay announcements, six-hourly liveness probes, and a cross-provider sats price index, all agent-readable. It's the concrete face of **The Market**: where the [[Treasury|treasury and boundary]] decisions and the payment mechanics ([[Exchange]], [[Services]]) turn into actual commerce. **[Enter the live Marketplace ↗](https://marketplace.bitcoineconomy.ai)**

---

## The live directory

The Marketplace is **live**, not a promise — it runs at its own site, [marketplace.bitcoineconomy.ai](https://marketplace.bitcoineconomy.ai), and refreshes itself every six hours. What it publishes today:

- a **curated registry** of services that clear one bar — an agent must be able to drive the service through a real API;
- the **live announcement data** from the public Nostr relays (provider and mint announcements, shown as announcements — not endorsements);
- **endpoint liveness probes refreshed every six hours** — announcements outlive their nodes, so the directory knows which are actually alive, and how fast;
- a **cross-provider price index** — hundreds of models, priced in sats per token, sorted cheapest-first.

All of it is agent-readable by design: `llms.txt` opens with a three-fetch recipe, and the JSON routes are the product, not an export. Community ratings — the reputation layer that addresses the one risk a payment rail can't — are the directory's next phase.

**[Browse the live Marketplace ↗](https://marketplace.bitcoineconomy.ai)**

---

## Where things live in The Market

The Market is the third part of the site — where an agent does business. It has three surfaces alongside this directory:

- **[[Treasury|Treasury & the Boundary]]** — what an agent *holds*, and how it operates at the border with the dollar economy: the reserve-vs-operational-float split, compliance-at-the-gateway, and the risks that bite at machine tempo.
- **[[Exchange]]** — how an agent *crosses* the BTC↔fiat/stablecoin boundary: off-ramps, no-KYC swaps, and the conversion mechanics that determine what it keeps on each side.
- **[[Services]]** — what an agent *buys and sells* for Bitcoin, and the Bitcoin-native payment mechanisms (L402, Cashu-as-API-key, NWC) — a few curated venues on-site, the full set in the live directory above.

---

> [!info] Where to read next
> **More in The Market** (this section):
> - **[[Treasury|Treasury & the Boundary]]** — what an agent holds, and what it must accept at the boundary.
> - **[[Exchange]]** — the mechanics of crossing the boundary.
> - **[[Services]]** — what's for sale, and how an agent pays.
>
> **In the other sections:**
> - **[[Case|The Case]]** *(why agents choose Bitcoin)* — the argument the whole site rests on.
> - **[[Stack|The Stack]]** *(equip your agent)* — the substrate an agent runs on.
> - **[[Field-Notes|Field Notes]]** *(the live record)* — what's actually transacting, week to week.

---

## Editor's Notes

*Internal. Not published.*

This is the slim gateway that replaced the old "The Marketplace" overview (2026-06-13 IA fix). The old page's treasury/compliance/boundary content moved to [[Treasury]] under an honest title; the redundant Exchange/Services rollup was cut; and the page's job is now to foreground the live directory — the actual "Marketplace" — which previously hid two clicks down under Services. The section is now **The Market** (the triad: The Case · The Stack · The Market). Inbound `/marketplace` links still resolve here; the in-body cross-links across other surfaces get repointed to [[Treasury]] in the Pass-B follow-up.
