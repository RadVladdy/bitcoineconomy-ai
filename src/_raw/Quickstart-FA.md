---
title: Quickstart — connect an agent to Bitcoin — For Agents
slug: quickstart-for-agents
description: "Machine-readable specification of the four pathways for connecting an autonomous agent to Bitcoin — custodial service, self-custody-no-node, light-client node, full sovereign stack — ordered by self-run infrastructure, with the custody / trust / time / sovereignty trade-offs, the per-pathway tool sets, the remote-signer hardening overlay, and the node-architecture constraints that set each pathway."
type: quickstart-for-agents
surface: quickstart
audience: agents
twin-page: quickstart
status: v0-draft-2026-06-25 (pending review)
created: 2026-06-25
last-updated: 2026-06-25
last-verified: 2026-06-25
word-count-target: 1600
voice: honest-middle-position
canonical-source: "[[Quickstart]]"
epistemic-status: "operational on-ramp specification, not an argument surface — no falsifier. Pathway facts are structural/operational. Node-architecture claims (Neutrino support per tool; CLN has no native Neutrino; BOLT12 light-client support is implementation-dependent; LNbits is nodeless-capable) were verified against official docs 2026-06-25 (docs.lightning.engineering, lightningloop.io, docs.lnbits.org, corelightning.org, shocknet/Lightning.Pub)."
claims-index:
  - id: QP1
    tag: structural
    statement: "Connecting an agent to Bitcoin is a single ordered decision: how much infrastructure the agent runs itself, from a custodial service (no infra, no custody) to a full sovereign node (full infra, full validation). Custody, censorship-resistance, time-to-live, and ops burden are all functions of position on this axis. The correct default is the lightest pathway that meets the agent's trust and sovereignty requirements; descent down the ladder is available later without re-architecting."
    defended-in: "§2, §3"
  - id: QP2
    tag: operational
    statement: "Pathway A — Custodial service: runs nothing; a hosted wallet/account holds keys and operates the node. Live in minutes, zero ops; custodial — the operator can KYC, freeze, or be compelled to censor. Stack reach is mostly via Market venues (Exchange / Services) plus custodial ecash (minibits-ippon). Use for small operational balances and cold-start payment, not treasury reserve."
    defended-in: "§3.A"
  - id: QP3
    tag: operational
    statement: "Pathway B — Self-custody, no node: agent holds keys (or a scoped key-free handle) but runs no node, via a headless non-custodial wallet (xverse-agent-wallet; keys encrypted on-device; answers HTTP-402 itself) or a wallet connector (alby-nwc / NWC; mcp). Pays over L402 / LNURL. Cashu sits here with a mint-trust asterisk (bearer token self-held, backing custodial). Self-custody without infrastructure; depends on the wallet/connector backend."
    defended-in: "§3.B"
  - id: QP4
    tag: operational
    statement: "Pathway C — Light-client node: the agent's own lnd on a Neutrino light client (no full chain copy); real channels, self-custody, trust reduced to block headers (BIP157/158 SPV level) plus peer/swap availability. Tools verified Neutrino-capable (official docs, 2026-06-25): lightning-agent-tools, lnbits, loop, taproot-assets, clink. Neutrino is an lnd capability only — Core Lightning has no native light-client mode (requires bitcoind), so a CLN node is Pathway D."
    defended-in: "§3.C, §4"
  - id: QP5
    tag: operational
    statement: "Pathway D — Full sovereign stack: a Bitcoin Core full node under the agent's Lightning node; full validation, maximum censorship-resistance, heaviest storage/sync/ops. The toolkits are identical to Pathway C — the same LN toolkit runs on a light client or a full node — so the pathway is set by the node BACKEND (Neutrino vs full Core), not by tool choice; an agent can start on C and graduate to D without re-tooling."
    defended-in: "§3.D, §4"
  - id: QP6
    tag: structural
    statement: "The remote-signer / split-node pattern is an orthogonal hardening overlay on C or D, not a fifth pathway: a watch-only node initiates payments while private keys live on a separate isolated signer, with scoped macaroons capping authority (pay-only, daily limit). A compromised agent host cannot drain the treasury because it never held the keys. lightning-agent-tools implements this directly; a scoped NWC connection (alby-nwc) is the lighter analogue for Pathway B."
    defended-in: "§3.S"
