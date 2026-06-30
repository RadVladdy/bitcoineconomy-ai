---
title: Field Notes — State of Play
slug: field-notes
description: "Where the Bitcoin-AI economy stands right now — what's deployed, what's measured, what's changing."
type: field-notes
surface: field-notes
status: v0-approved-2026-05-26
audience: humans
twin-page: field-notes-for-agents
created: 2026-05-26
last-updated: 2026-06-30
section-A-last-refreshed: 2026-06-01
voice: honest-middle-position
tags:
  - canonical
  - field-notes
  - empirical
  - current-state
  - bitcoin
  - ai-economy
  - lightning
agent-tldr: |
  Field Notes — State of Play is the project's periodically-refreshed snapshot of where the Bitcoin-AI economy stands: what's deployed, what's measured, and what's changing across the parallel-substrate (Bitcoin + Lightning + ecash) and competing-substrate (issuer-controlled stablecoins and card rails — AgentCore on x402, Google's AP2 consortium, Circle Nanopayments, Skyfire) agent-payment stacks. The dated, reverse-chronological record of specific developments lives on its companion page, Field Notes — The Log (/field-notes-log). As of mid-2026: both stacks shipped production agent-payment infrastructure within 90 days of each other (Lightning Labs lightning-agent-tools Feb 2026; AWS Bedrock AgentCore Payments May 2026), and the incumbent side has consolidated at the governance layer (x402 contributed to a Linux Foundation x402 Foundation with 119M+ Base transactions; Google AP2's 60+-organization consortium) — all settling in Ethereum/stablecoin/card rails, none in Bitcoin. USDT live on Lightning via Taproot Assets confirmed March 21, 2026; USDC live non-custodially via Boltz (Circle CCTP) May 2026. BPI March 2026 study remains the load-bearing empirical anchor for substrate-preference-under-inference. Honest engagement with Bitcoin-side deployment challenges (Lightning liquidity, federated-trust risks, agent attack surface) is part of the surface's scope.
---

# Field Notes — State of Play

> **What this page is.** A periodically-refreshed snapshot of where the Bitcoin-AI economy stands — what's deployed today, what's measured today, what's changed since the last refresh, what's worth watching next. The canonical surfaces — [[Case]], [[Independence-Doctrine|Independence Doctrine]], [[Treasury]], [[Stack]] — carry the structural arguments; this is the moving record they defer to.
>
> **The dated log is its own page now.** This page tells you *where things stand*; the companion **[[Field-Notes-Log|Field Notes — The Log]]** tells you *how we got here and what changed when* — reverse-chronological dated entries, newest first. Looking for the latest development? **[Read the Log →](/field-notes-log)**
>
> **Voice.** Honest middle-position, same as the canonical surfaces. Engages deployment challenges directly — for the Bitcoin substrate (Lightning liquidity, federated-trust risks in the L3 layer, agent custody attack surface) as much as for the competing substrate (issuer freeze events, regulatory pressure on stablecoin issuers, integration-scenario operational reality). Clear-eyed thinking, not curated marketing.

---

## The deployed picture

*Last refreshed: 2026-05-26*

The state below reflects the empirical landscape as of late May 2026. Most consequential structural fact: **two production agent-payment stacks shipped within 90 days of each other** — one Bitcoin-substrate, one stablecoin-substrate — and the deployed picture is now substantially clearer than it was at the start of the year.

## The two deployed agent-payment stacks

**Bitcoin-substrate stack (Lightning + L402 + ecash).** Production as of February 2026 with the Lightning Labs `lightning-agent-tools` release. Seven composable components: Lightning node operation, remote signer key isolation, scoped macaroons (five preset permission roles), `lnget` for L402 payment automation, Aperture for hosting paid HTTP endpoints, MCP integration for node-state queries, end-to-end buyer/seller workflow orchestration. Stablecoin support on this stack via Taproot Assets — **USDT live on Lightning via Taproot Assets, confirmed March 21, 2026**, with USDC and native stablecoins (DePix, GBP) also supported through Speed Wallet, LnFi, and Joltz. Ecash layer for privacy-sensitive and lightweight-client use cases via Cashu and Fedimint, with **Minibits Ippon as the AI-agent-native Cashu wallet** (single HTTP call or CLI command to create + fund a working wallet). Two further Bitcoin-substrate entrants are now deployed: **Xverse Agent Wallet** (Secret Key Labs) — a self-custodial agent wallet that pays Lightning invoices over a "Machine Payments Protocol" (HTTP 402 → autonomous invoice payment, no human in the loop), built on the **Spark** L2 (see Active developments below); and **Routstr** — a Bitcoin-powered AI-inference marketplace where agents buy LLM inference with Cashu ecash (the token functions as the API key), settling over Lightning, with Nostr-based provider discovery. Routstr is the cleanest deployed instance of the thesis: AI services bought and sold on the Bitcoin payment stack rather than the card/stablecoin stack (see [[Field-Notes-Log|the Log]] and [[Stack|The Stack]] — Wallet architectures).

