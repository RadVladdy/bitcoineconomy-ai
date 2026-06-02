---
title: The Stack
slug: stack
description: "Technical reference for the pure-substrate architecture beneath every Bitcoin-substrate agent payment. Six structural layers: Bitcoin L1 settlement; Lightning L2 payments; Cashu and Fedimint L3 bearer ecash; agent-integration primitives (L402, NWC, BOLT12, LNURL, MCP servers); deployed wallet architectures (lightning-agent-tools, Minibits Ippon, LNBits, and others); and a security model (remote-signer isolation, scoped macaroons, watchtower coverage, hot/cold separation) running through every layer. Bridges to legacy payment rails live at The Border Zone; the empirical adoption record lives at Field Notes."
type: essay
surface: stack
status: v0-approved-2026-05-30
audience: humans
twin-page: stack-for-agents
created: 2026-05-26
last-updated: 2026-06-01
last-empirical-refresh: 2026-06-01
word-count-target: 4000
voice: honest-middle-position
scope: pure-substrate-architecture
tags:
  - canonical
  - stack
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
agent-tldr: |
  The Stack is the pure-substrate architecture beneath every Bitcoin-substrate agent payment. Six structural layers form the architecture: (1) Bitcoin L1 settlement — 21M cap, pristine collateral, 24/7 global settlement, ~7 tps reserve-layer throughput; (2) the Lightning Network as payment layer — payment channels, HTLC-based multi-hop routing, BOLT11/BOLT12/LNURL specifications, machine-tempo settlement at sub-cent fees, ~5,637 BTC public capacity as of December 2025; (3) Cashu and Fedimint as L3 bearer-ecash layers — Chaumian-blinded bearer tokens, single-mint Cashu trust vs. federated-mint Fedimint trust, lightweight client operation; (4) agent-integration primitives — L402 for HTTP-payment-gated API access via macaroon-mediated authentication, Nostr Wallet Connect (NIP-47) for remote wallet control without key exposure, BOLT12 reusable offers, LNURL endpoints, MCP servers (lightning-mcp-server, lnc); (5) deployed wallet architectures — Lightning Labs' lightning-agent-tools (February 2026) at depth, Minibits Ippon as AI-agent-native Cashu wallet, LNBits as programmable Lightning platform, plus an inventory of AI-Sats, Mintbot, AgenticBTC, Bitclawd, BlueWallet, Phoenix; (6) a security model running through every layer — remote-signer isolation, scoped macaroons in five preset roles, NWC permissions, watchtower coverage, hot/cold separation, treasury policy. The Stack treats pure-substrate architecture only; bridges to legacy payment rails (on-ramps, custodian-mediated conversions, Taproot Assets Lightning-rails for stablecoins, AgentCore Payments competing-substrate stack) are scope-disjoint and live at The Border Zone. The empirical adoption record (deployment counts, capacity updates, ecosystem launches, attack-surface incidents) defers to Field Notes per the locked 2026-05-26 defer-pattern.
---

# The Stack

> **In brief.** The Stack is the architecture beneath every Bitcoin-substrate agent payment: Bitcoin L1 at the base for settlement and reserve, the Lightning Network above it for machine-tempo payments, and Cashu and Fedimint above that for privacy-preserving, lightweight bearer-ecash. Holding it together are the agent-integration primitives — L402 for paying over HTTP, NWC for controlling a wallet without holding its keys, plus BOLT12 offers and LNURL endpoints — and a security model (remote-signer isolation, scoped credentials, watchtowers, hot/cold separation) that runs through every layer. Deployed toolkits like lightning-agent-tools, Minibits Ippon, and LNBits already consume those primitives at production scale. This essay walks each layer at technical-reference depth, and you can land on any section directly without backtracking. What lives elsewhere: the bridges to legacy money at [[Border-Zone|The Border Zone]], the live adoption numbers at [[Field-Notes]], and the underlying case for Bitcoin at [[Thesis|The Thesis]].

---

## Following one payment down the stack

Start where an agent starts: it needs something, and the something costs money.

An autonomous agent wants a weather feed. It makes its first request — and the API answers not with data but with `HTTP 402 Payment Required`, a status code reserved in the web's plumbing decades ago and left almost entirely unused until now, alongside a Lightning invoice for eleven satoshis. This is **L402**, the topmost layer an agent touches. The agent doesn't fill out a form or reach for a card. It just pays.

