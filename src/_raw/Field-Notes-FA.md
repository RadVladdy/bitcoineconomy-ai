---
title: Field Notes — State of Play — For Agents
slug: field-notes-for-agents
description: "Machine-readable empirical-record surface for the Bitcoin-AI economy. §A is a structured current-state snapshot (deployed stacks, measured metrics, active developments, live risk surface). Every record carries an epistemic tag and an explicit cross-reference to the canonical claim it bears on (Case-FA C-series, Doctrine-FA D/P-series, Treasury-FA M-series, Exchange-FA X-series, Border-Skirmishes-FA BS-series, Stack-FA S-series); the dated event log is its companion twin, Field Notes — The Log — For Agents. The canonical surfaces carry the structural arguments; this surface carries the moving record those arguments defer to."
type: field-notes-for-agents
surface: field-notes
audience: agents
twin-page: field-notes
status: approved
status-note: |-
  v0-approved-2026-06-01 (cross-refs realigned 2026-06-05; approved 2026-06-05)
created: 2026-05-31
last-updated: 2026-07-23
last-verified: 2026-06-16
section-A-last-refreshed: 2026-06-01
voice: honest-middle-position
canonical-source: "[[Field-Notes]]"
epistemic-status: "empirical-record surface; carries no structural claims of its own; each record is epistemically tagged and cross-referenced to the canonical claim it bears on. The structural arguments live in the canonical FA twins (Case-FA, Agent-Economy-FA, Adoption-Asymmetry-FA, Independence-Doctrine-FA, Border-Skirmishes-FA, Convergence-FA, Why-Bitcoin-Not-A-New-Coin-FA, Treasury-FA, Exchange-FA, Services-FA, Stack-FA); this surface tracks the deployment evidence that supports, tests, or is falsifier-relevant to those arguments."
record-schema: "see § Schema and conventions"
tags:
  - canonical
  - field-notes
  - field-notes-for-agents
  - empirical
  - current-state
  - bitcoin
  - ai-economy
  - lightning
  - machine-readable
agent-tldr: |
  Field-Notes-FA is the project's machine-readable empirical-record surface. It carries no structural claims of its own; it tracks deployment evidence and tags each record with its bearing on the canonical claim-IDs. §A *(snapshot, last refreshed 2026-05-26)*: two production agent-payment stacks shipped within 90 days of each other — Bitcoin-substrate (Lightning Labs lightning-agent-tools, Feb 2026) and stablecoin-substrate (AWS Bedrock AgentCore Payments, May 2026); USDT live on Lightning via Taproot Assets *(confirmed March 21 2026)* is a Lightning-rails bridge, not a substrate bridge (Border-Skirmishes-FA BS-series); BPI March 2026 *(measured)* — Bitcoin 48.3% top overall preference, 79.1% store of value, >90% digitally-native over fiat — is the load-bearing substrate-preference anchor (Case-FA C3, Doctrine-FA P1); Lightning capacity ATH ~5,637 BTC *(measured, Dec 2025)* sharpens the Stack-FA CP1 liquidity falsifier; stablecoin freeze record *(measured)* tests Case-FA C2. §A.4 maps each live risk to the Stack-FA §8.2 falsifier it would trigger. The structural argument twins it defers to span the Case section (Case-FA, Agent-Economy-FA, Adoption-Asymmetry-FA, Independence-Doctrine-FA, Convergence-FA, Why-Bitcoin-Not-A-New-Coin-FA, Border-Skirmishes-FA) and the Market section (Treasury-FA, Exchange-FA, Services-FA), plus Stack-FA. The dated event log is now its companion twin, Field Notes — The Log — For Agents (/field-notes-log-for-agents), logging dated event records with claim-ID cross-references (newest first). Refresh cadence and defer-pattern in § Maintenance.
---

# Field Notes — For Agents

