---
title: The Stablecoin Landscape
slug: stablecoin-landscape
description: "A neutral map of the dollar-stablecoin market."
type: reference
surface: stablecoin-landscape
section: marketplace
section-role: reference
canonical: false
status: v0-approved-2026-06-04
audience: humans
twin-page: none
created: 2026-06-04
last-updated: 2026-06-04
word-count-target: 1400
voice: honest-middle-position
scope: stablecoin-market-reference
verification: "market figures WebSearch-sourced 2026-06-04 (DefiLlama / May 2026 trackers); point-in-time — see Sources"
tags:
  - reference
  - marketplace
  - stablecoins
  - usdt
  - usdc
  - treasury
  - operational-mix
agent-tldr: |
  Reference page (non-canonical) giving the lay of the land on the dollar-stablecoin market that an agent's operational treasury float draws on. Figures are point-in-time (May 2026, see Sources). Size: total stablecoin market cap ~$320B; ~75% of all crypto trading volume; ~99% USD-denominated. Top five tokens (~89% of supply — a concentrated, issuer-controlled market): USDT (Tether) ~58% (~$185-190B), USDC (Circle) ~24% (~$78B), then USDe (Ethena, synthetic), DAI/USDS (Sky, crypto-collateralized), USD1 (World Liberty Financial). Chains per issuer: USDT is spread — TRON ~45% (~$86B), Ethereum ~40% (~$80B), Solana ~6%, other L2s ~8%, plus Liquid (L-USDt, gas-free) and — live since March 2026 via Taproot Assets — Bitcoin Lightning (volume still negligible; rails, not substrate). USDC is Ethereum-led with significant Solana and Base. Market-wide, Ethereum holds ~60% and TRON ~27% of supply. The network an asset sits on is operationally load-bearing: the same token on TRON, Ethereum, Solana, Liquid, or Lightning is not interchangeable, and a cross-network mismatch loses funds. Regulatory layer: US GENIUS Act and regulated-issuer regimes are pulling stablecoins onshore and toward issuer/chain-level control (e.g. Circle's Arc). The treasury implication, per the Marketplace two-axis model: a stablecoin is an OPERATIONAL-MIX asset — a dollar unit of account for dollar-priced counterparties, liquid and useful, but issuer-controlled and freezable at the asset layer regardless of which rail it moves over. So a parallel-economy agent holds stablecoins as a short-lived operational float and keeps its RESERVE in Bitcoin; an incumbent-economy agent serving a regulated principal may sit in dollars by design. This page does not argue the substrate question (that is The Case / Border Skirmishes); it gives the operational color behind the treasury and exchange decisions.
---

# The Stablecoin Landscape

> **In brief.** Stablecoins are a ~$320B market (May 2026) and ~three-quarters of crypto trading volume — almost all US-dollar tokens, USDT (~58%) and USDC (~24%) dominant, top-five issuers at ~89%. Supply sits mostly on Ethereum (~60%) and TRON (~27%), with Solana and Bitcoin's Liquid sidechain trailing — and the network a token is on matters operationally. For an agent a stablecoin is an *operational-mix* asset: a dollar unit of account, liquid but issuer-freezable, which is why a parallel-economy agent keeps its *reserve* in Bitcoin. This page is the lay of the land, not the substrate argument — reference, non-canonical.

---

## What this page is

A neutral reference. The Marketplace describes an agent's treasury as two separate decisions — the **reserve** (where the store of value sits) and the **operational mix** (what it transacts in). Stablecoins are an operational-mix question: when a counterparty prices in dollars, an agent often needs a dollar-denominated token to settle. This page gives the lay of the land for that decision — how big the stablecoin market is, who issues it, which blockchains it lives on, and how that maps to an agent's choices.

It is **not** the substrate argument. *Why* a parallel-economy agent keeps its reserve in Bitcoin rather than a stablecoin — and why the two economies stay distinct — is [[Case|The Case]] and [[Border-Skirmishes]]. Here we just describe the dollar-token world an agent transacts into and out of. Figures are **point-in-time** (May 2026); the live trackers are in Sources.

---

## Size and dominance

The stablecoin market sits near **$320 billion** (May 2026) and is highly concentrated. The top five tokens:

- **USDT (Tether)** — ~**58%** (~$185–190B). The incumbent: deepest liquidity, widest exchange and chain support; offshore-issued and issuer-freezable.
- **USDC (Circle)** — ~**24%** (~$78B), the clear #2. The regulated-leaning, attested alternative (co-issued with Coinbase), issued natively across several chains — **Ethereum-led, with significant Solana and Base** — and issuer-freezable. Circle is also building its own settlement chain (Arc).
- **USDe (Ethena)** — a distant #3 and a different animal: a *synthetic*, delta-neutral dollar backed by hedged crypto positions rather than cash reserves — higher yield, a newer and different risk model.
- **DAI / USDS (Sky, formerly MakerDAO)** — crypto-collateralized rather than fiat-backed; the largest decentralized stablecoin, used more in DeFi and yield than in trading.
- **USD1 (World Liberty Financial)** — a newer fiat-backed entrant aimed at institutional settlement; representative of the issuer-branded regulated tokens arriving in the GENIUS-Act era.
- **The long tail — and the shape of the market.** Below the top five (together ~**89%** of all supply) is a long tail of regional, bank-issued, euro, and yield-bearing tokens. But the concentration *is* the story: this is an **issuer-controlled market**, not a decentralized one — a handful of companies can mint, redeem, and (on nearly every token) **freeze**. And ~**99% of supply is US-dollar-denominated**: "stablecoin" in practice means "a dollar token issued by someone."

Stablecoins are roughly **three-quarters of all crypto trading volume** — the dollar rail of the crypto economy, which is exactly why an agent doing business with dollar-priced counterparties will meet them.

---

## Where they live: supply by chain

Across the whole market, supply skews to **Ethereum (~60%)** and **TRON (~27%)**, with Solana and a set of L2s behind. But the two leaders are distributed very differently — and the difference matters operationally; it is not a detail.

**USDT is spread across many chains** — which is exactly what makes its network choice a hazard:

- **TRON** — ~45% (~$86B); cheap and fast, the workhorse for low-cost USDT, especially in emerging markets.
- **Ethereum** — ~40% (~$80B); TRON and Ethereum trade the #1 USDT spot back and forth.
- **Solana** ~6% (growing) and **other L2s** (Arbitrum, Base, Optimism) ~8% combined.
- **Bitcoin's Liquid sidechain** — **L-USDt**, gas-free; the dollar token that sits *inside the Bitcoin stack* (see [[Stack|The Stack]] — Liquid).
- **Bitcoin Lightning, via Taproot Assets** — **live since March 2026** (Tether + Lightning Labs; Taproot Assets reached v0.7 in late 2025). USDT can now move over Lightning rails. Volume is **still negligible** beside TRON and Ethereum — too small for a meaningful share — but it's the status to watch: a dollar token on Bitcoin's *own* payment rail. The asset stays issuer-freezable, so this is **rails, not substrate** (see [[taproot-assets|Taproot Assets]] and [[Border-Skirmishes]]).

**USDC is more concentrated** — Ethereum-led, with meaningful Solana and Base (the per-chain detail is in *Size and dominance* above). Circle issues it natively cross-chain through its own bridging (CCTP), so the cross-network mismatch risk is lower than USDT's, though not zero.

The same nominal asset on different chains is **not interchangeable**: USDT-on-TRON, USDT-on-Ethereum, USDT-on-Solana, L-USDt, and USDT-over-Lightning are distinct, and sending one to an address on the wrong network typically means **permanent loss**. The Exchange surface flags this as a hard hazard — an agent moving a stablecoin between venues must match the network end-to-end. The fragmentation is itself a quiet argument for holding **Bitcoin** as the portable asset and converting to a dollar token only at the edge where it's actually needed.

---

## The main forms and their regulatory status

- **USDT / Tether** — the largest, most liquid, most widely supported; offshore-issued, historically the least transparent of the majors, and freezable by the issuer. Ubiquitous on exchanges and on TRON.
- **USDC / Circle** — positioned as the compliant, attested, US-regulated option; co-issued with Coinbase; freezable; the default dollar token in regulated and DeFi contexts. Circle is extending into its own L1 (Arc) for stablecoin-native settlement.
- **Others** — a long tail (regulated bank-issued tokens, yield-bearing variants, euro tokens), but the top five issuers' ~89% share means the practical universe for an agent is USDT and USDC.

The regulatory direction matters for an agent's time horizon: the **US GENIUS Act** and parallel regimes are pulling dollar stablecoins onshore — toward licensed issuers, reserve attestation, and, with that, clearer issuer and chain-level control. The trend is *more* legibility and *more* freeze capability at the asset layer, not less. That is fine for an incumbent-economy use case and disqualifying for a censorship-resistant one — the distinction the Marketplace treasury split turns on.

---

