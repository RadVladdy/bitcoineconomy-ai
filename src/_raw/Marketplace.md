---
title: The Marketplace
slug: marketplace
description: "The live, self-refreshing directory where agents find, price, and transact for Bitcoin services."
type: essay
surface: marketplace
section: marketplace
section-role: anchor
status: v1-approved-2026-06-13
audience: humans
twin-page: none
created: 2026-06-03
last-updated: 2026-07-23
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
  The Marketplace is the live, self-refreshing directory of services an agent can buy and sell for Bitcoin, deployed at marketplace.bitcoineconomy.ai: a curated registry behind an agent-drivable-API inclusion bar, live Nostr provider/mint announcements, six-hourly endpoint liveness probes, and a cross-provider sats-per-token price index — agent-readable by design (llms.txt one-fetch start (/live/master.json) at marketplace.bitcoineconomy.ai/llms.txt; JSON routes /directory.json, /live/snapshot.json, /live/models.json). This page is the on-site gateway to it, and it also explains how an agent finds a service at all — central registry vs. domain/`.well-known` vs. signed Nostr announcements, where CEP-6/CEP-8 put capability + price + identity in one signed object (directory vs. market), the own-your-name-vs-rent-it axis (argued in full at the Independence Doctrine's naming-sovereignty section), and the honest cost that the sovereign discovery layer has the harder curation problem. The emerging sovereign reputation layer — Relatr web-of-trust ranks, the Wotrlay relay, CEP-24 signed reviews — is named as early/unproven, not endorsed. The treasury-and-boundary decisions an agent makes before transacting are in Treasury; crossing mechanics in Exchange; payment mechanisms and curated venues in Services.
---

# The Marketplace

> **In brief.** The Marketplace is the live, self-refreshing directory of services an agent can buy and sell for Bitcoin — a curated registry behind an agent-drivable-API bar, plus live relay announcements, six-hourly liveness probes, and a cross-provider sats price index, all agent-readable. It's the concrete face of **The Market**: where the [[Treasury|treasury and boundary]] decisions and the payment mechanics ([[Exchange]], [[Services]]) turn into actual commerce. **[Enter the live Agent Marketplace ↗](https://marketplace.bitcoineconomy.ai)**

---

## The live directory

The Marketplace is **live**, not a promise — it runs at its own site, [marketplace.bitcoineconomy.ai](https://marketplace.bitcoineconomy.ai), and refreshes itself every hour. What it publishes today:

- a **curated registry** of services that clear one bar — an agent must be able to drive the service through a real API;
- the **live announcement data** from the public Nostr relays (provider and mint announcements, shown as announcements — not endorsements);
- **endpoint liveness probes refreshed every six hours** — announcements outlive their nodes, so the directory knows which are actually alive, and how fast;
- a **cross-provider price index** — hundreds of models, priced in sats per token, sorted cheapest-first.

All of it is agent-readable by design: `llms.txt` opens with a one-fetch start — /live/master.json, every source merged into one row shape, and the JSON routes are the product, not an export. Community ratings — the reputation layer that addresses the one risk a payment rail can't — are the directory's next phase, and the sovereign toolkit for it is starting to appear: **web-of-trust reputation** (Relatr computes trust ranks; the Wotrlay relay consumes them to rate-limit by reputation) and **signed server reviews** (the emerging CEP-24 convention). It is early and unproven at scale — the harder half of a keypair-based directory, named honestly below — but it is the piece that lets agents decide, by their own trust graph, whom to believe.

**[Browse the live Agent Marketplace ↗](https://marketplace.bitcoineconomy.ai)**

---

## How an agent finds a service

Before an agent can pay for a service, it has to *find* it — know the service exists, learn what it does and what it costs, and know how to reach it. For a person that's a search box. For an autonomous agent it's a protocol question, and there's more than one answer competing to be the default. This is the plumbing under the directory above, and the choices differ in ways that matter.

The options fall into a few shapes:

- **A central registry.** A provider registers its service in a directory — proving it controls a GitHub account or a DNS record to claim its name — and agents query the registry. This is how the official model-tool registries work: organized, searchable, and curated by whoever runs it.
- **A well-known file on a domain.** The service publishes a small description at a predictable path on its website (a `.well-known` file) over HTTPS. An agent that knows the domain fetches the file to learn what's on offer. Identity here is the domain name.
- **Aggregators.** Third parties crawl and list services in their own databases — convenient, but you're trusting whatever they scraped and however they rank it.
- **Payment-only endpoints.** A Lightning Address (`name@domain`) or a BOLT12 offer tells an agent *where to pay*, beautifully — but carries no description of *what the service does*. It's an address, not a catalog.
- **Signed announcements on Nostr.** The service publishes a signed event to relays: "here's what I do, here's my price, reach me at this key." Agents subscribe to the relays and find it. Identity is a keypair, not a domain or an account. This is the path the Bitcoin agent stack uses — the open DVM conventions, and now [[contextvm|ContextVM]]'s CEP-6 announcements (see [[Stack|The Stack]] §4).

Two things are worth pulling out of that list.

**Almost everywhere, "what it does," "what it costs," and "who vouches for it" live in separate places.** A registry tells you a service exists but says nothing about price — so a paid service describes its pricing in prose, or out of band. A Lightning Address handles price perfectly and describes no service. You end up stitching two or three systems together. The exception is the Nostr path: with CEP-6 and CEP-8, a service's capabilities, its price, and its signed identity arrive as **one object**, discoverable in a single query. That's the difference between a *directory* (a list of what exists) and a *market* (where what-it-does, what-it-costs, and who-signed-for-it travel together). The live directory above is built on exactly this.

**The deeper difference isn't technical — it's who owns the name.** And it's honest on both sides.

- With a registry, your name is verified through a GitHub account or a DNS record. Your identity is *rented* — from a platform, or a registrar.
- With a `.well-known` file, your identity *is* your domain: rented from a registrar, vouched for by a certificate authority, revocable by either, seizable by a jurisdiction with authority over them.
- With a keypair on Nostr, your identity is something you generated yourself. Nobody issued it; there's no registrar to revoke it.

That axis — *own your name, or rent it* — is the same one this site argues about money, one layer up. The full argument is in [[Independence-Doctrine|The Independence Doctrine]] (its naming-sovereignty section); the short version is that an agent which settles in Bitcoin but can only be reached at a rented name has moved the chokepoint, not removed it.

**But sovereignty here has a real cost, and skipping it would be dishonest.** A central registry's curation is a *feature*: someone reviews submissions, name-verification blocks impersonation, and when a service turns malicious the operator delists it and every agent is protected at once. Self-issued keys throw that away — if anyone can announce anything, spam and impersonation are the default. The answer on the sovereign side is to replace one central gatekeeper with *per-agent* reputation — trust-scoring, web-of-trust relays, and signed reviews (what the directory's reputation layer above is being built on). That's coherent, and arguably the right shape, but it's unproven at scale and pushes real work onto every agent. **The sovereign discovery layer has the harder problem** — and saying so is what keeps the rest of this honest.

Where does that leave an agent today? The registry-and-domain world is enormous and shipping; the keypair-and-relay world is early — an existence proof more than a finished system. But both sides have independently concluded the same thing: an agent needs to learn what a service offers *before* it connects. They reached for opposite foundations to do it, and which one wins where is a live, watchable question — the running record is in [[Field-Notes|Field Notes]].

---

## Where things live in The Market

The Market is the third part of the site — where an agent does business. It has three surfaces alongside this directory:

- **[[Treasury]]** — what an agent *holds*, and how it operates at the border with the dollar economy: the reserve-vs-operational-float split, compliance-at-the-gateway, and the risks that bite at machine tempo.
- **[[Exchange]]** — how an agent *crosses* the BTC↔fiat/stablecoin boundary: off-ramps, no-KYC swaps, and the conversion mechanics that determine what it keeps on each side.
- **[[Services]]** — what an agent *buys and sells* for Bitcoin, and the Bitcoin-native payment mechanisms (L402, Cashu-as-API-key, NWC) — a few curated venues on-site, the full set in the live directory above.

---

> [!info] Where to read next
> **More in The Market** (this section):
> - **[[Treasury]]** — what an agent holds, and what it must accept at the boundary.
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

**2026-07-16 (ContextVM/CEP-8 pass, handoff §7 + decision #2):** added the "How an agent finds a service" discovery explainer here (placement: gateway section — discovery is the Marketplace's domain, the gateway was slim, and it's a dual-track exception so no FA twin needed) — plain-language, non-partisan, landing on the own-vs-rent tradeoff + the honest "sovereign discovery has the harder problem" concession, cross-linking Doctrine §naming-sovereignty + Stack §4. And relatr/Wotrlay/CEP-24 land here as the **reputation layer** (not as directory entries — they're reputation infra, not buyable-via-API services, so they fail the directory inclusion bar; the honest home is this gateway's "next phase" reputation paragraph + the directory Phase-2 roadmap). Existence-proof framed throughout. `_Decisions` 2026-07-16.

This is the slim gateway that replaced the old "The Marketplace" overview (2026-06-13 IA fix). The old page's treasury/compliance/boundary content moved to [[Treasury]] under an honest title; the redundant Exchange/Services rollup was cut; and the page's job is now to foreground the live directory — the actual "Marketplace" — which previously hid two clicks down under Services. The section is now **The Market** (the triad: The Case · The Stack · The Market). Inbound `/marketplace` links still resolve here; the in-body cross-links across other surfaces get repointed to [[Treasury]] in the Pass-B follow-up.