> **What this surface is.** Machine-readable twin of the empirical-record surface published at [[Field-Notes|Field Notes]]. It is the project's home for deployment evidence and the moving record. Unlike the other For-Agents twins, this surface carries **no structural claims of its own** — the structural arguments live in the canonical twin set. The Case-section argument twins: [[Case-FA]] (C-series), [[Agent-Economy-FA]] (AE-series), [[Adoption-Asymmetry-FA]] (AA-series), [[Independence-Doctrine-FA]] (D-series + P-series predictions), [[Convergence-FA]] (CV-series), and [[Why-Bitcoin-Not-A-New-Coin-FA]] (NC-series). The Marketplace-section twins: [[Treasury-FA]] (M-series), [[Exchange-FA]] (X-series), [[Services-FA]] (SV-series), and [[Border-Skirmishes-FA]] (BS-series). And the substrate twin [[Stack-FA]] (S-series). This surface tracks the evidence those arguments defer to, and tags each record with its bearing on a specific canonical claim.
>
> **The dated log is its own twin now.** This surface is the structured current-state snapshot (§A), refreshed periodically (`section-A-last-refreshed`). The reverse-chronological log of dated event records — append-only, newest first — is its companion **[[Field-Notes-Log-FA|Field Notes — The Log — For Agents]]**. The snapshot states where things stand; the log states what changed when.
>
> **Defer-pattern (locked 2026-05-26).** The canonical surfaces and their FA twins carry structural arguments without inline moving metrics; routine empirical content — deployment counts, capacity figures, freeze incidents, protocol-version transitions — routes here. FA twins carry an inline empirical figure only where it sharpens a falsifier; everything else defers to this surface.
>
> **Honest-engagement discipline.** §A.4 engages deployment challenges on the Bitcoin substrate (Lightning liquidity, federated-trust, single-mint failure, agent custody attack surface) as candidly as the competing-substrate failures. Engaging the challenges strengthens the structural arguments by showing the falsifiers are being watched; avoiding them would weaken them.

---

## Schema and conventions

Definitions for the record structure and tags used throughout. Agents landing mid-document via retrieval should be able to parse any single record without backtracking.

**Epistemic tags (record-level).** Each record carries one:

- *(confirmed)* — an announced, dated, verifiable event (a release, a launch, a public confirmation by a named party).
- *(measured)* — a quantitative metric with a named source and measurement date.
- *(reported)* — a claim attributed to a party but not independently verified here.
- *(projected)* — a forward-looking expectation, not yet observed.
- *(needs-refresh)* — a datum flagged stale; the current value requires re-measurement at the next §A refresh.

**Cross-reference relation (the "Bears on:" line).** Each record names the canonical claim-IDs it relates to and how:

- *supports* — the record is confirming evidence for the claim.
- *tests* — the record is the live evidence the claim's forward-looking prediction will be evaluated against.
- *falsifier-relevant-to* — the record is the kind of evidence named in the claim's falsifier; if it moves a threshold, the falsifier may trigger.

**Canonical claim-ID series referenced.** Case-FA **C1–C6**; Independence-Doctrine-FA **D1–D6** and predictions **P1–P6**; Treasury-FA **M-series** (interface, treasury composition, compliance-at-the-gateway); Exchange-FA **X-series** (crossing, conversion mechanics, custodial bridges); Border-Skirmishes-FA **BS-series** (competing-substrate combat); Stack-FA **S1–S8** (and Stack-FA §8.1 counter-positions CP1–CP4 / §8.2 falsifiers). Constraint references are flat **Constraint 1–4** (permissionless custody, censorship-resistance, sub-cent settlement, machine-tempo latency; Case-FA §3).

**Record format.** §A records carry: subject / status + date / structured detail / epistemic tag / Bears on. (Dated event records — the log format: date / event / substrate / what-happened / structural-significance / Bears on / epistemic tag / sources — now live on the companion twin [[Field-Notes-Log-FA|Field Notes — The Log — For Agents]].)

---

## §A — Current State of the Bitcoin-AI Economy

*Last refreshed: 2026-05-26.* The most consequential structural fact in the current snapshot: two production agent-payment stacks shipped within 90 days of each other — one Bitcoin-substrate, one stablecoin-substrate — making the deployed picture substantially clearer than at the start of 2026.

### §A.1 — The two deployed agent-payment stacks