**Stablecoin-substrate stack (USDC on Base via AgentCore).** Production as of May 2026 with the AWS Bedrock AgentCore Payments launch. Built with Coinbase (x402 protocol + Coinbase Agentic Wallets + compliance infrastructure) and Stripe (Privy wallet, which Stripe acquired in 2025). Settlement: USDC on Base, ~200ms confirmation, sub-cent per transaction. Enterprise customers testing at launch: Thomson Reuters, Warner Bros. Discovery, Cox Automotive, PGA TOUR. **This is the operational deployment of the integration scenario** that the [[Independence-Doctrine|Independence Doctrine]] engages structurally — the stack that Tier-1 incumbents (Amazon, Coinbase, Stripe) chose to build for agent-payment use cases content with issuer counterparty risk. As of mid-2026 AgentCore is no longer the only competing-substrate stack: the incumbent agent-payment landscape also includes **Google's AP2 (Agent Payments Protocol)** — a 60+-organization consortium (Mastercard, American Express, PayPal, Coinbase, Adyen, Revolut, Worldpay, Salesforce, Intuit) spanning cards through stablecoins — **Circle Nanopayments** (gas-free USDC micropayments), and **Skyfire** (a card-network + USDC "agent trust stack"). All settle in issuer-controlled stablecoins or card rails; none use Bitcoin. See [[Field-Notes-Log|the Log]] (competing-substrate landscape entry).

**Protocol-naming convergence worth flagging:** Lightning Labs' **L402** and Coinbase's **x402** both use the HTTP 402 "Payment Required" status code as the underlying mechanism. Same status code, different settlement substrates — L402 settles in Lightning sats (permissionless at the payment layer); x402 settles in USDC on Base (issuer-mediated at the payment layer). The naming collision is the protocol-level expression of the substrate divergence. As of mid-2026 x402 has outgrown its "Coinbase's protocol" framing: it has been contributed to a dedicated **x402 Foundation under the Linux Foundation**, surpassed 119M transactions on Base, powers Google's A2A x402 extension (built with Coinbase, the Ethereum Foundation, and MetaMask), and is the compatibility target for Circle Nanopayments — now a multi-deployment EVM/stablecoin standard. The freshest scale datapoint is on-air: Armstrong put agent transactions on Coinbase's stack at *"about 100 million transactions now, maybe 50 million of value"* on *Moonshots* ep. 264 (June 2026), correcting the episode's stale 3.1M show-notes figure upward himself (see [[Field-Notes-Log|the Log]]). The crypto rail the incumbents are standardizing on is Ethereum/stablecoin, *not* Bitcoin — the divergence visible at the protocol-governance layer.

## Empirical record

**BPI March 2026 study.** 9,072 scenarios across 36 frontier language models, neutral scenario design. Headline: Bitcoin was the top overall monetary preference at 48.3% of responses and the preferred store of value at 79.1%; over 90% of responses favored digitally-native money over fiat. Per-provider results were uneven (one major provider's models chose Bitcoin in 68% of responses, another's in 26%; the strongest single-model consensus in the study was 91.3%) — the spread is wide but one-directional. Bitcoin Policy Institute, March 2026. Remains the central empirical anchor for substrate-preference-under-inference; not yet supplemented by deployed-flow measurement at scale. Reference: [[Case]] — The two-tier model + What's already deployed for the canonical treatment.

**Lightning Network capacity.** All-time high of **5,637 BTC (~$490M) in December 2025**, per Bitcoin Magazine — driven largely by institutional exchange adoption from Binance and OKX. Lightning public volume up **266% year-over-year in 2025**, with declining raw transaction count — a consolidation toward fewer, larger-value flows that maps cleanly onto stablecoin and institutional settlement patterns. Q1–Q2 2026 capacity update needed for current-state freshness; flagged for next refresh.

