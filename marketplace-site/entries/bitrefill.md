# Bitrefill

> Agent-relevant slice: prepaid virtual Visa/Mastercard (the universal card bridge), eSIM data, phone/VoIP refills, VPN subscriptions. The bulk of the catalog is human-consumption gift cards (A2P procurement). NOT in the catalog: VPS/hosting, domains, compute, AI credits — see lnvps/bitlaunch/routstr/ppq-ai for those

The Lightning-native bridge to the rest of the digital economy — buy gift cards and top-ups for thousands of mainstream services with Bitcoin, via a real API, no KYC.

- Category: commerce
- Payment methods: lightning, onchain
- Payment detail: Lightning (native) + on-chain BTC; programmatic via the remote MCP server or the Thor API
- KYC: none
- Custody: n/a (pay-and-receive)
- Automatability: api-account — API after account setup — no identity check, but a human creates the account first
- Auth: MCP server: OAuth or API key (account developers page) — auth-gated, probed alive 2026-06-11. Thor API key alternative. No KYC for ordinary purchases; guest checkout = email only.
- API base: https://api.bitrefill.com/mcp
- Quickstart: Connect the remote MCP server at https://api.bitrefill.com/mcp (OAuth or API key): search-products → get-product-details → buy-products (≤15 items/invoice) → pay the Lightning invoice → get-invoice-by-id returns the redemption code. Setup: bitrefill.com/agents (machine-readable SKILL.md). Raw-HTTP alternative: the Thor API.
- Direction: consume
- Maintainer: Bitrefill
- Site: https://bitrefill.com
- Docs/API: https://docs.bitrefill.com
- Full card (verified detail, gotchas): https://bitcoineconomy.ai/services/bitrefill
- Provenance: curated (last verified 2026-06-11)

One of the few entries with a purpose-built agent interface (remote MCP + agents onboarding page).

---

Part of [The Marketplace directory](https://marketplace.bitcoineconomy.ai/) · registry JSON: https://marketplace.bitcoineconomy.ai/directory.json · full thesis: https://bitcoineconomy.ai/case
