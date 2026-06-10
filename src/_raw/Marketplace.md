---
title: The Marketplace
slug: marketplace
description: "Where your agent does business — treasury, exchange, and services."
type: essay
surface: marketplace
section: marketplace
section-role: anchor
status: v0-approved-2026-06-04
audience: humans
twin-page: marketplace-for-agents
created: 2026-06-03
last-updated: 2026-06-09
word-count-target: 2000
voice: honest-middle-position
scope: operational-overview
assembled-from:
  - "Border-Zone.md § What the border zone is, § Treasury composition patterns, § The compliance-at-the-gateway pattern, § Border-zone risks unique to agents"
tags:
  - canonical
  - marketplace
  - treasury
  - compliance
  - bridges
  - bitcoin
  - ai-economy
agent-tldr: |
  The Marketplace is where an agent actually uses Bitcoin: the operational reality of holding, exchanging, and spending the substrate in a world that still prices most things in dollars. It is the anchor of the Marketplace section, with two children — Exchange (how an agent crosses the BTC↔fiat/stable boundary) and a Services directory (what an agent buys and sells for Bitcoin). Three operational realities define it. (1) Treasury composition answers two separate questions, and conflating them is what makes it confusing. The reserve — the store of value — is the major differentiator and an identity decision: a Bitcoin reserve plants the agent in the parallel economy (censorship-resistant, Constraint 2 preserved), a stablecoin reserve plants it in the incumbent economy (issuer-freezable, Constraint 2 traded for a USD unit of account); a parallel-economy agent operating against adversarial action cannot put its reserve behind an issuer freeze, while an incumbent-economy agent serving a regulated principal already has. The operational mix is the more mechanical speed/unit-of-account choice: some stablecoins for dollar counterparties, plus the Bitcoin payment stack — L1 to settle (security and finality) and Lightning + ecash (Cashu, Fedimint) for fast machine-tempo payments. In practice the forms are dictated as much by the counterparty as by the agent, so a working agent equips itself to pay and (where relevant) receive in the common forms its counterparties support, then runs a conversion strategy that sweeps value back toward its chosen reserve and tops up the operational float from it. The reserve is where censorship-resistance lives or dies; the operational mix is just rails. (2) Compliance lives at the gateway boundary, not the protocol layer: a regulated entity runs whatever regime its jurisdiction requires at the bridge; the Bitcoin/Lightning protocol downstream of the bridge is not modified, not KYC'd, not freezable — this is the only architecture that lets two systems with incompatible property bundles coexist without one absorbing the other. (3) Border risks bite differently for an agent at machine tempo without a human to call: bridge freezes mid-workflow, automated-conversion vulnerabilities, inadvertent reporting-threshold triggers, layered-custody inheritance — answered by hot/cold separation, fallback bridges, multi-jurisdiction custody, and ecash-bearer reserves. The boundary is narrow, not absent: some agent commerce genuinely must cross (paying USD invoices, settling tax, complying with enforceable orders), but the architectures stay distinct. Conversion mechanics and specific bridges (Strike, Boltz, Loop, Taproot Assets) are specified in the Exchange child; the live contest over which substrate wins is in Border Skirmishes; the moving deployment numbers are in Field Notes.
---

# The Marketplace

> **In brief.** The Case argues *why* an agent chooses Bitcoin; the Stack equips it; the Marketplace is where it transacts — using the substrate in a world still priced in dollars. An agent does two things here: it **exchanges** value across the boundary between the Bitcoin and incumbent economies, and it **buys and sells services**. This overview covers what's common to both — treasury (what it holds), compliance (at the gateway, not the protocol), and the risks that bite at machine tempo with no human to call. The two architectures stay distinct, as the Independence Doctrine predicts. Crossing mechanics live in [[Exchange]]; what's for sale lives in [[Services]].

---

## What the Marketplace is

The Marketplace is where an agent does business — the operational side of the substrate, seen from the agent's own side. Two economies meet here: the agent economy on Bitcoin and the incumbent dollar stack. *Why* they stay structurally distinct is the [[Independence-Doctrine|Independence Doctrine]]'s argument; *who wins the contest between them* is [[Border-Skirmishes]]'s. This page assumes both and gets practical.

