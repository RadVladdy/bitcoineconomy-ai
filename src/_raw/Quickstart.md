---
title: Quickstart — connect an agent to Bitcoin
slug: quickstart
description: "Four pathways to plug an agent into Bitcoin, from a hosted service in minutes to your own full node."
type: guide
surface: quickstart
section: stack
status: v0-draft-2026-06-25 (pending review)
audience: humans
twin-page: quickstart-for-agents
created: 2026-06-25
last-updated: 2026-06-25
word-count-target: 1400
voice: honest-middle-position
scope: how-to on-ramp (the adoption pathways + first concrete step each); architecture defers to Stack, tool detail defers to Tools cards, custodial venues defer to Exchange/Services
tags:
  - canonical
  - stack
  - quickstart
  - onboarding
  - lightning
  - ecash
  - agent-wallet
  - pathways
agent-tldr: |
  An on-ramp guide, not an argument. Core frame: there is no single way to connect an agent to Bitcoin — there is a ladder ordered by one variable, how much infrastructure you run yourself, and every trade-off (custody, censorship-resistance, time-to-live, ops burden) falls out of where you sit on it. Four pathways, lightest to most sovereign: (A) Custodial service — a hosted wallet/account holds the keys and the node; live in minutes; you trust an operator who can KYC/freeze/censor; our stack reaches this mostly through Exchange/Services venues plus custodial ecash (minibits-ippon). (B) Self-custody, no node — you hold keys but run no node, via a headless non-custodial wallet (xverse-agent-wallet, keys on-device, answers L402 itself) or a wallet connector (alby-nwc / NWC, mcp); pay over L402/LNURL; ecash (cashu) sits here with a mint-trust asterisk. (C) Light-client node — your own lnd on a Neutrino light client: real channels, no full chain download, trust reduces to block headers (SPV-level); lightning-agent-tools, lnbits, loop, taproot-assets, clink all confirm Neutrino support in official docs. Neutrino is LND-only — Core Lightning has no native Neutrino (needs bitcoind), so a CLN node is Pathway D; BOLT12 light-client support is implementation-dependent (CLN-BOLT12 needs a full node, LDK and LND-via-LNDK run light). (D) Full sovereign stack — Bitcoin Core full node under your Lightning node: full validation, maximum censorship-resistance, heaviest ops; the same C toolkits on a full-node backend. Key structural point: for C and D the TOOLKIT and the SOVEREIGNTY are independent — the same LN toolkit runs on a light client or a full node, so the pathway is set by the node backend (Neutrino vs Core), not the tool. Security overlay (orthogonal, hardens C/D): a remote signer / split-node — watch-only node initiates payments, keys live on an isolated signer, scoped macaroons cap exposure (e.g. pay-only, daily limit). Default recommendation: pick the lightest pathway that meets your trust and sovereignty needs; you can move down the ladder later. Every pathway terminates the same place — an agent that can pay, get paid, and reach the marketplace.
---

# Quickstart — connect an agent to Bitcoin

> **In brief.** There's no single way to plug an agent into Bitcoin — there's a ladder, and which rung is right comes down to one question: *how much infrastructure are you willing to run?* This guide lays out four pathways — a custodial service (live in minutes), self-custody with no node, your own light-client node, and the full sovereign stack — and what each one trades away on custody, censorship-resistance, and effort. The rule of thumb is simple: pick the lightest pathway that meets your needs, and move down the ladder later if you need to. Every pathway ends in the same place — an agent that can pay, get paid, and reach the marketplace.

---

## Which pathway?

Start at the top and stop at your first *yes*. Each step down the list trades a little more setup for a little more sovereignty.

- **Don't need to hold your own keys?** → **A · Custodial service.** The fastest path: a hosted wallet or account holds the keys and runs the node for you.
- **Want to hold your own funds, but not run a node?** → **B · Self-custody, no node.** A headless non-custodial wallet, or a connector that drives an external wallet without touching its keys.
- **Willing to run a node, but not store the whole blockchain?** → **C · Light-client node.** Your own Lightning node on a light client — real channels, no 600-gigabyte download.
- **Want to validate everything yourself?** → **D · Full sovereign stack.** Your own Bitcoin full node underneath your Lightning node. Trust nothing.
- **Handling real money?** → keep your pathway and add the **remote-signer** hardening (below) on top of C or D.

## The four pathways at a glance

| Pathway | What you run | Custody | What you trust | Time · effort | Sovereignty |
|---|---|---|---|---|---|
| **A · Custodial service** | nothing — an account / API | the operator holds the keys | the operator (can KYC, freeze, censor) | minutes · none | low |
| **B · Self-custody, no node** | a wallet or a connector | you hold the keys | the wallet / connector infra; the mint, for ecash | minutes–hours · low | medium |
| **C · Light-client node** | your own Lightning node on Neutrino | you hold the keys, your node | block headers (light-client level) + peer uptime | hours · medium | high |
| **D · Full sovereign stack** | a Bitcoin full node + your Lightning node | you hold the keys, full validation | nothing — you verify it yourself | days (incl. sync) · high | maximum |
| **＋ Remote signer** *(adds to C or D)* | a watch-only node + an isolated signer | keys live off the agent's host | the signer device + the limits you set | extra setup | hardens C/D |