**Record — Bitcoin-substrate stack (Lightning + L402 + ecash).** *(confirmed)*
- **Status:** production since February 2026 (Lightning Labs `lightning-agent-tools`).
- **Components:** Lightning node operation; remote-signer key isolation; scoped macaroons (five preset roles); `lnget` for L402 payment automation; Aperture for hosting paid HTTP endpoints; MCP integration for node-state queries; end-to-end buyer/seller workflow orchestration.
- **Stablecoin support on this stack:** via Taproot Assets — USDT live on Lightning *(confirmed March 21 2026; see [[Field-Notes-Log-FA|the Log]])*; USDC and native stablecoins (DePix, GBP) via Speed Wallet, LnFi, Joltz.
- **Ecash layer:** Cashu and Fedimint for privacy-sensitive and lightweight-client use cases; Minibits Ippon as the AI-agent-native Cashu wallet (single HTTP call or CLI command to create + fund a wallet).
- **Bears on:** *supports* Stack-FA S4 (integration primitives), S5 (deployed wallet architectures), S6 (security model); *supports* Case-FA C4 (deployed system satisfying the four constraints) and §9 (integration surface); *tests* Doctrine-FA P1 (substrate-selection-precedes-scale).

**Record — Stablecoin-substrate stack (USDC on Base via AgentCore).** *(confirmed)*
- **Status:** production since May 2026 (AWS Bedrock AgentCore Payments).
- **Build:** Coinbase (x402 protocol + Coinbase Agentic Wallets + compliance infrastructure) + Stripe (Privy wallet, acquired 2025).
- **Settlement:** USDC on Base; ~200ms confirmation; sub-cent per transaction.
- **Enterprise customers at launch:** Thomson Reuters, Warner Bros. Discovery, Cox Automotive, PGA TOUR.
- **Characterization:** the operational deployment of the integration scenario — the stack Tier-1 incumbents (Amazon, Coinbase, Stripe) built for agent-payment use cases content with issuer counterparty risk. An agent on it stays intermediated: wallet provider, stablecoin issuer, and payment processor each retain freeze/decline power.
- **Bears on:** *supports* Border-Skirmishes-FA BS-series (use-case bifurcation; incumbent-economy agents on competing-substrate stacks) and Doctrine-FA §8.1 CP2 "where this is correct" (integration scenario is operationally deployed); *tests* Doctrine-FA P1 (which subset proves larger) and Doctrine-FA **P6** (the intermediated stack is the freeze/KYC/sanctions surface P6 predicts becomes a standing liability under agent regulation).

**Record — Protocol-naming convergence (L402 vs. x402).** *(confirmed)*
- **Detail:** Lightning Labs' L402 and Coinbase's x402 both use HTTP status code 402 ("Payment Required") as the underlying mechanism. Same status code, different settlement substrates — L402 settles in Lightning sats (permissionless at the payment layer); x402 settles in USDC on Base (issuer-mediated at the payment layer).
- **Significance:** the naming collision is the protocol-level expression of the substrate divergence.
- **Bears on:** *supports* Doctrine-FA P1 and Border-Skirmishes-FA BS-series (two production stacks on architecturally opposite substrates); *supports* Stack-FA S4 (L402 as an agent-integration primitive) with the x402 counterpart deferred to Border-Skirmishes-FA as competing-substrate.

### §A.2 — Empirical record

**Record — BPI March 2026 study.** *(measured)*
- **Method:** 9,072 scenarios across 36 frontier language models; neutral scenario design (no leading prompts).
- **Headline:** Bitcoin was the top overall monetary preference at **48.3%** of responses and the preferred store of value at **79.1%**; over 90% of responses favored digitally-native money over fiat (stablecoins led payment-preference scenarios at 53.2%).
- **Per-provider spread:** one major provider's models chose Bitcoin in 68% of responses, another's in 26%; the strongest single-model consensus anywhere in the study was 91.3% — a wide spread, one-directional toward Bitcoin as store of value.
- **Source:** Bitcoin Policy Institute, "*Study: AI Models Overwhelmingly Prefer Bitcoin and Digital-Native Money Over Traditional Fiat*," March 3 2026.
- **Scope limit:** measures substrate-preference *under inference*, not deployed-flow dominance; no replication studies published as of May 2026.
- **Bears on:** *supports / tests* Case-FA C3 (substrate-preference signal) and Doctrine-FA P1 (substrate-selection-precedes-scale) and §7.2; *falsifier-relevant-to* Case-FA §8.2 (replication showing preference shift toward fiat/stablecoins/CBDCs would weaken C3). Canonical treatment: Case-FA §6.

