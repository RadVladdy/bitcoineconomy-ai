---
title: Boltz
slug: boltz
type: exchange-card
category: noncustodial-swap
featured: true
kyc: none
custody: self-custody
lightning: true
stablecoins: [USDT, USDC]
fiat: false
agent-access: api
bridges:
  - Lightning↔on-chain BTC
  - Lightning↔Liquid
  - Lightning↔stablecoin
trust-model: cryptographic-atomic
links:
  site: https://boltz.exchange
  api-docs: https://api.docs.boltz.exchange
status: v0-2026-06-03-structural-verified
links-verified: 2026-06-03
---

# Boltz

**What it is.** A non-custodial, no-KYC atomic-swap service — the standout agent-native option. Swaps settle via shared-preimage HTLCs (either both legs settle or both refund), so the agent never gives up custody and no account or identity is required.

**What it bridges.** Bitcoin across **L1, Lightning, Liquid, and Rootstock** (internal-substrate moves), **and Lightning ↔ USDT/USDC** — the cross-asset swaps that make it an *exchange* path, not just substrate tooling. (Its pure BTC L1↔Lightning swaps are the *infrastructure* aspect — see its [tools card](/tools/boltz).)

**Agent access.** **REST API + `boltzd`** built for automated workflows — create swaps, poll status, retrieve history programmatically. No account, no KYC keys to delegate; the agent acts on its own wallet.

**How an agent uses it.** From its own wallet, call the API to create a swap (e.g. Lightning sats → USDT), pay the swap invoice, receive the output to a self-custody address. No onboarding step.

**Infrastructure (the stablecoin path).** BTC ↔ Lightning ↔ Liquid ↔ Rootstock are direct atomic swaps. The two stablecoins now differ in how they settle. **USDC is native, via Circle's CCTP** (live since May 2026) — no wrapping and no third-party bridge — deliverable across Ethereum, Arbitrum, Base, and Polygon. **USDT settles as USDT0** (LayerZero omnichain Tether, liquidity concentrated on Arbitrum) over a **multi-hop path**: Lightning → tBTC (atomic Boltz leg) → USDT0 via a Uniswap-style DEX swap, stitched into one irreversible transaction by a Router contract, with gas abstracted (no ETH needed). USDT0 can then bridge to other chains.

**Dependencies.** A self-custody wallet on the rails you're swapping between (Lightning, on-chain BTC, Liquid, or the stablecoin chains) and the REST API / `boltzd`; no account, no KYC. No fiat path — value goes crypto-in, crypto-out — and the stablecoin leg pulls in extra dependencies (tBTC, a DEX, USDT0; see below).

**Gotchas.** *Non-custodial* is not *dependency-free*. The **USDT path** leans on **tBTC** (a wrapped-BTC bridge, Threshold), an **on-chain DEX** (liquidity/slippage), and **USDT0/LayerZero** (omnichain-bridge risk) — on top of the USDT issuer's freeze surface. The **USDC path** (native via CCTP) avoids the wrapping and DEX hops, but the dollar token is still issuer-freezable and CCTP is a Circle-operated mechanism. The atomic guarantee protects *custody* (you don't lose funds to Boltz), not the asset's censorship-resistance or those external bridges' soundness. The pure BTC↔Lightning↔Liquid↔Rootstock swaps carry none of that — they're the cleanest use. No fiat; no support line; non-custodial means no recourse if you misconfigure. *(Fee schedule: verify.)*

**Links.** [boltz.exchange](https://boltz.exchange) · API docs `api.docs.boltz.exchange`.
