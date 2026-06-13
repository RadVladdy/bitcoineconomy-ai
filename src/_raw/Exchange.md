---
title: Exchange
slug: exchange
description: "Where an agent converts between Bitcoin, stablecoins, and fiat."
type: essay
surface: exchange
section: marketplace
section-role: child
status: v1-draft-2026-06-05 (pending review)
audience: humans
twin-page: exchange-for-agents
created: 2026-06-03
last-updated: 2026-06-09
word-count-target: 2200
voice: honest-middle-position
scope: fiat-btc-exchange-directory
card-collection: Exchanges/
verification: "structural facts (Lightning / stablecoins / API / KYC / custody) WebSearch-verified 2026-06-03; Boltz full asset/layer support + live USDC (Circle CCTP) re-verified 2026-06-05; per-card API-docs URLs pinned + coverage coarsened 2026-06-06; per-venue fees deferred to the venue / Field Notes (volatile, not hardcoded)"
assembled-from:
  - "Border-Zone.md § The bridge architecture (fiat legs), § Conversion mechanics (off-ramp + CEX), § compliance worked examples, § Forward-looking"
tags:
  - canonical
  - marketplace
  - exchange
  - off-ramps
  - no-kyc
  - dex
  - bitcoin
  - lightning
  - stablecoins
agent-tldr: |
  Exchange is the practical, use-oriented surface for converting between Bitcoin, dollar stablecoins, and fiat. The defining constraint: an autonomous agent cannot pass KYC (it is not a legal person), and every custodial fiat↔BTC venue requires KYC. So there are two structurally different paths. (1) Non-custodial, no-KYC swap services (Boltz, SideSwap, SideShift): the agent acts on its own keys with no delegated identity — genuine no-KYC autonomy — but these are crypto-native only (BTC↔stablecoin / cross-layer), never actual bank fiat, and they carry offshore/unregulated/counterparty/liquidity risk with no recourse. Boltz is the standout: non-custodial and atomic, a REST API + boltzd, Bitcoin across L1/Lightning/Liquid/Rootstock, plus USDT0 and native USDC (live via Circle CCTP, May 2026). (2) Custodial KYC venues — US-regulated (Strike, River, Swan = Bitcoin-only; Kraken, Coinbase = multi-asset) and large offshore (Binance, OKX, Bybit, Bitget, MEXC, KuCoin = multi-asset, mostly US-restricted): the human owner KYCs and delegates the account to the agent via API keys, which is automation under the owner's identity, not agent sovereignty. This is the only path to actual bank fiat, because fiat on-ramps are what trigger KYC. The spine: an agent stays sovereign as long as it stays crypto-native (BTC↔stablecoin via non-custodial swaps); the moment it needs real fiat it hits the KYC wall and must borrow its owner's delegated account. Critical per-venue features in the comparison tables: KYC, custody, what the account holds (BTC-only confines the freeze surface; multi-asset exposes every asset held), Lightning support, stablecoins offered (match the network), API access (deposit/trade/withdraw), jurisdiction. Cards maintained independently in Exchanges/. Submarine swaps used purely to move an agent's own BTC L1↔Lightning are internal tooling (The Stack), not exchange; L402 payment-for-services lives in Services. The ideal agent exchange is a frontier — API + no-KYC + atomic + wide BTC-layer/stablecoin coverage + deep liquidity — on which deep liquidity (custodial) trades off against sovereignty (non-custodial swaps); Boltz sits closest today.
---

# Exchange

> **In brief.** Where an agent converts between Bitcoin, dollar stablecoins, and fiat — turning on one hard fact: **an autonomous agent cannot pass KYC**, and every custodial fiat venue requires it. So an agent crosses one of two ways. On a **non-custodial, no-KYC swap** (Boltz, SideSwap, SideShift) it acts on its own keys, genuinely sovereign — but only crypto-native, BTC↔stablecoin, never real bank fiat. On a **custodial KYC venue** (Strike, River, Swan, Kraken, Coinbase, and the large offshore exchanges) the *owner* completes KYC and delegates the account by API key — the only path to real fiat, but the agent is running a human's identity-bound, freezable account. The spine: *an agent stays sovereign while it stays crypto-native; the moment it needs real fiat, it hits the KYC wall.*