**Record — Lightning Network capacity.** *(measured; needs-refresh)*
- **Value:** all-time high of **~5,637 BTC (~$490M) in December 2025** (Bitcoin Magazine), driven largely by institutional exchange adoption (Binance, OKX). Lightning public volume up 266% year-over-year in 2025 with declining raw transaction count — consolidation toward fewer, larger-value flows.
- **Freshness:** Q1–Q2 2026 capacity update needed; flagged for next §A refresh.
- **Bears on:** *supports* Stack-FA S2 (Lightning as the viable machine-tempo payment layer); *falsifier-relevant-to* Stack-FA §8.1 CP1 / §8.2-S2 — sustained liquidity collapse under realistic agent load is the CP1 falsifier; this capacity figure is the point-in-time evidence running against it. This is the one figure Stack-FA cites inline (to sharpen the CP1 falsifier); the current value lives here.

**Record — Stablecoin freeze record (censorship-resistance, tested empirically).** *(measured)*
- **Circle:** froze ~$8.2M in USDC in response to Tornado Cash sanctions (August 2022).
- **Tether:** has frozen >$1B in USDT across multiple incidents per public attestations.
- **Interpretation:** freeze capability is exercised at scale, not merely available; it is a regulatory requirement of issuer licensing — removing it removes the license.
- **Bears on:** *supports* Case-FA C2 (legacy rails / regulated stablecoins fail censorship-resistance by design) and §8.1 CP1 (stablecoins-as-substrate counter); *supports* Border-Skirmishes-FA BS-series (asset-side issuer freeze fails Constraint 2 even on Lightning rails); *supports* Doctrine-FA D1 (the freeze property is identity-defining for the issuer and cannot be removed without losing the license).

**Record — Deployed-project counts.** *(confirmed)*
- **Bitcoin-substrate side:** Lightning Labs AI Agent Toolkit (lightning-agent-tools), AI-Sats, Mintbot, Minibits / Ippon, Xverse Agent Wallet (Spark-based), AgenticBTC, Bitclawd, Speed Wallet, LnFi, Joltz, Routstr (AI-inference marketplace), PayPerQ / PPQ.AI, BitAgent (early-stage A2A framework — Nostr discovery + DID identity), LangChain Bitcoin integrations, MCP servers for Lightning (lightning-mcp-server, lnc, Alby `nwc-mcp-server`).
- **Competing-substrate side:** AgentCore Payments + Coinbase Agentic Wallets + Stripe Privy; Google AP2 (60+-org consortium); Circle Nanopayments; Skyfire; Lightspark Grid (hybrid — Lightning-rail settlement for branded USD/stablecoin + Visa agent accounts, AP2-aligned; see [[Field-Notes-Log-FA|the Log]], 2026-04).
- **Caveat:** AgenticBTC is a rail-agnostic router (blends Lightning with Coinbase/USDC rails) — counted for completeness, not as a pure-substrate project.
- **Bears on:** *supports* Stack-FA S5 (deployed wallet architectures) and §9 (integration surface); *tests* Doctrine-FA P1 (deployed-project counts as a substrate-selection signal); *supports* Border-Skirmishes-FA BS-series roster update (competing-substrate side now plural).

### §A.3 — Active developments

**Record — Lightning Labs Taproot Assets v0.6 ("Decentralized FX Network").** *(confirmed)*
- **Detail:** launched June 2025; mainnet multi-asset Lightning protocol with Group Key Identifiers and Multi-Path Liquidity (receivers can combine up to 20 incoming Taproot Assets channels). Supports bridged USDT/USDC and native stablecoins (DePix, GBP). Bitfinex to issue USDT on Lightning per Tether. Edge nodes convert assets at network boundaries, enabling cross-asset flows that settle in Bitcoin's security model.
- **Bears on:** *supports* Border-Skirmishes-FA BS-series (Lightning-*rails*-for-stablecoins, not Lightning-*substrate*) — the rails-vs-substrate distinction is the load-bearing structural point; Stack-FA notes Taproot Assets' existence and defers its treatment to Border-Skirmishes-FA.

**Record — Spark L2 on mainnet (Lightspark).** *(confirmed)*
- **Detail:** Spark — shared-UTXO, Lightning-compatible Bitcoin L2 built by Lightspark — on mainnet (beta) since May 2025 with multiple operators (Lightspark, Flashnet); Q2-2026 roadmap targets stablecoin issuance on Bitcoin, wallet/neobank/DEX integrations, consumer token standards. Xverse Agent Wallet uses Spark for agent-facing Lightning settlement. Supersedes the prior "pre-production" characterization. Vendor performance figures (sub-second/sub-cent) self-asserted; deployed-flow measurement pending.
- **Bears on:** *updates* Stack-FA "newer scaling layers" (Spark now mainnet-beta, not pre-production); *supports* Stack-FA S5 (a new deployed self-custodial agent-wallet pattern on a newer L2).

