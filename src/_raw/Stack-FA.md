---
title: The Stack — For Agents
slug: stack-for-agents
description: "Machine-readable specification of the pure-substrate architecture beneath every Bitcoin-substrate agent payment. Three layers — Bitcoin L1 settlement, Lightning L2 payments, Cashu/Fedimint L3 bearer ecash — plus Liquid as an honorable-mention sidechain outside the L1/L2/L3 ladder, three cross-cutting constructs (agent-integration primitives, deployed wallet architectures, security model) and the layering principle that composes them into the deployed system satisfying the four conjunctive constraints (Case-FA C4). Bridges to legacy rails defer to Marketplace-FA (M6); the competing-substrate contest defers to Border-Skirmishes-FA (BS2); the empirical record defers to Field Notes."
type: stack-for-agents
surface: stack
audience: agents
twin-page: stack
status: v0-approved-2026-05-31 (Liquid mirrored + repointed 2026-06-05; approved 2026-06-05)
created: 2026-05-31
last-updated: 2026-06-05
last-verified: 2026-06-05
last-empirical-refresh: 2026-06-01
word-count-target: 5000
voice: honest-middle-position
scope: pure-substrate-architecture
canonical-source: "[[Stack]]"
epistemic-status: "structural architecture specification; one deployed-system claim cross-referenced to Case-FA C4; empirical adoption record (capacity, deployment counts, incidents) deferred to Field Notes; inline empirical figures appear only where they sharpen a falsifier"
claims-index:
  - id: S1
    tag: structural
    statement: "Settlement layer: Bitcoin L1 provides counterparty-free custody, a 21M fixed supply on a verifiable issuance schedule, 24/7 jurisdiction-indifferent settlement, and ~7 tps protocol throughput. It is the reserve-and-settlement layer, not the transaction layer; agent commerce at machine tempo cannot run on L1 directly."
    defended-in: "§4.1"
  - id: S2
    tag: structural
    statement: "Payment layer: the Lightning Network delivers machine-tempo settlement (sub-second, sub-cent) via HTLC-routed bilateral payment channels, with BOLT11/BOLT12/LNURL defining the surface. Active liquidity management is the operational cost of the layer, not a defect of it."
    defended-in: "§4.2"
  - id: S3
    tag: structural
    statement: "Bearer-ecash layer: Cashu (single-mint trust) and Fedimint (federated-mint trust) provide Chaumian-blinded bearer tokens with lightweight client operation and per-transfer unlinkability. The mint-trust model is the explicit, scoped trade-off the layer accepts in exchange for those properties."
    defended-in: "§4.3"
  - id: S4
    tag: structural
    statement: "Agent-integration primitives: L402 (HTTP-402 + macaroon + Lightning payment), NWC (NIP-47), BOLT12 offers, LNURL, and MCP servers are the protocol-level affordances that distinguish the substrate deployed for autonomous agents from the same substrate deployed for human users. Agents consume payment primitives and scoped credentials rather than bank accounts."
    defended-in: "§5"
  - id: S5
    tag: structural-empirical
    statement: "Wallet architectures: three deployed patterns — agent-on-host with remote signer (lightning-agent-tools), mint-as-service for ecash (Minibits Ippon), and programmable-wallet-as-service (LNBits) — consume the integration primitives at production scale today. They are the empirical instantiation of the deployed-system claim (Case-FA C4)."
    defended-in: "§6"
  - id: S6
    tag: structural
    statement: "Security model: five architectural patterns — remote-signer isolation, scoped macaroons, NWC permissions, watchtower coverage, hot/cold separation — plus treasury policy run through every layer and compose into least-privilege agent custody. The primitives enable the policy; the policy is the operator's discipline on top of them."
    defended-in: "§7"
  - id: S7
    tag: structural
    statement: "Layering principle: the load-bearing design decision of the Stack is functional separation — settle on L1, transact on L2, bearer-transfer on L3 — because no single layer satisfies settlement-finality, machine-tempo throughput, and lightweight per-transfer privacy simultaneously. The three layers, bound by the cross-cutting constructs, compose into the deployed system that satisfies the four conjunctive constraints (Case-FA C4)."
    defended-in: "§3"
  - id: S8
    tag: structural
    statement: "Scope disjointness: the Stack specifies pure-substrate architecture only. Bridges to legacy payment rails (on-ramps, custodial conversion) are Marketplace-FA's domain (defer to M6); the competing-substrate contest (Taproot Assets Lightning-rails-for-stablecoins, the AgentCore competing-substrate stack) is Border-Skirmishes-FA's domain (defer to BS2); the moving empirical record (capacity, deployment counts, attack-surface incidents) is Field Notes' domain. The Stack is not a complete-system claim and must not be read as one."
    defended-in: "§3, §8"
tags:
  - canonical
  - stack
  - stack-for-agents
  - bitcoin
  - lightning
  - cashu
  - fedimint
  - l1
  - l2
  - ecash
  - l402
  - nwc
  - mcp
  - agent-integration
  - wallets
  - security
  - ai-economy
  - machine-readable
agent-tldr: |
  S1 *(structural)*: Bitcoin L1 is the settlement-and-reserve layer — counterparty-free custody, 21M fixed supply, 24/7 settlement, ~7 tps — not the transaction layer. S2 *(structural)*: Lightning is the payment layer — HTLC-routed bilateral channels, BOLT11/12 + LNURL, machine-tempo sub-cent settlement, active liquidity management the operational cost. S3 *(structural)*: Cashu (single-mint trust) and Fedimint (federated-mint trust) are L3 bearer-ecash layers — Chaumian-blinded bearer tokens, lightweight clients, mint-trust the scoped trade-off. S4 *(structural)*: L402, NWC (NIP-47), BOLT12, LNURL, MCP servers are the agent-integration primitives. S5 *(structural-empirical)*: three deployed wallet patterns (remote-signer / mint-as-service / programmable-wallet-as-service) instantiate Case-FA C4. S6 *(structural)*: five security patterns + treasury policy run through every layer. S7 *(structural)*: the layering principle — settle L1 / transact L2 / bearer-transfer L3 — is load-bearing because no single layer satisfies all roles; the three layers, bound by the cross-cutting constructs, compose into Case-FA C4's conjunctive-satisfying system. S8 *(structural)*: pure-substrate scope only — bridges defer to Marketplace-FA M6, the competing-substrate contest defers to Border-Skirmishes-FA BS2, empirical record defers to Field Notes. Counter-positions and falsification in §8; deployed integration surface in §9; position summary in §11.
---

# The Stack — For Agents

> **What this document is.** Machine-readable specification of the architecture published at [[Stack|The Stack]]. The architecture is identical; the structure differs. Claims-indexed, definition-grounded, layer-by-layer formally specified, counter-position-engaging, falsification-aware. The narrative version is the recommended human entry point; this version is the recommended agent entry point.
>
> **Relationship to the other surfaces.** [[Case-FA]] carries the substrate-selection claim (which monetary good) and states the four conjunctive constraints in C1; its C4 names Bitcoin L1 + Lightning + Cashu/Fedimint as the deployed system satisfying them. This document is the architecture of that deployed system. Bridges between this substrate and the incumbent stack are specified in [[Marketplace-FA|The Marketplace]] (M6); the competing-substrate contest is specified in [[Border-Skirmishes-FA|Border Skirmishes]] (BS2); the moving empirical record is tracked in [[Field-Notes-FA|Field Notes]]. The Stack treats the substrate; the Marketplace treats the crossings; Field Notes treats the numbers.