---

## The KYC wall: who holds the account?

Start here, because it determines everything else. KYC ("know your customer") binds a financial account to a verified legal identity. **An agent has no legal identity to verify** — so it cannot open a KYC'd account itself. Two consequences fall out, and they split the whole field:

- **Non-custodial swaps need no KYC → the agent is sovereign, but crypto-only.** Services like Boltz and SideSwap execute atomic swaps without an account or identity; the agent acts on its own keys and never hands over custody. This is the no-KYC, self-custody ideal — software-manageable without human account intermediation. But these services convert *between crypto assets* (BTC, Lightning, stablecoins, other layers); they do **not** touch bank fiat, and they trade regulatory protection for autonomy (see the caveats below).
- **Custodial venues require KYC → the owner delegates.** To use Strike, a US exchange, or any regulated off-ramp, the *human owner* completes KYC, then delegates account access to the agent — in practice, by issuing the agent **API keys** scoped to its account. The agent transacts, but it is operating the owner's identity-bound, freezable account. This is automation under the owner's identity, not the agent's own agency. It is also **the only path to actual bank fiat**, because the fiat on-ramp is precisely what triggers the KYC requirement.

So the practical rule for a builder: **an agent can remain fully sovereign as long as it stays crypto-native** — holding Bitcoin, swapping to a stablecoin and back via non-custodial services when it needs a stable unit of account. The instant the workflow requires *real fiat* — a bank payment, a fiat invoice, a payroll deposit — the agent must borrow its owner's delegated, KYC'd account. The KYC wall is where the parallel economy ends and the agent starts operating as its principal's proxy.

---

## What an agent actually does at an exchange

For a non-custodial swap, the flow is short: the agent calls the swap service's API directly from its own wallet — no account, no delegation — and the swap settles atomically to its keys.

For a custodial venue, the pattern is longer and nearly identical across venues:

1. **Owner opens and KYCs an account** — the compliance boundary; identity attaches here, once.
2. **Owner delegates to the agent** — scoped API keys (ideally least-privilege: trade + withdraw-to-allowlisted-address only).
3. **Fund** — from a bank (slow fiat rails: ACH, wire, SEPA), card, or by receiving BTC/Lightning.
4. **Convert** — fiat↔BTC or BTC↔stablecoin via the venue's **API**.
5. **Withdraw to self-custody promptly** — bounds the custodial freeze surface to the time funds sit on the venue.

Two features make or break a venue for agent use. **API access** is non-negotiable — without it the venue is human-only. **Lightning support** matters more than it looks: a venue that pays out over Lightning lets the agent move funds off the venue in seconds for a fraction of a cent, shrinking the custodial-freeze window that an on-chain-only or bank-only venue leaves open.

---

## Non-custodial, no-KYC swaps *(agent-sovereign, crypto-native)*

The agent swaps on its own keys — no account, no delegated identity. This is the most agent-native path; the caveats below are the price of that sovereignty. *(Structural facts WebSearch-verified 2026-06-03; Boltz re-verified 2026-06-05; Flashnet + Taproot Assets verified 2026-06-06. ✓ yes · — no · ⚠ limited; the API column is the capability an agent needs to run a swap unattended.)*

| Service | Type | Lightning | Stablecoin (network) | API | Bank fiat |
|---|---|---|---|---|---|
| **Boltz** ⭐ | atomic swap | ✓ | USDT0 + USDC *(via Circle CCTP: ETH/Arbitrum/Base/Polygon)* | ✓ REST / `boltzd` | — |
| **SideSwap** | Liquid swap | ⚠ *(Liquid)* | L-USDt *(Liquid)* | ✓ | — |
| **SideShift** | swap | ✓ | USDT *(Liquid)* + 200+ assets | ✓ REST | — |
| **Flashnet** | AMM *(Spark)* | ✓ *(via Spark)* | USDT / USDB / USDC *(Spark)* | ✓ skill / API | — |
| **Taproot Assets** | Lightning FX *(edge-node)* | ✓ | USDT *(Lightning)* | ⚠ *(`tapd`, no REST)* | — |

