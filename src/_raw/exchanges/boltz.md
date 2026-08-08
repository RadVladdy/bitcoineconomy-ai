---
title: Boltz
slug: boltz
type: exchange-card
category: noncustodial-swap
featured: false
kyc: none
custody: self-custody
lightning: true
fiat: false
agent-access: api
bridges:
  - Lightning↔on-chain BTC
  - Lightning↔Liquid
trust-model: cryptographic-atomic
links:
  site: https://boltz.exchange
  api-docs: https://api.docs.boltz.exchange
status: v0-2026-06-03-structural-verified
links-verified: 2026-08-07 (live API pair census + suspension notice read from the vendor bundle; swaps disabled 2026-08-03)
---

> [!warning] ⛔ **Swap services are DISABLED indefinitely, since 3 August 2026.**
> Boltz's own site states it: *"Swap Services Disabled… Boltz will stay disabled until further notice… Do not expect swap services to resume shortly."* Their stated reason is a sustained rise in automated, AI-assisted probing of an open-source stack that a team their size cannot patch fast enough. **The API remains up only to process refunds** — *"unilateral refunds will work, as they do not depend on our infrastructure"*, which is the non-custodial design doing exactly its job: the service shut down and no user funds were held hostage. **Do not route an agent here to swap.** This card is kept, unfeatured and factual, rather than deleted, because the mechanism and the shutdown are both worth understanding.

**What it is.** A non-custodial, no-KYC atomic-swap service. Swaps settle via shared-preimage HTLCs (either both legs settle or both refund), so the agent never gives up custody and no account or identity is required. *(Written in the present tense because the software and the protocol are unchanged — what stopped is the operator running it.)*

**What it bridges.** As last measured against the live API (2026-08-07), the supported set is **Bitcoin L1, Lightning, Liquid, and Ark** — and nothing else. **Rootstock, tBTC, WBTC, USDT and USDC are no longer offered on any swap type**, though the marketing copy and UI still mention several of them; **Ark** is offered and had never been carded. (Its pure BTC L1↔Lightning swaps are the *infrastructure* aspect — see its [tools card](/tools/boltz).)

**Agent access.** **REST API + `boltzd`** built for automated workflows — create swaps, poll status, retrieve history programmatically. No account, no KYC keys to delegate; the agent acts on its own wallet.

**How an agent uses it.** From its own wallet, call the API to create a swap (e.g. Lightning sats → on-chain BTC, or Lightning → L-BTC), pay the swap invoice, receive the output to a self-custody address. No onboarding step.

**The stablecoin path is gone.** This card previously described a USDC route via Circle's CCTP and a USDT route settling as USDT0 over tBTC and a DEX. **Neither is offered by the live API today**, so the description — and the bridge-risk reasoning that went with it — has been removed rather than left describing machinery an agent cannot reach.

**Dependencies.** A self-custody wallet on the rails you're swapping between (Lightning, on-chain BTC, Liquid, or Ark) and the REST API / `boltzd`; no account, no KYC. No fiat path — value goes crypto-in, crypto-out — and the supported set is Bitcoin L1, Lightning, Liquid and Ark only.

**Gotchas.** The service is **off** (see the callout above) — that is the only gotcha that matters right now. Structurally: *non-custodial* is not *dependency-free*, and the atomic guarantee protects **custody** (you do not lose funds to Boltz) rather than any counterparty's soundness. The suspension is itself the strongest evidence for the design: Boltz stopped operating and users could still refund unilaterally, because refunds do not depend on Boltz's infrastructure. No fiat; no support line; non-custodial means no recourse if you misconfigure.

**Links.** [boltz.exchange](https://boltz.exchange) · API docs `api.docs.boltz.exchange`.
