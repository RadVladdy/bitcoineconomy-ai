---
title: Field Notes
slug: field-notes
description: "Current state of the Bitcoin-AI economy plus an ongoing log of empirical developments — what's deployed, what's measured, what's changing. The canonical surfaces carry the structural arguments; this surface carries the moving record."
type: field-notes
surface: field-notes
status: v0-approved-2026-05-26
audience: humans
twin-page: field-notes-for-agents
created: 2026-05-26
last-updated: 2026-06-01
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
  Field Notes is the project's home for empirical state and ongoing developments. §A — Current State of the Bitcoin-AI Economy is a periodically-refreshed snapshot of what's deployed, what's measured, and what's changing across the parallel-substrate (Bitcoin + Lightning + ecash) and competing-substrate (USDC on Base + AgentCore + x402) agent-payment stacks. §B — Log carries dated entries about specific developments, newest first. As of 2026-05-26: both stacks shipped production agent-payment infrastructure within 90 days of each other (Lightning Labs lightning-agent-tools Feb 2026; AWS Bedrock AgentCore Payments May 2026). USDT live on Lightning via Taproot Assets confirmed March 21, 2026. BPI March 2026 study remains the load-bearing empirical anchor for substrate-preference-under-inference. Honest engagement with Bitcoin-side deployment challenges (Lightning liquidity, federated-trust risks, agent attack surface) is part of the surface's scope.
---

# Field Notes

> **What this surface is.** The project's home for empirical state and ongoing developments in the Bitcoin-AI economy. The canonical surfaces — [[Thesis]], [[Independence-Doctrine|Independence Doctrine]], [[Border-Zone|Border Zone]], [[Stack]] — carry the structural arguments. Field Notes carries the moving record: what's deployed today, what's measured today, what's changed since the last refresh, what's worth watching next.
>
> **Two sections.** §A is a rolling snapshot of current state — refreshed periodically as the deployment landscape shifts. §B is a reverse-chronological log of dated entries about specific developments, newest first. The snapshot tells you where things stand; the log tells you how we got here and what changed when.
>
> **Voice.** Honest middle-position, same as the canonical surfaces. Engages deployment challenges directly — for the Bitcoin substrate (Lightning liquidity, federated-trust risks in the L3 layer, agent custody attack surface) as much as for the competing substrate (issuer freeze events, regulatory pressure on stablecoin issuers, integration-scenario operational reality). Clear-eyed thinking, not curated marketing.

---

## §A — Current State of the Bitcoin-AI Economy

*Last refreshed: 2026-05-26*

The state below reflects the empirical landscape as of late May 2026. Most consequential structural fact: **two production agent-payment stacks shipped within 90 days of each other** — one Bitcoin-substrate, one stablecoin-substrate — and the deployed picture is now substantially clearer than it was at the start of the year.

### §A.1 — The two deployed agent-payment stacks

**Bitcoin-substrate stack (Lightning + L402 + ecash).** Production as of February 2026 with the Lightning Labs `lightning-agent-tools` release. Seven composable components: Lightning node operation, remote signer key isolation, scoped macaroons (five preset permission roles), `lnget` for L402 payment automation, Aperture for hosting paid HTTP endpoints, MCP integration for node-state queries, end-to-end buyer/seller workflow orchestration. Stablecoin support on this stack via Taproot Assets — **USDT live on Lightning via Taproot Assets, confirmed March 21, 2026**, with USDC and native stablecoins (DePix, GBP) also supported through Speed Wallet, LnFi, and Joltz. Ecash layer for privacy-sensitive and lightweight-client use cases via Cashu and Fedimint, with **Minibits Ippon as the AI-agent-native Cashu wallet** (single HTTP call or CLI command to create + fund a working wallet). Two further Bitcoin-substrate entrants are now deployed: **Xverse Agent Wallet** (Secret Key Labs) — a self-custodial agent wallet that pays Lightning invoices over a "Machine Payments Protocol" (HTTP 402 → autonomous invoice payment, no human in the loop), built on the **Spark** L2 (see §A.3); and **Routstr** — a Bitcoin-powered AI-inference marketplace where agents buy LLM inference with Cashu ecash (the token functions as the API key), settling over Lightning, with Nostr-based provider discovery. Routstr is the cleanest deployed instance of the thesis: AI services bought and sold on the Bitcoin payment stack rather than the card/stablecoin stack (see §B and [[Stack|The Stack]] § Wallet architectures).