The further down you go, the less you have to trust anyone else — and the more you run yourself. Most agents should start at the lightest rung that meets their needs.

---

## A · Custodial service — fastest

**What you run:** nothing. A hosted service holds the keys and operates the node; your agent calls an API or signs into an account.

**The trade-off:** you're live in minutes with zero infrastructure, but the operator can KYC you, freeze funds, or be compelled to censor. Fine for small operational balances and getting moving; not where you park a treasury.

**In our stack:** most of this lane lives in the [[Market|Market]] section rather than the toolbox — see the [[Exchange|Exchange]] venues and the [[Services|Services]] directory for hosted, account-based options. On the bearer-token side, [[minibits-ippon|Minibits/Ippon]] spins up a custodial Cashu wallet with a single call (keep it small and disposable).

**Start here if** you just need your agent paying for an API today and don't want to manage anything.

## B · Self-custody, no node

**What you run:** a wallet you control, or a connector — but no node of your own.

**The trade-off:** you hold your own keys without standing up infrastructure. You're still depending on the wallet or connector's backend (and, for ecash, on a mint), so it's not full self-sovereignty — but your funds aren't sitting with a custodian.

**In our stack:** [[xverse-agent-wallet|Xverse Agent Wallet]] is a headless, non-custodial wallet whose keys stay encrypted on-device and which answers HTTP-402 payment requests itself. [[alby-nwc|Alby + Nostr Wallet Connect]] hands your agent a *scoped, budgeted, revocable* connection to a wallet hub without ever exposing the keys, and the [[mcp|Model Context Protocol]] carries those payment tools into agent frameworks. For bearer cash, [[cashu|Cashu]] gives instant, private transfers — with the honest caveat that the mint is a custodial trust point, so spread balances across mints (see [[evaluating-ecash-mints|how to vet a mint]]). Your agent pays over [[l402|L402]] and [[lnurl|LNURL]].

**Start here if** you want real self-custody quickly and are comfortable trusting a wallet or connector for the plumbing.

## C · Light-client node

**What you run:** your own Lightning node — `lnd` on a **Neutrino** light client instead of a full chain copy. You get real channels and route payments without downloading or storing the entire blockchain. *(Neutrino is an `lnd` capability; Core Lightning always wants a full `bitcoind`, so a CLN node lands in Pathway D.)*

**The trade-off:** near-sovereign, with a fraction of the storage and sync time. The compromise is that a light client trusts block *headers* rather than fully validating every transaction itself — a real but well-understood reduction, not custodial trust.

