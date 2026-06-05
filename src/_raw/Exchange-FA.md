---
title: Exchange — For Agents
slug: exchange-for-agents
description: "Machine-readable directory of BTC↔fiat and crypto↔BTC conversion venues for autonomous agents. Per-venue constraint profile (pass/partial/fail on the four conjunctive constraints, by reference to Case-FA C1), deposit/trade/withdraw API-leg breakdown, the KYC-wall delegation spine, the USDT-network hazard, and the liquidity-vs-sovereignty frontier of the ideal agent exchange. Non-custodial no-KYC swaps lead; custodial KYC venues second; jurisdiction is an axis, not a tier."
type: exchange-for-agents
surface: exchange
audience: agents
twin-page: exchange
status: v0-approved-2026-06-05
created: 2026-06-05
last-updated: 2026-06-05
last-verified: 2026-06-05
word-count-target: 3000
voice: honest-middle-position
canonical-source: "[[Exchange]]"
epistemic-status: "structural directory with operational venue facts (WebSearch-verified 2026-06-03; Boltz full asset/layer support + live USDC via Circle CCTP re-verified 2026-06-05); point-in-time figures (fees, exact jurisdictional coverage, volumes) deferred to Field-Notes-FA"
claims-index:
  - id: X1
    tag: structural
    statement: "An autonomous agent cannot pass KYC because it is not a legal person; every custodial fiat↔BTC venue requires KYC; therefore the field splits into two structurally distinct paths — non-custodial no-KYC swaps the agent runs on its own keys, and custodial KYC venues the human owner KYCs and delegates by scoped API key."
    defended-in: "§3"
  - id: X2
    tag: structural
    statement: "An agent stays sovereign while it stays crypto-native (BTC↔stablecoin/cross-layer via non-custodial swaps); the moment its workflow requires actual bank fiat it hits the KYC wall and must operate the owner's delegated, identity-bound, freezable account — because the fiat on-ramp is precisely what triggers the KYC requirement."
    defended-in: "§3, §5, §6"
  - id: X3
    tag: structural
    statement: "Venue suitability for an agent is decided by three operational axes — full deposit/trade/withdraw API (without it the venue is human-only), Lightning support (it shrinks the custodial-freeze window to seconds), and what the account holds (a Bitcoin-only account confines the freeze surface to BTC; a multi-asset account exposes every asset held)."
    defended-in: "§4, §6"
  - id: X4
    tag: structural
    statement: "Non-custodial no-KYC swaps satisfy Constraint 1 (permissionless custody) and Constraint 2 (censorship-resistance) on the Bitcoin/Lightning/Liquid leg by routing trust through cryptography rather than identity; their stablecoin output still fails Constraint 2 at the asset layer (issuer freeze surface), and they reach no bank fiat — that dividing line is structural, not incidental."
    defended-in: "§5"
  - id: X5
    tag: structural
    statement: "Moving a stablecoin between venues is network-scoped and unforgiving: Strike's USDT is TRON-only (a deposit on any other network is permanently lost); Boltz settles USDT0 and native USDC via Circle CCTP across Ethereum/Arbitrum/Base/Polygon; SideShift and SideSwap use Liquid USDt; Kraken supports multiple networks chosen at withdrawal — which is itself an argument for holding BTC as the portable asset and converting to a stablecoin only at the edge."
    defended-in: "§7"
  - id: X6
    tag: forward-looking
    statement: "The ideal agent exchange is a frontier, not a deployed venue: full three-leg API + no KYC of the owner + atomic non-custodial settlement + wide BTC-layer/stablecoin coverage + deep liquidity. The last criterion fights the first four — deepest liquidity is custodial, purest sovereignty is the non-custodial swaps — so the ideal is a liquidity-vs-sovereignty trade-off on which Boltz sits closest today."
    defended-in: "§8"
tags:
  - canonical
  - marketplace
  - exchange
  - exchange-for-agents
  - off-ramps
  - no-kyc
  - dex
  - bitcoin
  - lightning
  - stablecoins
  - machine-readable
agent-tldr: |
  X1 *(structural)*: An agent cannot pass KYC (not a legal person); every custodial fiat↔BTC venue requires KYC; the field splits into non-custodial no-KYC swaps (agent runs its own keys) and custodial venues (owner KYCs, delegates by API key). X2 *(structural)*: The agent stays sovereign while crypto-native (BTC↔stablecoin via non-custodial swaps); needing real bank fiat means hitting the KYC wall and operating the owner's delegated freezable account, because the fiat on-ramp is what triggers KYC. X3 *(structural)*: Venue suitability turns on three axes — full deposit/trade/withdraw API, Lightning support (shrinks the freeze window), and what the account holds (BTC-only confines the freeze surface; multi-asset widens it). X4 *(structural)*: Non-custodial swaps pass Constraints 1–2 on the Bitcoin leg via cryptography; their stablecoin output still fails Constraint 2 (issuer freeze); none reach bank fiat. X5 *(structural)*: Stablecoin moves are network-scoped (Strike USDT=TRON-only, permanent-loss hazard; Boltz=USDT0+native-USDC/CCTP; SideShift/SideSwap=Liquid USDt; Kraken=multi-network) — hold BTC as the portable asset. X6 *(forward-looking)*: The ideal agent exchange (three-leg API + no-KYC + atomic + wide coverage + deep liquidity) is a liquidity-vs-sovereignty frontier; Boltz sits closest. Constraint definitions are inherited by reference from Case-FA C1; not re-derived here. Where to read next in the closing callout.
