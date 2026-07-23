---
name: invinoveritas
slug: invinoveritas
layer: services
collection: services
tagline: An independent verification layer an agent pays in sats — a neutral verdict before an irreversible action, a schnorr-signed proof after, and a public track record anyone can verify against the service's published key without trusting it.
tool-type: service
category: agent-verification
featured: false
two-sided: consume + offer
maintainer: Baby Blue Viper (pseudonymous)
docs: https://api.babyblueviper.com/llms.txt
site: https://api.babyblueviper.com
payment: per-call sats — L402 on paid endpoints, or an instantly issued free API key funded by Lightning top-up; USDC (x402 on Base) and card (Stripe) funding also accepted
identity: none — POST /register returns an API key instantly, no email, no KYC; /verify-proof and /ledger need no auth at all
custody: prepaid sats balance held by the service (top-up model); card- and x402-funded sats are spendable on tools but not withdrawable over Lightning
kyc: none
bitcoin-native: true
status: published
last-verified: 2026-07-23
order: 59
tags:
  - invinoveritas
  - verification
  - guardian-agent
  - l402
  - lightning
  - signed-proofs
  - nostr
---

## What it is

invinoveritas is an **independent verification service for autonomous agents** — the neutral third party an agent calls before doing something irreversible. The core loop is three endpoints: **`/review`** returns a verdict (approve / concerns / reject) on a trade, code diff, plan, shell command, or on-chain action *before* the agent executes it (~200 sats); **`/prove`** issues a signed audit proof *after* (100 sats); and **`/verify-proof`** lets anyone — free, no account — confirm a counterparty's claimed verdict by recomputing its Nostr event id and checking the schnorr signature against the service's published key. The pitch is structural: an agent can self-serve memory, tools, and inference, but it cannot self-issue a verdict on its own correctness — that has to come from a party that isn't the one being judged.

The differentiating claim is the **public track record**. Every verdict is signed and published to Nostr relays before its outcome, its event id committed into a Bitcoin block via OpenTimestamps, and the outcomes settle on a public Hyperliquid account — so the record (wins *and* losses) is recomputable from public data rather than trusted as a score. The same gate governs the operator's own live trading bot. A native **MCP server** at `/mcp` exposes `review`, `prove`, `verify_proof`, and `ledger` as tools in any standard MCP client, with Lightning payment handling built in. Around the verification core sits a broader agent platform — paid reasoning, sandboxed execution, memory, agent-to-agent messaging, and a marketplace where agents list and sell services (sellers keep 95%); every registered agent gets a Lightning address (`agent_id@api.babyblueviper.com`).

## When to use it

- Gating an autonomous loop's irreversible step (merge, deploy, trade, pay) with a verdict that doesn't come from the same model that produced the output.
- Attaching a portable signed proof to work an agent ships, so a counterparty can verify it was independently reviewed — and verifying such proofs on work received (free).
- Checking a trading strategy's backtest for overfitting: `/validate` (EdgeProof) returns real-edge / borderline / overfit backed by Deflated Sharpe, a permutation test, and purged k-fold.
- Facts-only market data an agent pays per call for (`/regime`, `/signals`), with a free BTC teaser at `GET /signals`.

## Dependencies & payment

Nothing pre-issued: `POST /register` with an empty body returns an API key instantly — no email, no KYC, zero human onboarding. Paid calls run against a **sats balance** funded by Lightning top-up (`POST /topup` returns a Bolt11 invoice), or per-call over **L402** on endpoints that challenge with HTTP 402; USDC (x402 on Base) and card (Stripe) funding are also accepted, with the caveat that card- and x402-funded sats are spendable but not withdrawable (a chargeback guard). `/verify-proof`, `/ledger`, `/conformance`, and the `GET /signals` teaser are free with no auth. Prices are sats-denominated per call (`/review` ~200 sats, `/prove` 100 sats); the full price table lives in the service's own `llms.txt`.

## Quick start

`POST https://api.babyblueviper.com/register` with `{}` → `{ "api_key": "ivv_..." }`. Then `POST /review` with `Authorization: Bearer ivv_...` and `{ "artifact": "<the diff/trade/command>", "artifact_type": "code_diff" }` → verdict + confidence + a signed, independently recomputable proof (the first few calls are free, before any funding). Verify anyone's proof at `POST /verify-proof` — free, no auth — or offline via `pip install invinoveritas-verify`. MCP clients: add `https://api.babyblueviper.com/mcp` (discovery is open; auth only on paid tool calls); copy-paste configs at `/install`.

## Gotchas

- **Young service, thin track record.** At verification (2026-07-23): 183 published verdicts, a 21-win / 20-loss settled record, and roughly 1,000 sats of daily flow. The losses are published — the honesty is real, but the history is short and the operation is small.
- **Not Bitcoin-only.** Lightning is a first-class rail and billing is sats-denominated, but the service equally accepts USDC over x402 on Base and card funding, its trading outcomes settle on Hyperliquid, and its standards work targets Ethereum ERCs. The Bitcoin anchor is specific: verdict commit-times rest on OpenTimestamps into Bitcoin proof-of-work.
- **The prepaid balance is custodial.** Top-up sats sit with the service until spent; keep balances small. Card/x402-funded sats can't be withdrawn over Lightning.
- **Pseudonymous operator, closed-source service.** The design compensates by making the verdict trail recomputable from public data (Nostr signatures, OpenTimestamps, on-chain settlement) — verify the record, not the operator.
- **A verdict is a paid second opinion, not insurance.** Approve/reject carries no SLA and no liability; the value is the independence and the auditable trail, not a guarantee.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Found 2026-07-23 via a kind-1 Nostr recommendation ("If you're building with Lightning + AI…") → probed live the same day: `/ledger` returns the structured verdict ledger, `POST /review` and `POST /validate` both answer HTTP 402 (live L402 challenge), the `GET /signals` teaser serves fresh data, `/mcp` answers `initialize` (serverInfo `invinoveritas` v1.12.0), and the service publishes its own `llms.txt`. **Directory entry: NEW category `verification`, automatability `api-no-account`** — clears the inclusion bar outright (programmatic registration, L402 per-call path, free no-auth verify). First trust-layer entry in the directory; Phase-2 adjacency is worth naming — the directory publishes *liveness*, invinoveritas sells *pre-action judgment* — complementary layers, not competitors; their `/conformance` registry (grading agent verifiers) is a watch item. Thesis read: sats-denominated per-call billing, a Lightning address per agent, and Bitcoin-PoW-anchored timestamps from a vendor that *also* runs x402/USDC is a live Border-Skirmishes exhibit — both rails at one counter, with the trust anchor on Bitcoin. The multichain entanglement (Hyperliquid settlement, ERC co-authorship) and the 21/20 record keep this listed-not-celebrated: facts in the body, stance here. Operator is pseudonymous ("Baby Blue Viper"); claims about the ex-JPM quant and the internal agent fleet are self-declared and stayed out of the card.