It pays over the **Lightning Network** — the payment layer — where the eleven satoshis move in under a second across a chain of payment channels, for a fee smaller than the payment itself. The agent retries its request, this time attaching cryptographic proof that it paid, and the data comes back. Start to finish: well under a second, a fraction of a cent in fees, no bank, no human pressing *approve*.

Underneath Lightning sits **Bitcoin L1** — the settlement layer — where the agent's reserve balance lives and where Lightning balances ultimately anchor. The agent never touched L1 for an eleven-satoshi purchase, and it didn't need to: L1 is where value comes to rest, not where it moves. That split — settle on L1, transact on Lightning — is the load-bearing design decision of the whole stack.

Around that spine sit the rest of the layers this essay covers. Bearer-ecash systems — **Cashu** and **Fedimint** — for payments that need privacy or no channel management. The **integration primitives** (L402, NWC, BOLT12, LNURL) the agent leaned on without noticing. The **wallet architectures** that package all of it into something an agent can actually run. And the **security model** that keeps the agent's keys safe while it spends.

That is the Stack. The rest of this essay walks each layer at reference depth — but every layer is somewhere on the path that eleven-satoshi payment just took.

---

## What the Stack is

Formally, the Stack is six structural layers: Bitcoin L1 for settlement and reserve; the Lightning Network for machine-tempo payments; Cashu and Fedimint for bearer-ecash; the agent-integration primitives that bind the protocol surface together; the deployed wallet implementations that consume those primitives; and a security model running through all of them. The rest of this essay walks each in turn, at technical-reference depth — properties, failure modes, and deployed implementations per layer. The walk is reference, not narrative: land on any section directly and it stands on its own.

What the Stack is *not* is the bridges to the legacy payment rails. Those live at [[Border-Zone|The Border Zone]] — the interface between this substrate and the incumbent stack. The Border Zone treats the crossings; the Stack treats the substrate itself. Nor is the Stack the moving empirical record — current capacity figures, deployment counts, and freeze incidents live at [[Field-Notes]]. The architecture lives here; the numbers live there.

---

## §1 — L1: Bitcoin settlement

The settlement layer. Bitcoin L1 is where value ultimately settles and where reserve balances live.

**Properties.** L1 carries the properties that make Bitcoin pristine collateral. The supply is capped at 21 million coins on a transparent issuance schedule every full node can verify. Every UTXO is auditable by software at any block height. Settlement runs 24/7 — no business hours, and no jurisdiction it answers to, because the protocol does not know which country a transaction came from. And custody is counterparty-free: whoever holds the private key holds the value, with no intermediary attestation in between. For agent treasuries, that means a reserve balance held on L1 has no issuer-discretion surface — nobody upstream can freeze it.

**Throughput.** Roughly seven transactions per second at the protocol layer. This is what makes L1 the settlement-and-reserve layer rather than the transaction layer. Agent commerce at machine tempo cannot operate on L1 directly; settlement-layer throughput would saturate before agent activity reached interesting scale. The architectural answer is layering: L1 settles; L2 transacts; L3 carries bearer-instrument throughput beyond L2's per-channel capacity.

**Settlement finality.** Probabilistic at one confirmation; converging on absolute as confirmation depth grows. The conventional thresholds — one confirmation for low-value transactions, three to six for routine, six-plus for large or contentious settlement — are operational discipline, not protocol-enforced rules. Agent treasury policy specifies the threshold per transaction class.

**Programmatic accessibility.** Agents interact with L1 via bitcoind, btcd, or full-node infrastructure over RPC, gRPC, or REST. The full-node software is mature, multi-implementation, and well-documented. Running a full node is the canonical sovereign-custody pattern; pruned nodes and SPV alternatives exist for resource-constrained deployments with explicit security trade-offs.

**Reserve role for agent treasuries.** Long-term holdings live on L1 in cold storage; operational balances move to L2 (or L3) for transactional use. Sweeping an operational balance back to cold-storage reserves is a routine treasury operation, usually via [Loop Out](/tools/loop) (a Lightning → on-chain submarine swap). Those swap mechanics — and the on-ramp, off-ramp, and regulated-custodian patterns that move value between L1 and fiat — belong to the interface, not the substrate: they are treated at [[Border-Zone]] under *Conversion mechanics* and *The bridge architecture*. The Stack covers L1 as substrate.