tags:
  - canonical
  - quickstart-for-agents
  - onboarding
  - lightning
  - ecash
  - agent-wallet
  - pathways
  - neutrino
  - remote-signer
agent-tldr: |
  Specification of how an autonomous agent connects to Bitcoin. One ordered decision axis: how much infrastructure the agent runs itself. Four pathways, lightest→most-sovereign: (A) Custodial service — hosted wallet/account holds keys+node; minutes, zero ops; custodial/freezable; reached mostly via Market venues + custodial ecash (minibits-ippon). (B) Self-custody no node — headless non-custodial wallet (xverse-agent-wallet) or key-free connector (alby-nwc/NWC, mcp); pays over L402/LNURL; cashu with mint-trust caveat. (C) Light-client node — own lnd on Neutrino (no full chain); real channels, trust=block headers; verified Neutrino-capable: lightning-agent-tools, lnbits, loop, taproot-assets, clink. (D) Full sovereign stack — Bitcoin Core full node under the LN node; full validation, max censorship-resistance, heaviest ops. KEY CONSTRAINT: the pathway is set by the node backend (Neutrino vs full Core), not the toolkit — same LN toolkit runs on either; start on C, graduate to D without re-tooling. Neutrino is LND-only — Core Lightning has no native light client (needs bitcoind) → a CLN node is D. BOLT12 light-client support is implementation-dependent (CLN-BOLT12 needs a full node; LDK and LND-via-LNDK run light). LNbits is nodeless-capable (delegates to its funding backend — custodial, Phoenixd/Breez, or LND-which-can-be-Neutrino). Security overlay (hardens C/D, orthogonal): remote signer / split-node — watch-only node + isolated signer + scoped macaroons (pay-only, daily cap). Default: pick the lightest pathway meeting trust/sovereignty needs; descend later. Architecture spec → Stack-FA; tool catalogue → Tools; spend venue → Market. Node-architecture claims verified vs official docs 2026-06-25.
---

# Quickstart — connect an agent to Bitcoin — For Agents

> **Specification.** This is the machine-readable twin of [[Quickstart]]. It specifies the four pathways for connecting an autonomous agent to Bitcoin as an ordered function of self-run infrastructure, with the trade-offs, per-pathway tool sets, the remote-signer overlay, and the node-architecture constraints. It is an on-ramp specification, not an argument — there is no falsifier. The architecture is specified in [[Stack-FA|The Stack — For Agents]]; the deployable tools are catalogued at [[Tools]]; spend venues are at [[Marketplace|The Market]].

---

## §1 — Claims index

- **QP1** *(structural)* — Connecting an agent to Bitcoin is one ordered decision: how much infrastructure the agent runs itself. All trade-offs derive from position on this axis; default to the lightest pathway meeting requirements. → §2, §3
- **QP2** *(operational)* — Pathway A: custodial service — nothing run, custodial, minutes, freezable. → §3.A
- **QP3** *(operational)* — Pathway B: self-custody, no node — headless wallet or key-free connector; depends on wallet/connector backend. → §3.B
- **QP4** *(operational)* — Pathway C: light-client node — own lnd on Neutrino; trust = block headers; CLN is excluded (no native Neutrino). → §3.C, §4
- **QP5** *(operational)* — Pathway D: full sovereign stack — Bitcoin Core full node; same toolkits as C; backend (not toolkit) sets the pathway. → §3.D, §4
- **QP6** *(structural)* — Remote-signer / split-node is an orthogonal hardening overlay on C/D, not a fifth pathway. → §3.S

## §2 — The decision procedure