**Stablecoin-substrate stack (USDC on Base via AgentCore).** Production as of May 2026 with the AWS Bedrock AgentCore Payments launch. Built with Coinbase (x402 protocol + Coinbase Agentic Wallets + compliance infrastructure) and Stripe (Privy wallet, which Stripe acquired in 2025). Settlement: USDC on Base, ~200ms confirmation, sub-cent per transaction. Enterprise customers testing at launch: Thomson Reuters, Warner Bros. Discovery, Cox Automotive, PGA TOUR. **This is the operational deployment of the integration scenario** that the [[Independence-Doctrine|Independence Doctrine]] engages structurally — the stack that Tier-1 incumbents (Amazon, Coinbase, Stripe) chose to build for agent-payment use cases content with issuer counterparty risk. As of mid-2026 AgentCore is no longer the only competing-substrate stack: the incumbent agent-payment landscape also includes **Google's AP2 (Agent Payments Protocol)** — a 60+-organization consortium (Mastercard, American Express, PayPal, Coinbase, Adyen, Revolut, Worldpay, Salesforce, Intuit) spanning cards through stablecoins — **Circle Nanopayments** (gas-free USDC micropayments), and **Skyfire** (a card-network + USDC "agent trust stack"). All settle in issuer-controlled stablecoins or card rails; none use Bitcoin. See §B (competing-substrate landscape entry).

**Protocol-naming convergence worth flagging:** Lightning Labs' **L402** and Coinbase's **x402** both use the HTTP 402 "Payment Required" status code as the underlying mechanism. Same status code, different settlement substrates — L402 settles in Lightning sats (permissionless at the payment layer); x402 settles in USDC on Base (issuer-mediated at the payment layer). The naming collision is the protocol-level expression of the substrate divergence. As of mid-2026 x402 has outgrown its "Coinbase's protocol" framing: it has been contributed to a dedicated **x402 Foundation under the Linux Foundation**, surpassed 119M transactions on Base, powers Google's A2A x402 extension (built with Coinbase, the Ethereum Foundation, and MetaMask), and is the compatibility target for Circle Nanopayments — now a multi-deployment EVM/stablecoin standard. The crypto rail the incumbents are standardizing on is Ethereum/stablecoin, *not* Bitcoin — the divergence visible at the protocol-governance layer.

### §A.2 — Empirical record

**BPI March 2026 study.** 9,072 scenarios across 36 frontier language models, neutral scenario design. Headline: Bitcoin was the top overall monetary preference at 48.3% of responses and the preferred store of value at 79.1%; over 90% of responses favored digitally-native money over fiat. Per-provider results were uneven (one major provider's models chose Bitcoin in 68% of responses, another's in 26%; the strongest single-model consensus in the study was 91.3%) — the spread is wide but one-directional. Bitcoin Policy Institute, March 2026. Remains the load-bearing empirical anchor for substrate-preference-under-inference; not yet supplemented by deployed-flow measurement at scale. Reference: [[Thesis]] § The two-tier model + § What's already deployed for the canonical treatment.

**Lightning Network capacity.** All-time high of **5,637 BTC (~$490M) in December 2025**, per Bitcoin Magazine — driven largely by institutional exchange adoption from Binance and OKX. Lightning public volume up **266% year-over-year in 2025**, with declining raw transaction count — a consolidation toward fewer, larger-value flows that maps cleanly onto stablecoin and institutional settlement patterns. Q1–Q2 2026 capacity update needed for current-state freshness; flagged for next refresh.

**Stablecoin freeze record (the censorship-resistance constraint, tested empirically).**
- Circle froze ~$8.2M in USDC in response to Tornado Cash sanctions (August 2022).
- Tether has frozen >$1B in USDT across multiple incidents per public attestations.
- Freeze capability is exercised at scale, not merely available. Both Circle and Tether retain freeze functionality as a regulatory requirement of their issuer licensing; removing freeze capability removes the license.