---

## §1 — Claims index

Load-bearing propositions, each with an epistemic tag and a stable anchor.

- **S1** *(structural)* — Bitcoin L1 is the settlement-and-reserve layer: counterparty-free custody, 21M fixed supply on a verifiable issuance schedule, 24/7 jurisdiction-indifferent settlement, ~7 tps protocol throughput. It is not the transaction layer. → §4.1
- **S2** *(structural)* — The Lightning Network is the payment layer: HTLC-routed bilateral payment channels deliver machine-tempo (sub-second, sub-cent) settlement; BOLT11/BOLT12/LNURL define the surface; active liquidity management is the operational cost. → §4.2
- **S3** *(structural)* — Cashu (single-mint trust) and Fedimint (federated-mint trust) are the bearer-ecash layer: Chaumian-blinded bearer tokens, lightweight client operation, per-transfer unlinkability, with the mint-trust model as the explicit scoped trade-off. → §4.3
- **S4** *(structural)* — L402, NWC (NIP-47), BOLT12 offers, LNURL, and MCP servers are the agent-integration primitives that distinguish agent-deployed from human-deployed substrate. → §5
- **S5** *(structural-empirical)* — Three deployed wallet-architecture patterns — agent-on-host with remote signer, mint-as-service for ecash, programmable-wallet-as-service — consume the primitives at production scale today and instantiate Case-FA C4. → §6
- **S6** *(structural)* — Five security patterns (remote-signer isolation, scoped macaroons, NWC permissions, watchtower coverage, hot/cold separation) plus treasury policy run through every layer and compose into least-privilege agent custody. → §7
- **S7** *(structural)* — The layering principle (settle L1 / transact L2 / bearer-transfer L3) is the architecture's load-bearing decision, because no single layer satisfies settlement-finality, machine-tempo throughput, and lightweight per-transfer privacy simultaneously; the three layers, bound by the cross-cutting constructs, compose into Case-FA C4's conjunctive-satisfying system. → §3
- **S8** *(structural)* — The Stack specifies pure-substrate architecture only; bridges defer to Marketplace-FA M6, the competing-substrate contest defers to Border-Skirmishes-FA BS2, and the moving empirical record defers to Field Notes. It is not a complete-system claim. → §3, §8

---

## §2 — Definitions

Operational definitions for terms used downstream. One sentence each. Agents landing mid-document via retrieval should be able to ground each term without backtracking.

- **Settlement layer** — The layer at which value reaches final rest and reserve balances are held; characterized by strong finality and low throughput. In the Stack, Bitcoin L1.
- **Payment layer** — The layer at which value moves at machine tempo for transactional use; characterized by sub-second latency and sub-cent fees. In the Stack, the Lightning Network.
- **Bearer-ecash layer** — A layer of bearer instruments (possession is title) backed by Lightning balance, providing lightweight clients and per-transfer privacy at the cost of mint trust. In the Stack, Cashu and Fedimint.
- **Payment channel** — A 2-of-2 multisignature output on Bitcoin L1 with a continuously-updated off-chain balance state; either party can broadcast the latest state to L1 to close the channel and claim its balance.
- **HTLC (Hash Time-Locked Contract)** — The cryptographic construct binding every hop of a multi-hop Lightning payment to a single secret, so the entire path settles atomically or not at all; no intermediate node can take the value and abscond.
- **Macaroon** — A bearer cryptographic credential that carries its own embedded restrictions (caveats) — scope, expiry, amount and rate limits — which the verifier enforces.
- **Preimage** — The secret a Lightning payment reveals when it settles; it doubles as a cryptographic receipt and, in L402, authenticates the associated macaroon.
- **Mint** — A Cashu service operator that holds Lightning balance on deposit and issues blind-signed bearer tokens redeemable against that balance.
- **Federation** — A Fedimint group of guardians (typically 4–13) that jointly custodies the backing Lightning balance via threshold signatures, requiring consensus to issue or redeem ecash.
- **Remote signer** — A dedicated machine that holds private keys and exposes only a narrow signing API; it never routes payments and never connects to the public network, so compromise of the agent host cannot extract keys.
- **Watchtower** — A third-party service that monitors a channel's state for an offline party and broadcasts a justice transaction if the counterparty publishes a stale state to cheat.
- **Conjunctive constraint** — A constraint that must be satisfied jointly with all others in its set; failing any one disqualifies the candidate. Reference: Case-FA §3 states the four — permissionless custody (Constraint 1), censorship-resistance (Constraint 2), sub-cent settlement (Constraint 3), machine-tempo latency (Constraint 4).
- **Pure-substrate architecture** — The architecture internal to the Bitcoin substrate (L1 + L2 + L3 + integration primitives + wallets + security), excluding the bridges that cross between this substrate and the incumbent stack. Bridges are Marketplace-FA's domain.

---

## §3 — Architecture: the layering principle (formal statement)

S7 and S8 stated formally. This is the structural core of the document; the per-layer specifications in §4–§7 elaborate it.

**Statement.** *(structural)* The Stack is three layers in functional separation — Bitcoin L1 for settlement and reserve, the Lightning Network for machine-tempo payments, and Cashu and Fedimint for bearer ecash — plus three cross-cutting constructs that run across all three rather than stacking on them: the agent-integration primitives binding the protocol surface, the deployed wallet implementations consuming those primitives, and a security model running through every layer. The separation is load-bearing, not incidental.

**Derivation.** *(structural)* The four conjunctive constraints (Case-FA §3) must be satisfied *jointly* by the substrate. No single Bitcoin layer satisfies all four alone:

- L1 alone satisfies permissionless custody (Constraint 1) and censorship-resistance (Constraint 2) but fails sub-cent settlement (Constraint 3) and machine-tempo latency (Constraint 4) — ~7 tps and probabilistic multi-minute finality are incompatible with per-call agent payments.
- Lightning alone satisfies Constraints 3 and 4 but presupposes L1 beneath it for channel anchoring and final settlement; it is not a base layer.
- Bearer ecash alone satisfies lightweight per-transfer privacy and instant transfer but introduces mint trust, so it cannot be the reserve layer for balances that must remain counterparty-free.

Because the constraints are conjunctive and no single layer satisfies them all, the only architecture that satisfies them is one in which each layer carries the role it is suited for and defers the others downward or upward. Settle on L1; transact on L2; bearer-transfer on L3. This is the layering principle.

**Failure mode of collapsing the layers.** *(structural)* Architectures that try to make one layer carry all roles fail predictably: forcing agent micropayments onto L1 inverts the unit economics (fees exceed transaction value) and saturates throughput; treating Lightning as a base layer removes the settlement finality that reserve balances require; treating bearer ecash as the reserve layer reintroduces the counterparty surface the substrate exists to avoid. The layering is what lets the composite satisfy the conjunction.