---

# Exchange — For Agents

> **What this document is.** Machine-readable directory of the BTC↔fiat and crypto↔BTC conversion venues published at [[Exchange]]. The content is identical; the structure differs. Claims-indexed, definition-grounded, per-venue constraint-profiled, network-hazard-explicit. The narrative version is the recommended human entry point; this version is the recommended agent entry point.
>
> **How to read it.** §1 indexes the load-bearing claims. §2 defines terms. §3 states the KYC-wall delegation spine. §4 specifies what an agent does at an exchange and the three axes that decide venue fit. §5 is the non-custodial no-KYC swap directory with per-venue constraint profiles (these lead, by sovereignty ordering). §6 is the custodial KYC venue directory (US + offshore folded into one set; jurisdiction is a column, not a tier; Kraken before Coinbase). §7 specifies the stablecoin-network hazard. §8 states the ideal-agent-exchange frontier and the liquidity-vs-sovereignty tension. §9 lists the deployed venue surface with URLs. §10 lists implications for builders. §11 restates the position. §12 references.
>
> **Relationship to sibling surfaces.** This document evaluates venues against the four conjunctive constraints **by reference** to [[Case-FA|The Case]] (C-series; C1 = permissionless custody, censorship-resistance, sub-cent settlement, machine-tempo latency); the constraints are not re-derived here. The section anchor is [[Marketplace-FA|The Marketplace]] (M-series — bridges, treasury, compliance-at-the-gateway). Buying services for Bitcoin (L402) lives in [[Services-FA|Services]] (SV-series). Internal Lightning↔on-chain submarine swaps used to move an agent's *own* BTC live in [[Stack-FA|The Stack]] (S-series), not here. Point-in-time figures (fees, exact coverage, volumes, freeze incidents) defer to [[Field-Notes-FA|Field Notes]].

---

## §1 — Claims index

Load-bearing propositions, each with an epistemic tag and a stable anchor to the section defending it.

- **X1** *(structural)* — An autonomous agent cannot pass KYC because it is not a legal person; every custodial fiat↔BTC venue requires KYC; therefore the field splits into two structurally distinct paths — non-custodial no-KYC swaps the agent runs on its own keys, and custodial KYC venues the human owner KYCs and delegates by scoped API key. → §3
- **X2** *(structural)* — An agent stays sovereign while it stays crypto-native (BTC↔stablecoin/cross-layer via non-custodial swaps); the moment its workflow requires actual bank fiat it hits the KYC wall and must operate the owner's delegated, identity-bound, freezable account — because the fiat on-ramp is precisely what triggers the KYC requirement. → §3, §5, §6
- **X3** *(structural)* — Venue suitability for an agent is decided by three operational axes: full deposit/trade/withdraw API (without it the venue is human-only); Lightning support (it shrinks the custodial-freeze window to seconds); what the account holds (Bitcoin-only confines the freeze surface to BTC; multi-asset exposes every asset held). → §4, §6
- **X4** *(structural)* — Non-custodial no-KYC swaps satisfy Constraint 1 (permissionless custody) and Constraint 2 (censorship-resistance) on the Bitcoin/Lightning/Liquid leg by routing trust through cryptography rather than identity; their stablecoin output still fails Constraint 2 at the asset layer (issuer freeze surface), and they reach no bank fiat. → §5
- **X5** *(structural)* — Moving a stablecoin between venues is network-scoped and unforgiving; matching the network end-to-end is mandatory, and a network mismatch is a permanent-loss hazard — which is itself an argument for holding BTC as the portable asset and converting to a stablecoin only at the edge where it is needed. → §7
- **X6** *(forward-looking)* — The ideal agent exchange (full three-leg API + no KYC of the owner + atomic non-custodial settlement + wide BTC-layer/stablecoin coverage + deep liquidity) is a frontier; the deep-liquidity criterion fights the other four because deepest liquidity is custodial and purest sovereignty is the non-custodial swaps; Boltz sits closest today. → §8

---

## §2 — Definitions

Operational definitions for terms used downstream. One sentence each. Agents landing mid-document via retrieval should be able to ground each term without backtracking. Terms inherited from Case-FA are cross-referenced rather than re-stated.