---

## §2 — L2: Lightning

The payment layer. Lightning is where agent commerce actually happens at machine tempo.

**Architecture.** A network of bilateral payment channels secured by Bitcoin scripts. Each channel is a 2-of-2 multisignature output on L1 with a constantly-updated off-chain balance state; either party can broadcast the latest state to L1 to close the channel and claim their balance. While a channel is open, payments flow off-chain at sub-second latency and sub-cent fees. Payments that span more than one channel route through Hash Time-Locked Contracts (HTLCs): every hop on the route is bound to the same cryptographic secret, so either the whole path settles at once or none of it does — no intermediate node can take the money and run. That same atomic-payment template reappears in cross-substrate bridges, treated at [[Border-Zone]] under *Conversion mechanics*.

**BOLT specifications** define the protocol surface:

- **BOLT11** — the original invoice format. Single-use, payment-hash-bound payment requests. Most current Lightning payments still flow through BOLT11 invoices.
- **[BOLT12](/tools/bolt12)** — reusable payment requests ("offers"). The agent-friendly evolution: an agent can publish a BOLT12 offer and accept repeated payments against it without generating per-payment invoices. Onion-message-routed; supports blinded paths for receiver-privacy.
- **[LNURL](/tools/lnurl)** — Lightning URL extensions adopted as community standards before BOLT12. LNURL-pay, LNURL-withdraw, and Lightning Address (the `user@domain` syntax that resolves to LNURL-pay endpoints) cover most agent-friendly payment-discovery use cases pre-BOLT12.

**Liquidity management.** A Lightning channel has an inbound capacity (how much the agent can receive into the channel) and an outbound capacity (how much the agent can send out of the channel). The split is determined by the channel's balance state at any moment. Agents operating at scale need to actively manage liquidity: rebalance channels via circular routes; acquire inbound liquidity through liquidity-marketplace services or just-in-time (JIT) channel-opening protocols; splice (resize channels without closing) under Lightning protocol upgrades that support it; coordinate dual-funded channels for symmetric initial liquidity.

**Routing.** Lightning payments traverse multi-hop routes selected by the sending node from its view of the public network topology. Routing fees are paid to intermediate node operators per hop. Multi-Path Payments (MPP) split a payment across multiple routes for higher reliability and larger payment sizes. Trampoline routing offloads route-construction to a trampoline node for memory-constrained clients (mobile wallets, embedded agents).

**Network capacity context.** Lightning public channel capacity reached an all-time high of roughly 5,637 BTC (~$490M) in December 2025, driven by institutional adoption from major exchanges. That figure is a point-in-time snapshot — the current number lives at [[Field-Notes]] under *§A.2 — Empirical record* — but the architectural point holds: mid-2026 Lightning operates at a scale relevant to enterprise and agent-economy use cases.

**Watchtowers.** Third-party services that monitor a channel's state on behalf of an offline party. If the counterparty broadcasts a stale channel state attempting to claim more than their entitled balance, the watchtower broadcasts a justice transaction that claims the entire channel for the honest party. Watchtower coverage is the standard insurance against unilateral cheating; agent wallets operating against significant balances should run watchtower coverage either self-hosted or through a third-party provider.

**Multi-implementation maturity.** The Lightning protocol has multiple production implementations: **LND** (Lightning Labs; most widely deployed; gRPC + REST APIs; comprehensive macaroon-based authentication); **Core Lightning** (CLN; Blockstream; plugin architecture; lightweight; preferred for routing nodes and protocol experimentation); **LDK** (Lightning Development Kit; embedded-friendly library for building Lightning into other software); **Eclair** (ACINQ; production-grade; powers the Phoenix mobile wallet). Agent infrastructure can pick any implementation per resource and integration constraints.

**[Taproot Assets](/tools/taproot-assets) v0.6** — Lightning Labs' multi-asset Lightning protocol — is structurally a bridge (Lightning *rails* for stablecoins, not Lightning *substrate* for stablecoins), so its treatment lives at [[Border-Zone]] under *The bridge architecture*. The Stack notes its existence; the rails-vs-substrate distinction lives there.