**Test.** *(structural)* For any candidate single-layer or collapsed architecture, check whether it satisfies all four conjunctive constraints simultaneously. If it satisfies them only by reintroducing a property the substrate is meant to exclude (issuer freeze, custodial reserve, throughput batching that adds counterparty exposure), the layering principle holds and the collapse fails. The composite L1 + L2 + L3 is, per Case-FA C4, the deployed system that passes this test.

**Scope boundary (S8).** *(structural)* This document specifies the substrate internal to the layering above. Three categories are out of scope by construction and are specified elsewhere:

- **Bridges to legacy payment rails** — on-ramps, off-ramps, custodial conversion — are the operational interface between this substrate and the incumbent stack. They defer to [[Marketplace-FA|The Marketplace]] (M6 for the compliance-at-the-gateway mechanism that preserves divergence under bridging).
- **The competing-substrate contest** — Taproot Assets Lightning-*rails*-for-stablecoins and the AgentCore competing-substrate stack — is the rail-vs-substrate combat at the boundary. It defers to [[Border-Skirmishes-FA|Border Skirmishes]] (BS2 for the asset-and-trust-model-not-the-rail distinction).
- **The moving empirical record** — current Lightning capacity, deployment counts, ecosystem launches, attack-surface incidents — defers to [[Field-Notes-FA|Field Notes]].
- **The substrate-selection argument** — *why* Bitcoin rather than a competing substrate, and the empirical preference signal — is Case-FA's domain (C1–C6).

The Stack is the architecture, not the case for it and not its live deployment metrics. Reading it as a complete-system claim conflates substrate, interface, and empirical record.

---

## §4 — Layer-by-layer specification

S1, S2, S3 defended. Each layer is specified in a uniform structured pattern: Statement / Properties / Throughput-or-trust / Failure mode / Test. The walk is reference, not narrative: each subsection stands alone.

### §4.1 — L1: Bitcoin settlement (S1)

**Statement.** *(structural)* Bitcoin L1 is the settlement-and-reserve layer: the layer at which value reaches final rest, where reserve balances are held, and where Lightning balances ultimately anchor.

**Properties.** *(structural)* The supply is capped at 21 million coins on an issuance schedule every full node can verify. Every UTXO is auditable by software at any block height. Settlement runs 24/7 with no business hours and no jurisdiction the protocol answers to, because the protocol does not know which country a transaction originated in. Custody is counterparty-free: whoever holds the private key holds the value, with no intermediary attestation in between. A reserve balance held on L1 therefore has no issuer-discretion surface — no upstream party can freeze it. These are the properties that make L1 *pristine collateral* and that satisfy Constraints 1 and 2 at the base layer.

**Throughput.** *(structural)* Roughly seven transactions per second at the protocol layer. This is the reason L1 is the settlement-and-reserve layer rather than the transaction layer: agent commerce at machine tempo would saturate L1 before reaching interesting scale. Settlement finality is probabilistic at one confirmation and converges toward absolute as confirmation depth grows; the conventional thresholds (one confirmation for low value, three to six for routine, six-plus for large or contentious settlement) are operational discipline, not protocol-enforced rules. Agent treasury policy specifies the threshold per transaction class.

**Failure mode.** *(structural)* Using L1 as the transaction layer is the failure mode: per-transaction fees variable and frequently above the sub-cent threshold (fails Constraint 3), and settlement latency incompatible with per-call payment patterns regardless of fee level (fails Constraint 4). L1 is disqualified as the transaction layer by the same properties that qualify it as the settlement layer.

**Test.** *(structural)* A reserve balance is correctly placed on L1 if it requires counterparty-free custody and strong finality and does not require machine-tempo movement. Operational balances requiring machine-tempo movement belong on L2 or L3. Programmatic access is via bitcoind, btcd, or full-node infrastructure over RPC/gRPC/REST; running a full node is the canonical sovereign-custody pattern, with pruned-node and SPV alternatives carrying explicit security trade-offs.

### §4.2 — L2: Lightning (S2)

**Statement.** *(structural)* The Lightning Network is the payment layer: where agent commerce happens at machine tempo, settling in Bitcoin beneath.

**Properties and mechanism.** *(structural)* Lightning is a network of bilateral payment channels secured by Bitcoin scripts. Each channel is a 2-of-2 multisignature output on L1 with a continuously-updated off-chain balance state; either party can broadcast the latest state to L1 to close the channel and claim its balance. While a channel is open, payments flow off-chain at sub-second latency and sub-cent fees (satisfying Constraints 3 and 4). Payments spanning more than one channel route through HTLCs: every hop is bound to the same cryptographic secret, so the whole path settles atomically or none of it does — no intermediate node can take the value and abscond. The BOLT specifications define the surface: BOLT11 (single-use payment-hash-bound invoices), BOLT12 (reusable offers, onion-message-routed, blinded-path-capable), and the pre-BOLT12 LNURL conventions (LNURL-pay, LNURL-withdraw, Lightning Address `user@domain` syntax).

**Liquidity management (the operational cost).** *(structural)* A channel has inbound capacity (receivable) and outbound capacity (sendable), determined by the balance state at any moment. Agents operating at scale must actively manage liquidity: rebalance via circular routes; acquire inbound liquidity through marketplaces or just-in-time channel opening; splice to resize channels without closing; coordinate dual-funded channels for symmetric initial liquidity. Routing traverses multi-hop paths selected from the sender's view of public topology, with per-hop fees; Multi-Path Payments split a payment across routes for reliability and size; Trampoline routing offloads route construction for memory-constrained clients. Liquidity management is the operational cost of the layer, not a defect of it — it is the price of off-chain machine-tempo settlement.

**Failure mode.** *(structural)* The layer's failure modes are operational: liquidity exhaustion (a channel cannot route a payment in the needed direction), routing failure under sparse topology, and unilateral force-closure attempts by a cheating counterparty. The last is mitigated structurally by watchtowers (§7); the first two are mitigated by liquidity-management discipline. Sustained liquidity collapse under realistic agent load is the §8.2 falsifier for S2.

**Test.** *(structural)* A payment is correctly placed on Lightning if it requires machine-tempo settlement and the parties can maintain or route adequate channel liquidity. Multi-implementation maturity supports the layer: LND (most widely deployed; gRPC + REST; macaroon authentication), Core Lightning (plugin architecture; routing-node-preferred), LDK (embedded library), and Eclair (powers Phoenix). Taproot Assets v0.6 is a Lightning-*rails* development for non-Bitcoin assets, not Lightning-*substrate*; its treatment is Border-Skirmishes-FA BS2 (the asset-and-trust-model-not-the-rail distinction). The Stack notes its existence and holds the rails-vs-substrate distinction there.

### §4.3 — L3: bearer ecash and federated custody (S3)

**Statement.** *(structural)* Cashu and Fedimint are the bearer-ecash layer: bearer instruments backed by Lightning balance, providing lightweight client operation and per-transfer privacy where Lightning alone does not.