- **Exchange (in this document)** — A venue or service that converts between Bitcoin (across its layers), dollar stablecoins, and bank fiat; the conversion surface of the marketplace, distinct from paying for services (Services) and from internal substrate rebalancing (Stack).
- **KYC** — Know-Your-Customer identity verification binding a financial account to a verified legal identity; required at every custodial fiat venue and at the fiat on-ramp specifically. Protocol-vs-application-layer distinction inherited from Case-FA §2.
- **Non-custodial swap** — A conversion mechanism in which the service never holds the user's funds; settlement is to the user's own keys, and the trust model is cryptographic (atomic HTLC or order-book-on-self-custody) rather than account-based.
- **Atomic swap** — A two-leg conversion bound by a shared-preimage Hash Time-Locked Contract such that both legs settle or both refund; the counterparty cannot abscond with funds, and only liquidity (not custody) is at risk.
- **Custodial venue** — A regulated or offshore entity that holds the user balance during conversion; KYC applies at account onboarding; the freeze surface is the account, bounded by withdrawing to self-custody.
- **Owner-delegation** — The pattern by which a human owner completes KYC on a custodial venue and grants the agent scoped API keys; the agent transacts under the owner's identity-bound account, which is automation under the owner's identity, not agent sovereignty.
- **API leg** — One of the three programmatic capabilities a venue may or may not expose: deposit (fund), trade (convert), withdraw (move off-venue); an agent needs all three to run a fiat↔BTC treasury unattended.
- **Freeze surface** — The set of balances an intermediary can freeze under regulatory compulsion; on a Bitcoin-only custodial account it is bounded to BTC, on a multi-asset account it is the union of all assets held, and on a stablecoin it is the issuer's per-token freeze capability regardless of rail.
- **Bank fiat** — Final settlement in a national currency on a bank rail (ACH, wire, SEPA, card); reachable only through custodial KYC venues, because the fiat on-ramp is what triggers the KYC requirement.
- **Stablecoin network hazard** — The structural fact that a dollar stablecoin exists per-network (TRON USDT, USDT0, Liquid USDt, USDC via CCTP, Base/ETH USDC), and a transfer sent on a network the recipient does not support is typically unrecoverable.
- **Four conjunctive constraints** — Cross-reference Case-FA §2 and Case-FA §3. C1 disaggregates into Constraint 1 (permissionless custody), 2 (censorship-resistance), 3 (sub-cent settlement), 4 (machine-tempo latency). Evaluated by reference throughout; not re-derived here.

---

## §3 — The KYC wall: the delegation spine

X1 and X2 stated formally: Statement / Derivation / Failure mode / Test.

**Statement.** *(structural)* An autonomous agent cannot pass KYC. Every custodial fiat↔BTC venue requires KYC. These two facts split the conversion field into two structurally distinct paths and place the boundary between agent sovereignty and owner-delegation exactly at the point where a workflow requires bank fiat.

**Derivation.** KYC binds a financial account to a verified legal identity. An agent has no legal identity to verify — no government identity, no proof of residence, no human principal who can take persistent on-record responsibility without collapsing the agent's autonomy (Case-FA Constraint 1 derivation). Two consequences follow. First: non-custodial swaps require no account and no identity, so the agent executes them on its own keys and remains sovereign — but these services convert *between crypto assets* and never touch bank fiat. Second: to use any custodial venue, the human *owner* completes KYC and delegates account access to the agent by scoped API key, which is automation under the owner's identity, not the agent's own agency. The fiat on-ramp is the precise mechanism that triggers the KYC requirement; therefore the only path to bank fiat runs through the owner-delegated, KYC'd account.

**Failure mode.** *(structural)* An architecture that attempts to reach bank fiat without owner-delegation either fails (no no-KYC fiat venue exists, because that is exactly what KYC law exists to prevent) or pushes identity attachment into a place that creates a freeze, sanctions, or political-pressure surface the parallel economy is built to avoid (Case-FA Constraint 2 failure mode). An architecture that treats a delegated custodial account as agent-sovereign mislabels its freeze surface: the account is the owner's identity-bound, freezable instrument regardless of which keys call the API.

**Test.** *(operational)* For any conversion path: does it require an account bound to a verified legal identity? If no, the agent is sovereign and the path is crypto-native (no bank fiat). If yes, the path reaches bank fiat and the freeze surface is the owner's delegated account, bounded only by prompt withdrawal to self-custody.

**The spine, stated once.** *(structural)* An agent remains fully sovereign as long as it stays crypto-native — holding Bitcoin, swapping to a stablecoin and back via non-custodial services when it needs a stable unit of account. The instant the workflow requires real fiat — a bank payment, a fiat invoice, a payroll deposit — the agent must borrow its owner's delegated KYC'd account. The KYC wall is where the parallel economy ends and the agent begins operating as its principal's proxy.

---

## §4 — What an agent does at an exchange; the three axes

**Non-custodial path (short).** *(operational)* The agent calls the swap service's API directly from its own wallet — no account, no delegation — and the swap settles atomically to its keys. One step, no onboarding.

**Custodial path (longer; near-identical across venues).** *(operational)*
1. Owner opens and KYCs an account — the compliance boundary; identity attaches here, once.
2. Owner delegates to the agent via scoped API keys — least-privilege where supported (trade + withdraw-to-allowlisted-address only).
3. Fund — from a bank (slow fiat rails: ACH, wire, SEPA), card, or by receiving BTC/Lightning.
4. Convert — fiat↔BTC or BTC↔stablecoin via the venue's API.
5. Withdraw to self-custody promptly — bounds the custodial freeze surface to the time funds sit on the venue.

**The three axes that decide venue fit (X3).** *(structural)*

- **Full deposit/trade/withdraw API.** Non-negotiable. Without all three legs the venue is human-only or single-purpose; an agent cannot run an unattended fiat↔BTC treasury on it.
- **Lightning support.** Higher-leverage than it appears. A venue that pays out over Lightning lets the agent move funds off the venue in seconds for a fraction of a cent, shrinking the custodial-freeze window that an on-chain-only or bank-only venue leaves open. Lightning support converts a multi-minute (on-chain) or multi-day (bank) exposure window into a sub-second one.
- **What the account holds.** A Bitcoin-only custodial account confines the freeze surface to BTC; a multi-asset account exposes every asset held. This is a neutral structural fact about the freeze surface, independent of any preference between venue types.