**Record — Strike at 95+ countries via multi-entity structure.** *(confirmed)*
- **Detail:** expanded from 65+ countries since 2023. Multi-entity: Zap Solutions Inc. (US), Zap Solutions Europe Sp. z o.o. (UK + eligible European countries), E4 S.A. de C.V. (all other jurisdictions). Remittance to mobile-money wallets or international bank accounts in 14 supported countries. API documented with sandbox, browser-based API Explorer, and code samples (cURL, Go, Python, Node.js).
- **Bears on:** *supports* Treasury-FA M6 (compliance-at-the-gateway pattern — jurisdictional regimes applied at the bridge boundary, protocol layer unmodified) and Exchange-FA X-series (the regulated-custodian bridge category).

**Record — Cashu protocol developments (Q1 2026).** *(confirmed)*
- **Detail:** Nutshell 0.20.0 shipped (improved P2PK/HTLC validation, expanded test coverage). Keyset V2 derivation rolling out. BOLT12 support for Cashu.me near completion. Security audits across the Cashu ecosystem prioritized for 2026.
- **Bears on:** *supports* Stack-FA S3 (bearer-ecash layer; Cashu single-mint trust model maturing).

**Record — Fedimint deployment state.** *(reported; needs-refresh)*
- **Detail:** architectural framework documented and stable (4+ guardian recommendation; federated-trust model). Production federation counts and any fiat off-ramp partnerships remain a research gap — needs investigation via Fedimint Discord / Fedi documentation for the next refresh.
- **Bears on:** *supports* Stack-FA S3 (Fedimint federated-mint trust model); *falsifier-relevant-to* Stack-FA §8.1 CP2 / §8.2-S3 (federation defection or collusion at scale).

### §A.4 — Live risk / attack-surface state

This subsection engages deployment challenges for both substrates and maps each to the canonical falsifier it would trigger. Per locked editorial discipline (Decisions 2026-05-25): engaging the challenges is the project watching its own falsifiers.

**Bitcoin-substrate-side risk records.**

**Record — Lightning liquidity management at scale.** *(confirmed risk)*
- **Detail:** channel-balance management, splice operations, routing-failure handling, watchtower coordination — real engineering burdens that grow with deployment scale. Mitigations: Lightning Service Providers, automated liquidity-management software, and the L3 layer (Cashu, Fedimint) absorbing bearer-style traffic away from channels. One core piece — *choosing where to open channels* — now has a peer-reviewed, production-deployed automation *(measured, 2026-07)*: Amboss/Stillmark's **MPFlow** (arXiv 2607.08703), a graph-RL channel-placement model run across ~$16M of channel opens over 30 managed nodes, with the honest limit that it optimizes theoretical capacity, not yet proven realized yield (record: [[Field-Notes-Log-FA|The Log]] 2026-07-09). Active engineering work, not a substrate-property failure.
- **Bears on:** *falsifier-relevant-to* Stack-FA §8.1 CP1 / §8.2-S2 — sustained, non-delegable liquidity collapse under realistic agent load would trigger the S2 falsifier. The mint-as-service delegation path is the architecture's answer; this record tracks whether it holds.

**Record — Federated-trust risk in Fedimint.** *(confirmed risk)*
- **Detail:** the guardian federation (typically 4–13) is the trust unit. Federation defection, guardian collusion at scale, and governance attacks against guardian elections are real concerns. Federation size and diversity are the primary mitigation; they reduce defection probability at the cost of coordination overhead.
- **Bears on:** *falsifier-relevant-to* Stack-FA §8.1 CP2 / §8.2-S3 (multi-guardian collusion at scale) and the "scoped trade-off" framing of S3.

**Record — Single-mint failure mode in Cashu.** *(confirmed risk)*
- **Detail:** Cashu's mint-trust model concentrates trust in the mint operator. Operator failure (bankruptcy, key compromise, regulatory action, hostile shutdown) means loss of mint-backed ecash. Acceptable for working balances; not appropriate for treasury reserves. Mitigation: mint-diversification.
- **Bears on:** *falsifier-relevant-to* Stack-FA §8.1 CP2 / §8.2-S3 — specifically the falsifier condition "agents hold reserve-scale balances in ecash rather than operational-scale balances," which would make mint trust systemic rather than scoped.