**Deployed-project counts.** Agent-payment infrastructure in production deployment as of mid-2026 includes (Bitcoin-substrate side): Lightning Labs AI Agent Toolkit, AI-Sats, Mintbot, Minibits / Ippon, **Xverse Agent Wallet** (Spark-based), AgenticBTC, Bitclawd, Speed Wallet, LnFi, Joltz, **Routstr** (AI-inference marketplace), **BitAgent** (early-stage A2A framework with Nostr discovery + DID identity), LangChain Bitcoin integrations, MCP servers for Lightning (lightning-mcp-server, lnc, Alby `nwc-mcp-server`). Competing-substrate side: AgentCore Payments + Coinbase Agentic Wallets + Stripe Privy; **Google AP2** (60+ orgs); **Circle Nanopayments**; **Skyfire**; **Lightspark Grid** (a *hybrid* — Lightning-rail settlement for branded USD/stablecoin + Visa agent accounts, AP2-aligned; see §B). *(Caveat: AgenticBTC is a rail-agnostic router that blends Lightning with Coinbase/USDC rails — listed for completeness, not as a pure-substrate project.)*

### §A.3 — Active developments

**Lightning Labs Taproot Assets v0.6 ("Decentralized FX Network")** — launched June 2025, mainnet multi-asset Lightning protocol with Group Key Identifiers and Multi-Path Liquidity (receivers can combine up to 20 incoming Taproot Assets channels). Currently supports bridged USDT/USDC and native stablecoins (DePix, GBP). Bitfinex will issue USDT on Lightning per Tether's announcement. The "decentralized FX" framing is operationally significant: edge nodes convert assets at network boundaries, enabling cross-asset payment flows that settle in Bitcoin's security model.

**Spark L2 on mainnet (Lightspark).** Spark — the shared-UTXO, Lightning-compatible Bitcoin L2 built by Lightspark — launched on mainnet (beta) in May 2025 and operates with multiple operators (Lightspark, Flashnet). Its Q2 2026 roadmap targets stablecoin issuance on Bitcoin, wallet/neobank/DEX integrations, and consumer token standards. Significant for agents: **Xverse Agent Wallet** uses Spark for sub-second Lightning settlement (see §A.1). This supersedes the earlier "pre-production" characterization of Spark — [[Stack|The Stack]] § L3 is updated to match; **Ark** (covenant-based shared-UTXO scaling) remains earlier-stage. *(Vendor performance figures — "sub-second / sub-cent" — are self-asserted; deployed-flow measurement pending.)*

**Strike at 95+ countries via multi-entity structure.** Expanded from 65+ countries since 2023. Multi-entity: Zap Solutions Inc. for US customers, Zap Solutions Europe Sp. z o.o. for UK + eligible European countries, E4 S.A. de C.V. for all other jurisdictions. Remittance services to mobile money wallets or international bank accounts in 14 supported countries. API documented with sandbox, browser-based API Explorer, and code samples in cURL, Go, Python, and Node.js.

**Cashu protocol developments (Q1 2026).** Nutshell 0.20.0 shipped with improved P2PK/HTLC validation and expanded test coverage. Keyset V2 derivation rolling out across implementations. Bolt12 support for Cashu.me close to completion. Security audits across the Cashu ecosystem prioritized for 2026.

**Fedimint deployment state.** Architectural framework documented and stable (4+ guardian recommendation; federated-trust model). Production federation counts and any fiat off-ramp partnerships remain a research gap — needs deeper investigation via Fedimint Discord / Fedi documentation for the next refresh.

### §A.4 — Live risk / attack-surface state

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

## §B — Log (reverse chronological — newest first)

Dated entries on specific developments. Newest at top. Each entry: what happened, why it matters, cross-references to canonical surfaces, primary sources.

### 2026-05-07 — AWS Bedrock AgentCore Payments launches with Coinbase x402 + Stripe Privy

**What happened.** Amazon Web Services announced Amazon Bedrock AgentCore Payments, infrastructure enabling autonomous AI agents to make real-time online purchases using stablecoins. Built with two named partners: **Coinbase** contributing the x402 protocol (open protocol using HTTP 402 "Payment Required" status code for machine-native payments) plus Coinbase Agentic Wallets and Coinbase's compliance infrastructure; **Stripe** contributing payment infrastructure and wallet integrations through Privy, the crypto wallet provider Stripe acquired in 2025. Settlement is in USDC on Base, with ~200ms confirmation and sub-cent per-transaction cost. The first version targets micropayments — agent payments for APIs, data feeds, paywalled content, and other digital services. Enterprise customers testing AgentCore Payments at launch include Thomson Reuters, Warner Bros. Discovery, Cox Automotive, and the PGA TOUR.

