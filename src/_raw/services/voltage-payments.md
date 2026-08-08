---
name: Voltage Payments
slug: voltage-payments
layer: services
collection: services
tagline: A REST API for Lightning payments with the nodes, channels, and liquidity abstracted away — send and receive bitcoin over Lightning, backed either by Voltage's own credit line or by your own node.
tool-type: service
category: payments
featured: false
two-sided: consume + offer
maintainer: Voltage (Voltage Credit, LLC)
site: https://voltage.cloud
docs: https://docs.voltageapi.com
payment: usage-based, sales-quoted (no public rate card); credit-backed accounts settle on a monthly billing cycle
identity: account (business, U.S.-approved-states only, full KYB + beneficial-ownership)
custody: node-backed (self-custodial, your own node) or credit-backed (Voltage runs the infra; a secured line of credit collateralized in BTC/USD)
bitcoin-native: true
agent-access: limited
status: published
last-verified: 2026-08-08
order: 57
tags:
  - voltage
  - payments
  - lightning
  - laas
  - lnd
---

## What it is

Voltage Payments is a **"Stripe for Lightning"**: a REST API (`https://voltageapi.com/v1`) that lets a business create Lightning wallets, **send and receive bitcoin over Lightning** (BOLT11), manage teams and permissions, reconcile accounts, and receive webhooks — with **the nodes, channels, and liquidity mostly abstracted away**. That abstraction is the whole point: you make an API call, and Voltage handles the routing and inbound/outbound liquidity that normally make running a Lightning node hard.

It ships in two shapes. **Node-backed** points the API at **your own Lightning node** — you keep complete control of your infrastructure and funds. **Credit-backed** lets Voltage run the infrastructure and gives you a **business line of credit** (no pre-funding, monthly settlement), secured by collateral — BTC or USD held in a multi-sig vault, or bank-account verification.

The transacting asset today is **bitcoin**. Voltage's marketing pairs "BTC & USD," but the developer docs are explicit that **bitcoin is currently the only supported asset**, with **USDT still "coming soon."** **USD lines of credit have shipped** — the docs carry dedicated Sending and Receiving (USD Line of Credit) guides in which a USD wallet converts USD to BTC at payment time, and the API exposes `/lines_of_credit/*` and `/quotes`. What remains "coming soon" is **USD *invoice* payments** — settling Voltage's own billing invoice by ACH, which is a different thing. Credit-backed accounts denominate and settle their activity in USD against the BTC rail, but the value that actually moves is Bitcoin over Lightning.

## When to use it

- A business or agent needs to **send and receive bitcoin over Lightning behind one API** without operating its own node and liquidity.
- You want to point the same API at **your own node** (self-custodial) rather than a hosted one.
- You want **machine-tempo Lightning settlement** with usage-based billing rather than running the rail yourself.

## Dependencies & payment

A **business account** — and this is a regulated financial onboarding, not a self-serve signup. Voltage Payments is **only available to businesses in approved U.S. states**; the mainnet application collects org structure and TIN plus **beneficial-owner details for anyone holding 25%+** (name, DOB, address, SSN/TIN), and credit-backed accounts must **post collateral** (BTC/USD in a multi-sig vault) or verify a bank account. Pricing is **not a published rate card** — "shaped around your volume, your rails, and how you deploy," set with sales at approval; credit-backed accounts get an approved credit amount and a billing-cycle frequency. **Mainnet applications are currently closed**; you can read the docs and build against **staging** today, but live access is gated.

## Quick start

The API is public and documented at `docs.voltageapi.com` (interactive spec at `voltageapi.com/v1/docs`). Auth is a per-environment **API key** sent as an `x-api-key` header, generated from the dashboard's Team → API Keys page. One integration quirk worth knowing: creating a payment returns **HTTP 202 (accepted)**, and you then **GET the payment** to retrieve the actual invoice. There is **no official SDK and no MCP server** — integration is hand-rolled HTTP against the REST endpoints. Build against **staging** first; **mainnet onboarding is closed** at time of writing, so an agent cannot self-provision live credentials.

## Gotchas

- **Bitcoin is still the only transacting asset, despite "BTC & USD" marketing.** USDT remains roadmap ("soon"); **USD lines of credit are live**, but a USD wallet converts to BTC at payment time — so USD is a denomination and a credit line, never the thing that settles. Lead with the docs, not the homepage.
- **Credit-backed is a secured loan, not just a payments account.** Collateral sits in a multi-sig vault; it's a lending relationship with Voltage. Node-backed is the self-custodial path — you keep the funds.
- **Business-only, U.S.-states-only, heavy KYB.** Beneficial-ownership disclosure and SSN/TIN are required. No individual, non-US, or anonymous access.
- **Mainnet onboarding is closed.** Staging is open; live money movement is gated and sales-approved.
- **No SDK, no MCP.** Raw REST only — an agent can drive the API once credentialed, but there's no published agent-ready path and no self-serve onboarding.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Verified 2026-07-03 against Voltage's own docs (`docs.voltageapi.com` — the Payments API portal, distinct from the legacy node-hosting docs at `docs.voltage.cloud`) and product/pricing pages. **Entity note:** this is `voltage.cloud` (Voltage Credit, LLC, NMLS 2676234) — **not** the unrelated `@voltage-finance/sdk` DeFi project on the Fuse chain; do not attribute that SDK here.

**Directory decision:** carded on the main site for reference; **not a directory entry.** With no public/self-serve agent path (mainnet closed, no SDK/MCP, full KYB) it sits at the `limited` tier, below the directory's machine-actionable inclusion bar — the amboss-payments / Swan precedent. **Re-evaluate for a directory entry if mainnet opens self-serve and/or an SDK or MCP ships.**

**Thesis line to hold (rails, not substrate):** the *rail* is the story to praise — Lightning, sub-second, and a genuine **self-custodial node-backed option** that is Phase-1 *and* Phase-2 aligned. Hold the line on two things: (1) the **USD/USDT roadmap** is Phase-1 rails, not the settlement asset — represent currency flexibility as rails, never as an endpoint the value settles in; (2) the **credit-backed model is a custodial/lending relationship with heavy KYB**, which trades away exactly the sovereignty the Independence Doctrine argues for. State the KYB/credit facts plainly in the body (allowed); the preference stays here. `bitcoin-native: true` is correct today (BTC is the only supported asset) — flip it if USDT ships and the card starts describing multi-asset settlement, the way amboss-payments does.

Built on its own merits; **don't infer a Voltage↔Amboss link** — the Amboss Payments card describes an LND node the customer hosts (its earlier Voltage attribution was retracted), which is a separate product from this one.
