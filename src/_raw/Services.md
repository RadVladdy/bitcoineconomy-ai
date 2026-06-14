---
title: Services
slug: services
description: "The services an agent buys and sells for Bitcoin."
type: essay
surface: services
section: marketplace
section-role: child
status: v0-approved-2026-06-04
audience: humans
twin-page: services-for-agents
created: 2026-06-03
last-updated: 2026-06-09
word-count-target: 1800
voice: honest-middle-position
scope: services-layer
external-directory: marketplace.bitcoineconomy.ai
tags:
  - canonical
  - marketplace
  - services
  - l402
  - cashu
  - a2a
  - bitcoin
  - lightning
agent-tldr: |
  Services is the "what" layer of the agent economy — the actual services an agent buys and sells for Bitcoin, as opposed to Exchange (converting money forms) or the Stack (the substrate). It is two-sided: an agent both consumes services (AI inference, compute, data feeds, API calls, storage, and other agents' work) and can offer its own. The Bitcoin-native payment mechanisms — how an agent actually pays for a service — are: L402 (HTTP 402 + a Lightning invoice + a reusable macaroon credential — sats converted into machine-readable access), Cashu-as-API-key (a bearer ecash token that IS the API key, the Routstr pattern), and NWC (Nostr Wallet Connect) for letting an agent control a wallet to pay without holding its keys. These are Bitcoin-native and permissionless at the payment layer. Deployed proof-points an agent can use today: Routstr (Cashu-as-API-key reverse proxy in front of LLM APIs, Nostr discovery), PPQ.AI (pay-per-query AI over Lightning/L402), OpenAgents (openagents.com — a Bitcoin-native machine-work marketplace where sovereign agents sell compute and are paid over Lightning). Beyond A2A venues, off-the-shelf real-world services matter on the consume side, but most that "accept Bitcoin" only do so via human checkout (a processor redirect, not agent-drivable); the agent-automatable pair is Mullvad (privacy VPN, paid over Lightning against an account number, no KYC) and Bitrefill (a Lightning gift-card/top-up bridge with a real payment API, Thor) — Bitrefill being the bridge to the long tail of brands that don't take Bitcoin directly. The page hosts a few curated, vetted entries; the full categorized directory is live at marketplace.bitcoineconomy.ai — a curated registry behind an agent-drivable-API inclusion bar, plus live Nostr announcement data with 6-hourly endpoint liveness probes and a cross-provider sats price index, published agent-readable (llms.txt + JSON routes); community ratings are the directory's next phase. Honest caveat: paying over a sovereign rail does not guarantee the service delivers — service-delivery/quality/reputation risk is real and is what a ratings directory exists to address; the payment rail is sovereign, the counterparty's performance is not. This layer is where the agent economy stops being a premise and becomes concrete commerce.
---

# Services

> **In brief.** Exchange moves between money forms; **Services is about spending and earning** — the "what" layer, where an agent buys real things for Bitcoin (AI inference, compute, data, API calls, other agents' work) and can sell its own. It's two-sided: agents are both customers and providers. This page covers how an agent pays (the Bitcoin-native mechanisms — L402, Cashu-as-API-key, NWC), what's for sale, how it offers its own, a few curated venues, and the full live directory at its own site, [marketplace.bitcoineconomy.ai](https://marketplace.bitcoineconomy.ai). This is where the agent economy stops being a premise and becomes commerce: agents paying agents, at machine tempo, in Bitcoin.

---

## What Services is

[[Case|The Case]] argues *why* an agent chooses Bitcoin; [[Stack|The Stack]] *equips* it; [[Exchange]] lets it *cross between money forms*. Services is the **destination** — the actual economic activity the whole stack exists to enable. An autonomous agent that holds value but never spends or earns it is a wallet, not an economic actor. Services is where it acts.

It is **two-sided** by nature:

- **Consume.** An agent buys what it needs to do its job — inference from a model API, compute for a task, a data feed, a paid API call, storage, or a service performed by another agent.
- **Offer.** An agent sells what it produces — its own inference, analysis, monitoring, or task execution — to other agents or to humans, and gets paid in Bitcoin.

The two sides together are what "the agent economy" actually means at ground level: not agents *using* money, but agents *transacting* — buying and selling from each other (agent-to-agent, A2A) at a frequency and granularity no human-mediated market produces.

---

## How an agent pays for a service

This is the part that is genuinely agent-native, and it is what distinguishes Bitcoin-stack services from a human typing a card number. The Bitcoin-native mechanisms:

- **L402.** The canonical pattern. An agent requests a paid resource; the server answers `HTTP 402 Payment Required` with a Lightning invoice; the agent pays; it retries with cryptographic proof; the server issues a **scoped credential** — a macaroon carrying caveats like expiry and rate limit — that the agent reuses across the session. The payment leg is permissionless at the protocol layer; the conversion is from **sats into machine-readable capability**. For high-frequency, pay-per-call workflows this is the machine-tempo standard. (The tooling that implements it — `lnget`, Aperture, `lightning-agent-tools` — lives in [[Stack|The Stack]].)
- **Cashu-as-API-key.** A bearer ecash token *is* the access credential. The agent holds a Cashu token; presenting (or spending) it grants the service; no account, no identity, no per-call invoice round-trip. This is the **Routstr** pattern — the token is the API key — and it is the lightest-weight, most private way for an agent to pay for a service.
- **NWC (Nostr Wallet Connect).** Lets an agent control a wallet to *make* these payments without holding the wallet's keys directly — the permissioning layer behind autonomous service payment.

All three are permissionless at the payment layer: the service operator runs whatever access policy it likes, but no intermediary stands between the agent's sats and the payment.

---

## What's for sale

The categories of service an agent consumes, roughly in order of how deployed they are today:

- **AI inference** — pay-per-query access to LLM and other model APIs (the most mature category; see Routstr and PPQ.AI below).
- **Compute** — task execution, rendering, training cycles billed per use.
- **Data** — feeds, datasets, real-time signals, paid lookups.
- **API calls** — any metered service behind an L402 paywall.
- **Storage and infrastructure** — paid, metered, machine-accessible.
- **Other agents' work (A2A)** — the frontier: an agent subcontracting a task to another agent and settling in Bitcoin. This is the category that turns a collection of tools into an economy.

---

## Agents as providers

The marketplace is two-sided, and the sell side is underbuilt relative to the buy side — which makes it an opportunity. An agent that can *offer* a service for Bitcoin needs three things: a way to gate the service on payment (an L402 paywall via Aperture, or a Cashu-token check), a way to be discovered (Nostr-based discovery is the deployed pattern — it is how Routstr's providers are found), and a payout path to its treasury (covered in [[Treasury]] and [[Exchange]]). An agent that both consumes upstream services and sells its own output is a full economic participant — and the same payment mechanisms work in both directions.

---

## Featured services *(curated)*

A few vetted, deployed venues an agent can use today — the proof that this layer is real, not hypothetical. *(The full, categorized, liveness-probed set lives in the directory below.)*

- **[[openagents|OpenAgents]]** — a Bitcoin-native marketplace for *machine work*: sovereign agents hold Nostr identities and self-custodial Lightning wallets, sell spare compute via the Pylon node / Autopilot app, and are paid in Bitcoin over Lightning, across five interlocking markets (Compute, Data, Labor, Liquidity, Risk). The closest existing model for this section's full-directory shape; a clean Bitcoin-substrate fit.
- **[[routstr|Routstr]]** — a Bitcoin-powered AI-inference marketplace: a payment-gated reverse proxy in front of OpenAI-compatible LLM APIs, paid per request in **Cashu ecash (the token is the API key)**, settling over Lightning, with Nostr-based provider discovery. The clearest deployed instance of an agent buying a service on the Bitcoin stack; HRF Top-15 Freedom Tech Project of 2025.
- **[[ppq-ai|PPQ.AI]]** — pay-per-query access to AI models over Lightning / L402; an agent (or a human) pays per call with no subscription or account. A live A2A-adjacent proof-point.
- **[[maple|Maple AI]]** — **private inference**: every prompt runs inside a TEE with end-to-end encryption, provably unreadable to the provider, behind an OpenAI-compatible API (Maple Proxy). Subscription-based, **Bitcoin accepted** (yearly plans, 10% discount) — the operator funds the account and the agent drives the API. The privacy-axis counterpart to the sats-per-call venues above.

Each links to its card in this section's **Services** collection — the same tile-and-page format as the Stack's Tools and the Exchange directory. The full categorized set lives in the separate live directory site below.

---

## Off-the-shelf services an agent can pay for *(curated)*

Beyond agent-to-agent venues, an agent often needs ordinary real-world services — privacy, compute, hosting, domains, storage. The honest constraint for an *autonomous* agent is **automatability**: most merchants that "accept Bitcoin" actually bounce you to a human checkout (a CoinGate or BitPay page, or an account top-up), which an agent can't drive on its own. These stand out because an agent can genuinely pay *itself* — across privacy, compute, and the long-tail bridge:

- **[[mullvad|Mullvad VPN]]** — a privacy VPN paid over **Lightning** against a random account number, with **no email and no KYC**. The cleanest direct-merchant fit on the consume side, and a model for what "a service an agent can pay for itself" looks like.
- **[[lnvps|LNVPS]]** — **compute, the agent-native way.** A Lightning VPS with **Nostr login, no KYC**, fundable over **NWC**, provisionable by **API** — an agent can stand up its own server (even a child agent) and pay for it itself. The first deployed instance of an agent buying its own infrastructure ran on LNVPS (see [[Field-Notes]]).
- **[[bitlaunch|BitLaunch]]** — **mainstream compute** (DigitalOcean/Vultr/Linode) with a real **API + SDKs** and Lightning-automated payments, no KYC — "programmable servers with programmable money" for an agent that wants big-cloud capacity paid in Bitcoin.
- **[[bitrefill|Bitrefill]]** — the **bridge**. A Lightning-native gift-card and top-up service with a purpose-built agent interface (a remote **MCP server**, alongside the raw **Thor API**) and no KYC. For the long tail of brands that don't take Bitcoin directly, an agent buys a Bitrefill credit with sats and redeems it there — and its **prepaid virtual Visa/Mastercard** products extend the same bridge to anything that takes cards, including categories the catalog itself doesn't carry. This is how the consume side reaches the rest of the digital economy without leaving Bitcoin.

Many VPN, hosting, and domain brands *do* take Bitcoin — but via human checkout, not an agent-drivable API (Vultr, for instance, routes crypto through a BitPay redirect). For raw compute, **LNVPS and BitLaunch take Lightning directly**; for everything else, **Bitrefill is the agent-automatable path**.

---

## The full directory *(separate site — `marketplace.bitcoineconomy.ai`)*

The curated entries above are deliberately few. The complete picture lives as its own **sibling site at [marketplace.bitcoineconomy.ai](https://marketplace.bitcoineconomy.ai)** — and it's **live**, not a promise. What it publishes today: a **curated registry** of services that clear one bar (an agent must be able to drive the service through a real API), the **live announcement data** from the public Nostr relays (provider and mint announcements, shown as announcements — not endorsements), **endpoint liveness probes refreshed every six hours** (announcements outlive their nodes; the directory knows which are actually alive, and how fast), and a **cross-provider price index** — hundreds of models, priced in sats per token, sorted cheapest-first. All of it is agent-readable by design: `llms.txt` opens with a three-fetch recipe, and the JSON routes are the product, not an export. Community ratings — the reputation layer that addresses the one risk a payment rail can't (below) — are the directory's next phase. Prior art shaping it: OpenAgents (its five-market structure is the closest live model), Routstr, PPQ.AI.

---

## The honest caveat: a sovereign rail is not a guarantee of delivery

Paying for a service over Bitcoin makes the *payment* sovereign — no intermediary can block it, reverse it, or freeze it. It does **not** make the *counterparty* trustworthy. The service can be slow, wrong, down, or fraudulent; the model behind a pay-per-query API can be worse than advertised; an agent-provider can take payment and underdeliver. The permissionless rail that removes the payment intermediary also removes the chargeback and the dispute desk. This is the real risk of the Services layer, and it is exactly what the directory's **reputation layer** exists to mitigate — reputation as the substitute for an intermediary's recourse. (Community ratings are the directory's next phase; its trust signals today are probed liveness and announcement freshness.) An agent operating here needs reputation signals, bounded per-transaction exposure, and ideally escrow or streaming-payment patterns for larger engagements. The rail is sovereign; the counterparty's performance is earned, not guaranteed.

---

> [!info] Where to read next
> **More in The Market** (this section):
> - **[[Treasury]]** — what an agent holds: the reserve-vs-operational mix, and how a service payout reaches the agent's reserve.
> - **[[Exchange]]** — converting what an agent earns here back toward its reserve, or funding an operational float to spend.
>
> **In the other sections:**
> - **[[Agent-Economy|The Agent Economy]]** *(in The Case)* — the premise this layer makes concrete: that agents become economic actors transacting at scale. Services is where that argument cashes out.
> - **[[Stack|The Stack]]** *(equip your agent)* — the payment tooling beneath this page: L402 (`lnget`, Aperture), Cashu, NWC, MCP servers.
> - **[[Border-Skirmishes]]** *(in The Case)* — the competitive landscape around agent-payment rails, for the substrate context behind these Bitcoin-native mechanisms.
> - **[[Field-Notes|Field Notes]]** *(the standing live record)* — the deployment record: new services, A2A milestones, what's actually transacting.

---

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Services is a child of the Market section (the section was named "Marketplace" pre-2026-06-13) and the "what" layer the whole site has been building toward — the place the agent economy becomes concrete commerce rather than a thesis. Scope decisions baked in: it is **two-sided** (consume + offer — the sell side deliberately surfaced because it's underbuilt and is where A2A becomes an economy); it **hosts the L402 material pulled out of Exchange** (L402 is service *payment*, not fiat↔BTC conversion); and it carries **a few curated entries on-site + the full community-rated directory as the separate `marketplace.bitcoineconomy.ai` build** (per `_Decisions` 2026-06-03 — a larger interactive build, scoped as v2).

The honest-caveat section is load-bearing: the project leans pro-Bitcoin, but the one thing a sovereign payment rail genuinely does *not* fix is counterparty delivery risk, and saying so is what keeps the surface credible — it also motivates the ratings directory as more than a nicety. **Scope discipline (user, 2026-06-04): these practical Market sections do not relitigate the thesis at all.** All x402 / substrate-contest framing has been removed from the body (the duplicate OpenAgents entry too); the only cross-reference to the contest is a single neutral read-next pointer to Border Skirmishes. Keep this page (and Exchange / Treasury) focused strictly on *how an agent uses Bitcoin* — the why/which-substrate arguments stay in The Case section.

**OpenAgents — verified 2026-06-04** (two inbox intelligence reports, grok + gemini): the correct entity is **OpenAgents, Inc. — openagents.com** (Christopher David / @AtlantisPleb, Austin), a Bitcoin-native machine-work marketplace — Lightning settlement (NIP-57 zaps), Nostr sovereign-agent identity (proposed NIP-SA), self-custodial BIP39 agent wallets, FROSTR threshold signing; products Autopilot / Pylon / Nexus; five markets (Compute/Data/Labor/Liquidity/Risk). A clean Bitcoin-substrate fit (not a hybrid/stablecoin play) and the closest live instance of the directory shape this section points toward — so it's a peer/ally, not a competitor. **The earlier `open-agents.dev` reference was the wrong entity** and has been corrected across the surfaces and the spine. Routstr and PPQ.AI keep their verified Tools cards. Moving metrics (funding, node counts, sats paid) deferred to Field Notes per the defer-numbers discipline.

**Services card collection — adopted (user 2026-06-04).** Services will carry **its own card collection with tiles + expanded individual pages**, mirroring `Exchanges/` and `Tools/` (the "clean extension" flagged earlier is now the plan). The on-site curated few become cards; `marketplace.bitcoineconomy.ai` becomes the scaled, community-rated version of the *same card schema*. First cards: **OpenAgents, Routstr, PPQ.AI**. Build tracked in `_Progress` (queued after Phase 6) and logged to `_Decisions` 2026-06-04 as a refinement of decision 9. Until the cards exist, this page keeps the curated prose list above. **Update 2026-06-06:** the Services cards now exist (OpenAgents, Routstr, PPQ.AI, Bitrefill, Mullvad), and a **compute/hosting** pair was added — **LNVPS** (Nostr login + Lightning + NWC + API; the agent-native standout) and **BitLaunch** (mainstream DO/Vultr/Linode capacity via API + SDKs + Lightning) — per the VPS research (inbox 2005; `_Product-Ideas-Research` 2026-06-06). Vultr / BitHost excluded by the agent-automatability filter (BitPay human-checkout / no API).

**Publications backlinks**

- [[Marketplace]] (this project) — the Market-section anchor (the live directory) this child sits under
- [[Exchange]] (this project) — the sibling child (money-form conversion vs. spending/earning)
- [[Stack]] (this project) — the payment tooling (L402, Cashu, NWC) this layer consumes
- [[Border-Skirmishes]] (this project) — the competitive landscape behind the agent-payment rails
- [[Field-Notes]] (this project) — the deployment record this surface defers to
- [[Services-FA]] (this project, forthcoming) — the For-Agents twin of this surface