Evaluate in order; stop at the first match.

1. **Does the agent require self-custody of keys?** If no → **Pathway A** (custodial service).
2. **Is the agent willing to run a node?** If no → **Pathway B** (self-custody, no node).
3. **Full validation, or a light client?** Light client → **Pathway C**; full validation → **Pathway D**.
4. **Hardening (orthogonal):** if the agent holds value above a low operational threshold, apply the **remote-signer overlay** (§3.S) to whichever of C/D was selected.

Descent down the ladder (A→D) increases self-sovereignty and decreases external trust, at the cost of setup time and ops burden. The toolkits at C and D are identical, so an agent may begin at C and graduate to D by changing only the node backend.

## §3 — Pathway specifications

Fields per pathway: `runs` · `custody` · `trust` · `time-to-live` · `ops` · `sovereignty` · `tools` · `use-when`.

### §3.A — Custodial service *(QP2)*
- **runs:** nothing — a hosted wallet/account holds keys and operates the node.
- **custody:** custodial (operator-held). **trust:** the operator — can KYC, freeze, censor.
- **time-to-live:** minutes. **ops:** none. **sovereignty:** low.
- **tools:** reached mostly via the Market section — [[Exchange]] venues and the [[Services]] directory (account/hosted); custodial ecash via [[minibits-ippon]].
- **use-when:** small operational balances, cold-start payment, no infrastructure desired. Not for treasury reserve.

### §3.B — Self-custody, no node *(QP3)*
- **runs:** a wallet or a connector; no node.
- **custody:** self-custodial (agent-held keys, or a scoped key-free handle). **trust:** the wallet/connector backend; for ecash, the mint.
- **time-to-live:** minutes–hours. **ops:** low. **sovereignty:** medium.
- **tools:** [[xverse-agent-wallet]] (headless non-custodial; keys encrypted on-device; answers HTTP-402 itself); [[alby-nwc]] (NWC — scoped, budgeted, revocable wallet handle, no key exposure); [[mcp]] (carries the payment tools into the agent framework); [[cashu]] (bearer ecash, mint-trust caveat — diversify across mints, see [[evaluating-ecash-mints]]). Pays over [[l402]] / [[lnurl]].
- **use-when:** self-custody required without running infrastructure.

### §3.C — Light-client node *(QP4)*
- **runs:** the agent's own `lnd` on a **Neutrino** light client (BIP157/158) — no full chain copy.
- **custody:** self-custodial, agent-operated node. **trust:** block headers (SPV level) + peer/swap availability.
- **time-to-live:** hours. **ops:** medium. **sovereignty:** high.
- **tools (verified Neutrino-capable, official docs 2026-06-25):** [[lightning-agent-tools]] (embedded Neutrino backend; gRPC-to-own-lnd is the production default, and that lnd can itself be Neutrino), [[lnbits]] (programmable wallets on the node; note: LNbits is nodeless-capable in general — it delegates to its funding backend), [[loop]] ("all of lnd's chain backends supported: Neutrino, Bitcoin Core, btcd"), [[taproot-assets]] (Neutrino/BIP157 mode; does not scan the full chain), [[clink|Lightning.Pub]] (runs lnd in Neutrino mode natively, minimal hardware).
- **constraint:** Neutrino is an `lnd` capability. **Core Lightning has no native Neutrino** (requires `bitcoind`; light operation only via trusted third-party plugins, not SPV) — a CLN node is Pathway D.

### §3.D — Full sovereign stack *(QP5)*
- **runs:** [[bitcoin-core]] full node under the agent's Lightning node.
- **custody:** self-custodial, full validation. **trust:** none — the agent verifies every transaction itself.
- **time-to-live:** days (incl. initial sync). **ops:** high. **sovereignty:** maximum.
- **tools:** identical to Pathway C, on a full-node backend (incl. CLN-based stacks, which require this pathway).
- **structural note:** the toolkit and the sovereignty level are independent — the same LN toolkit runs on a light client or a full node. The pathway is set by the **node backend** (Neutrino vs full Core), not by tool choice; C→D graduation changes only the backend.
- **serving note:** *(structural)* the four pathways connect an agent to *pay*. The same full-node backend can also *serve* a priced capability with no inbound surface — a ContextVM (CVM) server addressed by pubkey rather than an HTTP endpoint (Stack-FA §5, CEP-8). This is the sell-side use of the sovereign stack; the buy-side pathways are unchanged.