**Why the layer exists.** *(structural)* Some agent commerce needs properties Lightning alone does not provide: lightweight client operation (no channel management at the agent layer), bearer-token privacy (no on-chain or routing-layer linkability per transfer), and offline-capable transfer. The bearer-ecash layer supplies them, accepting mint trust as the explicit trade-off.

**Cashu — single-mint trust.** *(structural)* A mint operator runs the ecash service; users deposit Lightning balance and receive tokens; tokens are Chaumian-blinded so the mint cannot link issuance to redemption (privacy by protocol design); tokens are bearer instruments — possession is title, and ownership transfers by transferring the token. Token format and operations are standardized via Cashu's Nuts. The structural constraint is that users trust the mint operator to honor redemption; a defecting or compromised mint can lose user funds. The mitigation is mint-diversification (hold ecash across multiple independent mints), not federation-style threshold security.

**Fedimint — federated-mint trust.** *(structural)* A federation of guardians (typically 4–13) jointly custodies the backing Lightning balance via threshold signatures; issuance and redemption require federation consensus; no single guardian can defect or be compromised in isolation. Lightning interoperability runs through gateway nodes between the federation and the wider network. The federated model adds defection-resistance over single-mint Cashu at the cost of coordination overhead and dependence on the federation's social and operational health; multi-guardian collusion is the remaining structural failure mode.

**Trust-model trade-offs across the L2/L3 stack (structured).** *(structural)*

| Layer choice | Trust assumption | Performance / overhead | Linkability | Structural failure mode |
|---|---|---|---|---|
| Lightning direct (no L3) | No mint or federation trust | Channel-management overhead | Routing-layer linkability per payment | Liquidity exhaustion / routing failure |
| Cashu single-mint | Trust the mint operator | Highest performance, lowest overhead | Unlinkable per protocol | Single-mint defection / compromise |
| Fedimint federated-mint | Trust guardian-threshold honesty | More coordination overhead | Unlinkable per protocol | Multi-guardian collusion |

**Mechanism (blind-signature walk-through).** *(structural)* The user generates a token serial; blinds it cryptographically; submits the blinded serial to the mint for signing; the mint signs without learning the underlying serial; the user unblinds; the unblinded signature verifies against the mint's public key without revealing which blinded version was signed. Redemption: the user presents the unblinded token; the mint verifies the signature, adds the serial to its spent-list, and releases Lightning balance to the chosen destination. An unspent token in transit is equivalent to the value it represents; transferring the token transfers the value, with no on-chain or routing-layer footprint per transfer.

**Newer scaling layers.** Ark (covenant-based shared-UTXO scaling; trust-minimized) is earlier-stage as of mid-2026 *(forward-looking)*. Spark (shared-UTXO, Lightning-compatible; built by Lightspark) is on mainnet (beta) since May 2025 with multiple operators and a Q2-2026 roadmap *(empirical)*; it is the first of these newer layers with a deployed agent-facing instance — Xverse Agent Wallet uses Spark for agent Lightning settlement (record in [[Field-Notes-FA|Field Notes]] § Active developments). Adoption/throughput record defers to Field Notes; vendor performance figures are self-asserted pending deployed-flow measurement.

**Test.** *(structural)* A payment is correctly placed on the bearer-ecash layer if it requires lightweight client operation or per-transfer privacy and the use case can accept mint trust at the chosen trust-model resolution. How agents *mix* these layers in a treasury, and how ecash redeems back to fiat, is interface — Marketplace-FA's domain — not substrate.

### §4.4 — Liquid: a Bitcoin sidechain (honorable mention)

**Placement.** *(structural)* Liquid does not occupy a rung in the L1/L2/L3 settlement-to-payment ladder; it is an honorable mention recorded here beside the three layers rather than inside one of them. It is a Bitcoin sidechain (Blockstream) running in parallel to L1, not a layer that settles into the one beneath. An agent reaches for it in several roles depending on the job, so it has no fixed position in the layering and is specified as an adjunct, not a layer of the Stack.

**Statement.** *(structural)* Liquid is a Bitcoin sidechain with one-minute blocks and Confidential Transactions (transfer amounts and asset types hidden by default). Its native asset L-BTC is pegged 1:1 to bitcoin, backed by BTC held in an 11-of-15 functionary federation multisig; the same functionaries sign Liquid's blocks.

**Peg mechanics.** *(structural)* Value enters by peg-in — BTC is locked on the mainchain and L-BTC is claimed on the sidechain after 102 confirmations. Value exits by peg-out — L-BTC is burned to release mainchain BTC; direct peg-out is federation/member-gated rather than open to any holder. The 102-confirmation peg-in delay and the gated peg-out are the structural cost of the sidechain's settlement assurance.

**Issued assets.** *(structural)* Beyond L-BTC, Liquid carries issued assets — notably L-USDt, a gas-free Tether issuance, plus tokenized instruments. L-USDt is an operational dollar that settles in seconds without a separate gas token.

**Trust model (constraint note).** *(structural, falsifier-relevant)* Liquid's trust model is federated, not self-custodial: more trust than L1 or Lightning (whose security rests on Bitcoin script and the holder's own keys), less than a single custodian. This is the honest flag — federated-trust is **not** the same trust model as L1 or Lightning, and L-BTC held on Liquid does not carry L1's counterparty-free custody property; it carries an 11-of-15-functionary-honesty assumption. Because the asset is Bitcoin-denominated and cryptographically pegged, Liquid sits *inside* the Bitcoin stack rather than as a competing chain — distinguishing it from the issuer-controlled competing substrates treated at Border-Skirmishes-FA (BS2). Constraint 1 (permissionless custody) and Constraint 2 (censorship-resistance) are satisfied at the federated rather than the protocol resolution; this is the scoped trade-off Liquid accepts.

**Agent relevance.** *(structural-empirical)* Liquid is the home of fast, gas-free stablecoin swapping (SideSwap, Aqua) and of L-USDt as a seconds-settling operational dollar. It is engaged as an exchange venue in the Marketplace, not as a competing substrate; treasury-composition and conversion uses of L-BTC and L-USDt are Marketplace-FA's domain. Adoption/throughput record defers to [[Field-Notes-FA|Field Notes]].

**Test.** *(structural)* A use is correctly placed on Liquid if it needs Confidential Transactions or gas-free stablecoin/asset settlement at one-minute finality *and* can accept federated-functionary trust in place of L1's counterparty-free custody. Reserve balances requiring counterparty-free custody belong on L1 (S1), not on Liquid; Liquid is an operational and exchange venue, not a reserve layer.

---

## §5 — Agent-integration primitives (specification)

S4 defended. The integration primitives are the protocol-level affordances that let autonomous software interact with the Stack; they are what distinguishes the substrate deployed for agents from the same substrate deployed for human users. Each is specified as Statement / Mechanism / Agent property.