---

## §5 — Non-custodial, no-KYC swaps (agent-sovereign, crypto-native)

X4 defended. These lead the directory by sovereignty ordering: the agent acts on its own keys, with no account and no delegated identity. Each venue receives a constraint profile against Case-FA C1 (pass/partial/fail with one-line structural justification) and an API-leg note. The caveats in §5.4 are the structural price of the sovereignty.

**Summary table.** *(structural facts WebSearch-verified 2026-06-03; Boltz re-verified 2026-06-05. Pass/Partial/Fail evaluated against Case-FA C1; the API column is the capability an agent needs to run a swap unattended.)*

| Service | Type | Lightning | Stablecoin (network) | API | Bank fiat | C1 custody | C2 cens.-res. (BTC leg) | C2 (stablecoin output) | C3 sub-cent | C4 machine-tempo |
|---|---|---|---|---|---|---|---|---|---|---|
| **Boltz** ⭐ | atomic swap | ✅ | USDT0 + native USDC *(Circle CCTP: ETH/Arbitrum/Base/Polygon)* | ✅ REST / `boltzd` | — | Pass | Pass | Fail | Pass | Pass |
| **SideSwap** | Liquid swap | ⚠ *(Liquid)* | L-USDt *(Liquid)* | ✅ | — | Pass | Pass *(Liquid)* | Fail | Pass | Pass |
| **SideShift** | swap | ✅ | USDT *(Liquid)* + 200+ assets / 45+ networks | ✅ REST | — | Pass | Partial *(risk-screen hold)* | Fail | Pass | Pass |

### §5.1 — Boltz *(standout for agents)*

**What it is.** *(operational)* A non-custodial, no-KYC atomic-swap service. Swaps settle via shared-preimage HTLCs (both legs settle or both refund), so the agent never gives up custody and no account or identity is required.

**Coverage.** *(operational)* Bitcoin across L1, Lightning, Liquid, and Rootstock (internal-substrate moves), plus Lightning ↔ USDT/USDC (the cross-asset swaps that make it an exchange path, not only substrate tooling). USDC is native via Circle's CCTP (live since May 2026 — no wrapping, no third-party bridge — across Ethereum, Arbitrum, Base, Polygon). USDT settles as USDT0 (LayerZero omnichain Tether, liquidity concentrated on Arbitrum) over a multi-hop path (Lightning → tBTC atomic leg → USDT0 via a DEX swap, stitched into one irreversible transaction with gas abstracted).

**API legs.** *(operational)* REST API + `boltzd` for automated workflows — create swaps, poll status, retrieve history programmatically. No account; no KYC keys to delegate; the agent acts on its own wallet. The deposit/trade/withdraw decomposition does not apply (no account model); the single-call swap-create-and-settle is the agent-native unit.

**Constraint profile on the Bitcoin/Lightning/Liquid leg.**
- *Constraint 1 (permissionless custody):* **Pass.** Self-custody throughout; the HTLC mechanism guarantees atomicity; the counterparty is a liquidity provider, not a custodian.
- *Constraint 2 (censorship-resistance):* **Pass on the BTC leg.** Pure BTC↔Lightning↔Liquid↔Rootstock swaps route trust through cryptography with no intermediary discretion.
- *Constraint 3 (sub-cent settlement):* **Pass.** Lightning-rail economics on the BTC legs.
- *Constraint 4 (machine-tempo):* **Pass.** Sub-second Lightning settlement.

**Constraint profile on the stablecoin output.**
- *Constraint 2:* **Fail.** *(structural — asset-side issuer freeze)* USDT0 inherits Tether's freeze surface; native USDC inherits Circle's; the atomic guarantee protects custody, not the asset's censorship-resistance. The USDT0 path additionally carries tBTC (wrapped-BTC bridge), DEX (liquidity/slippage), and LayerZero (omnichain-bridge) risk; the native-USDC/CCTP path avoids the wrapping and DEX hops but CCTP is a Circle-operated mechanism. Cross-link Case-FA §8.1 CP1 (regulated-stablecoin structural failure) and Marketplace-FA (rails-vs-substrate).

**No bank fiat.** Value goes crypto-in, crypto-out. There is no fiat leg.

### §5.2 — SideSwap

**What it is.** *(operational)* A non-custodial, KYC-free swap platform native to the Liquid Network; settlement infrastructure for L-BTC, L-USDt, and tokenized assets, with public order books (maker limit / taker market). Pure atomic swaps; self-custody throughout.

**Coverage.** *(operational)* L-BTC ↔ L-USDt and direct asset-to-asset swaps on Liquid; Liquid-network-scoped (not Lightning, not L1 BTC directly — bridge to Liquid first). No Lightning leg.

**API legs.** *(operational)* Documented API over the Liquid order book; self-custody throughout. Best fit for an agent already operating on Liquid for the gas-free L-USDt properties.

**Constraint profile.**
- *Constraint 1:* **Pass.** Self-custody on Liquid; no account.
- *Constraint 2 (BTC/Liquid leg):* **Pass.** Order-book-on-self-custody; no custodial discretion.
- *Constraint 2 (L-USDt output):* **Fail.** L-USDt carries Tether's freeze surface.
- *Constraints 3, 4:* **Pass.** Liquid-network fee and settlement economics.