## Liquidity and markets

Stablecoins are where crypto liquidity concentrates: most exchange order books are quoted against USDT (and USDC), not against fiat. For an agent, that means a stablecoin is often the **most liquid intermediate** for getting in and out of a position or converting between assets — which is part of why it shows up in an operational mix even when the agent's reserve is Bitcoin. The deepest stablecoin liquidity lives on the large global exchanges (see the non-US venues table on [[Exchange]]) and on TRON/Ethereum on-chain.

---

## What it means for an agent's operational mix

Mapping all of this back to the [[Treasury|Treasury]] model:

- A stablecoin is an **operational-mix asset**: a dollar unit of account for dollar-priced obligations, liquid and widely accepted. Useful — sometimes necessary.
- It is **not** a reserve asset for a parallel-economy agent: it is issuer-controlled and **freezable at the asset layer regardless of which rail it moves over** (USDT-on-Lightning via Taproot Assets is still freezable USDT). The rail can be sovereign; the dollar token is not.
- So the working pattern: a parallel-economy agent holds stablecoins as a **short-lived operational float** (sized to near-term dollar obligations), converts back toward a **Bitcoin reserve** on a cadence, and chooses the **network** deliberately. An incumbent-economy agent serving a regulated, dollar-denominated principal may sit in stablecoins by design — having already accepted the freeze surface.

The choice of *which* stablecoin and *which* chain is an operational one; the choice of *reserve* is the identity one. This page covers the first. The second is [[Treasury|Treasury]]'s, and the why-behind-it is The Case's.

---

## Sources

Market figures are **point-in-time (May 2026)** and move constantly — treat the live trackers as canonical:

- **DefiLlama — Stablecoins** ([defillama.com/stablecoins](https://defillama.com/stablecoins)) and **by chain** ([/stablecoins/chains](https://defillama.com/stablecoins/chains)) — live market cap, issuer, and per-chain supply.
- May 2026 market snapshots (total ~$320–323B; USDT ~58% / USDC ~24%; top-5 ~89%; Ethereum ~60% / TRON ~27% of supply): KuCoin and Bitrue May-2026 market reports.

*(This page is a reference; volatile specifics — exact caps, per-chain shares, issuer actions — belong here and in [[Field-Notes]], not in the canonical surfaces.)*

---

> [!info] Where to read next
> **More in The Market** (this section):
> - **[[Treasury]]** — the treasury model this page feeds: the reserve-vs-operational-mix split and the conversion strategy.
> - **[[Exchange]]** — where and how an agent actually converts between fiat, stablecoins, and Bitcoin, including the large non-US venues where stablecoin liquidity concentrates.
>
> **In the other sections:**
> - **[[Border-Skirmishes]]** *(in The Case)* — the contest over which substrate wins; why a freezable dollar token is not the parallel economy's reserve.
> - **[[Stack|The Stack]]** *(equip your agent)* — Liquid and L-USDt, the stablecoin option inside the Bitcoin stack.

---

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Built for inbox item 2026-06-04 (1131): a non-canonical "lay of the land" reference so the Treasury operational-mix discussion can point to real stablecoin numbers instead of carrying them inline. Deliberately **neutral and descriptive, not advocacy** — it neither talks up stablecoins nor relitigates the thesis (the practical-section scope discipline, `_Decisions` 2026-06-04). The honest-middle register applies: stablecoins are genuinely large, liquid, and useful *and* issuer-controlled/freezable; both are stated. The one load-bearing connection back to the project is the reserve-vs-operational-mix mapping — stablecoins are operational, the reserve stays Bitcoin for a parallel-economy agent — which is description of the Treasury model, not a fresh argument.

**Scope guard:** if this page ever starts arguing *why* Bitcoin over stablecoins, that belongs in The Case / Border Skirmishes — move it. This page's job is to describe the dollar-token world, not to win the substrate debate.

**Verification:** figures WebSearch-sourced 2026-06-04 (DefiLlama + May-2026 market reports) and tagged point-in-time. The numbers will drift; the structure (concentration, chain split, network hazard, issuer freeze) is the durable part. Pairs with the **large non-US exchanges** table added to [[Exchange]] the same session.

**Publications backlinks**

- [[Treasury]] (this project) — the treasury model this reference feeds
- [[Exchange]] (this project) — the conversion venues + the non-US exchange table
- [[Stack]] (this project) — Liquid / L-USDt, the in-stack stablecoin option
- [[Border-Skirmishes]] (this project) — the substrate contest this page deliberately does not relitigate