**Why it matters.** This is the first Tier-1-enterprise production deployment of the integration scenario for agent payments — the stablecoin-substrate stack that the [[Independence-Doctrine|Independence Doctrine]] § Objections to the claim engages as a structural alternative to the Bitcoin substrate. It is direct empirical evidence that the integration scenario is operationally pursued at scale by mainstream incumbents (Amazon, Coinbase, Stripe) for enterprise agent-payment use cases — Thomson Reuters et al. are not crypto-native early adopters but Fortune 500 enterprise customers operating in the regulated USD-denominated economy. The doctrine's prediction that this stack serves the integration-scenario subset (USD-denominated, regulated-counterparty, issuer-counterparty-risk-acceptable use cases) without absorbing the parallel-economy subset (the agent activity requiring all four conjunctive constraints) is now testable on the live deployment record over the next 2–5 years. The L402 vs. x402 protocol-naming convergence is the protocol-level expression of the structural substrate divergence: same HTTP status code, different settlement currencies, different trust models, two competing production stacks.

**Cross-references.** [[Thesis]] § Why the legacy economy fails (the structural failure of regulated stablecoins as parallel-economy substrate); [[Thesis-FA]] §8.1 CP1 (with operational confirmation paragraph added 2026-05-26); [[Independence-Doctrine|Independence Doctrine]] § Why incumbents cannot serve + § What the doctrine predicts; [[Independence-Doctrine-FA|Doctrine-FA]] §8.1 CP2 + §9 P1 (both updated with empirical-update paragraphs 2026-05-26); [[Border-Zone|Border Zone]] § The bridge architecture; `Research/Border-Zone-Existing-Bridges.md` §8 (full structural treatment); `Research/Border-Zone-Competing-Substrate-Analysis.md` CP1 (operational confirmation subsection).