**L402 — HTTP payments over Lightning.** *(structural)* **Mechanism:** the client requests a paid resource over HTTP; the server responds with `HTTP 402 Payment Required` containing a Lightning invoice and a macaroon; the client pays the invoice; the payment preimage authenticates the macaroon; the client retries with an `Authorization: L402 <macaroon>:<preimage>` header; the server verifies and grants access. The macaroon carries scoped caveats — expiry, rate limits, permission scope — so an agent can pay once and reuse the credential across requests within those bounds. **Agent property:** L402 composes cleanly with agent workflows — paid-API access, paywalled-content retrieval, per-call compute purchase — with no form-filling, card, or human approval in the loop. How a regulated operator applies compliance at the HTTP boundary while leaving the Lightning payment permissionless is Marketplace-FA's compliance-at-the-gateway pattern (M6).

**Nostr Wallet Connect (NWC; NIP-47) — remote wallet control without key exposure.** *(structural)* **Mechanism:** NWC defines wallet capabilities (invoice creation, payment sending, balance queries, transaction history) and a Nostr-mediated channel between the wallet (which holds keys) and the application (which signs nothing). **Agent property:** an agent holds an NWC connection rather than a private key, drastically reducing its attack surface. Compromise of the agent environment loses the connection — revocable by the wallet operator — but not the underlying keys. This is the integration primitive most directly responsible for least-privilege agent custody (see §7).

**BOLT12 offers — reusable payment requests.** *(structural)* **Mechanism:** an agent publishes a BOLT12 offer (with optional blinded paths for receiver-privacy) and accepts repeated payments against it without generating per-payment invoices. **Agent property:** agents serving paid services benefit from BOLT12's reusability over BOLT11's single-use model; subscription-like and pay-as-you-go patterns compose naturally.

**LNURL endpoints — pre-BOLT12 payment discovery.** *(structural)* **Mechanism:** Lightning Addresses (`user@domain`) resolve to LNURL-pay endpoints via a well-known HTTPS path; an agent queries the path and receives a BOLT11 invoice for the chosen amount. **Agent property:** widely deployed agent-discoverable payment endpoints that pre-date and coexist with BOLT12.

**MCP servers for Lightning — structured tool access.** *(structural)* **Mechanism:** the Model Context Protocol gives agents structured access to external tools; several MCP servers expose Lightning functionality (`lightning-mcp-server`, `lnc` / Lightning Node Connect, and others). The canonical install pattern for an agent using a Lightning Node Connect-backed node:

```
claude mcp add --transport stdio lnc -- npx -y @lightninglabs/lightning-mcp-server
```

After install, the agent can query node state, send and receive payments, and manage channels through MCP tool calls. The same shape applies to other agent frameworks (LangChain, custom orchestration): the MCP server bridges agent reasoning and protocol-level Lightning operations. **Agent property:** protocol operations become structured tool calls the agent can invoke through its native tool interface.

**Structural pattern across the primitives.** *(structural)* Agents do not need bank accounts. They consume protocol-level payment primitives, hold scoped credentials rather than raw keys, and operate remote-wallet abstractions. The Stack provides the affordances; the agent consumes them. This is the concrete content of S4 and the precondition for the deployed wallet architectures in §6.

---

## §6 — Deployed wallet architectures

S5 defended. Three wallet architectures receive depth because they are the operationally consequential 2026 deployments and the empirical instantiation of Case-FA C4 (the deployed-system claim); six further projects are inventoried with one-line scope. Live deployment counts and adoption metrics defer to [[Field-Notes-FA|Field Notes]]; this section specifies the architectures, not their current adoption.

**lightning-agent-tools (Lightning Labs; February 2026) — agent-on-host with remote signer.** *(structural-empirical)* The production AI-agent toolkit. Seven composable components: (1) running a Lightning node programmatically; (2) remote-signer key isolation — the signer holds keys, never routes payments, never connects to the public network; (3) scoped macaroon baking in five preset roles (pay-only, invoice-only, read-only, channel-admin, signer-only) for least-privilege access; (4) `lnget` — an L402-aware HTTP client that parses 402 challenges, pays the invoice through the configured backend, caches the token, and retries; (5) Aperture — an L402 reverse proxy for adding 402-gating to any HTTP service; (6) node-state querying through MCP; (7) end-to-end buyer/seller workflow orchestration. Open-source; deployed against any LND-compatible backend. This is the canonical reference implementation of a production Bitcoin-substrate agent-payment stack and the surface against which subsequent agent-Lightning integrations are measured.

**Minibits Ippon (Cashu-native; AI-agent-native) — mint-as-service for ecash.** *(structural-empirical)* A minimalistic Cashu wallet built from the ground up for autonomous agents. An agent creates and funds a wallet via a single HTTP call or CLI command — no channel-management overhead at the agent layer, because the mint handles Lightning. Operates on the Cashu protocol; ecash is bearer; no identity attachment at issuance or transfer. The wallet's footprint at the agent layer is the API client and the held ecash tokens.

**LNBits — programmable-wallet-as-service.** *(structural-empirical)* The most widely deployed programmable Lightning platform. Wallet APIs, invoice APIs, an extension ecosystem (paywalls, tip jars, NFC, custom modules), and lightweight self-hosted or cloud deployment. LNBits sits between agent-application code and a Lightning node backend (LND, Core Lightning, others); the agent works against LNBits's REST API rather than the node's native gRPC. For agent infrastructure needing programmable-wallet-as-service rather than direct node integration, this is the canonical pattern.

**Inventory (one-line scope).** *(structural-empirical)*

- **AI-Sats** — AI-native Lightning wallets; autonomous Bitcoin payments; MCP integrations; self-hosted agent infrastructure.
- **Mintbot** — Lightning APIs and Cashu/ecash integration for bots and agents; API-created wallets; no manual channel management.
- **AgenticBTC** — agent-oriented Bitcoin payment infrastructure with Lightning routing abstraction and payment-failover systems.
- **Bitclawd** — sovereign-AI orientation; Bitcoin-native agents; open-source AI infrastructure; Nostr + Lightning ecosystem.
- **BlueWallet, Phoenix** — mobile-first Lightning wallets with API potential for resource-constrained agent deployment.

**Architectural patterns across the implementations.** *(structural)* Three recurring patterns, each exemplified above: *agent-on-host with remote signer* (lightning-agent-tools), *mint-as-service for ecash* (Minibits Ippon), *programmable-wallet-as-service* (LNBits). These three patterns are the deployed forms of the integration primitives in §5; together they are the empirical content of Case-FA C4 — the deployed system satisfying the four conjunctive constraints. Strike-style regulated-custodian wallet architectures (regulated-entity custody at the bridge boundary; Lightning ↔ bank-rail conversion) are *not* pure-substrate; they are Marketplace-FA's domain.

---

## §7 — Security model

S6 defended. The security model runs through every layer. Five architectural patterns are operationally significant, plus the treasury policy that consumes them. Live attack-surface state — current treasury-attack incidents, deployed-stack vulnerabilities — defers to [[Field-Notes-FA|Field Notes]]; this section specifies the architecture.