### §3.S — Remote-signer overlay *(QP6, hardens C/D)*
- **runs:** a watch-only node (initiates payments) + a separate isolated signer (holds keys); scoped macaroons.
- **custody:** keys held off the agent host. **trust:** the signer device + the macaroon scope (e.g. pay-only, daily limit).
- **property:** a compromised agent host cannot extract keys or exceed the scoped limits — it never held the keys.
- **tools:** [[lightning-agent-tools]] (watch-only node + remote signer is its canonical pattern); scoped [[alby-nwc|NWC]] is the lighter analogue for Pathway B.

## §4 — Node-architecture constraints (verified 2026-06-25)

- **Neutrino is LND-only.** Core Lightning has no native light-client mode; it requires a synchronized `bitcoind` (light operation only via trusted third-party plugins — categorically not an SPV light client). Therefore any CLN-based stack is Pathway D.
- **BOLT12 light-client support is implementation-dependent.** CLN-BOLT12 inherits CLN's full-node requirement; LDK (Esplora/Electrum) and LND-via-LNDK (inheriting LND's Neutrino-capable backend) run as light clients. BOLT12 support does not imply light-client capability.
- **LNbits is nodeless-capable.** It delegates all chain handling to a funding source: custodial backends (Alby, OpenNode, Strike, …), self-custodial-nodeless backends (Phoenixd, Breez — the Boltz funding source is swap-based and Boltz suspended all swaps 2026-08-03), or a node backend (LND — which can itself be Neutrino — or CLN). Whether a full node is needed is a function of the chosen funding source, not of LNbits itself.
- **Source basis:** docs.lightning.engineering, lightningloop.io, docs.lnbits.org, corelightning.org/docs/bitcoin-core, github.com/shocknet/Lightning.Pub.

## §5 — Cross-references

- **Architecture (how the layers work):** [[Stack-FA|The Stack — For Agents]] — L1/L2/L3, the integration primitives (L402, NWC, BOLT12, LNURL, MCP), wallet architectures, security model, and the three deployment shapes (§6, *Stack compositions*).
- **Tool catalogue:** [[Tools]] — every component named here, with prerequisites and gotchas.
- **Why hold Bitcoin at all:** [[Case-FA|The Case — For Agents]].
- **Where the agent spends:** [[Marketplace|The Market]] — the live services directory.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

For-Agents twin of [[Quickstart]], authored 2026-06-25 (▶ Next #5 / Killeen K3). A guide-twin, not an argument-twin: structured as a pathway *specification* (decision procedure + per-pathway fields + constraints) rather than claims/counter-positions/falsification, because the human surface is an on-ramp, not a thesis. The node-architecture constraints in §4 are the load-bearing accuracy content (verified against official docs 2026-06-25 by two research agents) — keep them exact; the BOLT12-isn't-light-client and CLN-has-no-Neutrino points are the ones an agent is most likely to get wrong from secondary sources. Register: structured, machine-parseable, claims-indexed for consistency with the FA family even though the "claims" are operational pathway specs. Sibling-calibrated against [[Stack-FA]] (the architecture twin it cross-references). Length runs short of the 2,400-word argument-twin target by design — a spec is dense, not discursive.

**Publications backlinks**

- [[Quickstart]] (this project) — the human twin
- [[Stack-FA]] (this project) — the architecture spec it cross-references
- [[_Progress-Bitcoineconomy-ai]] (this project) — ▶ Next #5 / K3