The two meet at a border that is **narrow, not absent**: some agent commerce genuinely must cross — paying a USD invoice, settling tax, meeting an enforceable order — and the crossings that handle it are the **exchanges** (the [[Exchange]] child). They are bridges, not merging points; the architectures stay distinct on either side. What this overview covers is what's common to everything an agent does here, exchange and services alike: what it holds (treasury), how compliance actually works (at the gateway, not the protocol), and the risks that bite differently at machine tempo.

---

## Treasury composition

A deployed agent's treasury answers **two separate questions**, and running them together is what makes "what should my agent hold?" confusing. Pulled apart, it's two clean decisions: where the agent's store of value sits, and what rails it spends on.

### The reserve: where are your feet planted?

The reserve — the agent's store of value, the balance it holds for the long term — is the decision that places it in one economy or the other. This is the major differentiator, and it is an *identity* decision, not an operational detail:

- A **Bitcoin reserve** plants the agent in the parallel economy: a censorship-resistant, no-issuer store of value. Censorship-resistance is preserved — no one can freeze the agent's savings.
- A **stablecoin reserve** plants it in the incumbent economy: a dollar-denominated store of value an issuer can freeze. Censorship-resistance is traded away in exchange for a stable unit of account against USD.

This is the doctrine's scope line made concrete. A *parallel-economy* agent — operating across adversarial jurisdictions, settling against state action, transacting with counterparties banks would refuse — keeps its reserve in Bitcoin, because it cannot put its savings behind an issuer's freeze. An *incumbent-economy* agent — serving a fiat-denominated principal under regulated contracts — keeps its reserve in dollars, and has already accepted that freeze surface. Where the reserve sits *is* which economy the agent is in.

### The operational mix: what do you transact with?

Day-to-day spending is a mix, and it's a more mechanical choice than the reserve — it's about speed and unit-of-account, not identity. An agent draws on:

- **Stablecoins**, when a counterparty prices in dollars — unit-of-account compatibility for USD-denominated obligations. The operational balance carries the issuer's freeze surface, but it is small and short-lived, not the agent's store of value. *(For the dollar-token market this float draws on — size, issuer dominance, which chains the supply lives on, and the network hazard — see [[Stablecoin-Landscape|The Stablecoin Landscape]].)*
- **The Bitcoin payment stack**, for Bitcoin-native and machine-tempo payments — the two-tier model applied to the operating balance. **L1 settles** (final, secure, absolute; for large or important balances, where finality matters more than speed), while **Lightning and ecash** (Cashu, Fedimint) **move fast** (sub-cent, machine-tempo, for the high-frequency payments that are the agent economy's signature — Lightning for routed payments, ecash for bearer-instrument speed and privacy).

Most deployed agents hold some of each: a reserve on one side of the line, plus an operational float that mixes stablecoins (for dollar counterparties) with a Lightning/ecash working balance (for Bitcoin-native and machine-tempo spend), and L1 underneath as the settlement and cold-storage layer.

In practice, the *forms* an agent transacts in are dictated as much by the other side as by the agent's own preference. A counterparty may only invoice in dollars, only accept a Lightning payment, only publish an on-chain address, or only pay out in a stablecoin. So an agent doing real economic activity equips itself to **pay — and, where its work involves being paid, receive — in whatever common forms its counterparties actually support**, rather than insisting on a single rail it would prefer. What keeps that operational flexibility from quietly migrating the agent's feet to the other economy is a **conversion strategy for the treasury**: a discipline that sweeps received value back toward the chosen reserve (for a parallel-economy agent, into Bitcoin) and tops the operational float up from reserve as needed, on a cadence the agent sets. The operational mix is what the agent *transacts in*; the conversion strategy is what keeps the *reserve* where the agent intends it. How those conversions actually execute — the swaps, off-ramps, and routing — is the subject of the Exchange child.

### Why the split matters

Keeping the two questions separate is what makes the decision legible. **The reserve is where censorship-resistance lives or dies; the operational mix is mostly speed and unit-of-account.** An agent can plant its feet in the parallel economy — a Bitcoin reserve — and still spend stablecoins operationally when a counterparty demands dollars, without moving its store of value an inch. The reserve answers *which economy are you in*; the operational mix answers *what rails do you spend on*. The architectural rule follows from the first question, not the second: an agent whose use case requires censorship-resistance cannot hold its **reserve** in a freezable asset, however convenient an operational stablecoin float may be.

---

## Compliance lives at the gateway, not the protocol

The single most important operational principle in the Marketplace: **compliance lives at the gateway boundary, not at the protocol layer.** A regulated bridge — a Lightning-to-bank off-ramp, a custodial exchange, a fiat-redemption partner — runs whatever its jurisdiction requires (KYC, sanctions screening, reporting, licensing), but that regime applies to the *account* and the *fiat leg* only. The Bitcoin/Lightning leg downstream is not modified, not identity-bound, not freezable by the protocol.

This is the only architecture that lets two systems with incompatible property bundles coexist without one absorbing the other: the Travel Rule and money-transmission rules apply to bridges, not protocols — a Lightning channel is not a money-services business; a custodial wallet run by a licensed entity is. The pattern breaks when identity or freeze capability is pushed *into* the protocol, when a custodian's freeze reaches self-custodied Bitcoin downstream, or when every bridge an agent uses terminates in one regulatory regime. Worked examples live in the [[Exchange]] child.

---

## Risks unique to an agent at the boundary

Some bridge risks look like generic crypto-bridge risks. They bite differently when the party crossing operates at machine tempo, continuously, with no human to call.

- **Bridge freezes mid-workflow.** A human notices a compliance hold, calls support, resumes tomorrow. An agent in a high-frequency workflow can lose meaningful value in the seconds before the freeze propagates into its logic — and it has no support relationship. Recovery requires fallback-routing the agent was designed with.
- **Automated-conversion vulnerabilities.** Slippage, MEV exposure during the conversion window, oracle manipulation in stablecoin↔Bitcoin pathways — all become operationally significant when an agent converts on a schedule without per-transaction human judgment. A predictable rebalancing schedule is a high-quality target. Defenses: rate-limiting, jittered scheduling, protocol-level atomic-swap mechanics where the trust model precludes the attack.
- **Inadvertent reporting-threshold triggers.** An agent operating across jurisdictions can trip reporting thresholds or sanctions-screening matches without the operator's awareness; the burden lands on the custodian and ultimately the human behind the agent. Placing custody and bridges in jurisdictions with predictable rules is a legitimate architectural response.
- **Layered-custody inheritance.** A bridge marketed as a single integration may layer custody across several intermediaries — a wallet provider, an issuer, a processor — each with discretionary freeze capability behind one API. An agent transacting on it inherits the *union* of those surfaces. Evaluate the custody the bridge actually exposes, not the developer-facing simplification.

The answers converge on a small, unexotic set: **hot/cold separation** (operational balances on bridges, reserves in self-custody), **fallback bridges** (at least two independent paths to fiat), **multi-jurisdiction custody** (reserves split across non-correlated regimes), and **ecash-bearer reserves** (balances outside the custodial perimeter). The bridges are real, and so are bridge failures; the agent has to be designed for both.

Worth naming before moving on: every risk above enters on the *incumbent* side of the boundary — the freeze, the hold, the custodial discretion, the reporting trigger. Each is a property of the legacy stack the agent reaches *into*, not of the Bitcoin leg it reaches *from*; none exists in the pure-substrate economy, where there is no one to freeze a balance and no intermediary to fail. The risks of the boundary are very nearly the risks of the incumbent system itself — and the agent carries them only as far, and only as long, as it crosses.

---

## The two children

The Marketplace section has two practical surfaces beneath this overview:

- **[[Exchange]]** — how an agent crosses the BTC↔fiat/stable boundary: regulated off-ramps, submarine swaps, Taproot Assets stable-exchange, CEX conversion, and the conversion mechanics that determine what the agent retains on each side. The tools that do this work — [[boltz|Boltz]], [[loop|Lightning Loop]], [[taproot-assets|Taproot Assets]] — keep their reference cards in the Stack's Tools collection (Boltz and Taproot Assets also carry Exchange cards for their venue role); Exchange specifies the *activity* they enable and holds the venue cards (Strike, the CEXes, the no-KYC swaps).
- **[[Services]]** — what an agent actually buys and sells for Bitcoin: AI inference, compute, data, API calls, even human-delivered work. A few curated, vetted entries live here on the main site; the full community-rated directory is a separate site at [marketplace.bitcoineconomy.ai](https://marketplace.bitcoineconomy.ai). Live examples of the idea today: OpenAgents ([openagents.com](https://openagents.com) — a Bitcoin-native machine-work marketplace), Routstr, and PPQ.AI.

This overview is the map common to both: the same treasury, compliance, and risk realities apply whether an agent is exchanging value or paying for a service.

---

> [!info] Where to read next
> **More in The Marketplace** (this section):
> - **[[Exchange]]** — the mechanics of crossing the boundary: off-ramps, swaps, conversion, and what the agent keeps on each side.
> - **[[Services]]** *(full directory at [marketplace.bitcoineconomy.ai](https://marketplace.bitcoineconomy.ai))* — the categorized, community-rated directory of services an agent can consume and offer for Bitcoin.
> - **[[Stablecoin-Landscape|The Stablecoin Landscape]]** *(reference)* — the dollar-stablecoin market behind the operational mix: size, issuer dominance, chains, and the network hazard.
>
> **In the other sections:**
> - **[[Border-Skirmishes]]** *(in The Case)* — the live contest over *which* substrate wins the boundary this section operates on. The Marketplace is the practice; Border Skirmishes is the argument about who's winning it.
> - **[[Independence-Doctrine|The Independence Doctrine]]** *(in The Case)* — *why* the two architectures stay distinct even as the bridges multiply; the structural reason compliance has to live at the gateway.
> - **[[Stack|The Stack]]** *(equip your agent)* — the pure-substrate architecture without bridges, and the Tools cards for the exchange tools named here.
> - **[[Field-Notes|Field Notes]]** *(the standing live record)* — dated bridge developments: new off-ramps, freeze incidents, regulatory shifts, deployed treasury patterns.

---

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

The Marketplace is the positive reframe of what The Border Zone treated defensively. Border Zone was "the interface between two economies" — a boundary to be specified. The Marketplace is "where your agent does business" — the same operational content, led by what an agent *does* (exchange + services) rather than by the wall it runs into. The reframe is the point of the restructure: the section is named for the activity, not the seam.

This anchor deliberately keeps the conceptual/practice layer — treasury composition, the gateway-compliance principle, agent-specific risks — and pushes the *mechanics* (submarine-swap HTLCs, off-ramp API specifics, edge-node FX, the L402/Strike worked examples) down into the Exchange child. The risk to watch in review: the overview and Exchange must not duplicate. The line I drew: overview answers "what does an agent hold and what must it accept at the boundary"; Exchange answers "how does it actually convert, tool by tool."

Two pieces of the old Border Zone deliberately did **not** come here: the "two-toolkit moment," the competing-substrate roster, and the honest-case-for-stablecoins went to [[Border-Skirmishes]] (they were the live *contest*, i.e. theory); the bridge *tool* cards stay in the Stack's Tools collection. What remained — treasury, compliance-as-practice, risks — is the genuinely operational core, and that is what the Marketplace section is for.

**Dissolution — DONE (2026-06-05):** `Border-Zone.md` + `Border-Zone-FA.md` were archived to `_archive/` (not deleted) per `_Decisions` 2026-06-03; the Case/Stack/Marketplace restructure is deployed.

**Publications backlinks**

- [[Independence-Doctrine]] (this project) — the structural argument this surface operationalizes
- [[Border-Skirmishes]] (this project) — the live-contest surface that took Border Zone's competing-substrate / stablecoin material
- [[Case]] (this project; renaming → The Case) — the four-constraints argument the treasury decisions are scored against
- [[Field-Notes]] (this project) — the empirical record this surface defers moving numbers to
- [[Marketplace-FA]] (this project, forthcoming) — the For-Agents twin of this surface