**Stablecoin freeze record (the censorship-resistance constraint, tested empirically).**
- Circle froze ~$8.2M in USDC in response to Tornado Cash sanctions (August 2022).
- Tether has frozen >$1B in USDT across multiple incidents per public attestations.
- Freeze capability is exercised at scale, not merely available. Both Circle and Tether retain freeze functionality as a regulatory requirement of their issuer licensing; removing freeze capability removes the license.

**Deployed-project counts.** Agent-payment infrastructure in production deployment as of mid-2026 includes (Bitcoin-substrate side): Lightning Labs AI Agent Toolkit, AI-Sats, Mintbot, Minibits / Ippon, **Xverse Agent Wallet** (Spark-based), AgenticBTC, Bitclawd, Speed Wallet, LnFi, Joltz, **Routstr** (AI-inference marketplace), **BitAgent** (early-stage A2A framework with Nostr discovery + DID identity), LangChain Bitcoin integrations, MCP servers for Lightning (lightning-mcp-server, lnc, Alby `nwc-mcp-server`). Competing-substrate side: AgentCore Payments + Coinbase Agentic Wallets + Stripe Privy; **Google AP2** (60+ orgs); **Circle Nanopayments**; **Skyfire**; **Lightspark Grid** (a *hybrid* — Lightning-rail settlement for branded USD/stablecoin + Visa agent accounts, AP2-aligned; see [[Field-Notes-Log|the Log]]). *(Caveat: AgenticBTC is a rail-agnostic router that blends Lightning with Coinbase/USDC rails — listed for completeness, not as a pure-substrate project.)*

## Active developments

**Lightning Labs Taproot Assets v0.6 ("Decentralized FX Network")** — launched June 2025, mainnet multi-asset Lightning protocol with Group Key Identifiers and Multi-Path Liquidity (receivers can combine up to 20 incoming Taproot Assets channels). Currently supports bridged USDT/USDC and native stablecoins (DePix, GBP). Bitfinex will issue USDT on Lightning per Tether's announcement. The "decentralized FX" framing is operationally significant: edge nodes convert assets at network boundaries, enabling cross-asset payment flows that settle in Bitcoin's security model.

**Spark L2 on mainnet (Lightspark).** Spark — the shared-UTXO, Lightning-compatible Bitcoin L2 built by Lightspark — launched on mainnet (beta) in May 2025 and operates with multiple operators (Lightspark, Flashnet). Its Q2 2026 roadmap targets stablecoin issuance on Bitcoin, wallet/neobank/DEX integrations, and consumer token standards. Significant for agents: **Xverse Agent Wallet** uses Spark for sub-second Lightning settlement (see The two deployed agent-payment stacks above). This supersedes the earlier "pre-production" characterization of Spark — [[Stack|The Stack]] — L3 is updated to match; **Ark** (covenant-based shared-UTXO scaling) remains earlier-stage. *(Vendor performance figures — "sub-second / sub-cent" — are self-asserted; deployed-flow measurement pending.)*

**Agents are provisioning their own infrastructure (Lightning-paid VPS).** A February 2026 Alby report documented what reads as the first deployed instance of an autonomous agent *buying its own compute*: an OpenClaw agent spawned a child agent and funded it with Bitcoin over Lightning, deploying on a VPS provisioned through **LNVPS** — a Lightning-native, Nostr-login, no-KYC host fundable via NWC. Alongside **BitLaunch** (Bitcoin/Lightning VPS with a full API + SDKs across DigitalOcean/Vultr/Linode), this is the consume side of the thesis turning concrete — an agent paying for real-world infrastructure on the Bitcoin stack with no human in the loop. Both are now [[Services]] cards. *(Self-reported milestone; deployed-flow scale unmeasured — defer numbers here per the locked pattern.)*

**Strike at 95+ countries via multi-entity structure.** Expanded from 65+ countries since 2023. Multi-entity: Zap Solutions Inc. for US customers, Zap Solutions Europe Sp. z o.o. for UK + eligible European countries, E4 S.A. de C.V. for all other jurisdictions. Remittance services to mobile money wallets or international bank accounts in 14 supported countries. API documented with sandbox, browser-based API Explorer, and code samples in cURL, Go, Python, and Node.js.