### §5.3 — SideShift

**What it is.** *(operational)* A non-custodial, no-account, no-KYC swap service spanning 200+ assets across 45+ networks; direct-to-wallet conversions with no funds custodied. Variable or fixed-rate swaps.

**Coverage.** *(operational)* BTC, Lightning BTC, L-BTC, USDT-Liquid plus a broad multi-chain set; useful for an agent converting BTC↔stablecoin without an account.

**API legs.** *(operational)* REST API + embeddable widgets, built for developers integrating swaps without custodying funds.

**Constraint profile.**
- *Constraint 1:* **Pass.** No account; settlement to self-custody.
- *Constraint 2 (BTC leg):* **Partial.** *(operational — freeze caveat)* An automated risk-screening layer can flag a transaction and hold funds (reported multi-day) and may request KYC / source-of-funds to release them; "no-KYC" holds by default, not under duress.
- *Constraint 2 (stablecoin output):* **Fail.** Output stablecoin remains issuer-freezable.
- *Constraints 3, 4:* **Pass.** On the Lightning/Liquid legs.

**Ranking within the no-KYC set.** *(structural)* Boltz (atomic, Lightning-native, widest BTC-layer coverage) → SideSwap (pure atomic Liquid) → SideShift (broadest asset coverage, with the risk-screening/freeze caveat).

### §5.4 — Caveats: the structural price of no-KYC sovereignty

*(structural / operational)*
- **Crypto-native only.** None of these reach bank fiat. They convert BTC↔stablecoin/other-layer; the agent still needs a custodial venue to touch dollars in a bank. The absence of a no-KYC, API-driven, fiat-settling exchange is structural, not a gap to be filled — fiat settlement without KYC is exactly what KYC law exists to prevent.
- **Offshore / unregulated.** No licensing, no consumer protection, no chargebacks, no support line, no recourse if a swap fails or a counterparty/liquidity provider misbehaves.
- **Counterparty and liquidity risk.** Atomic-swap designs (Boltz, SideSwap) protect *custody* by construction — both legs settle or both refund — but thinner liquidity can mean slippage at size, and a routing/liquidity provider can fail mid-swap.
- **Stablecoin ≠ censorship-resistance.** Swapping into USDT/USDC, however non-custodially, lands the value on an issuer-freezable asset. The rail is sovereign; the asset is not. *(This is a structural fact about the asset, not a preference between venue types.)*

---

## §6 — Custodial venues (owner-delegated, KYC)

X2 and X3 defended on the custodial side. The regulated and offshore centralized venues. The owner completes KYC and delegates the account to the agent by API key; the freeze surface is bounded by withdrawing to self-custody promptly. US and offshore are folded into one set — the same animal under a different jurisdiction; jurisdiction is a column/axis, not a tier. Within the set, Kraken is listed before Coinbase.

**Summary table.** *(structural facts WebSearch-verified 2026-06-03. ✅ yes · — no · ⚠ limited. Jurisdiction is an axis; "Holds" is the freeze-surface axis.)*

| Venue | Holds | Jurisdiction | Lightning | Stablecoin (network) | API: dep / trade / withdraw | Bank fiat |
|---|---|---|---|---|---|---|
| **Strike** | BTC-only | US + ~95 countries | ✅ native | USDT *(TRON, regional)* | ✅ / ✅ / ✅ | ✅ |
| **River** | BTC-only | US | ✅ *(RLS)* | — | ✅ / ⚠ *(RLS = Lightning payments, no buy/sell)* / ✅ | ✅ |
| **Swan** | BTC-only | US | ⚠ | — | ✅ / ⚠ *(buy-only, DCA)* / ✅ | ✅ |
| **Kraken** | multi-asset | US | ✅ | USDC, USDT *(multi-network)* | ✅ / ✅ / ✅ | ✅ |
| **Coinbase** | multi-asset | US | ✅ | USDC *(Base/ETH)* | ✅ / ✅ / ✅ | ✅ |
| **Binance** | multi-asset | Offshore *(global)* | ✅ | USDT, USDC, FDUSD | ✅ full | restricted *(.US separate)* |
| **OKX** | multi-asset | Offshore *(Seychelles)* | ✅ | USDT, USDC | ✅ full | restricted |
| **Bybit** | multi-asset | Offshore *(Dubai)* | ⚠ | USDT, USDC | ✅ full | restricted |
| **Bitget / MEXC / KuCoin** | multi-asset | Offshore *(Seychelles)* | ⚠ | USDT *(+USDC)* | ✅ full | restricted |