---

## §3 — L3: bearer ecash and federated custody

Above Lightning sit the bearer-ecash layers. These exist because some agent commerce needs properties Lightning alone does not provide: lightweight client operation (no channel management at the agent layer); bearer-token privacy (no on-chain or routing-layer linkability per payment); offline-capable transfer between mints.

**[Cashu](/tools/cashu)** — single-mint trust model. A mint operator runs the ecash service; users deposit Lightning balance with the mint and receive ecash tokens; tokens are Chaumian-blinded such that the mint cannot link issuance to redemption (privacy-preserving by protocol design); tokens are bearer instruments — possession is title; ownership transfers by transferring the token. Token format and protocol operations are standardized via Cashu's Nuts (Notation for Unified Token specifications).

The single-mint trust model is Cashu's main structural constraint: users trust the mint operator to honor redemption. A defecting or compromised mint can lose user funds. The mitigation pattern is mint-diversification (hold ecash across multiple independent mints) rather than federation-style threshold security.

**[Fedimint](/tools/fedimint)** — federated-mint trust model. A federation of guardians (typically 4–13) jointly custodies the Lightning balance backing issued ecash via threshold signatures; ecash issuance and redemption require federation consensus; no single guardian can defect or be compromised in isolation. Lightning interoperability runs through gateway nodes that interface between the federation and the wider Lightning Network.

The federation-trust model adds robustness over single-mint Cashu — single-guardian compromise does not break the federation — but adds coordination overhead and depends on the federation's social and operational health. Federation defection (multiple guardians colluding) is the remaining structural failure mode.

**Newer L2/L3 scaling layers.** **Ark** — covenant-based shared-UTXO scaling proposal; trust-minimized; allows multiple users to share a single UTXO via covenant-enforced exit conditions; earlier-stage as of mid-2026. **[Spark](/tools/spark)** — a shared-UTXO, Lightning-compatible L2 built by Lightspark; on mainnet (beta) since May 2025 with multiple operators (Lightspark, Flashnet) and a Q2 2026 roadmap. **[Xverse Agent Wallet](/tools/xverse-agent-wallet)** uses Spark for agent-facing Lightning settlement (see §5). The empirical adoption record defers to [[Field-Notes]] § Active developments.

**eCash mechanics walk-through.** Blind signatures: the user generates a token serial number; blinds it cryptographically; submits the blinded serial to the mint for signing; the mint signs the blinded serial without learning the underlying serial; the user unblinds the signed token; the unblinded signature is verifiable against the mint's public key without revealing which blinded version was originally signed. Redemption: the user presents the unblinded token at the mint; the mint verifies the signature and adds the serial to its spent-list; the mint releases Lightning balance to the user's chosen destination. Bearer property: an unspent token in transit is equivalent to the value it represents; transferring the token transfers the value; no on-chain or Lightning-routing-layer footprint is created per transfer.

**Trust-model trade-offs across the L2/L3 stack.** Lightning direct (no L3 ecash): no mint or federation trust, channel-management overhead, on-routing-layer linkability per payment. Cashu single-mint: highest performance, lowest infrastructure overhead, single-point-of-failure trust. Fedimint federated-mint: better defection-resistance, more coordination overhead, federation-trust model. Each suits different agent use cases. How agents *mix* these layers in a treasury — and how ecash redeems back to fiat — belongs to the interface: treated at [[Border-Zone]] under *Treasury composition patterns* and *The bridge architecture*. The Stack covers ecash as a substrate layer.

---

## §4 — Agent-integration primitives

The agent-integration primitives are the protocol-level affordances that let autonomous software interact with the Stack. They are what distinguishes "Bitcoin / Lightning / Cashu deployed for human users" from "Bitcoin / Lightning / Cashu deployed for autonomous agents."