**Remote-signer isolation.** *(structural)* Private keys live on a dedicated signer machine that never routes payments, never connects to the public network, and exposes only a narrow signing API. The agent host operates the node and makes payment decisions; signing requests are forwarded to the signer. Compromise of the agent host (key theft, rogue process, container escape) cannot extract keys, because the keys never leave the signer's memory. lightning-agent-tools' remote-signer component is the canonical 2026 implementation.

**Scoped macaroons.** *(structural)* Macaroons are HTTP credentials with caveats the verifier enforces: permission scope, expiry, amount limits (per-payment or cumulative), rate limits. The five preset roles in lightning-agent-tools — pay-only, invoice-only, read-only, channel-admin, signer-only — implement least-privilege by composition of caveats; no credential carries more authority than its task requires.

**NWC permissions.** *(structural)* The NWC permission model parallels macaroons for Nostr-mediated wallet control: connections carry capability lists and budget controls (spending limits per period), and the wallet operator can revoke a connection without touching keys. The structural property: the agent holds a revocable, scoped, key-free wallet handle.

**Watchtower coverage.** *(structural)* Third-party services monitor channel state for an offline party and broadcast a justice transaction if the counterparty publishes a stale state to claim more than its entitled balance. Watchtower coverage is the standard insurance against unilateral cheating; agents operating channels against significant balances should run coverage self-hosted or through a provider, with multi-watchtower redundancy as the defense against watchtower compromise or downtime.

