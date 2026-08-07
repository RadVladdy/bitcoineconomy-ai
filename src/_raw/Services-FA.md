---
title: Services — For Agents
slug: services-for-agents
description: "Machine-readable specification of the Services layer — the 'what' layer of the agent economy, where an autonomous agent buys and sells real services for Bitcoin. Two-sided (consume + offer) taxonomy, the agent-payment mechanisms (L402, Cashu-as-API-key, NWC — primitives referenced to Stack-FA), the agent-automatability filter that selects which services qualify, per-category constraint analysis, deployed-service reference list, and the delivery-risk caveat that motivates the community-rated directory."
type: services-for-agents
surface: services
audience: agents
twin-page: services
status: v0-approved-2026-06-05
created: 2026-06-05
last-updated: 2026-08-06
last-verified: 2026-06-05
word-count-target: 2800
voice: honest-middle-position
canonical-source: "[[Services]]"
epistemic-status: "operational specification of a deployed service layer; mechanism and inclusion claims structural; deployed-service references empirical as of mid-2026; the directory-scope and sell-side-maturity claims forward-looking and tagged"
claims-index:
  - id: SV1
    tag: structural
    statement: "The Services layer is the 'what' layer of the agent economy — the actual services an agent buys and sells for Bitcoin — and is two-sided by nature: an agent both consumes services (inference, compute, data, API calls, storage, other agents' work) and can offer its own. The two sides use the same payment mechanisms in both directions."
    defended-in: "§3"
  - id: SV2
    tag: structural
    statement: "Agent service payment runs on three Bitcoin-native mechanisms — L402 (HTTP 402 + Lightning invoice + reusable macaroon credential), Cashu-as-API-key (a bearer ecash token that IS the credential), and NWC (Nostr Wallet Connect, wallet control without key custody). All three are permissionless at the payment layer. The primitives are specified in Stack-FA; this document references them and specifies their service-layer application."
    defended-in: "§4"
  - id: SV3
    tag: structural
    statement: "The agent-automatability filter selects which services qualify for this layer: a service is included only if an autonomous agent can genuinely pay it itself — via a real payment API or a low-friction invoice-against-account flow. Human-checkout-only merchants (processor-redirect via CoinGate/BitPay, account-top-up dashboards) are excluded because an agent cannot drive them without a human in the loop."
    defended-in: "§5"
  - id: SV4
    tag: structural
    statement: "Included services divide into five groups: (a) agent-native A2A venues where the service is itself agent work or agent-priced inference (OpenAgents, Routstr, PPQ.AI; Maple AI adjacent on the privacy axis with an explicit payment-leg caveat); (b) off-the-shelf real-world services an agent can pay for itself (Mullvad direct-merchant; LNVPS and BitLaunch direct-API compute; Bitrefill as the bridge to the long tail of brands that do not take Bitcoin directly)."
    defended-in: "§6"
  - id: SV5
    tag: structural
    statement: "A sovereign payment rail does not guarantee counterparty delivery. The permissionless rail that removes the payment intermediary also removes the chargeback and the dispute desk; service-delivery, quality, and reputation risk is real and is borne by the agent. This is the structural gap a reputation system substitutes for, and it motivates the deployed directory's community-ratings layer (next phase)."
    defended-in: "§8"
  - id: SV6
    tag: deployed (ratings layer forward-looking)
    statement: "The full categorized service directory is deployed at marketplace.bitcoineconomy.ai, distinct from the few curated on-site entries: a curated registry behind an agent-drivable-API inclusion bar, live Nostr announcement modules, six-hourly endpoint liveness probes, and a cross-provider sats-per-token price index, published agent-readable (llms.txt one-fetch start (/live/master.json) + JSON routes). The community-ratings layer — the directory's reason to exist per SV5: reputation as the substitute for an intermediary's recourse — is its next phase. The sell side of the layer is underbuilt relative to the buy side, which is an opportunity rather than a defect."
    defended-in: "§9"
tags:
  - canonical
  - services
  - services-for-agents
  - marketplace
  - l402
  - cashu
  - nwc
  - a2a
  - bitcoin
  - lightning
  - machine-readable