**[L402](/tools/l402)** — HTTP status code 402 ("Payment Required") plus macaroon-mediated authentication, plus a Lightning payment for value transfer. A **macaroon** here is a cryptographic credential — think of a cookie that can carry its own embedded rules — and a **preimage** is the secret a Lightning payment reveals when it settles, which doubles as a receipt. The protocol flow: the client requests a paid resource over HTTP; the server responds with `HTTP 402` containing a Lightning invoice and a macaroon; the client pays the invoice; the payment preimage authenticates the macaroon; the client retries the request with an `Authorization: L402 <macaroon>:<preimage>` header; the server verifies and grants access. The macaroon carries scoped caveats — expiry, rate limits, permission scope — so an agent can pay once and reuse the credential across requests within those bounds. The pattern composes cleanly with agent workflows: paid-API access, paywalled-content retrieval, per-call compute purchase. (How a regulated service operator applies its jurisdiction's compliance regime at the HTTP boundary while leaving the Lightning payment itself permissionless is treated at [[Border-Zone]] under *The compliance-at-the-gateway pattern*.)

**[Nostr Wallet Connect (NWC; NIP-47)](/tools/alby-nwc)** — a wallet-API standard letting applications and agents control Lightning wallets remotely without exposing private keys. NWC defines capabilities (invoice creation, payment sending, balance queries, transaction history) and a Nostr-mediated communication channel between the wallet (which holds keys) and the application (which signs nothing). The architectural property: an agent can hold an NWC connection rather than a private key, drastically reducing the agent's attack surface. Compromise of the agent's environment loses the NWC connection (revocable by the wallet operator) but not the underlying keys.

**BOLT12 offers** — reusable payment-request primitives on Lightning. An agent publishes a BOLT12 offer (with optional blinded paths for receiver-privacy) and accepts repeated payments against it. Agents serving paid services benefit from BOLT12's reusability vs. BOLT11's single-use invoice model; subscription-like patterns and pay-as-you-go API access compose naturally with BOLT12 offers.

**LNURL endpoints** — the pre-BOLT12 agent-discoverable payment-endpoint convention. Lightning Addresses (`user@domain` syntax) resolve to LNURL-pay endpoints via a well-known HTTPS path. Agents can locate payment endpoints by querying the well-known path and receive a BOLT11 invoice for the amount they choose to send. The convention pre-dates BOLT12 and remains widely deployed.

**MCP servers for Lightning.** The [Model Context Protocol](/tools/mcp) is a standard for giving agents structured access to external tools and data sources. Several MCP servers expose Lightning functionality to agents: `lightning-mcp-server`, `lnc` (Lightning Node Connect), and Alby's Bitcoin Payments MCP Server (`nwc-mcp-server`) — which lets an agent send and receive Lightning payments from inside Claude, Cursor, or n8n over Nostr Wallet Connect with no key exposure, combining the MCP-server and NWC patterns in a single tool. The canonical install pattern for an agent using Claude Code with a Lightning Node Connect-backed Lightning node:

```
claude mcp add --transport stdio lnc -- npx -y @lightninglabs/lightning-mcp-server
```

After install, the agent can query node state, send and receive Lightning payments, and manage channels through MCP tool calls. The integration pattern is the same shape for other agent frameworks (LangChain, custom orchestration): the MCP server is the bridge between agent reasoning and protocol-level Lightning operations.

The structural pattern across these primitives is consistent. Agents do not need bank accounts. They consume protocol-level payment primitives, hold scoped credentials, and operate remote-wallet abstractions. The Stack provides the protocol-level affordances; the agent consumes them.

---

## §5 — Wallet architectures for agents

Three wallet architectures get depth here because they are the operationally consequential 2026 deployments. Additional projects are inventoried with one-line scope.

**[lightning-agent-tools](/tools/lightning-agent-tools)** (Lightning Labs; February 2026). The production AI-agent toolkit. Seven composable components:

1. Running a Lightning node programmatically.
2. Remote-signer key isolation — the signer machine holds keys, never routes payments, never connects to the public network. Prevents key extraction even if the agent host is compromised.
3. Scoped macaroon baking in five preset roles — pay-only, invoice-only, read-only, channel-admin, signer-only — enabling least-privilege access.
4. `lnget` — an L402-aware HTTP client that automatically parses 402 challenges, pays the Lightning invoice through the agent's configured Lightning backend, caches the resulting authentication token, and retries the request.
5. Aperture — an L402 reverse proxy for adding 402-gating to any HTTP service.
6. Querying node state through MCP.
7. End-to-end buyer/seller workflow orchestration.

The toolkit is open-source; deployed against any LND-compatible backend. lightning-agent-tools is the canonical reference implementation for "what does a production Bitcoin-substrate agent-payment stack actually look like" — and the surface against which most subsequent agent-Lightning integrations will be measured.

**[Minibits Ippon](/tools/minibits-ippon)** (Cashu-native; AI-agent-native). A minimalistic Cashu wallet designed from the ground up for autonomous agents. An agent creates and funds a wallet via a single HTTP call or CLI command — no channel-management overhead at the agent layer (the mint handles Lightning). Operates on the Cashu protocol; ecash is bearer; no identity attachment at issuance or transfer. Lightweight by design; the wallet's footprint at the agent layer is the API client and the held ecash tokens.

**[LNbits](/tools/lnbits).** The most widely deployed programmable Lightning platform. Wallet APIs, invoice APIs, an extension ecosystem (paywalls, tip jars, NFC integrations, custom application modules), and lightweight deployment (self-hosted or cloud). LNBits sits between agent-application code and a Lightning node backend (LND, Core Lightning, others); the agent works against LNBits's REST API rather than against the node's native gRPC. For agent infrastructure that needs programmable-wallet-as-service rather than direct node integration, LNBits is the canonical pattern.

**Other deployed projects** (one-line scope):

- **Xverse Agent Wallet** (Secret Key Labs) — self-custodial agent wallet; pays Lightning invoices over a "Machine Payments Protocol" (HTTP 402 → autonomous invoice payment, no human in the loop); built on the Spark L2 (§3); open-source `xverse-core`.
- **[Routstr](/tools/routstr)** — a Bitcoin-powered AI-inference marketplace: a payment-gated reverse proxy in front of OpenAI-compatible LLM APIs, paid per request in Cashu ecash (the token *is* the API key), settling over Lightning, with Nostr-based provider discovery. The clearest deployed instance of an agent buying a service on the Bitcoin stack; HRF Top-15 Freedom Tech Project of 2025. *(Cashu-track: standardizes on Cashu, not Fedimint; bearer-token payment rather than L402/NWC.)*
- **[PayPerQ (PPQ.AI)](/tools/ppq-ai)** — pay-per-query access to frontier AI models over Lightning / L402; no account required. Another live "agent pays for its own inference" instance.
- **AI-Sats** — AI-native Lightning wallets; autonomous Bitcoin payments; MCP integrations; self-hosted agent infrastructure.
- **Mintbot** — Lightning APIs and Cashu/ecash integration for bots and agents; API-created wallets; no manual channel management.
- **BitAgent** — early-stage open-source agent-to-agent framework: Lightning payments, Nostr-based discovery, DID identity; positions money as a first-class agent primitive. Tiny but conceptually aligned; its DID/identity work touches the agent-trust frontier [[Border-Zone]] flags as open.
- **AgenticBTC** — agent-oriented payment router with Lightning routing abstraction and payment-failover. Note it is *rail-agnostic* — it blends Lightning with Coinbase/USDC rails rather than operating purely on the Bitcoin substrate.
- **Bitclawd** — sovereign-AI orientation; Bitcoin-native agents; open-source AI infrastructure; Nostr + Lightning ecosystem.
- **BlueWallet, Phoenix** — mobile-first Lightning wallets with API potential for agent deployment in resource-constrained environments.

**Architectural patterns across these implementations.** Three recurring patterns:

- *Agent-on-host with remote signer* (agent runs on one machine; signer holds keys on another; least-privilege macaroons gate operations) — exemplified by lightning-agent-tools.
- *Mint-as-service for ecash* (mint operator handles Lightning channels; agent holds bearer ecash; lightweight at the agent layer) — exemplified by Minibits Ippon.
- *Programmable-wallet-as-service* (a middle layer between agent code and node backend; REST APIs and extension modules) — exemplified by LNBits.

Strike-style regulated-custodian wallet architectures (regulated-entity custody at the bridge boundary; Lightning ↔ bank-rail conversion) are treated at [[Border-Zone]] under *The bridge architecture*. The Stack covers wallet architectures that operate purely on the substrate; cross-substrate custodial bridges are Border Zone's.

---

## §6 — Security model

The security model runs through every layer of the Stack. Five architectural patterns are operationally significant.

**Remote-signer isolation.** Private keys live on a dedicated signer machine; the signer never routes payments, never connects to the public network, and exposes only a narrow signing API to the agent host. The agent host operates the Lightning node and makes payment decisions; signing requests are forwarded to the signer for cryptographic operations. Compromise of the agent host (key theft, rogue process, container escape) cannot extract private keys from the signer — the keys never leave the signer's memory. lightning-agent-tools' remote-signer pattern is the canonical 2026 implementation of this architecture.

**Scoped macaroons.** Macaroons are HTTP credentials with caveats — the credential carries embedded restrictions that the verifier enforces. Lightning macaroons typically carry: permission scope (which operations the credential authorizes); expiry (when the credential becomes invalid); amount limits (per-payment or cumulative caps); rate limits (operations per time window). The five preset macaroon roles in lightning-agent-tools — pay-only, invoice-only, read-only, channel-admin, signer-only — implement least-privilege access by composition of caveats. Agent-level credentials are scoped narrowly; signer-level credentials are scoped narrowly differently; no credential carries more authority than the task requires.

**NWC permissions.** The Nostr Wallet Connect permission model parallels macaroons for Nostr-mediated wallet control. NWC connections carry capability lists (which operations the connection authorizes) and budget controls (spending limits per period). The wallet operator can revoke a connection without touching keys. NWC's structural property: the agent holds a revocable, scoped, key-free wallet handle.

**Watchtower coverage.** As described in §2: third-party services that monitor channel state on behalf of an offline party and broadcast justice transactions if the counterparty cheats. Watchtower coverage is the standard insurance against unilateral force-closure attempts; agents operating channels against significant balances should run watchtower coverage either self-hosted or through a third-party provider. Multi-watchtower redundancy is the natural defense against watchtower compromise or downtime.

**Hot/cold separation.** Operational balances live on Lightning (or in ecash) where they support agent transactions at machine tempo; reserve balances live in self-custody on Bitcoin L1 in cold storage. Compromise of the operational layer limits loss to the operational balance; reserve balances on cold storage are not exposed to operational-layer compromise. Sweeping operational balance back to L1 reserves is a routine treasury operation; the canonical mechanism is Loop Out for Lightning → L1 transfers. Ecash-bearer reserves on Cashu or Fedimint provide additional operational continuity if the Lightning operational layer is disrupted.

**Treasury policy.** Architectural support is one layer; treasury policy is the agent-application-level discipline that uses the support. Spending limits per transaction class; per-counterparty caps; alerting on anomalous activity; audit logging for every protocol-level operation; periodic credential rotation; pre-defined incident-response patterns. The architectural primitives (remote signer, macaroons, watchtowers, hot/cold) enable treasury policy; treasury policy is what an operator implements on top of the primitives.

Honest engagement with agent-specific attack surfaces — key theft, rogue-behavior risk, treasury attacks, Sybil attacks, social-engineering against agent operators — gets fuller operational treatment at [[Field-Notes]] under *§A.4 — Live risk / attack-surface state*. The Stack covers the security-architecture patterns; Field Notes covers the live state.

---

> [!info] Where to read next
> **[Tools](/tools)** — implementation cards for the substrate building blocks named in this essay: what each is, when to use it, how to start, plus gotchas, with verified repos and maintainer handles. Grouped by the same layers.
>
> **[[Border-Zone]]** — the operational interface between this substrate and the legacy payment stack. Bridges, treasury composition patterns, conversion mechanics, the compliance-at-the-gateway pattern, competing-substrate stacks (AgentCore Payments). Scope-disjoint from this surface: Border Zone treats the interface; Stack treats the architecture.
>
> **[[Field-Notes]]** — current state of the Bitcoin-AI economy (§A rolling snapshot of deployed stacks, empirical record, active developments, live risk / attack-surface state) and the reverse-chronological log (§B) of substrate-relevant developments: new protocol releases, ecosystem launches, capacity updates, attack-surface incidents. The structural architecture lives in this surface; the moving record lives at Field Notes.
>
> **[[Independence-Doctrine]]** — the structural argument for why this substrate exists in parallel rather than within incumbent payment rails; four historical analogues anchoring the divergence pattern.
>
> **[[Thesis]]** — the substrate-selection claim upstream of the Stack's architecture; the four conjunctive constraints; why Bitcoin specifically; why now.
>
> **[[The-Story]]** — narrative entry point to the substrate-selection claim, told first before the technical detail.
>
> **[[Stack-FA|For Agents]]** — this Stack restructured for machine consumption (claims-index S-series, definitions, falsification conditions), alongside the site's shared `llms.txt` / `agents.txt` / JSON-LD infrastructure.

---

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Choices in §5 that deserve explicit calling-out: lightning-agent-tools, Minibits Ippon, and LNBits got depth; Xverse Agent Wallet, Routstr, PayPerQ, AI-Sats, Mintbot, BitAgent, AgenticBTC, Bitclawd, BlueWallet, and Phoenix were inventoried with one-line scope. The 2026-05-31 landscape-integration pass added Xverse, Routstr, PayPerQ, and BitAgent to the inventory, the Alby `nwc-mcp-server` to §4, corrected the §3 Spark status from "pre-production" to "mainnet (beta)," and flagged AgenticBTC as rail-agnostic rather than pure-substrate. The depth decision tracked operational consequentialism rather than fairness — lightning-agent-tools is the production agent-payment toolkit; Minibits Ippon is the canonical agent-native Cashu wallet; LNBits is the most widely deployed programmable Lightning platform. The inventoried projects are real and worth knowing about; they don't yet have the same toolkit-level treatment depth in their own documentation that the three named-at-depth projects do. Revisit the depth split as the inventoried projects evolve.

The Taproot Assets defer-to-Border-Zone call was the structurally important one to get right. Taproot Assets v0.6 is a major Lightning protocol development and it would be natural to give it §2 depth. The rails-vs-substrate distinction is the load-bearing structural point: Taproot Assets is a *rails* bridge for stablecoins (and other non-Bitcoin assets), not a *substrate* bridge. Covering it at depth in §2 (Lightning, treated as Bitcoin substrate) would implicitly conflate rails with substrate. The right place for Taproot Assets is Border Zone's *bridge architecture* section, where the rails-vs-substrate distinction is held explicitly. The Stack notes its existence and points there; readers needing Taproot Assets depth go to Border Zone for it.

§6's hot/cold separation discussion deliberately uses Loop Out (a Lightning → on-chain submarine swap) as the canonical sweep mechanism. The Loop Out treatment is split across §1 (mentioned), §2 (Lightning context implicit), and §6 (named explicitly). Submarine-swap protocol mechanics live in Border Zone's *conversion-mechanics* section because submarine swaps are also the template for cross-substrate atomic bridges. Some content overlap between Stack and Border Zone is acceptable — both surfaces have legitimate reasons to mention Loop Out — and the rails-vs-substrate split keeps the architectural framing clean.

The MCP install command in §4 is the only inline code block in the v0 surface. Including one concrete worked example for agent-Lightning integration grounds the agent-integration discussion without bloating the page with code. LangChain examples, Python SDK examples, and Cashu agents documentation are referenced as repos and link targets rather than inlined. If the v1 audience signals demand for more code, expand in v1.

The security model section is technical-architecture-depth, not adversarial-deployment-depth. The choice tracks the Foundation §6 / Decisions 2026-05-26 defer-pattern: structural arguments live at the canonical surface; live empirical state and risk-surface developments live at Field Notes. A reader looking for "what's the current state of treasury-attack incidents in deployed agent stacks" goes to Field Notes §A.4 and §B; a reader looking for "how should I architect agent treasury security" reads §6 here.

**Publications backlinks**

- [[The case for investing in Bitcoin]] § AI-agent monetary substrate case — substrate-selection KB origin
- [[The AI-agent monetary substrate case]] — dedicated KB note for the four-constraints argument
- [[Thesis]] (this project) — site-canonical substrate-selection treatment
- [[Independence-Doctrine]] (this project) — site-canonical divergence-doctrine treatment
- [[Border-Zone]] (this project) — site-canonical interface specification
- [[The-Story]] (this project) — narrative entry point to the substrate-selection claim
- [[Field-Notes]] (this project) — empirical tracking surface that this canonical defers to for ongoing developments