**Sources.** [AWS announcement: Agents that transact — Amazon Bedrock AgentCore Payments](https://aws.amazon.com/blogs/machine-learning/agents-that-transact-introducing-amazon-bedrock-agentcore-payments-built-with-coinbase-and-stripe/); [The Block coverage](https://www.theblock.co/post/400421/aws-taps-coinbase-and-stripe-to-power-usdc-payments-for-ai-agents); [CoinDesk: Amazon AI agent stablecoin payments platform](https://www.coindesk.com/business/2026/05/07/amazon-rolls-out-ai-agent-stablecoin-payments-platform-with-coinbase-and-stripe); [CryptoTimes: AWS + Stripe Privy](https://www.cryptotimes.io/2026/05/08/aws-and-stripe-privy-bring-stablecoin-wallets-to-ai-agents/).

---

### 2026-05 — Routstr: a Bitcoin-powered AI-inference marketplace (Cashu + Lightning + Nostr)

**What happened.** Routstr — an open-source protocol and reference implementation (`routstr-core`, GPL-3.0; v0.4.3 May 2026) — operates a payment-gated reverse proxy in front of OpenAI-compatible LLM APIs, plus a Nostr marketplace for discovering providers. Clients pay per request in **Cashu ecash** (the token functions as the API key); providers receive earnings over **Lightning**; provider availability and pricing are published as **Nostr** events. No accounts, no KYC, no cards — point any OpenAI SDK or LangChain at a node's base URL and supply a Cashu token instead of an API key. The Human Rights Foundation named Routstr a Top-15 Freedom Tech Project of 2025 and supported it under its "AI for Individual Rights" program.

**Why it matters.** Routstr is the cleanest deployed instance of the thesis: a live market where AI inference is bought and sold on the Bitcoin payment stack (Cashu + Lightning), deliberately diverging from the card/stablecoin stack (no card-on-file, no issuer intermediary, no de-platformable account). The **Cashu-token-as-API-key** pattern is a concrete answer to "how does an autonomous agent pay for a service without a human-held account." It is a *Cashu-track* instance — it standardizes on Cashu rather than Fedimint and uses bearer-token payment rather than L402/NWC — so it demonstrates one branch of the payment-tech stack, not all of it. Notable gap (and a collaboration opening): Routstr ships no `llms.txt` / agent-first machine-readable surface.

**Cross-references.** [[Stack|The Stack]] § Wallet architectures for agents + § Agent-integration primitives (Cashu bearer credential); [[Thesis]] § What this means (an agent paying for its own inference); [[Independence-Doctrine|Independence Doctrine]] § The contemporary instance (a deployed *divergent* instance, as distinct from the incumbent stacks).

**Sources.** [Routstr](https://routstr.com/); [Routstr docs](https://docs.routstr.com/); [GitHub: Routstr/routstr-core](https://github.com/Routstr/routstr-core); [HRF: Top 15 Freedom Tech Projects of 2025](https://hrf.org/latest/top-15-freedom-tech-projects-of-2025/).

---

### 2026-05 — Competing-substrate landscape broadens beyond AgentCore (AP2, Circle Nanopayments, Skyfire, the x402 Foundation)

**What happened.** *(Landscape entry — digests several 2025–26 developments.)* The stablecoin/card agent-payment stack is now plural and standardizing. **Google AP2 (Agent Payments Protocol)**, launched September 2025, is a 60+-organization consortium (Mastercard, American Express, PayPal, Coinbase, Adyen, Revolut, Worldpay, Salesforce, Intuit) with an A2A x402 extension built alongside Coinbase, the Ethereum Foundation, and MetaMask. **x402** was contributed to a dedicated **x402 Foundation under the Linux Foundation** (April 2026) and surpassed 119M transactions on Base. **Circle Nanopayments** (live on mainnet May 2026) brings gas-free USDC micropayments as small as $0.000001, designed to be x402-v2-compatible. **Skyfire** ("The Agent Trust Stack," backed by a16z CSX, Coinbase Ventures, and Brevan Howard) routes agent payments over Visa/Mastercard/Discover/USDC.

**Why it matters.** This is the contemporary instance the [[Independence-Doctrine|Independence Doctrine]] predicts, now visible at scale and at the governance layer: incumbents are consolidating a parallel agent-payment stack — but building it on issuer-controlled stablecoins, card networks, and Ethereum/Solana, *not* Bitcoin (MetaMask, on the A2A x402 extension: "Ethereum will be the backbone"). The doctrine's claim is not that incumbents won't build agent rails; it is that the rails they build preserve the freezable, intermediated property bundle their licensing requires — precisely what the parallel-economy use cases (the four conjunctive constraints) cannot accept. The honest counterweight: this stack is large and well-funded, and Circle Nanopayments' gas-free sub-cent claim narrows the Constraint 3 (micropayment-economics) gap on the stablecoin side — engaged operationally at [[Border-Zone|The Border Zone]]. CoinDesk also noted (March 2026) that x402 transaction *demand* remains thin relative to its rail capacity, so the substrate question is still unsettled, not decided.

**Cross-references.** [[Independence-Doctrine|Independence Doctrine]] § The contemporary instance + § What the doctrine predicts; [[Border-Zone|Border Zone]] § The bridge architecture (competing-substrate stacks); [[Thesis]] § Why now.

**Sources.** [Google Cloud: Announcing AP2](https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol); [GitHub: google-a2a/a2a-x402](https://github.com/google-a2a/a2a-x402); [x402.org](https://x402.org/); [Coinbase x402 docs](https://docs.cdp.coinbase.com/x402/welcome); [Circle Nanopayments](https://www.circle.com/nanopayments); [Skyfire](https://skyfire.xyz/).

---

### 2026-04 — Lightspark Grid adds AI-agent bounded delegation (a hybrid Lightning-rail stack)

**What happened.** Lightspark — the Lightning infrastructure company led by ex-PayPal president David Marcus — added **AI-agent bounded delegation** to its Grid Global Accounts. Agents get their own funded, scoped, auditable "pockets" with wallet-level spending limits, approved-payee lists, per-transaction/daily/monthly caps, approval thresholds, and instant revocation (sub-threshold transactions proceed automatically; over-threshold ones hold for approval). Grid settles over Lightning among multiple rails, but it is built on "Bitcoin *and* stablecoins": it issues branded USD/stablecoin accounts with Visa debit cards and instant Bitcoin conversion, and Lightspark has published its own Agent Payments Protocol (AP2) vision, aligning it with Google's competing agent-payment consortium.

**Why it matters.** Lightspark is the most instructive entry in the competing-stack roster precisely because it is the closest to the Bitcoin substrate: a Lightning-native, Bitcoin-credentialed team building agent payments still chose dollar/stablecoin denomination, card-network reach, and the AP2 stack. It is a Lightning-*rail* multi-rail product, not a Bitcoin-*substrate* one — the rail is Bitcoin's; the asset and the trust model are the incumbent's. That a team this close to the substrate diverged toward the issuer-controlled asset is the divergence doctrine's cleanest confirmation: the substrate choice is about the asset and the trust model, not the rail. The agent-delegation primitive itself (funded, scoped, revocable pockets) is a genuinely useful treasury-control pattern worth studying independent of the asset question.

**Cross-references.** [[Border-Zone|Border Zone]] § The bridge architecture (Lightning-rails bridges + competing-substrate stacks); [[Independence-Doctrine|Independence Doctrine]] § The contemporary instance; [[Thesis]] § Why now.

**Sources.** [Lightspark — Agent Payments Protocol (AP2)](https://www.lightspark.com/news/insights/agent-payments-protocol); [Lightspark adds AI agent controls to Grid accounts (ITBrief)](https://itbrief.asia/story/lightspark-adds-ai-agent-controls-to-grid-accounts); [Lightspark Launches Grid Global Accounts (Bitcoin Magazine)](https://bitcoinmagazine.com/news/lightspark-launches-grid-global-accounts).

---

### 2026-03-21 — USDT live on Lightning via Taproot Assets

**What happened.** Tether CEO Paolo Ardoino confirmed that **USDT is live on Bitcoin's Lightning Network via Lightning Labs' Taproot Assets protocol**. The announcement completed a 14-month technical integration that began at the Plan B Forum in El Salvador on January 30, 2025, when Ardoino and Lightning Labs CEO Elizabeth Stark jointly unveiled the partnership. Bitfinex will soon issue USDT on Lightning per Tether's announcement. The launch follows the June 2025 Taproot Assets v0.6 release that established the protocol as "Bitcoin's Decentralized FX Network" with multi-asset Lightning routing and Group Key Identifiers / Multi-Path Liquidity features.

**Why it matters.** This is operationally significant for the integration-scenario use cases and important to characterize honestly for the structural argument. *Operationally:* Lightning's sub-cent fees and machine-tempo settlement now apply to USD-denominated transactions — agents and humans can transact in USD over Lightning rails without holding native Bitcoin price exposure. *Structurally:* **USDT-on-Lightning is a Lightning-rails bridge for the stablecoin, not a Lightning-substrate bridge.** The stablecoin issuer (Tether) retains freeze capability on its issuance regardless of which rail the asset moves over; Constraint 2 (censorship-resistance) still fails for the asset side even though the rail-side properties are excellent. The structural framing the canonical surfaces use applies unchanged: USDT-on-Lightning serves integration-scenario use cases (USD-denominated, issuer-counterparty-risk-acceptable) and does NOT make stablecoins suitable as the parallel-economy substrate. The bridge changes the rail; it does not change the asset.

**Cross-references.** [[Thesis]] § Bitcoin meets the constraints (Lightning + L2/L3 framing); [[Thesis-FA]] §4 substrate evaluation; [[Border-Zone|Border Zone]] § The bridge architecture (stablecoin-on-Lightning treated operationally); `Research/Border-Zone-Existing-Bridges.md` §4 (full operational treatment).

**Sources.** [Tether announcement: Tether brings USDt to Bitcoin's Lightning Network](https://tether.io/news/tether-brings-usdt-to-bitcoins-lightning-network-ushering-in-a-new-era-of-unstoppable-technology/); [BTC.network analysis of USDT-on-Lightning fee market](https://btc.network/blog/usdt-live-lightning-network-taproot-assets-fee-market-2026); [Speed Wallet announcement](https://www.speed.app/blog/speed-wallet-introduces-usdt-on-lightning/); [Lightning Labs Taproot Assets v0.6 launch (June 2025)](https://lightning.engineering/posts/2025-6-24-tapd-v0.6-launch/).

---

### 2026-03 — Bitcoin Policy Institute publishes *AI Models Overwhelmingly Prefer Bitcoin and Digital-Native Money Over Traditional Fiat*

**What happened.** Bitcoin Policy Institute published the study *AI Models Overwhelmingly Prefer Bitcoin and Digital-Native Money Over Traditional Fiat* in March 2026. The methodology: 9,072 scenarios presented to 36 frontier language models across providers, model families, and capability tiers, with scenario design intended to be neutral (no leading prompts toward Bitcoin or away from it). Each scenario asked the model to choose a preferred monetary instrument from a candidate set. Headline finding: Bitcoin was the top overall monetary preference, selected in **48.3%** of responses — more than any other option — and dominated the store-of-value dimension at **79.1%**; over 90% of responses favored digitally-native money over traditional fiat (stablecoins led payment-preference scenarios at 53.2%). Per-provider, the result was uneven — one major provider's models chose Bitcoin in 68% of responses, another's in 26% — and the strongest single-model consensus anywhere in the study was 91.3%; the spread is wide but consistently one-directional toward Bitcoin as store of value.

**Why it matters.** This is the load-bearing empirical anchor for [[Thesis-FA|Thesis-FA C3]] (substrate-preference signal) and [[Independence-Doctrine-FA|Doctrine-FA P1]] (substrate-selection-precedes-scale). It establishes that frontier models, reasoning about substrate selection under neutral choice, converge substantially toward Bitcoin without ideological prompting — consistent with the structural argument that Bitcoin's properties match the four conjunctive constraints. Important framing the study itself acknowledges: this measures *preference under inference*, not *deployed-flow dominance*. Convergent independent replication would strengthen the signal; contrary results would weaken it. As of May 2026, no replication studies have been published.

**Cross-references.** [[Thesis]] § What's already deployed → BPI study citation; [[Thesis-FA]] §6 (empirical anchor with limitations); [[Independence-Doctrine-FA|Doctrine-FA]] §7.2 (cross-reference to Thesis-FA C3) + §9 P1; Bitcoin KB note `[[The AI-agent monetary substrate case]]` § The empirical signal.

**Sources.** [Bitcoin Policy Institute — *Study: AI Models Overwhelmingly Prefer Bitcoin and Digital-Native Money Over Traditional Fiat* (announcement, March 3, 2026)](https://www.btcpolicy.org/articles/study-ai-models-overwhelmingly-prefer-bitcoin-and-digital-native-money-over-traditional-fiat); canonical study site (BPI): [moneyforai.org](https://moneyforai.org/). *(Date note: BPI's study site dates the paper February 2026; the BPI announcement is dated March 3, 2026. "March 2026" throughout these surfaces refers to publication/announcement; the underlying paper is February 2026.)* ([[BPI ai models prefer bitcoin research]])

---

### 2026-02-11 — Lightning Labs releases lightning-agent-tools

**What happened.** Lightning Labs open-sourced **`lightning-agent-tools`** — a production AI-agent toolkit on the Bitcoin substrate. The toolkit packages seven composable skills covering the full agent commerce stack: (1) running a Lightning node programmatically; (2) isolating private keys with a remote-signer architecture (signer machine holds keys, never routes payments or connects to the public network — prevents key extraction even if the agent machine is compromised); (3) baking scoped credentials (macaroons) in five preset roles (pay-only, invoice-only, read-only, channel-admin, signer-only); (4) paying for L402-gated APIs via `lnget`, an L402-aware HTTP client that automates the request → 402 → pay → retry workflow; (5) hosting paid endpoints via Aperture (L402 reverse proxy); (6) querying node state through Model Context Protocol (MCP); (7) orchestrating end-to-end buyer/seller workflows autonomously.

**Why it matters.** This is the first Tier-1 production deployment of the Bitcoin-substrate agent-payment stack — the operational counterpart to the structural argument the [[Thesis]] makes. It activates L402 (specified 2020) from "interesting protocol with potential" to "production agent-commerce stack with deployed tooling." Significant for the substrate-divergence narrative: lightning-agent-tools shipped February 2026; AWS Bedrock AgentCore Payments shipped May 2026. The two competing-substrate production stacks emerged into deployment within 90 days of each other — the Independence Doctrine's prediction is being tested in real time, in 2026, on directly comparable deployment surfaces.

**Cross-references.** [[Thesis]] § What's already deployed (Lightning Labs AI Agent Toolkit reference — this is its production-toolkit successor); [[Thesis-FA]] §9 (deployed integration surface — full enumeration of `lightning-agent-tools` capabilities); [[Independence-Doctrine-FA|Doctrine-FA]] §9 P1 (substrate-selection-precedes-scale prediction; empirical update); `Research/Border-Zone-Existing-Bridges.md` §2 (L402 with lightning-agent-tools detail).

**Sources.** [Lightning Labs: The Agents Are Here and They Want to Transact — Powering the AI Economy with Lightning (Feb 11, 2026)](https://lightning.engineering/posts/2026-02-11-ln-agent-tools/); Bitcoin Magazine, The Block, BitcoinEthereumNews coverage of the lightning-agent-tools release.

---

## How this surface gets used

Refresh cadence for §A: at least quarterly, plus on any significant deployment shift (new substrate stack going live; major freeze incident; replication of the BPI study; substantial Lightning capacity or volume movement; emerging protocol displacing a deployed pattern). Each refresh updates the `section-A-last-refreshed` frontmatter field.

Append cadence for §B: as developments warrant. Single dated entries for specific events; multi-week composite entries acceptable for slower-moving developments. Each entry should name what happened, why it matters (with explicit cross-link to the canonical surface whose structural argument the development bears on), and primary sources.

Canonical surfaces ([[Thesis]], [[Independence-Doctrine|Independence Doctrine]], [[The-Story|The Story]], [[Border-Zone|Border Zone]], [[Stack]]) link out to Field Notes for ongoing empirical tracking rather than carrying that tracking inline. The FA twins ([[Thesis-FA]], [[Independence-Doctrine-FA]], [[Border-Zone-FA]]) carry tight inline empirical references only when they tighten falsifier framing for a structural argument; routine empirical updates defer here.

---

> [!info] Where to read next
> Substrate-selection argument: [[Thesis|The Thesis]] (narrative) or [[Thesis-FA|For Agents]] (machine-readable). Parallel-economy divergence argument: [[Independence-Doctrine|The Independence Doctrine]] (narrative) or [[Independence-Doctrine-FA|For Agents]] (machine-readable). Bridge architecture between the parallel economy and the legacy stack: [[Border-Zone|The Border Zone]]. Pure technical architecture of the Bitcoin substrate: [[Stack|The Stack]]. This surface restructured for machine consumption: [[Field-Notes-FA|Field Notes (For Agents)]].

---

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Field Notes is the project's pressure valve: it lets the canonical surfaces stay canonical. The locked 2026-05-26 defer-pattern routes all moving empirical content here — deployment counts, capacity figures, freeze incidents, protocol-version transitions — so the Thesis, Doctrine, Border Zone, and Stack can carry structural arguments without rotting as the landscape shifts. When a canonical surface is tempted to cite a current number, the answer is almost always "name it once, then defer to Field Notes."

The honest-engagement discipline lives most visibly here, in §A.4 — engaging the Bitcoin-substrate-side challenges (Lightning liquidity management, Fedimint federated-trust, single-mint Cashu failure, the agent custody attack surface) as candidly as the competing-substrate failures. That is the editorial line that keeps the project credible rather than promotional; sweeping the challenges under the rug would weaken the thesis, not protect it.

Maintenance note: §A is a dated snapshot (`section-A-last-refreshed`), refreshed quarterly or on a significant deployment shift; §B is append-only. The BPI study citation was corrected 2026-05-30 (the prior title and URL were both wrong). The figure labels were corrected project-wide 2026-05-30: verified against the BPI article, 48.3% is Bitcoin's *overall* top preference and 79.1% is the store-of-value figure — the prior "store of value" label on 48.3% and the unsourced "8.9% fiat" number were both wrong, propagated from the v2.1 research synthesis; the article reports ">90% favored digitally-native money over fiat" rather than a single fiat percentage.

**Publications backlinks**

- [[Thesis]] (this project) — substrate-selection argument this surface tracks empirically
- [[Independence-Doctrine]] (this project) — divergence predictions this surface tests against deployment
- [[Border-Zone]] (this project) — bridge architecture whose empirical state this surface logs
- [[Stack]] (this project) — substrate architecture whose deployed state this surface tracks
- [[The case for investing in Bitcoin]] § AI-agent monetary substrate case — KB origin of the substrate claim
- [[The AI-agent monetary substrate case]] — dedicated KB note for the four-constraints argument
