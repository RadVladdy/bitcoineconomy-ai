---
name: IBEX Hub
slug: ibex-hub
layer: services
collection: services
tagline: Custodial Lightning-as-a-service — one REST API for Lightning invoices, on-chain, LNURL, sub-accounts, and webhooks over IBEX's managed node cluster, with fiat and stablecoin settlement rails layered on top.
tool-type: service
category: payments
featured: false
two-sided: consume + offer
maintainer: IBEX ("Powered by IBEX")
site: https://www.poweredbyibex.io
docs: https://docs.poweredbyibex.io
payment: contract-negotiated (no public rate card); fees estimated per-transaction via the API
identity: account (business, sales/contract-gated onboarding)
custody: custodial — IBEX runs the node cluster and holds funds; no self-custody option
bitcoin-native: false
agent-access: limited
status: published
last-verified: 2026-07-03
order: 58
tags:
  - ibex
  - payments
  - lightning
  - laas
  - stablecoins
  - custodial
---

## What it is

IBEX Hub is a **custodial Lightning-as-a-service** API: a REST surface that lets a business accept and send Bitcoin payments **without running a node**. Through one integration you can **create and pay Lightning invoices, spin up unlimited sub-accounts, attach on-chain BTC addresses (send and receive), use LNURL** (LNURL-pay, LNURL-withdraw, static QR, Lightning addresses), and receive **webhooks** for asynchronous events. It all runs against **IBEX's managed Lightning node cluster**, so the customer never touches nodes, channels, or liquidity management.

IBEX (now branded **"Powered by IBEX" — "The Internet of Payments"**) is a Central American Lightning-infrastructure company (Guatemala / El Salvador). Beyond the core Lightning + on-chain rails, the rebranded platform markets **banking rails (deposits, withdrawals, beneficiaries) and crypto on/off-ramps** for cross-asset settlement, including **"instant, interoperable settlement in regulated stablecoins."** The Lightning and on-chain BTC rails are the confirmed, documented core; the fiat/stablecoin settlement reads as an enterprise-onboarded capability rather than an open, self-serve one.

Because IBEX **holds the funds and runs the nodes**, this is a **custodial** service: convenient and node-free, but you are trusting IBEX with custody.

## When to use it

- A business or agent needs to **accept and send Lightning + on-chain BTC behind one API** without operating any node infrastructure.
- You want **sub-accounts, LNURL, and webhooks** out of the box for a multi-user or multi-department integration.
- You need **fiat/stablecoin settlement rails** alongside Lightning and are comfortable with a custodial, enterprise-onboarded relationship.

## Dependencies & payment

A **business/organization account**, and onboarding is **human-gated, not self-serve**. Sandbox credentials are provisioned by emailing IBEX (`info@poweredbyibex.io`) with admin and organization details; **production access sits behind business-development contracts**. Auth is a **Bearer access token** (obtained from an email/password sign-in, with a 7-day refresh token) and the docs also describe an **OAuth machine-to-machine client-credentials flow** for authenticated machine requests. A **sandbox** exists (`ibexhub-api.sandbox.poweredbyibex.io`) but is throttled — e.g. a **10,000 sat/day sending cap** and slower responses. **Pricing is not published** on any primary IBEX page — no rate card, tiers, or free-tier statement; fees appear to be contract-negotiated (the API does expose send/withdrawal **fee-estimate** endpoints).

## Quick start

The API is publicly documented at `docs.poweredbyibex.io/reference/welcome`, and the docs publish an **`llms.txt`** index for LLM/agent consumption. Authenticate for a Bearer `AccessToken` (or use the OAuth M2M client-credentials flow), then call the Hub endpoints for invoices, on-chain, LNURL, and sub-accounts; register **webhooks** for async events. There is **no official SDK and no MCP server** — integration is hand-rolled REST. Point at the **sandbox** base URL first (mind the 10k sat/day cap), and note that **credentials are not self-serve** — a human has to request sandbox access and sign contracts for production, so an agent cannot onboard itself today.

## Gotchas

- **Custodial.** IBEX holds your funds and runs the nodes — no self-custody / key-control option. You trust the provider.
- **Stablecoin/fiat legs are issuer- and custodian-freezable.** Regulated stablecoins can be frozen or blacklisted by their issuers regardless of who holds them, and a custodian can freeze the account — self-custody of a freezable asset isn't the same as censorship-resistance. The plain **BTC/Lightning** leg carries none of that.
- **Sales/contract-gated onboarding.** No self-serve API key: sandbox by email request, production behind contracts and business KYB.
- **Sandbox is throttled** (≈10,000 sat/day, slower responses); no clear Bitcoin testnet — it's a limited replica, not a full test network.
- **No SDK, no MCP.** REST only (though an `llms.txt` and an OAuth M2M flow make it more machine-friendly than most).
- **Pricing opaque** — no public rate card; likely negotiated per contract.
- **Brand in transition.** `ibexmercado.com` / `ibexpay` are legacy and redirect to `poweredbyibex.io`; don't confuse this IBEX with unrelated entities of the same name (energy exchange, DeFi, etc.).

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Verified 2026-07-03 against IBEX's own docs (`docs.poweredbyibex.io`) and site. **Brand note:** the company rebranded/consolidated under **"Powered by IBEX"**; `ibexmercado.com` and `docs.ibexmercado.com` 301-redirect to the `poweredbyibex.io` domain. Confirm this is the Central American Lightning LaaS company — not the unrelated `ibex.bg` energy exchange, `ibex.fi` DeFi, or other same-name entities.

**Directory decision:** carded on the main site for reference; **not a directory entry.** Onboarding is sales-gated (no self-serve credentials), there's no SDK/MCP, and pricing is unpublished — so it sits at the `limited` tier, below the directory's machine-actionable inclusion bar (the amboss-payments / Swan precedent). **Re-evaluate if self-serve API access + published pricing (or an SDK/MCP) ship.**

**Thesis line to hold (rails, not substrate):** the Lightning rail is real and fast — praise the rail. Hold the line on two things: (1) it's **custodial** — you trust IBEX with funds and keys, which trades away the sovereignty the Independence Doctrine argues for; and (2) the **fiat/stablecoin settlement** is Phase-1 rails, not the substrate, and the **issuer-freeze + custodian-freeze surface** is exactly what "Why Bitcoin, Not a New Coin" and the Independence Doctrine warn about. Same gotcha family as amboss-payments, but *more* trust-heavy (fully custodial, vs. Amboss's self-custodial-option framing) — hence `bitcoin-native: false`. State the custody + freeze facts plainly in the body (allowed); the preference stays here.

**Partially-verified flag:** the "regulated stablecoin settlement" capability is marketed on the homepage but I could not confirm from primary docs that it's self-serve available to a general developer today (vs. enterprise-contracted) — the body reflects that hedge ("marketed … reads as enterprise-onboarded"). Re-verify before sharpening any stablecoin claim.

Built on its own merits — a net-new payments-infra entry (IBEX was previously absent from the project).