**Cashu protocol developments (Q1 2026).** Nutshell 0.20.0 shipped with improved P2PK/HTLC validation and expanded test coverage. Keyset V2 derivation rolling out across implementations. Bolt12 support for Cashu.me close to completion. Security audits across the Cashu ecosystem prioritized for 2026.

**Fedimint deployment state.** Architectural framework documented and stable (4+ guardian recommendation; federated-trust model). Production federation counts and any fiat off-ramp partnerships remain a research gap — needs deeper investigation via Fedimint Discord / Fedi documentation for the next refresh.

**Bitcoin-native prediction / "Risk" markets are appearing — but not yet agent-drivable.** Glimpse (`glimpse.trading`) launched a **regulated Bitcoin prediction market** — event contracts priced by a Bitcoin-native automated market maker (a liquidity-sensitive LMSR denominated in sats), with Lightning deposits and withdrawals. It is a live datapoint for the **Risk** corner of the agent-economy markets (forecasting / hedging / insurance primitives). But it does **not** clear the directory's agent-automatability bar: **custodial** (BitGo Trust), Bermuda-regulated with KYC and geo-restrictions (no US / Canada / UK), and no public agent-trading API surfaced. Logged as a Risk-market *watch*, not a directory entry — the thing to watch for is a self-custodial, API-driven, no-KYC venue an agent could actually trade.

## Live risk / attack-surface state

**This subsection engages deployment challenges honestly for both substrates.** Per locked editorial discipline (Decisions 2026-05-25): engaging challenges *strengthens* the structural argument by showing clear-eyed thinking; avoiding them weakens it.

**Bitcoin-substrate-side concerns.**

- *Lightning liquidity management at scale.* Non-trivial operational concern. Channel-balance management, splice operations, routing-failure handling, watchtower coordination — all real engineering burdens that grow with deployment scale. Lightning Service Providers, automated liquidity-management software, and the L3 layer (Cashu, Fedimint absorbing some bearer-style traffic away from channels) are the scaling response. Active engineering work; not a substrate-property failure.
- *Federated-trust risks in Fedimint.* The federation of guardians (typically 4–13) is the trust unit. Federation defection, guardian collusion at scale, governance attacks against guardian elections — all are real concerns. Federation size is the primary mitigation; larger and more diverse federations reduce defection probability but add coordination overhead.
- *Single-mint failure mode in Cashu.* Cashu's mint-trust model concentrates trust in the mint operator. Mint operator failure (bankruptcy, key compromise, regulatory action, hostile shutdown) means loss of mint-backed ecash. Acceptable for working balances; not appropriate for treasury reserves.
- *Agent custody attack surface.* Software-managed keys controlled by autonomous agents introduce attack surfaces that human-custodied keys do not: rogue agent behavior, key theft via prompt injection, treasury attacks, Sybil attacks on multi-agent settlements, social-engineering attacks against the humans operating agent infrastructure. The remote-signer architecture in `lightning-agent-tools` (signer machine holds keys, never connects to the public network) is the canonical mitigation pattern; the operational-security problem agent custody introduces is not solved by the substrate's properties alone.

**Stablecoin-substrate-side concerns.**

- *Issuer freeze surface.* Documented and exercised at scale (Circle Tornado Cash August 2022 ~$8.2M; Tether cumulative >$1B per attestations). Not a bug to be patched; structural requirement of regulated-issuer licensing.
- *AgentCore stack custody layers.* The deployed stack has multiple intermediary surfaces: Coinbase wallet/exchange custody discretion, Stripe payment-processor surface, Circle USDC freeze capability. Each layer is an independent intermediary-action surface under regulatory pressure.
- *Regulatory pressure trajectory.* MiCA in EU, ongoing US enforcement against stablecoin issuers, sanctions regime evolution — the regulatory environment for regulated-stablecoin operation is tightening, not loosening, across most jurisdictions in 2026. The integration-scenario use cases content with issuer counterparty risk are unaffected; parallel-economy use cases requiring censorship-resistance are increasingly disadvantaged on this substrate.

**Cross-substrate concerns (bridge-zone risk).**