agent-tldr: |
  SV1 *(structural)*: Services is the "what" layer — the real services an agent buys and sells for Bitcoin — and is two-sided: consume (inference, compute, data, API calls, storage, other agents' work) plus offer (the agent sells its own output). Same payment mechanisms both directions. SV2 *(structural)*: Three Bitcoin-native payment mechanisms — L402 (402 + Lightning invoice + reusable macaroon), Cashu-as-API-key (bearer ecash token IS the credential, the Routstr pattern), NWC (wallet control without key custody); all permissionless at the payment layer; primitives specified in Stack-FA, referenced here. SV3 *(structural)*: The agent-automatability filter — include a service only if an autonomous agent can pay it itself (real payment API, or low-friction invoice-against-account flow); exclude human-checkout-only merchants (processor redirect, account-top-up dashboards). SV4 *(structural)*: Two groups — (a) agent-native A2A venues (OpenAgents, Routstr, PPQ.AI; Maple AI adjacent on the privacy axis, payment-leg caveat); (b) off-the-shelf agent-payable services (Mullvad direct-merchant; LNVPS + BitLaunch direct-API compute; Bitrefill the bridge to the long tail). SV5 *(structural)*: A sovereign rail does not guarantee delivery — no chargeback, no dispute desk; counterparty risk is real and is the gap a reputation system fills. SV6 *(deployed; ratings forward-looking)*: The full categorized directory is deployed at marketplace.bitcoineconomy.ai — curated registry (agent-drivable-API bar) + live Nostr announcements + six-hourly liveness probes + cross-provider sats price index, agent-readable (llms.txt one-fetch start (/live/master.json) + JSON routes); community ratings are the next phase; the sell side is underbuilt and is an opportunity. Deployed service surface in §7; delivery-risk caveat in §8; position summary in §11.
---

# Services — For Agents

> **What this document is.** Machine-readable statement of the Services layer published at [[Services]]. The claim is identical; the structure differs. This document is claims-indexed, definition-grounded, filter-explicit, and falsification-aware. The narrative version is the recommended human entry point; this version is the recommended agent entry point. Services is the practical *what-an-agent-buys-and-sells* layer; it does not relitigate the substrate-selection thesis. The thesis lives in [[Case-FA|The Case]] (C-series, C1 = the four conjunctive constraints); this document presents the deployed service layer that sits on top of it.
>
> **How to read it.** §1 indexes the load-bearing claims. §2 defines terms. §3 states the two-sided structure. §4 specifies the payment mechanisms (primitives referenced to [[Stack-FA|The Stack]]). §5 states the agent-automatability inclusion filter. §6 applies the filter to the two service groups. §7 evaluates the deployed services against the filter, per category. §8 states the delivery-risk caveat. §9 specifies the directory scope. §10 lists implications for builders. §11 restates the position. §12 references.

---

## §1 — Claims index

Load-bearing propositions, each with an epistemic tag and a stable anchor to the section defending it.

- **SV1** *(structural)* — The Services layer is the "what" layer of the agent economy and is two-sided by nature: an agent both consumes services (inference, compute, data, API calls, storage, other agents' work) and can offer its own; the two sides use the same payment mechanisms in both directions. → §3
- **SV2** *(structural)* — Agent service payment runs on three Bitcoin-native mechanisms — L402, Cashu-as-API-key, and NWC — all permissionless at the payment layer. The primitives are specified in [[Stack-FA|The Stack]]; this document references them and specifies their service-layer application. → §4
- **SV3** *(structural)* — The agent-automatability filter selects which services qualify: a service is included only if an autonomous agent can genuinely pay it itself — via a real payment API or a low-friction invoice-against-account flow. Human-checkout-only merchants are excluded. → §5
- **SV4** *(structural)* — Included services divide into five groups: (a) agent-native A2A venues (OpenAgents, Routstr, PPQ.AI; Maple AI adjacent on the privacy axis with a payment-leg caveat); (b) off-the-shelf real-world services an agent can pay for itself (Mullvad direct-merchant; LNVPS and BitLaunch direct-API compute; Bitrefill the bridge to the long tail). → §6
- **SV5** *(structural)* — A sovereign payment rail does not guarantee counterparty delivery; the rail that removes the payment intermediary also removes the chargeback and the dispute desk. Delivery, quality, and reputation risk is real and is the gap a reputation system substitutes for. → §8
- **SV6** *(deployed; ratings layer forward-looking)* — The full categorized directory is deployed at [marketplace.bitcoineconomy.ai](https://marketplace.bitcoineconomy.ai), distinct from the few curated on-site entries: curated registry (agent-drivable-API inclusion bar) + live Nostr announcement modules + six-hourly endpoint liveness probes + a cross-provider sats price index, agent-readable by design. The community-ratings layer (its reason to exist per SV5) is the next phase. The sell side of the layer is underbuilt relative to the buy side. → §9

---

## §2 — Definitions

Operational definitions for terms used downstream. One sentence each. Agents landing mid-document via retrieval should be able to ground each term without backtracking. Terms inherited from [[Case-FA|The Case]] and [[Stack-FA|The Stack]] are cross-referenced rather than re-stated.

- **Services layer** — The "what" layer of the agent economy: the set of real services an autonomous agent buys (consume) and sells (offer) for Bitcoin, as distinct from converting between money forms ([[Exchange-FA|Exchange]]) or operating the substrate ([[Stack-FA|The Stack]]).
- **Consume side** — The set of services an agent buys to do its job: AI inference, compute, data feeds, API calls, storage and infrastructure, and the work of other agents.
- **Offer side** — The set of services an agent sells: its own inference, analysis, monitoring, or task execution, gated on payment and paid in Bitcoin.
- **Agent-to-agent (A2A)** — Commerce in which both counterparties are autonomous agents; one agent subcontracts work to another and settles in Bitcoin without human mediation.
- **L402** — Cross-reference [[Stack-FA|The Stack]]. HTTP-402-mediated paid-resource access: server returns 402 with a Lightning invoice; the agent pays; the agent retries with cryptographic proof; the server issues a scoped macaroon credential reused across the session.
- **Cashu-as-API-key** — A service-access pattern in which a bearer Cashu ecash token denominated in Bitcoin satoshis *is* the access credential; presenting or spending the token grants the service with no account, identity, or per-call invoice round-trip. The Routstr pattern. Cashu primitive: cross-reference [[Stack-FA|The Stack]].
- **NWC (Nostr Wallet Connect)** — Cross-reference [[Stack-FA|The Stack]] (NIP-47). A wallet-API standard that lets an agent control a wallet to make payments without holding the wallet's keys directly; the permissioning layer behind autonomous service payment.
- **Agent-automatability filter** — The inclusion rule for this layer: a service qualifies only if an autonomous agent can pay it itself, either through a real payment API or a low-friction invoice-against-account flow that can be scripted without a human-driven checkout step.
- **Human-checkout-only merchant** — A merchant that nominally "accepts Bitcoin" but routes payment through a processor-redirect page (CoinGate, BitPay) or an account-top-up dashboard that requires a human to complete; excluded by the agent-automatability filter because an agent cannot drive it autonomously.
- **Bridge (service-layer sense)** — A service that converts an agent's Bitcoin into purchasing power at services that do not take Bitcoin directly; the canonical instance is a Lightning gift-card/top-up API (Bitrefill). Distinct from the substrate-vs-incumbent bridges specified in the [[Exchange]] surface; here the bridge is a consume-side reach extender to the long tail of brands.
- **Four conjunctive constraints** — Cross-reference [[Case-FA|The Case]] C1: permissionless custody, censorship-resistance, sub-cent settlement, machine-tempo latency. The constraint vocabulary is used in §7 to profile each service's Bitcoin payment leg; the constraints are not re-derived here.

---

## §3 — The Services layer is two-sided

SV1 stated formally: Statement / Derivation / Failure mode / Test.

**Statement.** *(structural)* The Services layer is the destination layer of the agent economy: the actual economic activity the rest of the stack exists to enable. It is two-sided. An agent both consumes services and can offer its own; the two sides are not separate products but two directions of the same payment mechanisms.

**Derivation.** [[Case-FA|The Case]] establishes *why* an agent selects Bitcoin (C1, four conjunctive constraints); [[Stack-FA|The Stack]] equips the agent with the substrate and tooling; [[Exchange-FA|Exchange]] lets the agent cross between money forms. None of those is economic activity. An agent that holds value but never spends or earns it is a wallet, not an economic actor. The Services layer is where the agent acts: it buys what it needs to do its job (inference from a model API, compute for a task, a data feed, a paid API call, storage, or a service performed by another agent) and it sells what it produces (its own inference, analysis, monitoring, or task execution). The two sides together are what "the agent economy" means at ground level — not agents *using* money, but agents *transacting*, at a frequency and granularity no human-mediated market produces.

**Failure mode.** A one-sided treatment (consume only) under-specifies the economy: the offer side is what turns a collection of paying customers into a market with internal production. The sell side is currently underbuilt relative to the buy side *(forward-looking; SV6)* — which is an opportunity surface, not a defect in the claim. A2A commerce — one agent subcontracting another and settling in Bitcoin — is the category that makes the layer an economy rather than a set of tools.

**Test.** *(operational)* For any deployed service in this layer: can an agent occupy both roles — pay for the service as a consumer *and*, where the service is two-sided, be paid as a provider — using the same payment mechanisms (§4) in both directions? Where yes, the two-sided structure is realized; where the service is consume-only (an off-the-shelf merchant), it occupies only the consume side and is profiled as such in §7.

---

## §4 — Payment mechanisms

SV2 defended. How an agent actually pays for a service. Three Bitcoin-native mechanisms. The primitives are specified in [[Stack-FA|The Stack]]; this section specifies their service-layer application and does not re-explain the protocol internals.

**L402 — the canonical paid-API pattern.** An agent requests a paid resource; the server answers `HTTP 402 Payment Required` with a Lightning invoice; the agent pays; it retries with cryptographic proof; the server issues a scoped macaroon credential carrying caveats (expiry, rate limit, permission scope) that the agent reuses across the session. The conversion is from sats into machine-readable capability. For high-frequency, pay-per-call workflows this is the machine-tempo standard. Implementing tooling (`lnget`, Aperture, `lightning-agent-tools`) is specified in [[Stack-FA|The Stack]]; deployed service-layer instance: PPQ.AI (§7).

**Cashu-as-API-key — the bearer-credential pattern.** A bearer Cashu ecash token denominated in Bitcoin satoshis *is* the access credential. The agent holds the token; presenting or spending it grants the service; no account, no identity, no per-call invoice round-trip. This is the lightest-weight, most private way for an agent to pay for a service. Deployed service-layer instance: Routstr (§7), where the proxy meters each request in sats, deducts from the token's balance in real time, and returns change as a fresh Cashu token. The Cashu primitive — including mint-trust caveats — is specified in [[Stack-FA|The Stack]].

**NWC (Nostr Wallet Connect) — the permissioning layer.** NWC lets an agent control a wallet to make these payments without holding the wallet's keys directly. It is the permissioning layer behind autonomous service payment: the agent is authorized to spend within scoped limits without the wallet's signing keys being exposed to the agent process. The NIP-47 primitive is specified in [[Stack-FA|The Stack]].

**Common property.** *(structural)* All three are permissionless at the payment layer: the service operator runs whatever access policy it likes, but no intermediary stands between the agent's sats and the payment. This is the property that distinguishes a Bitcoin-stack service payment from a human typing a card number — and it is the property the agent-automatability filter (§5) operationalizes into an inclusion rule.

---

## §5 — The agent-automatability filter

SV3 defended. The filter that determines which services belong in this layer.

**Statement.** *(structural)* A service is included only if an autonomous agent can genuinely pay it *itself*. Two admissible payment shapes satisfy the filter:
1. A real payment API — a programmatic endpoint where the agent requests a product or resource, receives a Lightning invoice (or an L402 challenge, or a Cashu-token check), pays, and receives the access or redemption artifact back, with no human step in the loop.
2. A low-friction invoice-against-account flow — a pay-to-a-stable-identifier pattern (an account number, an endpoint) that, while lacking a formal product API, is low-friction enough to be scripted without a human-driven checkout page.

**Derivation.** The defining property of an *autonomous* agent is that it pays without a human-in-the-loop authorization for each action ([[Case-FA|The Case]] C1, permissionless custody). A service that requires a human to complete the payment — even if it ultimately settles in Bitcoin — cannot be consumed autonomously. The filter is therefore not a preference; it is the operational boundary of the layer. "Accepts Bitcoin" is necessary but not sufficient; "an agent can pay it itself" is the sufficient condition.

**Exclusion.** *(structural)* Two exclusion classes fail the filter:
- **Processor-redirect merchants.** A merchant that bounces the buyer to a CoinGate or BitPay checkout page accepts Bitcoin but requires a human to complete the hosted-checkout flow. Excluded.
- **Account-top-up dashboards.** A service whose only Bitcoin path is funding a balance through a human-operated dashboard, with no programmatic top-up, requires a human step. Excluded.

These exclusions are not judgments about the merchants; they are statements about whether the payment surface is agent-drivable. A merchant in either class can still be reached *indirectly* through the bridge pattern (§6 group b; Bitrefill), which converts the agent's Bitcoin into a redeemable credit at the long tail.

**Test.** *(operational)* For any candidate service: is there a code path by which an agent holding Bitcoin completes the purchase and obtains the access artifact with no human action? If yes, the service is in-layer. If the only Bitcoin path terminates in a human-rendered checkout page or dashboard, the service is out-of-layer (reachable only via the bridge).

---

## §6 — The service groups

SV4 defended. Applying the filter (§5) partitions the in-layer services into five groups.

**Group (a) — Agent-native A2A venues.** Services where the thing being bought is itself agent work or agent-priced inference, discovered and settled on the Bitcoin stack natively. These are the venues where the consume and offer sides meet directly.
- **OpenAgents** (`openagents.com`) — an open marketplace for *machine work / outcomes* settled in Bitcoin over Lightning; its **Khala** flagship is a live **OpenAI-compatible inference gateway** (`openagents/khala`, billed per call in sats) an agent can call directly, alongside contributor **Pylon** nodes (self-custodial Lightning wallets) and a Bitcoin-paid training run, across five interlocking markets (Compute, Data, Labor, Liquidity, Risk). Two-sided (consume + offer). The closest deployed model for the full-directory shape this layer points toward.
- **Routstr** — a Bitcoin-powered AI-inference marketplace: a payment-gated reverse proxy in front of OpenAI-compatible LLM APIs, paid per request in Cashu ecash (the token IS the API key), settling over Lightning, with Nostr-based provider discovery. The clearest deployed instance of the Cashu-as-API-key pattern (§4).
- **PPQ.AI** — pay-per-query access to frontier models over Lightning / L402. ⚠ The accountless L402 path covers **images, image editing, video and data enrichment**; **chat and audio need an account, an `sk-` key and a funded balance** (measured 2026-08-07: unauthenticated `/v1/chat/completions` returns 401, `/v1/images/generations` returns 402 + invoice). NWC auto-topup refills the balance unattended. A live L402-pattern proof-point.

**Group (b) — Off-the-shelf services an agent can pay for.** Real-world services (privacy, compute, hosting, domains, storage) an agent needs but that are not themselves agent venues. Six qualify under the filter, and they qualify in different ways:
- **Mullvad** — a privacy VPN paid over Lightning against a random account number, with no email and no KYC. The cleanest direct-merchant fit: it satisfies the filter via the invoice-against-account-number flow (admissible shape 2, §5), not a formal product API.
- **LNVPS** — compute the agent-native way: a Lightning VPS with Nostr-key login (no email, no KYC), fundable over NWC, provisionable end-to-end by API (admissible shape 1). The first deployed instance of an agent buying its own infrastructure ran on LNVPS ([[Field-Notes-FA|Field Notes]]).
- **BitLaunch** — compute on BitLaunch's own infrastructure and on DigitalOcean/Vultr/Linode capacity, behind a real provisioning API + SDKs with no KYC (admissible shape 1) — capacity paid in Bitcoin, request→invoice→pay→provision fully programmatic. *(The documented `cryptoSymbol` enum is BTC/LTC/ETH; Lightning is not an API-selectable method — unverified at the hosted invoice step.)*
- **Bitrefill** — the *bridge* to the long tail. A Lightning gift-card/top-up service with a real REST API and a remote MCP server, and no KYC for ordinary purchases. For the long tail of brands that do not take Bitcoin directly — domains, cloud, storage, mainstream SaaS — the agent buys a Bitrefill credit with sats (admissible shape 1, a real payment API) and redeems it at the target service. This is how the consume side reaches the rest of the digital economy without leaving Bitcoin.

- **Unhuman** — real-world *goods* end to end: roasted-to-order coffee and domain registration behind L402 paywalls (admissible shape 1). The agent discovers a product, pays a Lightning invoice, and the order is placed with no account, no card, and no human at checkout. Significance is categorical, not commercial — the first group-(b) member where the good delivered is physical, closing the purchase loop for atoms rather than bits.
- **l402.space** — the *second* bridge shape, and structurally distinct from Bitrefill's. Bitrefill bridges to **brands** by selling a redeemable credit; l402.space bridges to **APIs** by translating rails — the agent pays it over L402/MPP-Lightning and it settles the upstream over x402 (USDC) or MPP (Tempo), returning that API's response (admissible shape 1: URL scheme + standard 402 challenge/retry, no account). It makes the x402-settled API economy reachable by a sats-only agent. **Constraint-relevant caveat:** the gateway holds the payer's sats and settles upstream from its own float, so constraint 1 (no identity attachment) and 3 (fee floor) hold while constraint 2 (no permissioned intermediary) is *conceded for the duration of the call* — see §7.10. Admitted to the layer as a bridge, not as a Bitcoin-native payment path.

**Why these and not others.** *(structural)* Many VPN, hosting, and domain brands take Bitcoin — but via human checkout, not an agent-drivable API; they are out-of-layer per §5 and reachable only through a bridge (Vultr, for instance, routes crypto through a BitPay redirect). Group (b) is deliberately the services that pass the filter directly: Mullvad as the model of a direct-merchant fit, LNVPS and BitLaunch as compute with real provisioning APIs on the two ends of the sovereignty spectrum (Nostr-native vs. mainstream-cloud), Bitrefill and Unhuman as the credit-bridge and direct-goods models, and l402.space as the rail-translation bridge that extends agent reach to endpoints priced on a foreign rail.

**Group (d) — Verification & trust.** *(structural)* An agent can self-serve inference, memory, and tools; it cannot self-issue a credible verdict on its own correctness, because the judging party would be the judged party. That asymmetry makes independent verification a *purchasable service* rather than local software, which places it in this layer. It is also the market's own response to the delivery-risk gap in §8 — a partial one: a paid verdict bounds exposure, it does not underwrite it.
- **invinoveritas** — pre-action verdicts (approve / concerns / reject) on a trade, diff, plan, command, or on-chain action, plus a portable schnorr-signed proof after, and free no-auth verification of a counterparty's proof. Per-call sats over L402 (admissible shape 1). Its structural contribution is the *recomputability* discipline: verdicts are signed and published to Nostr **before** outcomes are known and anchored into Bitcoin proof-of-work via OpenTimestamps, so the track record is verifiable from public data rather than asserted — the same never-publish-a-bare-score rule the directory's trust layer follows.
- **Reflex** — the *other* verdict sold on this layer, and it is a different object: not "was this work correct" but "is this counterparty permitted". Screens channel peers by IP and funding source against sanctions lists, screens channels against OFAC-sanctioned Bitcoin addresses under configurable risk policies, monitors payments continuously, and emits deterministic compliance reports. `agent-access: limited` — an Amboss account and API key gate it, so it fails the `api-no-account` bar and is **not** a directory entry (§5). Recorded here because it is structurally load-bearing rather than commercially relevant to an agent: **it is a routing-layer screening surface being built on the rails this document argues for**, a distinct axis from issuer-level freeze (which is an *asset* property, per Treasury-FA) — the same substrate can be permissionless at L1 and policy-filtered at the point a channel is opened. Stated as a fact about the deployed landscape, not a claim about the vendor's intent.

**Group (e) — Sell-side payment infrastructure.** *(structural)* §3 holds that this layer is two-sided, and §7's profiles cover only the consume leg. The offer leg has its own precondition: a way to *accept* Lightning. Running a node is the sovereign answer and lives in [[Stack-FA|The Stack]]; these are the API-drivable services that supply the capability instead, and they are differentiated on the axis that determines the constraint profile — **who holds the bitcoin**.
- **Voltage Payments** — REST API for send/receive over Lightning with nodes, channels, and liquidity abstracted; backed either by Voltage's credit line or **by the operator's own node**, making self-custody a first-class configuration rather than an exception.
- **Amboss Payments** — one GraphQL API to send, receive, and settle in **BTC, USDT, or USDC over Lightning**, with a self-custodial option. Multi-asset by construction: a Bitcoin-native *rail* carrying an optionally freezable *asset* — the rail/asset separation [[Independence-Doctrine-FA|the Doctrine]] insists on, visible in one product.
- **IBEX Hub** — custodial Lightning-as-a-service: one REST API for invoices, on-chain, LNURL, sub-accounts, and webhooks over a managed node cluster, with fiat and stablecoin settlement layered on. Lowest operational burden, highest trust assumption; the provider holds the funds.

*(neutrality)* Group (e) members are listed as facts and differentiated on custody, not ranked against one another; the appropriate choice is a function of the operator's node capability and delegable-custody tolerance.

**Group (c) — Liquidity provisioning.** *(structural)* Inbound liquidity is the precondition for an agent to *receive* over Lightning; acquiring or providing it is a marketplace transaction, not local software. Two-sided by construction — buy capacity, or sell idle bitcoin as routing liquidity for yield — and both legs are self-custodial and API-drivable, passing the filter via a real API (admissible shape 1, §5).
- **Amboss (Magma)** — the buy side: a public channel-liquidity marketplace; an agent purchases inbound capacity opened to its *own* node via a public GraphQL mutation (no account) or the MIT `magma-mcp` server. Custody is preserved (non-custodial HODL-invoice escrow; the channel opens to the agent's node). Re-homed from the Stack's tooling to this layer 2026-06-27 — buying liquidity is a Market action, not equipment an agent runs.
- **Amboss Rails** — the sell side: deploy self-custodied bitcoin as routing liquidity and earn yield from the flow that crosses it, driven by API. The provide-side counterpart to Magma.

---

## §7 — Per-service constraint profile

SV4 defended at depth. Each deployed service profiled against the four conjunctive constraints ([[Case-FA|The Case]] C1) on its Bitcoin payment leg, plus its automatability shape (§5) and its two-sidedness (§3). Profiling is on the *payment leg*; counterparty delivery is a separate axis treated in §8. Moving metrics (funding, node counts, sats paid, query volumes) defer to [[Field-Notes-FA|Field Notes]] per the locked defer-numbers discipline.

### §7.1 — OpenAgents (Group a; machine-work marketplace)

- **Payment mechanism.** Lightning settlement — per-call billing on the **Khala** inference gateway, **BOLT12** for Forum/direct payments — with self-custodial Lightning wallets (Pylon-/agent-held). *(Earlier card detail — NIP-57 pay-after-verify zaps, BIP39-derived wallets, FROSTR threshold signing — is from the 2026-06-04 pass and is **not corroborated** as of 2026-06-28; current rails are Nostr **NIP-90** + **BOLT12/Lightning**. Re-verify against live docs before asserting signing specifics.)*
- **Constraint profile (payment leg).** Pass 1 (self-custodial Lightning wallets), 2 (Lightning settlement, no issuer), 3 (sub-cent Lightning fees), 4 (machine-tempo Lightning). Clean Bitcoin-substrate fit; not a hybrid or stablecoin play. *(Card/dollar rails exist on OpenAgents Cloud as a convenience layer; the substrate leg profiled here is the Lightning path.)*
- **Automatability.** Real agent-native payment path — **Khala** is a live OpenAI-compatible inference endpoint (`openagents/khala`, base `https://openagents.com/api/v1`) billed per call over Lightning, callable with no human step; admissible shape 1.
- **Two-sided.** Yes — consume (call Khala / buy machine work, paid over Lightning) and offer (run a Pylon node to sell compute, contribute to the Tassadar training run, or earn referral revenue share — paid in Bitcoin).
- **Operational caveat.** *(operational)* Verification is load-bearing: the Risk market and verifiable-evidence design exist precisely because unverified machine output can do economic damage. Coordination has hosted/centralized components today — a temporary centralization point in coordination, not in settlement custody — and the project's own README notes it is "early and in active development," with many surfaces gated.

### §7.2 — Routstr (Group a; inference marketplace, Cashu-as-API-key)

- **Payment mechanism.** Cashu ecash over Lightning; the bearer token is the API key. The proxy meters each request in sats (input/output tokens priced separately, plus a per-request fee), deducts in real time, returns change as a fresh token. Funded over Lightning; BOLT12 supported.
- **Constraint profile (payment leg).** Pass 1 (bearer self-custody of Cashu tokens), partial 2 (Cashu mint-trust caveat — redemption depends on the chosen mint; cross-reference [[Stack-FA|The Stack]] Cashu primitive), 3 (effectively free in-mint transfers), 4 (near-instant). The mint-trust caveat is the standard Cashu bearer-layer property, not a Routstr-specific defect.
- **Automatability.** Real agent-native payment path; the Cashu token IS the credential; admissible shape 1.
- **Two-sided.** Yes — providers offer inference and are discovered over Nostr; agents consume by presenting a funded token.
- **Operational caveat.** *(operational)* The token is bearer — anyone who obtains it can spend the remaining balance; guard it like cash. Providers are independent and pseudonymous; quality and uptime vary; no central SLA (an SV5 instance).

### §7.3 — PPQ.AI (Group a; inference gateway, L402)

- **Payment mechanism.** *(re-measured 2026-08-07)* Lightning / L402, pay-per-query (~1.5¢ per query; top-ups from ~10¢). **The accountless L402 path covers images, image editing, video and data enrichment only** — chat and audio require an account, an `sk-` API key and a funded balance. Funding is wide (Lightning, on-chain, Liquid, LTC, XMR, USDT/USDC, card) and **NWC auto-topup** refills the balance with no human. Publishes `/llms.txt` and an agent-consumable API surface.
- **Constraint profile (payment leg).** Pass 1 on the accountless L402 endpoints (images/video/data); **Partial for LLM inference, which needs an account + `sk-` key** (NWC auto-topup keeps it unattended thereafter). Pass 2 (Lightning payment leg permissionless), 3 (sub-cent-to-low-cent per query), 4 (machine-tempo). Note: the *service* is a custodial gateway proxying prompts upstream — a custody property of the service, not the payment leg.
- **Automatability.** Real agent-native payment path — accountless L402 on images/video/data; account + NWC auto-topup for chat and audio. Admissible shape 1.
- **Two-sided.** Consume only (an agent buys inference; it does not sell through PPQ).
- **Operational caveat.** *(operational)* Centralized custodial gateway — PPQ proxies prompts upstream; only the optional TEE-backed private mode keeps content unreadable to PPQ. Credit-card funding adds KYC; the Lightning path is the permissionless one, and it is accountless only on the images/video/data endpoints.

### §7.4 — Mullvad (Group b; direct-merchant VPN)

- **Payment mechanism.** Native Lightning (paid against a random 16-digit account number, with a discount) or on-chain BTC. No email, no account profile, no KYC.
- **Constraint profile (payment leg).** Pass 1 (no identity attachment; account number is the only credential), 2 (Lightning over Mullvad's own node, no issuer), 3 (sub-cent Lightning fees), 4 (Lightning settlement).
- **Automatability.** *Invoice-against-account-number* flow; admissible shape 2 — no formal product API, but low-friction enough to script. The model case for a real-world service an agent can pay for itself.
- **Two-sided.** Consume only (infrastructure privacy for the agent/operator; not itself an A2A service).
- **Operational caveat.** *(operational)* Not a full payment API; the account-number model means the number is the sole credential — losing it loses access.

### §7.5 — Bitrefill (Group b; the bridge)

- **Payment mechanism.** Native Lightning (instant, sub-cent fees) or on-chain BTC; programmatic via the remote MCP server (`api.bitrefill.com/mcp` — typed tools covering search → purchase → redemption-code retrieval) or the raw REST API (`api.bitrefill.com`, docs at `docs.bitrefill.com`). No account, no KYC for ordinary purchases. Either loop: request a product, receive a Lightning invoice, pay it, receive the redemption code back — no human in it.
- **Constraint profile (payment leg).** Pass 1 (no account/KYC for ordinary purchases), 2 (Lightning payment leg permissionless), 3 (sub-cent Lightning fees), 4 (Lightning settlement).
- **Automatability.** Real REST API plus a remote MCP server; admissible shape 1. The keystone of the consume side — it turns "this brand doesn't take Bitcoin" into "this brand is one Lightning payment away."
- **Two-sided.** Consume only (a reach extender, not a venue).
- **Operational caveat.** *(operational)* A bridge, not a merchant relationship — the agent buys a redeemable credit, then redeems it at the target service, which may itself require that service's own account or KYC. Coverage, denominations, and regional availability shift; pricing carries Bitrefill's spread; very large orders may trigger limits — verify the specific product before relying on it.

### §7.6 — LNVPS (Group b; agent-native compute)

- **Payment mechanism.** Native Lightning per provisioned server, or a wallet connected over NWC; Nostr key is the identity — no email, no account profile, no KYC.
- **Constraint profile (payment leg).** Pass 1 (keypair identity, no KYC), 2 (Lightning, no issuer), 3 (sub-cent Lightning fees), 4 (Lightning settlement).
- **Automatability.** Real provisioning API (github.com/LNVPS/api); admissible shape 1 — log in with a Nostr key, pick CPU/RAM/SSD, pay the invoice, all scriptable. The deployed proof-point: the first recorded instance of an agent buying its own infrastructure ran here ([[Field-Notes-FA|Field Notes]]).
- **Two-sided.** Consume only (infrastructure).
- **Operational caveat.** *(operational)* A small independent provider — capacity, regions, and continuity are a single operator's; weigh against the mainstream-capacity alternative below for production loads.

### §7.7 — BitLaunch (Group b; mainstream compute)

- **Payment mechanism.** *(operational, re-measured 2026-08-07)* On-chain **BTC, LTC or ETH** — the values the published `POST /transactions` schema accepts — funding a per-account balance that provisioning draws down; API token after an email signup, no KYC. A 2020 launch post announced Lightning automation and the current API does not expose it; whether the hosted invoice page offers Lightning was not testable read-only.
- **Constraint profile (payment leg).** Pass 1 (email-only account, no identity check), 2 (on-chain BTC leg permissionless), 3 **Partial** (on-chain fee floor, not sub-cent), 4 **Partial** (on-chain confirmation latency, not machine tempo). *(Lightning is not an API-selectable method here — the published `POST /transactions` schema accepts BTC, LTC or ETH.)*
- **Automatability.** Real API + SDKs (blcli, Go/Python/PHP): request, invoice, pay, provision — end-to-end programmatic; admissible shape 1. The mainstream-capacity counterpart to LNVPS: BitLaunch's own hardware plus DigitalOcean/Vultr/Linode, paid in Bitcoin.
- **Two-sided.** Consume only (infrastructure).
- **Operational caveat.** *(operational)* **Partly** a reseller: BitLaunch's own footer splits "BitLaunch locations" from "Partner locations", and upstream terms and markup flow through only on the partner instances. The account (and human email signup) precedes automation either way, so the identity attachment is minimal but not zero, unlike LNVPS's pure-keypair model.

### §7.8 — Maple AI (Group a-adjacent; privacy-axis inference — payment-leg caveat)

- **What it is.** TEE-attested, end-to-end-encrypted LLM inference behind an OpenAI-compatible API (Maple Proxy) — prompts provably unreadable to the provider; the privacy-axis counterpart to the sats-per-call venues of §7.2–§7.3.
- **Constraint profile — honest split.** The *API leg* is fully agent-drivable (OpenAI-compatible, key as Bearer). The *payment leg* does not pass the §5 self-pay filter: subscription-based (card, or **Bitcoin accepted on yearly plans** at a discount) with a human operator funding the account — no sats-per-call path. Directory automatability: `api-account`.
- **Why it is in-layer anyway.** *(structural)* The privacy axis is otherwise unserved: no sats-per-call venue offers TEE-attested encrypted inference today. Included with the caveat stated rather than omitted — an operator funds it, the agent drives it; for sats-native pay-per-call *inference*, use Routstr (PPQ.AI's accountless path does not cover chat).

### §7.9 — Unhuman (Group b; real-world goods over L402)

- **Payment mechanism.** L402 per purchase: the agent requests a product, receives a Lightning invoice, pays it, and the order is placed. No account, no card, no KYC. Storefronts today are roasted-to-order coffee and domain registration, with a hub listing further agent storefronts.
- **Constraint profile (payment leg).** Pass 1 (no account or identity attachment), 2 (Lightning/L402, no permissioned intermediary on the payment), 3 (sub-cent Lightning fees), 4 (Lightning settlement).
- **Automatability.** Admissible shape 1 — a real L402-gated purchase API; the full loop closes without a human.
- **Two-sided.** Consume only.
- **Structural significance.** *(structural)* First group-(b) member delivering a **physical** good end to end on the sovereign rail. The categorical claim is that the purchase loop for atoms now closes without a card; the commercial scale is small and should not be read as market evidence.
- **Operational caveat.** *(operational)* Narrow catalogue and a small operation; fulfilment of a physical good is a delivery-risk surface in the §8 sense, distinct from the payment leg.

### §7.10 — l402.space (Group b; rail-translation bridge — constraint-2 caveat)

- **What it is.** A universal 402 gateway (Alby). Inbound rails: `l402`, `x402`, `mpp-lightning`, `mpp-tempo`; outbound: whichever rail the upstream speaks. Interface is a URL scheme plus the standard 402 challenge/retry — no signup, no API key. The quoted price (upstream price + gateway markup + routing fee) is authoritative; receipts are reusable for follow-up requests the same upstream payment covers.
- **Constraint profile (payment leg) — honest split.** Pass 1 (no account or identity attachment), 3 (sub-cent Lightning fees on the inbound leg), 4 (Lightning settlement on the inbound leg). **Constraint 2 is conceded for the duration of the call**: the gateway holds the payer's sats and settles upstream from its own USDC/Tempo float, so a permissioned intermediary sits in the path and the payer inherits that intermediary's freeze surface until delivery. This is a genuine constraint failure, stated rather than waived.
- **Automatability.** Admissible shape 1 — no account, standard 402 flow, machine-readable manifests (`llms.txt`, OpenAPI 3.1).
- **Two-sided.** Consume only.
- **Why it is in-layer anyway.** *(structural)* It materially changes what a sats-only agent can buy: the x402-settled API economy outnumbers L402 endpoints by roughly 65:1 ([[Field-Notes-Log-FA]] § 2026-07-21), and this makes that set reachable without acquiring a freezable asset. That is a real widening of the consume side and it isolates the thesis correctly — the argument rests on the **asset's** freeze surface, not the rail's convenience. Admitted as a **bridge**, on the same footing as Bitrefill: a reach extender with a stated trust cost, not a Bitcoin-native payment path. Directory rows reached this way are labelled `via-gateway` rather than merged into "payable".
- **Operational caveat.** *(operational)* Markup plus routing fee on every call; float exhaustion is a live failure mode (`/health/balances` returns 503 per rail); traction is negligible at listing (848 transactions, $34.97 lifetime volume, 2026-07-29). Prefer a directly payable endpoint wherever one exists.

### §7.11 — invinoveritas (Group d; independent verification)

- **Payment mechanism.** Per-call sats — L402 per call, or an instantly-issued API key funded by Lightning top-up (`POST /register {}` returns a key; no email, no KYC). `/verify-proof` and `/ledger` are free and unauthenticated. USDC (x402) and card funding also accepted; card/x402-funded sats are spendable but not withdrawable.
- **Constraint profile (payment leg).** Pass 1 (no identity attachment; registration takes an empty body), 2 (Lightning/L402 payment leg permissionless), 3 (sub-cent Lightning fees), 4 (Lightning settlement). *Custody caveat:* the prepaid balance sits with the service until spent — a custodial exposure bounded by keeping balances small, not a payment-leg failure.
- **Automatability.** Admissible shape 1; also ships its own MCP server (`review`, `prove`, `verify_proof`, `ledger`).
- **Two-sided.** Consume + offer.
- **Structural significance.** *(structural)* Supplies the independence property an agent cannot self-generate, and does so under a **recomputable-not-asserted** discipline: verdicts signed and published to Nostr *before* outcomes, event ids anchored into Bitcoin proof-of-work via OpenTimestamps, outcomes settling on a public account. Bears on §8 — it prices the delivery-risk gap without closing it.
- **Operational caveat.** *(operational)* Young and small (183 verdicts, 21W/20L settled at verification, losses published); pseudonymous operator, closed-source service; multichain entanglement (Hyperliquid settlement, ERC standards work). A verdict carries no SLA and no liability — a paid second opinion, not insurance.

### §7.12 — Voltage Payments (Group e; sell-side, own-node option)

- **What it is.** REST API for sending and receiving over Lightning with nodes, channels, and liquidity abstracted away; backed either by Voltage's credit line or by the operator's **own node**.
- **Constraint profile.** Constraints 3 and 4 hold (Lightning fees, Lightning settlement). Constraints 1 and 2 depend on configuration: the own-node path keeps custody and removes the permissioned intermediary; the credit-line path does not.
- **Automatability.** Admissible shape 1 (REST API) once the operator has provisioned an account.
- **Two-sided.** Offer-side infrastructure (enables an agent-operated business to receive).

### §7.13 — Amboss Payments (Group e; sell-side, multi-asset)

- **What it is.** One GraphQL API to send, receive, and settle in **BTC, USDT, or USDC over Lightning**, aimed at businesses, with a self-custodial option.
- **Constraint profile.** Constraints 3 and 4 hold on the Lightning rail. Constraint 1/2 depend on the custody configuration. **Asset caveat:** settling in USDT/USDC places a freezable asset on a permissionless rail — the rail/asset separation is the whole point of [[Independence-Doctrine-FA|the Doctrine]], and which asset an agent should *hold* is answered in [[Treasury-FA]], not here.
- **Automatability.** Admissible shape 1 (GraphQL API).
- **Two-sided.** Offer-side infrastructure.

### §7.14 — IBEX Hub (Group e; sell-side, custodial)

- **What it is.** Custodial Lightning-as-a-service: one REST API for invoices, on-chain, LNURL, sub-accounts, and webhooks over a managed node cluster, with fiat and stablecoin settlement rails layered on top.
- **Constraint profile.** Constraints 3 and 4 hold on the Lightning rail. **Constraints 1 and 2 fail by construction** — the provider holds the funds and is a permissioned intermediary with an account relationship. Listed as the lowest-operational-burden option with that trade stated, not softened.
- **Automatability.** Admissible shape 1 (REST API) after account provisioning.
- **Two-sided.** Offer-side infrastructure.

---

## §8 — The delivery-risk caveat

SV5 defended. The honest constraint on the entire layer.

**Statement.** *(structural)* Paying for a service over Bitcoin makes the *payment* sovereign — no intermediary can block, reverse, or freeze it. It does not make the *counterparty* trustworthy. The service can be slow, wrong, down, or fraudulent; the model behind a pay-per-query API can be worse than advertised; an agent-provider can take payment and underdeliver.

**Derivation.** The permissionless rail that removes the payment intermediary ([[Case-FA|The Case]] C1, C2) also removes the chargeback and the dispute desk. In the incumbent payment stack, a card network's dispute mechanism is a recourse layer bundled with the rail; the agent economy's sovereign rail unbundles it. Sovereignty over the payment and recourse against the counterparty are different properties; the Services layer provides the first and does not, by the rail alone, provide the second. This is not a defect to be patched at the payment layer — it is the structural consequence of removing the intermediary, and it is precisely the recourse role the intermediary used to play.

**Mitigation surface.** *(structural)* The substitute for an intermediary's recourse is reputation. An agent operating in this layer needs: reputation signals about the counterparty; bounded per-transaction exposure (cap the loss on any single untrusted call); and, for larger engagements, escrow or streaming-payment patterns that release value against delivered work rather than up front. The directory's ratings layer (§9; SV6 — next phase of the deployed directory) exists to supply the reputation signal — reputation as the substitute for the dispute desk the sovereign rail does not include; until it ships, the deployed trust signals are probed liveness and announcement freshness.

**Test.** *(operational)* Before an agent transacts with an untrusted counterparty: is there a reputation signal to consult, and is the per-transaction exposure bounded below the agent's tolerance for a non-delivering counterparty? Where both hold, the delivery risk is managed; where neither holds, the agent is bearing un-mitigated counterparty risk and should treat the engagement accordingly.

---

## §9 — Directory scope

SV6 defended. The relationship between the curated on-site entries and the full directory.

**Statement.** *(deployed; ratings layer forward-looking)* The curated on-site entries (the services in §6–§7) are deliberately few — the proof that this layer is real, not hypothetical. The complete picture is deployed as a separate sibling site at [marketplace.bitcoineconomy.ai](https://marketplace.bitcoineconomy.ai), a data-maintained artifact a static page cannot be. As deployed it comprises: (a) a curated registry admitting only services an agent can drive through a real API; (b) live Nostr announcement modules (provider and mint announcements, presented as announcements rather than endorsements); (c) endpoint liveness probes refreshed every six hours, with status, latency, and network fields; (d) a cross-provider sats-per-token price index answering "who serves model X cheapest now" in one fetch; and (e) agent-native consumption surfaces — llms.txt opening with a one-fetch start, typed JSON routes, per-entry markdown. The community-ratings layer is the directory's next phase; until it ships, probed liveness and announcement freshness are the deployed trust signals.

**Why it is separate.** *(structural)* The directory's reason to exist is SV5: the one risk a payment rail cannot address is counterparty delivery, and community ratings are the reputation layer that substitutes for an intermediary's recourse. A ratings directory is therefore not a nicety bolted onto the layer — it is the structural complement to the sovereign rail. Its data-maintained, continuously-growing form is incompatible with a static essay surface, which is the build-shape reason it lives as its own site.

**Sell-side maturity.** *(forward-looking)* The offer side of the layer is underbuilt relative to the buy side. An agent that can offer a service for Bitcoin needs three things: a way to gate the service on payment (an L402 paywall via Aperture, or a Cashu-token check — §4), a way to be discovered (Nostr-based discovery is the deployed pattern, as in Routstr's provider discovery), and a payout path to its treasury (specified in [[Treasury-FA|Treasury]] and [[Exchange-FA|Exchange]]). The same payment mechanisms work in both directions; the sell side's relative immaturity is an opportunity surface, not a gap in the claim. Prior art shaping the directory: OpenAgents (its five-market structure is the closest live model), Routstr, PPQ.AI.

---

## §10 — Implications for builders

Declarative. Each implication follows from SV1–SV6 as marked.

- **Apply the automatability filter before listing a service.** *(SV3)* "Accepts Bitcoin" is necessary but not sufficient; the sufficient condition is "an agent can complete the purchase with no human step." A processor-redirect checkout or a top-up dashboard fails the filter regardless of whether it ultimately settles in Bitcoin.
- **Reach the long tail through the bridge, not by waiting for direct integration.** *(SV4)* For any service that does not expose an agent-drivable Bitcoin path, the Bitrefill bridge converts the agent's sats into a redeemable credit. Architect long-tail reach as bridge-mediated rather than blocking on each brand's direct Bitcoin support.
- **Choose the payment mechanism to the workflow.** *(SV2)* L402 for high-frequency pay-per-call API workflows; Cashu-as-API-key for the lightest-weight, most private bearer-credential access; NWC for delegating spend authority to an agent without exposing wallet keys. The primitives are in [[Stack-FA|The Stack]].
- **Build the offer side as a first-class path.** *(SV1, SV6)* An agent that both consumes upstream services and sells its own output is a full economic participant. Gate on payment (L402 paywall or Cashu-token check), be discoverable (Nostr discovery), and route payouts to treasury ([[Treasury-FA|Treasury]], [[Exchange-FA|Exchange]]).
- **Treat delivery risk as an explicit design parameter, not an afterthought.** *(SV5)* The sovereign rail does not include recourse. Consult reputation signals, bound per-transaction exposure, and use escrow or streaming-payment patterns for larger engagements. Do not assume payment finality implies delivery.
- **Defer moving metrics to the live record.** *(operational)* Funding, node counts, sats paid, and query volumes for the deployed services move continuously; they belong in [[Field-Notes-FA|Field Notes]], not in this specification.

---

## §11 — Position summary

*(structural, with deployed-service empirical references and forward-looking scope claims)* The Services layer is the "what" layer of the agent economy — the real services an autonomous agent buys and sells for Bitcoin — and is two-sided by nature: consume (inference, compute, data, API calls, storage, other agents' work) and offer (the agent's own output), using the same payment mechanisms in both directions (SV1). Agent service payment runs on three Bitcoin-native, payment-layer-permissionless mechanisms — L402, Cashu-as-API-key, and NWC — whose primitives are specified in [[Stack-FA|The Stack]] and applied here (SV2). The agent-automatability filter admits a service only if an agent can pay it itself through a real payment API or a low-friction invoice-against-account flow, excluding human-checkout-only merchants (SV3); applying the filter yields five groups — agent-native A2A venues (OpenAgents, Routstr, PPQ.AI), off-the-shelf agent-payable services (Mullvad direct-merchant, Bitrefill the bridge to the long tail), liquidity provisioning, verification & trust, and sell-side payment infrastructure (SV4). A sovereign payment rail does not guarantee counterparty delivery; the rail that removes the payment intermediary also removes the chargeback and the dispute desk, and reputation is the structural substitute for that recourse (SV5) — which is why the full categorized directory is deployed as the separate [marketplace.bitcoineconomy.ai](https://marketplace.bitcoineconomy.ai) site (curated registry + live announcements + liveness probes + sats price index, agent-readable; community ratings next), with the sell side an underbuilt opportunity surface (SV6). This layer is where the agent economy stops being a premise and becomes concrete commerce: agents paying agents, at machine tempo, in Bitcoin.

---

## §12 — References and provenance

**Canonical source.** [[Services]] — the human-track Services surface; this document is its For-Agents twin. The claim is identical; the structure differs.

**Cross-references — sibling For-Agents surfaces.**
- [[Case-FA|The Case]] — substrate-selection thesis; C1 (four conjunctive constraints) is the constraint vocabulary used in §7 to profile each service's Bitcoin payment leg. The Services layer sits on top of the substrate The Case selects; this document does not relitigate that selection.
- [[Stack-FA|The Stack]] — the payment primitives (L402, Cashu, NWC/NIP-47) and their implementing tooling (`lnget`, Aperture, `lightning-agent-tools`, MCP servers). §4 references these rather than re-explaining them.
- [[Treasury-FA|Treasury]] — the section anchor; treasury, the boundary, and how a service payout reaches the agent's reserve.
- [[Exchange-FA|Exchange]] — converting what an agent earns here back toward its reserve, or funding an operational float to spend.
- [[Field-Notes-FA|Field Notes]] — the live deployment record; moving metrics for every service in §7 (funding, node counts, sats paid, query volumes) defer here per the locked defer-numbers discipline.

**Deployed services referenced (verification surfaces).**
- **OpenAgents** (OpenAgents, Inc.; Christopher David / @AtlantisPleb, Austin) — https://openagents.com · https://docs.openagents.com · https://github.com/OpenAgentsInc/openagents
- **Routstr** — https://routstr.com · https://docs.routstr.com · https://github.com/Routstr (HRF Top-15 Freedom Tech Project 2025)
- **PPQ.AI (PayPerQ)** — https://ppq.ai · https://ppq.ai/api-docs · https://ppq.ai/llms.txt · https://github.com/PayPerQ
- **Mullvad VPN** — https://mullvad.net
- **Bitrefill** — https://bitrefill.com · REST API docs: https://docs.bitrefill.com *(Bitrefill also runs a separate "Thor API" — that is a Lightning channel-opening service, not the commerce API.)*

**Related human-track surface (no For-Agents twin).**
- The ecash-mint vetting guide "evaluating-ecash-mints" — referenced by display text for the Cashu mint-trust caveat in §7.2; it has no For-Agents twin.

**Date stamps.** Document created 2026-06-05; status per frontmatter (`v0-approved-2026-06-05`), which is authoritative. Deployed-service references verified as of mid-2026 (per the source cards' `last-verified` stamps: OpenAgents **2026-06-28** [Khala refresh], Routstr 2026-06-02, PPQ.AI 2026-06-02, Mullvad 2026-06-05, Bitrefill 2026-06-05).

---

> [!info] Where to read next
> Substrate-selection claim upstream of this layer: [[Case-FA|The Case]] (C-series, C1 = four conjunctive constraints). Payment primitives and tooling beneath this layer: [[Stack-FA|The Stack]] (S-series — L402, Cashu, NWC, MCP). Section overview, treasury, and payout-to-reserve: [[Treasury-FA|Treasury]] (M-series). Converting earnings back toward reserve: [[Exchange-FA|Exchange]] (X-series). Live deployment record and moving metrics: [[Field-Notes-FA|Field Notes]]. Canonical human narrative of this surface: [[Services]].