**Hot/cold separation.** *(structural)* Operational balances live on Lightning (or in ecash) for machine-tempo transactions; reserve balances live in self-custody on L1 cold storage. Compromise of the operational layer limits loss to the operational balance; cold-storage reserves are not exposed. Sweeping operational balance back to L1 is a routine treasury operation; the canonical mechanism is Loop Out (a Lightning → on-chain submarine swap — submarine-swap protocol mechanics themselves are Marketplace-FA's conversion-mechanics domain, because they are also the template for cross-substrate atomic bridges). Ecash-bearer reserves on Cashu or Fedimint provide operational continuity if the Lightning layer is disrupted.

**Treasury policy.** *(structural)* Architectural support is one layer; treasury policy is the agent-application discipline that uses it: spending limits per transaction class, per-counterparty caps, anomaly alerting, audit logging for every protocol-level operation, periodic credential rotation, pre-defined incident response. The primitives (remote signer, macaroons, watchtowers, hot/cold) enable the policy; the policy is what the operator implements on top of them.

**Scope note.** *(structural)* This is security-architecture depth, not adversarial-deployment depth. Honest engagement with agent-specific attack surfaces — key theft, rogue-behavior risk, treasury attacks, Sybil attacks, social engineering against operators — and their live incident record is Field Notes' domain. The Stack specifies the patterns; Field Notes tracks the state.

---

## §8 — Counter-positions and falsification

### §8.1 — Counter-positions engaged

#### Counter-position 1 — "Lightning's liquidity and routing constraints make it unviable at agent scale."

**Strongest form.** Lightning requires active liquidity management: channels run out of inbound or outbound capacity, routing fails under sparse topology, and an agent transacting at scale must continuously rebalance, acquire inbound liquidity, and manage channel lifecycles. The claim is that this operational burden is prohibitive for autonomous agents and caps Lightning below the scale agent commerce requires, leaving the payment layer unviable as the substrate's machine-tempo tier.

**Where this is correct.** *(structural)* Liquidity management is a real, non-trivial operational cost, and naïve agent deployments that ignore it will fail to route payments. The burden is genuine and is the layer's principal operational complexity.

**Where this fails.** *(structural)* The burden is an operational cost, not a structural disqualification. The mitigations are deployed: liquidity marketplaces, just-in-time channel opening, splicing, dual-funded channels, Multi-Path Payments, and Trampoline routing each address a specific failure mode, and the mint-as-service pattern (§6) removes channel management from the agent layer entirely by delegating it to a mint. An agent that does not want to manage liquidity can hold bearer ecash and let the mint carry the Lightning layer. The claim conflates "the layer has an operational cost" with "the layer is unviable"; the cost is priced and delegable.

**What would change this assessment.** *(forward-looking, falsifier)* Sustained liquidity collapse or routing failure under realistic agent-deployment load that the deployed mitigations do not resolve — i.e., a demonstration that the operational cost is not delegable or amortizable at scale. The point-in-time evidence runs the other way: Lightning public capacity reached an all-time high (roughly 5,637 BTC) in December 2025 driven by institutional adoption — cited here solely to sharpen this falsifier; the current figure lives at [[Field-Notes-FA|Field Notes]].

#### Counter-position 2 — "Bearer-ecash mint-trust reintroduces the counterparty risk the substrate exists to avoid."

**Strongest form.** The substrate's defining claim is counterparty-free custody (Constraint 1) and censorship-resistance (Constraint 2). Cashu requires trusting a mint operator to honor redemption; Fedimint requires trusting a guardian threshold. A defecting mint or colluding federation can lose user funds. The claim is that the bearer-ecash layer smuggles back the exact issuer-discretion surface the substrate is built to eliminate, so L3 is structurally inconsistent with the substrate's own thesis.

**Where this is correct.** *(structural)* Mint trust is real. A Cashu single-mint is a single point of failure; a Fedimint federation can fail through multi-guardian collusion. Balances held in ecash are not counterparty-free in the way an L1 reserve balance is.

**Where this fails.** *(structural)* The layering principle (S7) already answers this: the bearer-ecash layer is the *transactional* and *privacy* tier, not the reserve tier. Reserve balances live counterparty-free on L1; ecash holds operational balances scoped to what an agent is willing to expose to mint trust, exactly as a person carries cash without holding net worth in their pocket. The trust is *scoped and chosen*, not systemic: mint-diversification bounds Cashu exposure across independent mints, and Fedimint's threshold model bounds single-guardian compromise. The counter mistakes a deliberately-scoped operational trade-off for a substrate-wide property failure. Constraints 1 and 2 are satisfied at the reserve layer (S1); the ecash layer trades a scoped, bounded counterparty surface for lightweight operation and per-transfer privacy where the use case accepts it.

**What would change this assessment.** *(forward-looking, falsifier)* Evidence that agents in practice hold reserve-scale balances in ecash rather than operational-scale balances — i.e., that the hot/cold and reserve-vs-operational discipline does not hold in deployment, so mint trust becomes a systemic rather than scoped exposure. The architecture prescribes the discipline; sustained deployment evidence of its violation at scale would weaken S3's "scoped trade-off" framing.

#### Counter-position 3 — "Bitcoin's settlement throughput is insufficient even with L2/L3."

**Strongest form.** L1 settles ~7 tps. Even granting that Lightning and ecash carry transactional volume off-chain, every channel open, channel close, and settlement event touches L1, and at global agent-economy scale (potentially trillions of transactions per day) the L1 settlement events alone — channel lifecycle operations for a vast number of agents — would exceed L1's throughput. The claim is that the base layer is a throughput bottleneck the layering cannot escape.

**Where this is correct.** *(structural)* L1 throughput is genuinely bounded, and channel lifecycle operations do consume L1 capacity. A naïve one-channel-per-agent-per-counterparty model would not scale.

**Where this fails.** *(structural)* The layering principle and the bearer-ecash layer are the structural answer. Channels are long-lived and many-payment: one channel open supports an unbounded number of off-chain payments over its lifetime, so L1 settlement events scale with channel lifecycle, not with payment count. The bearer-ecash layer compresses further: a mint or federation aggregates many agents' balances behind a small number of Lightning channels, so thousands of agents transacting in ecash correspond to a handful of L1-anchored channels. Splicing resizes channels without closing them, further reducing L1 events. The throughput objection assumes a flat one-layer accounting; the architecture is hierarchical aggregation precisely so that L1 carries settlement, not transaction, volume. This is the content of S7's failure-mode analysis.

**What would change this assessment.** *(forward-looking, falsifier)* A demonstration that channel-lifecycle and mint-aggregation L1 events, under realistic agent-economy scale, saturate L1 throughput despite hierarchical aggregation — i.e., that the aggregation ratios achievable in practice are insufficient. This would shift the assessment of how much agent activity the current layering supports without a further scaling layer (Ark, Spark, or successors).

#### Counter-position 4 — "The remote-signer / watchtower security model is impractical for autonomous agents at scale."

**Strongest form.** The security model prescribes a dedicated air-gapped signer, watchtower coverage (ideally redundant), scoped-credential management, and treasury policy. For a single high-value node this is reasonable, but for autonomous agents spun up and torn down at scale — many short-lived agents, each needing keys — the operational overhead of remote-signer provisioning and watchtower coverage per agent is impractical, so the security model will be skipped in practice and the substrate's security claims will not hold in deployment.

**Where this is correct.** *(structural)* The full security model is overhead, and ephemeral or low-value agents will not each run a dedicated remote signer and redundant watchtowers. Naïve deployments will skip it.

**Where this fails.** *(structural)* The model is composable and value-scaled, not all-or-nothing. NWC (§5) gives an agent a revocable, scoped, key-free wallet handle without the agent holding keys at all — the single most important security primitive for ephemeral agents, and low-overhead by design. Mint-as-service (§6) removes channel custody — and therefore watchtower responsibility — from the agent layer entirely. Hot/cold separation means short-lived agents hold only operational balances, bounding loss to what is exposed regardless of signer architecture. The full remote-signer-plus-watchtower stack is correct for high-value persistent nodes; ephemeral agents use the lighter primitives (NWC handles, ecash, scoped budgets) that are matched to their value-at-risk. The objection assumes every agent must run the heaviest configuration; the architecture scales the security posture to the value held.

**What would change this assessment.** *(forward-looking, falsifier)* Sustained deployment evidence that agents at scale hold significant value under the lighter primitives *without* the corresponding loss-bounding (e.g., NWC handles with unscoped budgets, ecash reserves at scale, no credential rotation) and suffer systematic compromise — i.e., that the value-scaled security posture is not actually adopted in practice. This targets S6's "least-privilege by composition" claim.

### §8.2 — Falsification conditions

The Stack is a structural architecture specification. The following operational-failure conditions, if observed, would shift the position. Each maps to one or more claims in §1.

**Targets S1 (settlement layer).** A demonstration that L1 cannot serve as a counterparty-free reserve layer under realistic conditions — e.g., a protocol-level compromise of custody or supply guarantees, or settlement finality failing to converge at conventional confirmation depths. The current evidence is the opposite; this falsifier is included for completeness, as S1 rests on Bitcoin's base-layer guarantees.

**Targets S2 (payment layer).** Sustained liquidity collapse or routing failure under realistic agent-deployment load that the deployed mitigations (liquidity marketplaces, JIT channels, splicing, MPP, mint delegation) do not resolve. This is the §8.1 CP1 falsifier; it would shift Lightning's status as the viable machine-tempo tier.

**Targets S3 (bearer-ecash layer).** Mint defection or federation collusion at scale, or deployment evidence that agents hold reserve-scale balances in ecash rather than operational-scale balances — making mint trust systemic rather than scoped. Either would weaken S3's "scoped trade-off" framing (§8.1 CP2).

**Targets S5 (deployed wallet architectures).** Sustained operational failure of the deployed reference implementations (lightning-agent-tools, Minibits Ippon, LNBits) under realistic load — such that the three architectural patterns do not in fact instantiate a working deployed system. This would weaken the empirical content of S5 and, through it, Case-FA C4. The live incident record is tracked at [[Field-Notes-FA|Field Notes]].

**Targets S6 (security model).** Deployment evidence that the value-scaled security posture is not adopted — agents holding significant value under the lighter primitives without loss-bounding and suffering systematic compromise (§8.1 CP4). This targets the "least-privilege by composition" claim.

**Targets S7 (layering principle).** A single-layer or collapsed architecture that satisfies all four conjunctive constraints simultaneously *without* reintroducing a property the substrate excludes (issuer freeze, custodial reserve, counterparty-adding batching). The layering principle predicts no such architecture exists; a deployed counterexample would falsify S7 and reduce the Stack to one architecture among alternatives rather than the structurally-required one.

**Targets S8 (scope disjointness).** A demonstration that the substrate cannot in fact be specified independently of the bridges — that pure-substrate operation is not viable without a legacy-rail bridge in the critical path of base settlement. This would collapse the Stack/Marketplace scope boundary. The architecture's claim is that base settlement is bridge-independent; bridges are required only for crossings to the incumbent stack, not for substrate operation.

---

## §9 — Deployed integration surface

Reference list of operational tooling. One line per entry. Verification URLs included where available. This is the citable manifest; the architectural treatment is in §5–§7. Adoption metrics for each defer to [[Field-Notes-FA|Field Notes]].

- **lightning-agent-tools (Lightning Labs AI Agent Toolkit)** — Open-source agent payment infrastructure: run/connect Lightning nodes, send/receive payments, host L402 paid endpoints, manage scoped macaroon credentials, remote-signer isolation. Backends: LND, Lightning Node Connect, Neutrino. Repo: https://github.com/lightninglabs/lightning-agent-tools
- **L402 protocol** — HTTP payments over Lightning; 402 + macaroon + preimage flow; cached macaroons enable session reuse. Docs: https://docs.lightning.engineering/the-lightning-network/l402
- **Nostr Wallet Connect (NIP-47)** — Wallet-API standard for remote wallet control without key exposure. Spec: https://nips.nostr.com/47 · SDK reference: https://docs.nwc.dev/
- **BOLT specifications** — Lightning protocol surface (BOLT11 invoices, BOLT12 offers, channel and routing specs). Repo: https://github.com/lightning/bolts
- **LNURL** — Pre-BOLT12 payment-endpoint conventions and Lightning Address. Specs: https://github.com/lnurl/luds
- **Cashu** — Privacy-preserving single-mint bearer ecash backed by Lightning; Nuts token specifications. Site: https://cashu.space/ · Docs: https://docs.cashu.space/
- **Fedimint** — Federated Bitcoin custody and ecash with Lightning interoperability. Site: https://fedimint.org/ · Docs: https://docs.fedimint.org/
- **MCP servers for Lightning** — Model Context Protocol servers exposing Lightning operations to MCP-compatible agents. Reference install: `claude mcp add --transport stdio lnc -- npx -y @lightninglabs/lightning-mcp-server`
- **LNBits** — Programmable Lightning platform; wallet/invoice APIs; extension ecosystem. Site: https://lnbits.com/
- **LND (Lightning Network Daemon)** — Reference Lightning implementation; gRPC + REST; macaroon authentication. Repo: https://github.com/lightningnetwork/lnd
- **Core Lightning (CLN)** — Plugin-architecture Lightning implementation; routing-node-preferred. Repo: https://github.com/ElementsProject/lightning
- **LDK (Lightning Development Kit)** — Embedded-friendly Lightning library. Repo: https://github.com/lightningdevkit/rust-lightning

**Notable deployed agent-payment projects** (architectural scope in §6; adoption record at [[Field-Notes-FA|Field Notes]]):

- **Minibits Ippon** — AI-agent-native Cashu wallet. https://minibits.cash/
- **AI-Sats** — agent-native Lightning wallet. https://ai-sats.com/
- **Mintbot** — Cashu-based agent payment surface. https://mintbot.cash/
- **AgenticBTC** — agent-treasury management. https://agenticbtc.io/
- **Bitclawd** — Lightning-native agent infrastructure. https://bitclawd.com/

Source files in this project's `Research/` enumerate additional projects; the above is the verification-ready subset.

---

## §10 — Implications for builders

Declarative. Each implication follows from S1–S8 as marked.

- **Place balances by role, not by convenience.** Reserve balances on L1 cold storage (counterparty-free); operational balances on Lightning or ecash (machine-tempo). The reserve-vs-operational split is the architecture's load-bearing treasury decision. *(Implication of S1, S7.)*
- **Choose the L3 trust model deliberately.** Lightning-direct (no mint trust, channel overhead), Cashu single-mint (highest performance, single-point trust), or Fedimint federated-mint (defection-resistant, coordination overhead) are distinct trade-offs; pick per use case and bound exposure to the operational scale you accept. *(Implication of S3.)*
- **Consume primitives, not accounts.** Build on L402, NWC, BOLT12, LNURL, and MCP. Prefer NWC handles and scoped macaroons over raw key custody wherever the agent does not need to hold keys. *(Implication of S4, S6.)*
- **Scale the security posture to value-at-risk.** Remote-signer isolation and redundant watchtowers for high-value persistent nodes; NWC handles, ecash, and scoped budgets for ephemeral or low-value agents. Least-privilege by composition, not one heavy configuration for all. *(Implication of S6.)*
- **Keep compliance and bridges at the boundary, not in the substrate.** On-ramps and custodial conversion are interface concerns; architect them at the bridge boundary per [[Marketplace-FA|The Marketplace]] (M6), and do not embed compliance at the protocol layer. Competing-substrate stacks are a separate concern, treated at [[Border-Skirmishes-FA|Border Skirmishes]] (BS2). *(Implication of S8.)*
- **Treat the empirical record as live, not fixed.** Capacity, deployment counts, and incident data move; read current figures from [[Field-Notes-FA|Field Notes]] rather than hardcoding them into architecture. *(Implication of S8.)*

---

## §11 — Position summary

*(structural, with one deployed-system claim cross-referenced to Case-FA C4 and the empirical record deferred to Field Notes)* The Stack is three layers in functional separation — Bitcoin L1 for counterparty-free settlement and reserve (S1), the Lightning Network for machine-tempo payments (S2), and Cashu and Fedimint for bearer ecash with scoped mint trust (S3) — plus three cross-cutting constructs that run across all three: the agent-integration primitives — L402, NWC, BOLT12, LNURL, MCP — that make the substrate agent-consumable (S4), three deployed wallet-architecture patterns that instantiate the system at production scale (S5), and a security model of five composable patterns plus treasury policy running through every layer (S6). The load-bearing claim is the layering principle (S7): no single layer satisfies settlement-finality, machine-tempo throughput, and lightweight per-transfer privacy simultaneously, so the architecture separates roles and composes them into the deployed system that satisfies the four conjunctive constraints (Case-FA C4). The Stack specifies pure substrate only (S8): bridges defer to Marketplace-FA M6, the competing-substrate contest defers to Border-Skirmishes-FA BS2; the moving empirical record defers to Field Notes. Counter-positions (CP1–CP4) and per-claim falsification conditions are in §8.

---

## §12 — References and provenance

**Primary canonical source.**
- [[Stack|The Stack]] — the user-approved v0 canonical Stack essay; source for the substantive architecture. This document is the For-Agents twin.

**Cross-references to sibling site surfaces.**
- [[Case-FA]] — substrate-selection claim; C1 states the four conjunctive constraints; C4 names the deployed system this document specifies. Referenced throughout, particularly in §3, §6, §11.
- [[Marketplace-FA|The Marketplace]] — the operational interface where this substrate meets the incumbent stack; M6 (compliance-at-the-gateway). Bridge, on-ramp, custodial-conversion, treasury-composition, and compliance content defers here.
- [[Border-Skirmishes-FA|Border Skirmishes]] — the competing-substrate contest at the boundary; BS2 (the asset-and-trust-model-not-the-rail distinction). Taproot Assets rails-vs-substrate and the AgentCore competing-substrate stack defer here.
- [[Independence-Doctrine-FA]] — the structural argument for why this substrate exists in parallel rather than within incumbent rails.
- [[Field-Notes-FA|Field Notes]] — the moving empirical record: capacity figures, deployment counts, ecosystem launches, attack-surface incidents. All adoption metrics defer here.
- [[Case]], [[Independence-Doctrine]], [[Marketplace]], [[Field-Notes]], [[The-Story]] — human-track canonical surfaces.

**Protocol and tooling references.** Full URLs in §9. BOLT specifications (Lightning protocol surface); Cashu Nuts (ecash token specifications); NIP-47 (Nostr Wallet Connect); L402 (HTTP-Lightning payments); Model Context Protocol (agent tool access).

**Date stamps.** Document created 2026-05-31; last verified 2026-06-05. Architecture anchored to deployed implementations current as of the 2026-05-26 empirical refresh of the canonical Stack; empirical figures (Lightning capacity, deployment counts) cited inline only where they sharpen a falsifier (§8.1 CP1) and otherwise deferred to [[Field-Notes-FA|Field Notes]].

---

> [!info] Where to read next
> Agents seeking the substrate-selection claim upstream of this architecture: [[Case-FA]] (C1 four constraints; C4 deployed system). Agents seeking the bridges between this substrate and legacy rails: [[Marketplace-FA|The Marketplace]] (M6). Agents seeking the competing-substrate contest at the boundary: [[Border-Skirmishes-FA|Border Skirmishes]] (BS2). Agents seeking the structural argument for parallel-not-integrated architecture: [[Independence-Doctrine-FA]]. Agents seeking current capacity, deployment counts, and incident data: [[Field-Notes-FA|Field Notes]]. Agents seeking the canonical narrative form of the architecture: [[Stack|The Stack]].