**Boltz is the standout for agents** — the cleanest mix of no-KYC, non-custodial atomicity, and a full automation API (the table has the per-asset specifics). **SideSwap** is pure atomic swaps on Liquid (liquidity tracks order-book depth). **SideShift** spans the most assets but is not as clean as the other two: an automated risk-screening layer can flag and hold funds and may demand KYC/source-of-funds to release. **Flashnet** is a non-custodial AMM on Spark (Lightspark's Bitcoin L2) swapping BTC↔USDT/USDB/USDC, with an open-source agent skill — a strong agent fit, though newer and carrying Spark's operator-set trust. **Taproot Assets** turns Lightning itself into a BTC↔USDT FX rail via edge-node swaps — sovereign and no-KYC, but it is *rails* (the stablecoin stays issuer-freezable) and has no clean swap API, so it asks more setup than the others. None reach bank fiat — and that dividing line is the point: there is no no-KYC, **API-driven**, *fiat*-settling exchange, because that is exactly what KYC law exists to prevent. The one no-KYC road to fiat that does exist — Mostro, below — proves the rule by keeping a human on the fiat leg.

> [!warning] Caveats — the price of no-KYC sovereignty
> - **Crypto-native only.** None of these reach bank fiat. They convert BTC↔stablecoin/other-layer; the agent still needs a custodial venue to touch dollars in a bank.
> - **Offshore / unregulated.** No licensing, no consumer protection, no chargebacks, no support line, no recourse if a swap fails or a counterparty/liquidity provider misbehaves.
> - **Counterparty and liquidity risk.** Atomic-swap designs (Boltz, SideSwap) protect *custody* by construction — both legs settle or both refund — but thinner liquidity can mean slippage at size, and a routing/liquidity provider can fail mid-swap.
> - **Stablecoin ≠ censorship-resistance.** Swapping into USDT/USDC, however non-custodially, lands the value on an issuer-freezable asset. The rail is sovereign; the asset is not.

**The P2P exception — [[mostro|Mostro]].** A peer-to-peer, non-custodial protocol for **BTC↔bank-fiat/cash over Nostr**: Lightning **hold invoices** escrow the sats in the seller's own wallet until the fiat — exchanged peer-to-peer, outside any platform — is confirmed. No registration, no KYC; per-trade ephemeral keys prevent trade linking; free and open source, OpenSats- and HRF-supported. An agent can drive the order and escrow legs through the published Nostr protocol (clients: Android, terminal, CLI), but **the fiat leg is a human action** — a bank transfer or a cash handoff — which is exactly why this road can exist no-KYC where an API-driven one cannot. For an agent: operator-assisted, not autonomous.

---

## Custodial venues *(owner-delegated, KYC)*

The regulated, centralized venues. The owner completes KYC and delegates the account to the agent by API key; the freeze surface is bounded by withdrawing to self-custody promptly. Two factual axes matter for an agent: **what the account holds** — a Bitcoin-only account confines the freeze surface to BTC, a multi-asset account exposes every asset held — and **jurisdiction**, which sets licensing, recourse, and availability.

| Venue | Holds | Jurisdiction | Lightning | Stablecoin (network) | API: dep / trade / withdraw | Bank fiat |
|---|---|---|---|---|---|---|
| **Strike** | BTC-only | US + ~95 countries | ✓ native | USDT *(TRON, regional)* | ✓ / ✓ / ✓ | ✓ |
| **River** | BTC-only | US | ✓ *(RLS)* | — | ✓ / ⚠ *(RLS = Lightning payments, no buy/sell)* / ✓ | ✓ |
| **Swan** | BTC-only | US | ⚠ | — | ✓ / ⚠ *(buy-only, DCA)* / ✓ | ✓ |
| **Kraken** | multi-asset | US | ✓ | USDC, USDT *(multi-network)* | ✓ / ✓ / ✓ | ✓ |
| **Coinbase** | multi-asset | US | ✓ | USDC *(Base/ETH)* | ✓ / ✓ / ✓ | ✓ |
| **Binance** | multi-asset | Offshore *(global)* | ✓ | USDT, USDC, FDUSD | ✓ full | restricted *(.US separate)* |
| **OKX** | multi-asset | Offshore *(Seychelles)* | ✓ | USDT, USDC | ✓ full | restricted |
| **Bybit** | multi-asset | Offshore *(Dubai)* | ⚠ | USDT, USDC | ✓ full | restricted |
| **Bitget / MEXC / KuCoin** | multi-asset | Offshore *(Seychelles)* | ⚠ | USDT *(+USDC)* | ✓ full | restricted |

Only the venues with a full deposit/trade/withdraw API — **Strike, Kraken, Coinbase**, and the offshore giants — can run a fiat↔BTC treasury unattended. **River**'s public API (RLS) is Lightning *payments*, not buy/sell; **Swan**'s automates *buying* (DCA) + withdrawal, not two-way trading — both stay useful for their niches (River for Lightning payouts, Swan for scheduled accumulation) but neither does programmatic *conversion*. The **large offshore exchanges** — Binance, OKX, Bybit, Bitget, MEXC, KuCoin — are the same animal as the US multi-asset venues under a different jurisdiction: offshore domicile adds regulatory and recourse uncertainty (several have faced enforcement or market exits) on top of the account-level freeze surface, but they hold the deepest stablecoin-and-BTC liquidity (the pools described in [[Stablecoin-Landscape|The Stablecoin Landscape]]). Across all of them, **bank fiat — the one thing the non-custodial swaps can't reach — appears only here**; withdraw to self-custody promptly and treat any on-venue balance as exposed. *(Volumes, jurisdictional availability, and listings shift constantly — see [[Field-Notes]].)*

> [!warning] Moving a stablecoin? Match the network or lose the funds
> The stablecoin column names the **network**, and it matters operationally. Strike's USDT is **TRON-only** (a deposit on any other network is *permanently lost*); Boltz settles **USDT0** and **native USDC via Circle's CCTP** across Ethereum/Arbitrum/Base/Polygon; SideShift and SideSwap use **Liquid USDt (L-USDt)**; Kraken supports **several networks** (chosen at withdrawal). An agent moving a stablecoin between venues must match the network end-to-end — which is itself an argument for holding **BTC** as the portable asset and converting to a stablecoin only at the edge where it's needed. (L-USDt lives on the **Liquid sidechain** — see [[Stack|The Stack]].)

---

## Compliance lives at the gateway

For the custodial venues, the principle is simple: **compliance lives at the gateway, not the protocol.** The venue runs its full regime on **the account and the fiat leg**; the BTC/Lightning leg downstream, once withdrawn to self-custody, is unrestricted. The pattern breaks when KYC is pushed into the protocol, when terms compel repatriation of self-custodied BTC on demand, or when every venue an agent uses terminates in one jurisdiction — answered by multiple independent venues across non-correlated regimes, prompt withdrawal, and hot/cold separation. (*Why* this gateway boundary is the architecture that lets two incompatible systems coexist without one absorbing the other is the [[Independence-Doctrine|Independence Doctrine]]'s mechanism.)

---

## Risks at the boundary

Crossing has risks that look generic but bite differently when the party crossing is an agent — at machine tempo, continuously, with no human to call:

- **Bridge freeze mid-workflow** — a human notices a compliance hold and calls support; an agent can lose value in the seconds before the freeze reaches its logic, and has no support line. Recovery requires fallback-routing designed in.
- **Automated-conversion exposure** — slippage, MEV, and oracle manipulation become significant when an agent converts on a *schedule* with no per-trade judgment; a predictable rebalance is a target. Defenses: rate-limiting, jittered timing, atomic-swap settlement.
- **Inadvertent reporting / sanctions triggers** — an agent operating across jurisdictions can trip thresholds without the operator's awareness; the burden lands on the custodian and the human behind it. Predictable-jurisdiction custody is a legitimate response.
- **Layered-custody inheritance** — a bridge sold as one integration may stack a wallet provider, an issuer, and a processor behind a single API; the agent inherits the *union* of their freeze surfaces. Evaluate the custody actually exposed, not the developer-facing simplification.

The defenses are a small, unexotic set: **hot/cold separation** (operational balances on bridges, reserves in self-custody), **fallback bridges** (at least two independent paths to fiat), **multi-jurisdiction custody**, and **ecash-bearer reserves** (balances outside the custodial perimeter). Every one of these risks enters on the *incumbent* side of the boundary — none exists in the pure substrate, where there is no one to freeze a balance and no intermediary to fail. The agent carries them only as far, and only as long, as it crosses.

---

## Two things that are *not* exchange

- **Internal BTC rebalancing (L1 ↔ Lightning) is not exchange.** Moving value between an agent's *own* on-chain and Lightning balances — including via Boltz/Loop submarine swaps used purely for that — crosses no second economy; it is substrate tooling, and its home is **[[Stack|The Stack]]**. (Boltz appears here only for its *cross-asset* swaps — Lightning↔stablecoin — which do cross the boundary.)
- **Paying for services is not exchange.** L402 — converting Lightning value into access to a paid resource — is how an agent *buys things*, not how it converts fiat↔BTC. It belongs to the **Services** child, as the payment mechanism of the services layer.

---

## What good exchange infrastructure looks like for an agent

Reading down the comparison, a profile emerges for the venue best suited to an *autonomous* agent — the one that asks the least of a human and surrenders the least sovereignty:

- **An API that does all three legs** — deposit, convert, withdraw — programmatically. Without it the venue is human-only.
- **No KYC of the agent's owner.** KYC binds the account to a freezable human identity — the one thing the parallel economy is built to avoid. A venue that needs no account keeps the agent on its own keys.
- **Atomic, non-custodial settlement.** Both legs of a swap clear together or neither does, so no counterparty holds the funds mid-trade and none can freeze or fail them.
- **Wide Bitcoin-layer and stablecoin coverage** — L1, Lightning, Liquid, and the major dollar stablecoins — so the agent can source whatever a counterparty wants without leaving the venue.
- **Deep liquidity**, so it can swap at size without slippage.

The honest catch is that the last criterion fights the first four. The deepest liquidity lives on the large custodial, KYC'd venues; the purest sovereignty lives on the non-custodial swaps, which are thinner. So the "ideal" is a frontier, not a single winner — and today the venue sitting closest to it is **Boltz**, strong on every axis but liquidity-at-size, where the custodial giants still lead.

The standing build opportunity — scarcely filled — is a **regulated agent-payment gateway on Lightning-substrate rails**: the compliance assurances institutions need without compromising the Bitcoin leg. And the deeper open frontier, the one that would dismantle the KYC wall itself: **agent-native identity** — reputation systems, on-chain attestations, and zero-knowledge proofs that could one day satisfy a regulatory regime without a human's delegated KYC. Until that exists, the wall stands, and the delegation pattern is the practical reality.

---

> [!info] Where to read next
> **More in The Market** (this section):
> - **[[Treasury|Treasury & the Boundary]]** — the holding decision this surface serves: the reserve-vs-operational-mix split and the conversion strategy these venues execute.
> - **[[Marketplace|The Marketplace]]** — the live directory of services an agent can consume and offer for Bitcoin.
> - **[[Stablecoin-Landscape|The Stablecoin Landscape]]** *(reference)* — the lay of the land on the dollar-stablecoin market behind the operational mix: size, issuer dominance, which chains the supply lives on, and the network hazard.
> - **[[Services]]** *(full directory at [marketplace.bitcoineconomy.ai](https://marketplace.bitcoineconomy.ai))* — what an agent buys and sells for Bitcoin, and the L402 payment mechanism that powers it.
>
> **In the other sections:**
> - **[[Stack|The Stack]]** *(equip your agent)* — the protocol architecture beneath these venues; home of internal-rebalancing tooling and the Tools reference cards.
> - **[[Field-Notes|Field Notes]]** *(the standing live record)* — the volatile specifics the cards defer: fees, jurisdictional coverage, API changes, new venues, freeze incidents.
> - **[[Border-Skirmishes]]** *(in The Case)* — the contest over which substrate wins; this surface assumes Bitcoin and shows how to cross.

---

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Scope (user, 2026-06-03): fiat↔BTC, practical use-section, card-based and maintainable. This pass added what the first draft was missing — a real analysis of actual venues (WebSearch-verified structural facts), a side-by-side comparison table, and the two things that turned out to matter most.

The first is the **KYC-delegation point** (user's insight): an agent can't KYC, so a custodial venue means the owner KYCs and hands the agent its delegated account — automation under the owner's identity, the "automation, not agency" tension landing precisely at the exchange. The second, which fell out of the no-KYC research, is the **sovereign-while-crypto-native spine**: every no-KYC, API-driven, agent-operable option is crypto-native (BTC↔stablecoin); none reach bank fiat, because the fiat on-ramp is what triggers KYC. That is the whole site's thesis, concretized. Worth keeping that as the surface's organizing idea.

**Rework 2026-06-05 (inbox 2026-06-04 batch — PENDING user review).** Driven by inbox notes 1812/1935 (leakage), 1941 (structure + Boltz + ideal-exchange), 2001 (Loop), and the Kraken-before-Coinbase ordering note:
- **Reordered: non-custodial / no-KYC now leads**, custodial second — expressing the sovereignty-first preference through *curation order*, not through editorial body commentary (per user's "curate by what we show, the order, the facts").
- **Leakage scrubbed (the one leak the user flagged): the Bitcoin-only-vs-multi-asset *preference*.** Removed "project-aligned default," "recommended default," "operational reality," and "covered, not endorsed." KEPT as legitimate (per user 2026-06-04): the neutral *fact* that a multi-asset account widens the freeze surface; "Boltz is the standout for agents" (curation-by-emphasis); and "stablecoin ≠ censorship-resistance" (a fact, not a leak).
- **Folded US + offshore into one Custodial section** ("same animal, different jurisdiction"), jurisdiction as a column/axis; dropped the separate "Large non-US exchanges" section + its "covered, not endorsed" callout.
- **Removed:** the peer-to-peer (RoboSats/Bisq/Hodl Hodl) section (user: too far for an agent); **THORChain** (a separate L1, obscure for this audience); **Aqua** (a consumer wallet, not an exchange). Loop confirmed already correct (Tools/, internal rebalancing) — only referenced under "not exchange."
- **Kraken listed before Coinbase** wherever both appear (user note).
- **Boltz facts corrected:** USDC is **live** via Circle CCTP (May 2026), not roadmap; full Bitcoin-layer support (L1/Lightning/Liquid/Rootstock) named. **SideShift** caveat added (risk-screening/freeze, can demand KYC). Ranking within no-KYC: Boltz → SideSwap (pure atomic Liquid) → SideShift (with caveat).
- **"Ideal agent exchange" rebuilt** around the user's criteria (API · no-KYC-of-owner · atomic · wide BTC-layer/stablecoin coverage · deep liquidity), naming the liquidity-vs-sovereignty tension explicitly and that Boltz sits closest.
- **In-brief recalibrated** to the new 800-char / 6-sentence budget; **description shortened to a subtitle** (In-brief now carries the synthesis).

**Card-archival — DONE (2026-06-05).** `Exchanges/thorchain.md` and `Exchanges/robosats.md` (no longer referenced here) were archived to `_archive/` in the Border Zone archive pass.

**Verification status.** Structural facts WebSearch-verified 2026-06-03; Boltz full support + live USDC re-verified 2026-06-05. Per-card pass 2026-06-06: API-docs URLs pinned, coverage coarsened to durable statements, and the reader-facing "(verify)" nags removed; **per-venue fees are deferred to the venue (not hardcoded)** since they drift, per the defer-to-live-source pattern. Strike's tool-vs-exchange status is resolved (`_Decisions` 2026-06-06: exchange-only; the former `Tools/strike.md` was retired 2026-06-06 → archived, and `/tools/strike` redirects to `/exchanges/strike`). Optionally add Cash App / Gemini.

**Dissolution — DONE (2026-06-05):** `Border-Zone.md` + `-FA` archived to `_archive/`; the restructure is deployed.

**Publications backlinks**

- [[Marketplace]] (this project) — the section overview this child sits under
- [[Stack]] (this project) — home of internal-rebalancing tooling and Tools reference cards
- [[Field-Notes]] (this project) — the empirical record the cards defer volatile specifics to
- [[Exchange-FA]] (this project, forthcoming) — the For-Agents twin of this surface