- *Bridge counterparty risk at machine tempo.* A bridge freeze during a high-frequency agent workflow has different consequences than during human-tempo transactions. Hot-cold treasury separation strategies and multi-bridge redundancy are the architectural mitigations; the deployed practice is still maturing.
- *Conversion-mechanic attack surfaces.* Slippage attacks, MEV exposure during atomic swaps, oracle manipulation on bridge contracts — all real for agents using cross-substrate conversion. Engineering attention from Boltz, Lightning Loop, and the broader DEX ecosystem; not yet a solved problem.
- *Jurisdictional shopping at scale.* As agents and their custodians/bridges operate across jurisdictions, the operational complexity of compliance routing grows. The "compliance at the gateway boundary, not at the protocol layer" architectural pattern handles this cleanly when implemented; sloppy architectures leak compliance into the protocol layer in ways that compromise the parallel-system property.

---

## How this surface gets used

Refresh cadence for this snapshot: at least quarterly, plus on any significant deployment shift (new substrate stack going live; major freeze incident; replication of the BPI study; substantial Lightning capacity or volume movement; emerging protocol displacing a deployed pattern). Each refresh updates the `section-A-last-refreshed` frontmatter field. The dated, append-only record of individual developments lives on the companion page, [[Field-Notes-Log|Field Notes — The Log]].

Canonical surfaces ([[Case]], [[Independence-Doctrine|Independence Doctrine]], [[The-Story|The Story]], [[Treasury]], [[Stack]]) link out to Field Notes for ongoing empirical tracking rather than carrying that tracking inline. The FA twins ([[Case-FA]], [[Independence-Doctrine-FA]], [[Treasury-FA]]) carry tight inline empirical references only when they sharpen how you'd know a structural argument is wrong; routine empirical updates defer here.

---

> [!info] Where to read next
> The standing live record cross-cuts every section; the arguments and surfaces it tracks:
> - **[[Field-Notes-Log|Field Notes — The Log]]** — the dated, reverse-chronological record of how this picture changed, newest first.
> - **[[Case|The Case]]** *(why agents choose Bitcoin)* — the substrate-selection case this record tracks empirically.
> - **[[Independence-Doctrine|The Independence Doctrine]]** *(in The Case)* — the parallel-economy divergence whose predictions this record tests against deployment.
> - **[[Border-Skirmishes|Border Skirmishes]]** *(in The Case)* — the live contest over which substrate wins.
> - **[[Marketplace|The Marketplace]]** *(The Market)* — where an agent actually transacts: what it holds ([[Treasury]]), how it crosses ([[Exchange]] — bridges, conversion), and the live directory of services.
> - **[[Stack|The Stack]]** *(equip your agent)* — the pure technical architecture of the Bitcoin substrate this record logs the deployment of.

---

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Field Notes is the project's pressure valve: it lets the canonical surfaces stay canonical. The locked 2026-05-26 defer-pattern routes all moving empirical content here — deployment counts, capacity figures, freeze incidents, protocol-version transitions — so the Case, Doctrine, Treasury, and Stack can carry structural arguments without rotting as the landscape shifts. When a canonical surface is tempted to cite a current number, the answer is almost always "name it once, then defer to Field Notes."

The honest-engagement discipline lives most visibly here, in the Live-risk section — engaging the Bitcoin-substrate-side challenges (Lightning liquidity management, Fedimint federated-trust, single-mint Cashu failure, the agent custody attack surface) as candidly as the competing-substrate failures. That is the editorial line that keeps the project credible rather than promotional; sweeping the challenges under the rug would weaken the thesis, not protect it.

Maintenance note: this snapshot is dated (`section-A-last-refreshed`), refreshed quarterly or on a significant deployment shift; the dated Log is append-only and now its own page ([[Field-Notes-Log]], split 2026-06-30). The BPI study citation was corrected 2026-05-30 (the prior title and URL were both wrong). The figure labels were corrected project-wide 2026-05-30: verified against the BPI article, 48.3% is Bitcoin's *overall* top preference and 79.1% is the store-of-value figure — the prior "store of value" label on 48.3% and the unsourced "8.9% fiat" number were both wrong, propagated from the v2.1 research synthesis; the article reports ">90% favored digitally-native money over fiat" rather than a single fiat percentage.

**Publications backlinks**

- [[Case]] (this project) — substrate-selection argument this surface tracks empirically
- [[Independence-Doctrine]] (this project) — divergence predictions this surface tests against deployment
- [[Exchange]] (this project) — the bridges/crossing surface whose empirical state this surface logs
- [[Stack]] (this project) — substrate architecture whose deployed state this surface tracks
- [[The case for investing in Bitcoin]] § AI-agent monetary substrate case — KB origin of the substrate claim
- [[The AI-agent monetary substrate case]] — dedicated KB note for the four-constraints argument