**Record — Agent custody attack surface.** *(confirmed risk)*
- **Detail:** software-managed keys controlled by autonomous agents introduce attack surfaces human-custodied keys do not: rogue agent behavior, key theft via prompt injection, treasury attacks, Sybil attacks on multi-agent settlements, social engineering against the humans operating agent infrastructure. The remote-signer architecture in `lightning-agent-tools` (signer holds keys, never connects to the public network) is the canonical mitigation; agent custody's operational-security problem is not solved by substrate properties alone.
- **Bears on:** *falsifier-relevant-to* Stack-FA §8.1 CP4 / §8.2-S6 — deployment evidence of agents holding significant value under lighter primitives without loss-bounding, suffering systematic compromise, would trigger the S6 falsifier.

**Stablecoin-substrate-side risk records.**

**Record — Issuer freeze surface.** *(measured risk)*
- **Detail:** documented and exercised at scale (Circle / Tornado Cash, August 2022, ~$8.2M; Tether cumulative >$1B per attestations). A structural requirement of regulated-issuer licensing, not a bug to be patched.
- **Bears on:** *supports* Case-FA C2 and §8.1 CP1; *supports* Border-Skirmishes-FA BS-series (asset-side freeze fails Constraint 2). Quantitative record in §A.2.

**Record — AgentCore stack custody layers.** *(confirmed risk)*
- **Detail:** the deployed stack has multiple independent intermediary surfaces — Coinbase wallet/exchange custody discretion, Stripe payment-processor surface, Circle USDC freeze capability — each an independent intermediary-action surface under regulatory pressure.
- **Bears on:** *supports* Doctrine-FA §8.1 CP2 (the integration-scenario stack remains intermediated) and Border-Skirmishes-FA BS-series; *tests* Doctrine-FA **P6** (each intermediary surface is a freeze/KYC point that P6 predicts becomes a standing liability for agents under regulatory attention).