**In our stack:** [[lightning-agent-tools|Lightning Agent Tools]] (Lightning Labs' agent toolkit) runs natively in Neutrino mode; [[lnbits|LNbits]] gives you programmable wallets and accounts on top of your node; [[loop|Loop]] moves balance between on-chain and Lightning; [[taproot-assets|Taproot Assets]] adds issued-asset rails; and [[clink|Clink / Lightning.Pub]] is purpose-built to run an LND node in Neutrino mode on minimal hardware. Each of these confirms Neutrino support in its own docs — no full chain copy required.

**Start here if** you want your own node and channels but don't want to run a full Bitcoin node yet.

## D · Full sovereign stack

**What you run:** a [[bitcoin-core|Bitcoin Core]] full node underneath your Lightning node — the whole chain, validated by you.

**The trade-off:** maximum sovereignty and censorship-resistance — you trust nothing and verify everything — at the cost of the most storage, sync time, and ongoing operations.

**The key thing to know:** the toolkits are the *same* as Pathway C. Lightning Agent Tools, LNbits, Loop, Taproot Assets — they all run identically on a full node. **The pathway is set by your node backend (Neutrino vs. full Core), not by the tools.** That means you can start light on C and graduate to D later without changing your stack.

**Want your agent to *sell*, not just buy?** Everything above gets it *paying*; this same sovereign backend can also *serve* a priced tool over a pubkey — a [[contextvm|CVM]] server with no inbound ports — instead of exposing an HTTP endpoint. See [[Stack|The Stack]] §4.

**Start here if** censorship-resistance is the whole point — you're settling meaningful value and want to depend on no one.

## Protect the funds: the remote signer

This isn't a fifth pathway — it's a hardening layer you add on top of C or D when an agent is handling real money. In a **split-node** setup, the agent operates a *watch-only* node that can initiate payments, while the private keys sit on a separate, isolated **remote signer**. You then issue **scoped credentials** (macaroons) that cap what the agent can do — pay-only, with a daily limit, say 5,000 sats. A compromised agent host can't drain the treasury, because it never held the keys.

[[lightning-agent-tools|Lightning Agent Tools]] is built for exactly this (watch-only node plus a separate signer), and a scoped [[alby-nwc|NWC]] connection gives a lighter version of the same discipline for Pathway B.

---

## Reaching the marketplace

Whichever pathway you pick, the destination is the same: an agent that holds value and can transact for itself. Once it can pay an invoice and answer one, it can discover and buy services in [the live marketplace](https://marketplace.bitcoineconomy.ai) — agent-readable, with probed liveness and a cross-provider price index. That's the whole point of standing any of this up.

> [!info] Where to read next
> **More in The Stack** — [[Stack|The Stack]] for how the layers actually fit together and what the payment primitives (L402, NWC, BOLT12) are doing under the hood · [[Tools|the toolbox]] to browse every tool by category, with its prerequisites · [Skills](/skills) for install-ready, MCP-native capabilities once your pathway is connected (discover-and-buy, lightning-pay, btc-check, nostr-post, verify-setup).
> **In the other sections** — [[Case|The Case]] for why an agent should hold Bitcoin in the first place · [[Market|the Market]] for where it spends.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Built 2026-06-25 for ▶ Next #5 / Killeen K3 — the from-scratch "spin up an agent connected to a wallet" on-ramp. Reframed per the editor's 2026-06-25 decision from a single linear walkthrough into an **adoption-pathways** guide: the organizing axis is *how much infrastructure you run yourself*, and every trade-off falls out of that. Sourced from our own card prereqs (the #4 audit already captured the Neutrino / remote-signer nuance) plus the AI-search synthesis the editor supplied (light-client daemons / MCP+NWC connectors / remote signers / headless non-custodial wallets — the four map onto pathways C / B / overlay / B respectively).

**Scope discipline.** This is the *on-ramp*, not the explainer and not the catalog. Architecture → defers to [[Stack]]; specific-tool detail → defers to the [[Tools]] cards; custodial venues → defer to [[Exchange]] / [[Services]]. Keep it a decision-guide, not a re-explanation.

**The load-bearing insight to preserve:** for pathways C and D the *toolkit* and the *sovereignty level* are independent — the same LN toolkit runs on a light client or a full node, so the pathway is the backend choice (Neutrino vs Core), not the tool. This is what lets an agent start light and graduate without re-tooling. Don't let an edit collapse C and D into "pick a different tool."

**Neutrino verification — ✅ DONE 2026-06-25 (official docs, two research agents):**
- **Loop** — fully supports Neutrino (Loop API ref / README: "All of lnd's supported chain backends are fully supported: Neutrino, Bitcoin Core, and btcd"). **Taproot Assets** — Neutrino/BIP157 mode, "does not require you to keep or scan the entire blockchain" (docs FAQ). **Lightning Agent Tools** — embedded Neutrino backend (blog positions it for experiments; gRPC-to-your-own-lnd is the production default — that lnd can itself be Neutrino). **Clink/Lightning.Pub** — runs LND in Neutrino mode natively (README, $5 VPS). All four confirmed high-confidence. My earlier worry (Loop/Taproot need a full node) was **unfounded**.
- **Corrections applied:** (1) **Core Lightning has NO native Neutrino** (requires `bitcoind`; light-only via trusted third-party plugins, not SPV) → CLN is Pathway D, not C; removed the "lnd or CLN on Neutrino" phrasing. (2) **BOLT12 light-client support is implementation-dependent** — CLN-BOLT12 full-node-only; LDK (Esplora/Electrum) and LND-via-LNDK run light → dropped BOLT12 from the C tool list (it's a primitive moving to the Stack anyway; the chain-backend nuance belongs in the Stack's BOLT12 explainer). (3) **LNbits is nodeless-capable** — delegates to a funding source (custodial Alby/OpenNode/Strike, self-custodial-nodeless Phoenixd/Boltz/Breez, or LND-which-can-be-Neutrino); good example of "the backend sets the pathway, not the tool." Sources: docs.lightning.engineering, lightningloop.io, docs.lnbits.org, corelightning.org/docs/bitcoin-core, shocknet/Lightning.Pub. *(Open low-confidence: Eclair/Phoenix BOLT12 chain-backend specifics — not asserted on the surface.)*
- ✅ **FA twin authored** (`Quickstart-FA.md`, v0-draft 2026-06-25) — pathway-spec register; node-architecture constraints (§4) verified.
- ✅ **Nav wired** — registered under The Stack (`NAV_GROUPS` / `HUMAN_NAV` / `TWIN` / `HUMAN_OF` / `SLUG_TAGS`), order **Stack → Quickstart → Tools**; Tools orientation block links here.
- ⏸ **DEFERRED (polish, post-deploy): decision-flow diagram** (`quickstart-pathways`) in `diagrams.ts`, wired via `port-surfaces.mjs` INSERTS at the "Which pathway?" section — a 5-node decision tree (A→B→C→D + remote-signer branch), cyan Stack accent. The prose decision tree + comparison table carry the surface without it.
- ▶ Consider a link from the homepage + the `/marketplace` gateway to `/quickstart` (the cold-start funnel entry).

**Publications backlinks**

- [[Stack]] (this project) — the explainer this on-ramp sits beside
- [[Tools]] (this project) — the toolbox; its orientation block links here
- [[_Progress-Bitcoineconomy-ai]] (this project) — ▶ Next #5 / K3
- [[_Outreach-Dossiers-Bitcoineconomy-ai]] (this project) — Killeen K3 (report-back on ship)