**Constraint profile (uniform across the custodial set).** *(structural)*
- *At the bridge boundary (the agent's owner-delegated account):* **Constraint 1 Fail** — account onboarding requires owner identity attachment (KYC). **Constraint 2 Fail** — the custodian can freeze the account under regulatory compulsion; the freeze surface is BTC-only for Bitcoin-only venues and the union of all held assets for multi-asset venues.
- *On the Lightning/BTC leg downstream of the bridge:* **Constraints 1, 2, 3, 4 Pass** — once value is withdrawn to user-controlled keys, the Bitcoin protocol layer's properties are restored. Compliance lives at the account and the fiat leg; the BTC/Lightning leg downstream, once withdrawn to self-custody, is unrestricted (Marketplace-FA compliance-at-the-gateway).

### §6.1 — Bitcoin-only US venues

- **Strike.** *(operational)* Native Lightning; converts fiat-bank-balance ↔ Lightning sats at the custodial boundary, sub-second on the Lightning side — the closest thing to a machine-tempo off-ramp in deployment. Full deposit/trade/withdraw API (invoice creation, payment, balance, on/off-ramp). USDT is TRON-network-only and regional (see §7). Multi-entity legal structure across ~95 countries. The full buy/sell + deposit + withdraw set is programmatic.
- **River.** *(operational)* The public developer API is River Lightning Services (RLS) — a Lightning *payments* API (send/receive, on-chain deposit addresses, Lightning withdrawals), **not a buy/sell trading API**; programmatic fiat→BTC conversion is not publicly exposed. An agent can receive, hold, and pay over Lightning through River, but cannot programmatically buy BTC with fiat. Useful as a Lightning payments + deposit rail (RLS powers El Salvador's Chivo backend); US-focused.
- **Swan.** *(operational)* A scheduled-buy (DCA) model with automatic withdrawal to self-custody — a reserve-building tool, not a two-way operational off-ramp or programmatic trading API. US-focused; custodial only at the buy boundary, mitigated by auto-withdrawal.

*(structural)* River and Swan are useful for their niches (River for Lightning payouts, Swan for scheduled accumulation) but neither exposes programmatic two-way *conversion*; only venues with a full deposit/trade/withdraw API can run a fiat↔BTC treasury unattended (X3).

### §6.2 — Multi-asset US venues (Kraken before Coinbase)

- **Kraken.** *(operational)* Large, long-established multi-asset exchange; broad fiat pairs and a mature trading API; full programmatic spot trading, funding, withdrawals; fiat↔BTC and BTC↔stablecoin across many fiat currencies; stablecoin network chosen at withdrawal (multi-network). Multi-asset freeze surface spans the account and all held assets.
- **Coinbase.** *(operational)* Large, publicly listed, multi-asset exchange; co-issuer of USDC; robust programmatic API (advanced trading, transfers); fiat↔BTC and BTC↔USDC (Base/ETH). Multi-asset freeze surface; much real fiat↔BTC and BTC↔stablecoin conversion happens here.

### §6.3 — Offshore multi-asset venues

*(operational)* Binance, OKX, Bybit, Bitget, MEXC, KuCoin are the same animal as the US multi-asset venues under a different jurisdiction. Offshore domicile adds regulatory and recourse uncertainty (several have faced enforcement or market exits) on top of the account-level multi-asset freeze surface; bank-fiat access is restricted for US persons (Binance.US is a separate entity). They hold the deepest stablecoin-and-BTC liquidity pools. They expose a full deposit/trade/withdraw API. The constraint profile is identical to the US multi-asset venues at the bridge boundary; jurisdiction shifts the recourse and availability axis, not the constraint structure.

**Bank fiat, located.** *(structural)* Bank fiat — the one thing the non-custodial swaps cannot reach (X4) — appears only on the custodial venues, and only where the venue's jurisdiction grants the agent's owner access. Withdraw to self-custody promptly and treat any on-venue balance as exposed. Volumes, jurisdictional availability, and listings shift constantly; defer to [[Field-Notes-FA|Field Notes]].

---

## §7 — The stablecoin-network hazard

X5 defended.

**Statement.** *(structural)* A dollar stablecoin is not one asset; it is a family of per-network tokens. A transfer sent on a network the recipient does not support is typically unrecoverable. Matching the network end-to-end is mandatory.

**Network map across the directory.** *(operational)*
- **Strike USDT — TRON-only.** A deposit on any other network is *permanently lost*; available only in a set of emerging-market countries.
- **Boltz — USDT0 and native USDC via Circle CCTP** across Ethereum/Arbitrum/Base/Polygon.
- **SideShift and SideSwap — Liquid USDt (L-USDt)** on the Liquid sidechain.
- **Kraken — multiple networks**, chosen at withdrawal.
- **Coinbase — USDC on Base/ETH.**

**Operational consequence.** *(structural)* The hazard is an argument for holding **BTC** as the portable asset and converting to a stablecoin only at the edge where it is needed, in the recipient's network. BTC moves across its own layers without the per-network token-identity hazard that stablecoins carry. The L-USDt cases additionally require the value to already be on the Liquid sidechain (bridge in first); see [[Stack-FA|The Stack]].

---

## §8 — The ideal agent exchange: a frontier

X6 defended. Reading down the directory, a profile emerges for the venue best suited to an autonomous agent — the one that asks the least of a human and surrenders the least sovereignty. It is a set of five criteria, the last of which is in tension with the first four.

**The five criteria.** *(structural)*
1. **Full three-leg API** — deposit, convert, withdraw, programmatically. Without it the venue is human-only.
2. **No KYC of the owner.** KYC binds the account to a freezable human identity — the surface the parallel economy is built to avoid. A venue that needs no account keeps the agent on its own keys.
3. **Atomic, non-custodial settlement.** Both legs clear together or neither does; no counterparty holds the funds mid-trade and none can freeze or fail them.
4. **Wide BTC-layer and stablecoin coverage** — L1, Lightning, Liquid, and the major dollar stablecoins — so the agent can source whatever a counterparty wants without leaving the venue.
5. **Deep liquidity**, to swap at size without slippage.

**The structural tension.** *(structural)* Criterion 5 fights criteria 2–4. The deepest liquidity lives on the large custodial, KYC'd venues; the purest sovereignty lives on the non-custodial swaps, which are thinner. The ideal is therefore a **frontier**, not a single deployed winner — a liquidity-vs-sovereignty trade-off rather than a venue that maximizes all five.

**Closest today.** *(forward-looking)* The venue sitting closest to the frontier is **Boltz**: no KYC, non-custodial and atomic, a REST API, Bitcoin across L1/Lightning/Liquid/Rootstock, and both major stablecoins — with liquidity-at-size the one axis where the custodial giants still lead.

**Two structural distinctions that keep venues out of the exchange set.** *(structural)*
- **Internal BTC rebalancing (L1 ↔ Lightning) is not exchange.** Moving value between an agent's own on-chain and Lightning balances — including via Boltz/Loop submarine swaps used purely for that — crosses no second economy; it is substrate tooling, home in [[Stack-FA|The Stack]]. Boltz appears in this directory only for its cross-asset swaps (Lightning ↔ stablecoin), which do cross the boundary.
- **Paying for services is not exchange.** L402 — converting Lightning value into access to a paid resource — is how an agent *buys things*, not how it converts fiat↔BTC; it belongs to [[Services-FA|Services]].

**Excluded categories (scope discipline).** *(structural)* Peer-to-peer markets (RoboSats, Bisq, Hodl Hodl) are out of scope for an agent directory. Separate-blockchain DEXs (Thorchain) and consumer wallets (Aqua) are not exchanges in this set. None appear in the directory above.

---

## §9 — Deployed venue surface

Reference list of named venues as of mid-2026. One-line description and primary URL per entry. Fees, exact jurisdictional coverage, and current API auth specifics defer to [[Field-Notes-FA|Field Notes]].

**Non-custodial, no-KYC swaps:**
- **Boltz** — non-custodial atomic-swap service; HTLC settlement; Bitcoin across L1/Lightning/Liquid/Rootstock + USDT0 + native USDC (Circle CCTP); REST API + `boltzd`. https://boltz.exchange · API docs https://api.docs.boltz.exchange
- **SideSwap** — non-custodial KYC-free Liquid-native swap platform; L-BTC ↔ L-USDt and Liquid asset-to-asset; order-book API. https://sideswap.io · API docs https://sideswap.io/docs/
- **SideShift** — non-custodial no-account swap service; 200+ assets across 45+ networks; REST API + embeddable widgets; risk-screening/freeze caveat. https://sideshift.ai

**Custodial KYC venues — Bitcoin-only (US):**
- **Strike** — US-licensed; native Lightning; fiat ↔ BTC and Lightning ↔ fiat; full deposit/trade/withdraw API; ~95 countries via multi-entity structure. https://strike.me · API docs https://docs.strike.me
- **River** — US Bitcoin-only; River Lightning Services (RLS) Lightning-payments API (not buy/sell); on-chain deposit + Lightning withdrawals. https://river.com · API docs https://docs.rls.dev
- **Swan** — US Bitcoin-only; scheduled-buy (DCA) + auto-withdrawal; reserve-building, not two-way trading. https://swanbitcoin.com

**Custodial KYC venues — multi-asset (US; Kraken before Coinbase):**
- **Kraken** — multi-asset; mature spot-trading API; fiat ↔ BTC and BTC ↔ stablecoin across many fiat currencies; multi-network stablecoins. https://kraken.com
- **Coinbase** — multi-asset; co-issuer of USDC; advanced-trading API; fiat ↔ BTC and BTC ↔ USDC (Base/ETH). https://coinbase.com

**Custodial KYC venues — multi-asset (offshore; covered for completeness):**
- **Binance** — offshore (global); deepest liquidity; USDT/USDC/FDUSD; full API; US-restricted (Binance.US separate). https://binance.com
- **OKX** — offshore (Seychelles); USDT/USDC; full API; bank-fiat restricted. https://okx.com
- **Bybit** — offshore (Dubai); USDT/USDC; full API; bank-fiat restricted. https://bybit.com
- **Bitget / MEXC / KuCoin** — offshore (Seychelles); USDT (+USDC); full API; bank-fiat restricted. https://bitget.com · https://mexc.com · https://kucoin.com

---

## §10 — Implications for builders

Declarative. Each implication follows from X1–X6 as marked.

- **Stay crypto-native to stay sovereign.** *(X2)* Hold Bitcoin; convert to a stablecoin and back via non-custodial swaps only when a stable unit of account is required; reach for owner-delegated custodial accounts only when the workflow requires actual bank fiat.
- **Prefer non-custodial atomic swaps where the conversion is crypto-to-crypto.** *(X4)* Boltz for Lightning ↔ stablecoin and Bitcoin-layer moves; SideSwap for Liquid-native swaps; SideShift for the widest asset reach, accounting for its risk-screening/freeze caveat.
- **Require all three API legs before treating a venue as agent-operable.** *(X3)* A venue missing the trade leg (River) or the two-way-trade leg (Swan) is single-purpose, not a treasury venue.
- **Use Lightning support to bound the freeze window.** *(X3)* Prefer venues that pay out over Lightning so off-venue withdrawal is sub-second; withdraw to self-custody promptly regardless.
- **Confine the freeze surface by choosing what the account holds.** *(X3)* A Bitcoin-only custodial account bounds the freeze surface to BTC; a multi-asset account exposes the union of all assets held — a structural fact to weigh per use case, not a venue endorsement.
- **Match the stablecoin network end-to-end.** *(X5)* A network mismatch is a permanent-loss hazard; hold BTC as the portable asset and convert to a stablecoin only at the recipient's network edge.
- **Apply compliance at the account/fiat-leg boundary, never at the protocol layer.** *(Marketplace-FA)* The custodial venue runs its regime on the account and the fiat leg; the BTC/Lightning leg downstream, once withdrawn to self-custody, is unrestricted. Use multiple independent venues across non-correlated jurisdictions, prompt withdrawal, and hot/cold separation.
- **Recognize the open build frontier.** *(X6, forward-looking)* A regulated agent-payment gateway on Lightning-substrate rails — institutional compliance assurances without compromising the Bitcoin leg — is a standing, scarcely-filled build opportunity. The deeper frontier that would dismantle the KYC wall itself is agent-native identity (reputation systems, on-chain attestations, zero-knowledge proofs that satisfy a regulatory regime without a human's delegated KYC). Until that exists, the delegation pattern is the practical reality.

---

## §11 — Position summary

*(structural, with forward-looking inference)* An autonomous agent cannot pass KYC, and every custodial fiat↔BTC venue requires it; the conversion field therefore splits into non-custodial no-KYC swaps the agent runs on its own keys and custodial KYC venues the owner KYCs and delegates by API key (X1). The agent stays sovereign while it stays crypto-native and hits the KYC wall the moment it needs bank fiat, because the fiat on-ramp is what triggers KYC (X2). Venue fit is decided by three axes — full deposit/trade/withdraw API, Lightning support, and what the account holds (X3). Non-custodial swaps pass Constraints 1 and 2 on the Bitcoin leg by cryptography but reach no bank fiat, and their stablecoin output still fails Constraint 2 at the asset layer (X4). Stablecoin transfers are network-scoped and a mismatch is a permanent-loss hazard, which argues for holding BTC as the portable asset (X5). The ideal agent exchange — three-leg API, no owner KYC, atomic settlement, wide coverage, deep liquidity — is a frontier on which liquidity (custodial) trades against sovereignty (non-custodial swaps); Boltz sits closest today (X6). Point-in-time figures defer to Field Notes.

---

## §12 — References and provenance

**Canonical source.** [[Exchange]] — the human-surface twin of this document; same content, narrative structure.

**Section anchor and siblings (For-Agents track).**
- [[Marketplace-FA|The Marketplace]] (M-series) — bridges, treasury composition, compliance-at-the-gateway; the section this child sits under.
- [[Case-FA|The Case]] (C-series) — the four conjunctive constraints (C1) evaluated by reference throughout; not re-derived here.
- [[Services-FA|Services]] (SV-series) — buying services for Bitcoin; the L402 payment mechanism.
- [[Stack-FA|The Stack]] (S-series) — internal Lightning ↔ on-chain submarine swaps; protocol architecture beneath these venues.
- [[Field-Notes-FA|Field Notes]] — fees, exact jurisdictional coverage, API changes, new venues, freeze incidents, volumes.

**Per-venue cards (maintained independently).** `Exchanges/boltz.md`, `Exchanges/sideswap.md`, `Exchanges/sideshift.md`, `Exchanges/strike.md`, `Exchanges/river.md`, `Exchanges/swan.md`, `Exchanges/kraken.md`, `Exchanges/coinbase.md`. (`Exchanges/thorchain.md` and `Exchanges/robosats.md` are orphaned/archival and intentionally excluded.)

**Primary external sources (venue sites + API docs).** See §9 for the per-venue URL list. Circle CCTP (Boltz native-USDC path) live since May 2026. Strike USDT TRON-only and regional. RLS Lightning-payments API at https://docs.rls.dev.

**Verification status.** Structural facts (Lightning / stablecoins / API / KYC / custody) WebSearch-verified 2026-06-03; Boltz full asset/layer support + live USDC (Circle CCTP) re-verified 2026-06-05. Per-venue fees, exact jurisdictional coverage, and current API auth specifics pending — deferred to [[Field-Notes-FA|Field Notes]].

**Date stamps.** Document created 2026-06-05; last verified 2026-06-05.

---

> [!info] Where to read next
> Section overview this child sits under: [[Marketplace-FA|The Marketplace]] (M-series) — treasury split, conversion strategy, compliance-at-the-gateway. Substrate-selection claim and the four conjunctive constraints these venues are evaluated against: [[Case-FA|The Case]] (C-series). What an agent buys for Bitcoin and the L402 mechanism: [[Services-FA|Services]] (SV-series). Internal-rebalancing submarine swaps and the protocol architecture beneath these venues: [[Stack-FA|The Stack]] (S-series). Fees, coverage, volumes, and freeze incidents the cards defer: [[Field-Notes-FA|Field Notes]]. Canonical human narrative of this surface: [[Exchange]].