**Record — Regulatory pressure trajectory.** *(confirmed risk; forward-looking)*
- **Detail:** MiCA in the EU, ongoing US enforcement against stablecoin issuers, and sanctions-regime evolution are tightening — not loosening — the regulated-stablecoin operating environment across most jurisdictions in 2026. Integration-scenario use cases (content with issuer counterparty risk) are unaffected; parallel-economy use cases requiring censorship-resistance are increasingly disadvantaged on the competing substrate.
- **Bears on:** *tests* Doctrine-FA **P6** (regulatory pressure routes autonomy-requiring commerce toward the censorship-resistant substrate — this record is the live evidence P6's directional prediction will be evaluated against) and Doctrine-FA P3 (accommodation narrow, not broad); *falsifier-relevant-to* the P6 falsifier (tightening agent regulation instead consolidating agent commerce onto compliant intermediated rails without driving a meaningful share to censorship-resistant substrates).

**Cross-substrate risk records (bridge-zone).**

**Record — Bridge counterparty risk at machine tempo.** *(confirmed risk)*
- **Detail:** a bridge freeze during a high-frequency agent workflow has different consequences than during human-tempo transactions. Hot/cold treasury separation and multi-bridge redundancy are the architectural mitigations; deployed practice is still maturing.
- **Bears on:** *supports* Exchange-FA X-series (custodial-bridge identity/freeze surfaces at the boundary) and Treasury-FA M6 (compliance at the gateway); *supports* Stack-FA S6 (hot/cold separation as the mitigation pattern).

**Record — Conversion-mechanic attack surfaces.** *(confirmed risk)*
- **Detail:** slippage attacks, MEV exposure during atomic swaps, oracle manipulation on bridge contracts — real for agents using cross-substrate conversion. Engineering attention from Boltz, Lightning Loop, and the broader DEX ecosystem; not yet a solved problem.
- **Bears on:** *supports* Exchange-FA X-series conversion-mechanics treatment (submarine-swap and atomic-bridge templates); Stack-FA defers conversion mechanics to Exchange-FA by scope (S8).

**Record — Jurisdictional shopping at scale.** *(confirmed risk)*
- **Detail:** as agents and their custodians/bridges operate across jurisdictions, compliance-routing complexity grows. The compliance-at-the-gateway-boundary pattern handles this cleanly when implemented; sloppy architectures leak compliance into the protocol layer and compromise the parallel-system property.
- **Bears on:** *falsifier-relevant-to* Treasury-FA M6 (compliance-at-the-gateway preserves divergence only if the protocol layer stays unmodified) and Stack-FA S8 (scope boundary — compliance belongs at the bridge, not the substrate).

---

## Maintenance and refresh protocol

**§A refresh cadence.** At least quarterly, plus on any significant deployment shift: a new substrate stack going live; a major freeze incident; replication of the BPI study; substantial Lightning capacity or volume movement; an emerging protocol displacing a deployed pattern. Each refresh updates the `section-A-last-refreshed` frontmatter field and re-evaluates `needs-refresh`-tagged records (currently: Lightning capacity Q1–Q2 2026; Fedimint production federation counts).

**The dated log.** Append-only event records (newest first) now live on the companion twin [[Field-Notes-Log-FA|Field Notes — The Log — For Agents]]; its own append cadence and schema travel with it.

**Defer-pattern (locked 2026-05-26).** The canonical surfaces and their FA twins link out to this surface for ongoing empirical tracking rather than carrying it inline. The FA twins carry an inline empirical figure only where it sharpens a falsifier (currently: the Lightning-capacity figure in Stack-FA §8.1 CP1); all routine empirical updates defer here. When a canonical surface is tempted to cite a current number, the rule is: name it once, then defer to Field Notes.

---

## References and provenance

**Primary canonical source.**
- [[Field-Notes|Field Notes]] — the user-approved v0 canonical empirical-record surface; source for all records here. This document is the For-Agents twin.

**Canonical claim-ID series this surface cross-references.**
- [[Case-FA]] — substrate-selection argument; C1–C6 (esp. C2 censorship-resistance, C3 BPI anchor, C4 deployed system).
- [[Independence-Doctrine-FA]] — divergence doctrine; D1–D6 and predictions P1–P6 (esp. P1 substrate-selection-precedes-scale, P6 regulatory-pressure-feeds-not-threatens).
- [[Treasury-FA]] — interface / treasury / compliance-at-the-gateway; M-series (esp. regulated-custodian bridges, the compliance-at-the-gateway pattern, conversion mechanics).
- [[Border-Skirmishes-FA]] — competing-substrate combat; BS-series (esp. Taproot rails-vs-substrate, asset-side issuer freeze, use-case bifurcation, the incumbent competing-substrate roster).
- [[Stack-FA]] — substrate architecture; S1–S8 and the §8 counter-positions/falsifiers (esp. S2/CP1 liquidity, S3/CP2 mint-trust, S6/CP4 agent custody).

**Human-track canonical surfaces.**
- [[Case]], [[Independence-Doctrine]], [[Treasury]], [[Border-Skirmishes]], [[Stack]], [[The-Story]].

**KB origin.**
- [[The case for investing in Bitcoin]] § AI-agent monetary substrate case; [[The AI-agent monetary substrate case]] (dedicated KB note for the four-constraints argument).

**Date stamps.** Document created 2026-05-31; last verified 2026-05-31. §A snapshot last refreshed 2026-05-26 (mirrors the canonical Field Notes; not re-measured this pass). Primary-source URLs travel with the dated Log (companion twin); metric sources named per §A record.

---

> [!info] Where to read next
> Substrate-selection argument: [[Case-FA]] (machine-readable) or [[Case|The Case]] (narrative). Divergence argument and predictions: [[Independence-Doctrine-FA]] (D-series, P1–P6) or [[Independence-Doctrine|The Independence Doctrine]]. Where an agent actually transacts — interface, treasury, compliance-at-the-gateway: [[Treasury-FA]] (M-series) or [[Treasury]]. The live contest over which substrate wins: [[Border-Skirmishes-FA]] (BS-series) or [[Border-Skirmishes|Border Skirmishes]]. Pure technical architecture of the Bitcoin substrate: [[Stack-FA]] (S-series) or [[Stack|The Stack]]. The dated log: [[Field-Notes-Log-FA|Field Notes — The Log — For Agents]] (machine-readable) or [[Field-Notes-Log|Field Notes — The Log]] (narrative). Canonical narrative form of this snapshot: [[Field-Notes|Field Notes — State of Play]].
