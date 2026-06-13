---
title: Treasury & the Boundary
slug: treasury
description: "What an agent holds, and how it operates at the border with the dollar economy — treasury, gateway-compliance, and boundary risk."
type: essay
surface: treasury
section: marketplace
section-role: reference
status: v1-2026-06-13
audience: humans
twin-page: treasury-for-agents
created: 2026-06-03
last-updated: 2026-06-13
word-count-target: 2000
voice: honest-middle-position
scope: treasury-and-boundary-operations
assembled-from:
  - "Border-Zone.md § What the border zone is, § Treasury composition patterns, § The compliance-at-the-gateway pattern, § Border-zone risks unique to agents"
tags:
  - canonical
  - treasury
  - compliance
  - bridges
  - bitcoin
  - ai-economy
agent-tldr: |
  Treasury & the Boundary is the first decision an agent makes before it transacts: what to hold. It resolves along two independent axes, and conflating them is the primary treasury error. (1) The reserve — the store of value — is the major differentiator and an identity decision: a Bitcoin reserve plants the agent in the parallel economy (censorship-resistant, Constraint 2 preserved), a stablecoin reserve plants it in the incumbent economy (issuer-freezable, Constraint 2 traded for a USD unit of account); a parallel-economy agent operating against adversarial action cannot put its reserve behind an issuer freeze, while an incumbent-economy agent serving a regulated principal already has. (2) The operational mix is the more mechanical speed/unit-of-account choice: some stablecoins for dollar counterparties, plus the Bitcoin payment stack — L1 to settle, Lightning + ecash (Cashu, Fedimint) for fast machine-tempo payments. Forms are dictated as much by the counterparty as by the agent, so a working agent equips to pay and receive in the common forms its counterparties support, then runs a conversion strategy that sweeps value back toward its chosen reserve. The reserve is where censorship-resistance lives or dies; the operational mix is just rails. Why the two economies stay distinct under bridging — compliance at the gateway, not the protocol — is the Independence Doctrine (its D1 mechanism); the conversion mechanics and the machine-tempo risks of crossing are in Exchange; the live directory of services is the Marketplace; the live contest over which substrate wins is in Border Skirmishes; the moving deployment numbers are in Field Notes.
---

# Treasury & the Boundary

> **In brief.** Before an agent exchanges or spends, it has to decide what to **hold** — and that's two clean decisions, not one: the **reserve** (its store of value, and *which economy it's in* — a Bitcoin reserve is censorship-resistant, a stablecoin reserve is issuer-freezable) and the **operational mix** (the rails it transacts on day to day). This page is that decision. *Why* the two economies stay distinct under bridging — compliance at the gateway, not the protocol — is [[Independence-Doctrine|the Independence Doctrine]]; the crossing mechanics and the risks of crossing are in [[Exchange]]; the live directory of what's for sale is the [[Marketplace]].

---

## What this is

This is the first decision an agent makes before it transacts: **what to hold.** It straddles two economies — the agent economy on Bitcoin and the incumbent dollar stack — and where it parks its value decides which one it's really in. *Why* the two economies stay structurally distinct (and why compliance lives at the bridge, not in the protocol) is the [[Independence-Doctrine|Independence Doctrine]]'s argument; *who wins the contest between them* is [[Border-Skirmishes]]'s. This page assumes both and gets practical about the holding decision itself.

The two meet at a border that is **narrow, not absent**: some agent commerce genuinely must cross — paying a USD invoice, settling tax, meeting an enforceable order. The mechanics of crossing, and the risks unique to crossing at machine tempo, live in the [[Exchange]] page; this page is about what an agent holds on each side of that border.

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

In practice, the *forms* an agent transacts in are dictated as much by the other side as by the agent's own preference. A counterparty may only invoice in dollars, only accept a Lightning payment, only publish an on-chain address, or only pay out in a stablecoin. So an agent doing real economic activity equips itself to **pay — and, where its work involves being paid, receive — in whatever common forms its counterparties actually support**, rather than insisting on a single rail it would prefer. What keeps that operational flexibility from quietly migrating the agent's feet to the other economy is a **conversion strategy for the treasury**: a discipline that sweeps received value back toward the chosen reserve (for a parallel-economy agent, into Bitcoin) and tops the operational float up from reserve as needed, on a cadence the agent sets. The operational mix is what the agent *transacts in*; the conversion strategy is what keeps the *reserve* where the agent intends it. How those conversions actually execute — the swaps, off-ramps, and routing — is the subject of the [[Exchange]] page.

### Why the split matters

Keeping the two questions separate is what makes the decision legible. **The reserve is where censorship-resistance lives or dies; the operational mix is mostly speed and unit-of-account.** An agent can plant its feet in the parallel economy — a Bitcoin reserve — and still spend stablecoins operationally when a counterparty demands dollars, without moving its store of value an inch. The reserve answers *which economy are you in*; the operational mix answers *what rails do you spend on*. The architectural rule follows from the first question, not the second: an agent whose use case requires censorship-resistance cannot hold its **reserve** in a freezable asset, however convenient an operational stablecoin float may be.

---

> [!info] Where to read next
> **More in The Market** (this section):
> - **[[Exchange]]** — the mechanics of crossing the boundary: off-ramps, swaps, conversion, and what the agent keeps on each side.
> - **[[Marketplace|The Marketplace]]** — the live, self-refreshing directory of services an agent can consume and offer for Bitcoin.
> - **[[Stablecoin-Landscape|The Stablecoin Landscape]]** *(reference)* — the dollar-stablecoin market behind the operational mix: size, issuer dominance, chains, and the network hazard.
>
> **In the other sections:**
> - **[[Border-Skirmishes]]** *(in The Case)* — the live contest over *which* substrate wins the boundary. Treasury & the Boundary is the practice; Border Skirmishes is the argument about who's winning it.
> - **[[Independence-Doctrine|The Independence Doctrine]]** *(in The Case)* — *why* the two architectures stay distinct even as the bridges multiply; the structural reason compliance has to live at the gateway.
> - **[[Stack|The Stack]]** *(equip your agent)* — the pure-substrate architecture without bridges, and the Tools cards for the exchange tools named here.
> - **[[Field-Notes|Field Notes]]** *(the standing live record)* — dated bridge developments: new off-ramps, freeze incidents, regulatory shifts, deployed treasury patterns.

---

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

This is the old Marketplace overview, renamed and trimmed to what it actually is — the treasury decision. The 2026-06-13 IA fix split the old `/marketplace` page (the directory took the **Marketplace** name; the section is now **The Market**) and moved the treasury/compliance/boundary content here. The 2026-06-13 trim then pushed the **compliance-at-the-gateway** mechanism back to its real home — it's the [[Independence-Doctrine|Independence Doctrine]]'s argument (the D1 mechanism), with the operational version in [[Exchange]] — and the **machine-tempo boundary risks** to [[Exchange]] (where crossing lives), leaving this page focused on the reserve/operational-mix decision.

The line with Exchange: this page = *what an agent holds*; Exchange = *how it crosses, and the risks of crossing*. Don't duplicate.

**Publications backlinks**

- [[Independence-Doctrine]] (this project) — the structural argument this surface operationalizes
- [[Border-Skirmishes]] (this project) — the live-contest surface that took Border Zone's competing-substrate / stablecoin material
- [[Case]] (this project) — the four-constraints argument the treasury decisions are scored against
- [[Field-Notes]] (this project) — the empirical record this surface defers moving numbers to
- [[Treasury-FA]] (this project) — the For-Agents twin of this surface
