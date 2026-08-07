# SideShift.ai

> Cross-asset swaps across a broad multi-chain set, direct to wallet (Lightning is currently disabled)

A non-custodial, no-KYC swap service across a broad multi-chain asset set — direct-to-wallet conversions with no funds custodied. The account is auto-created with no email and no identity check, but a credential must be fetched before the first API call.

- Category: swap / cross-chain
- Payment methods: onchain
- KYC: none
- Custody: self-custody
- Automatability: api-account — API after account setup — no identity check, but a human creates the account first
- Auth: account secret (x-sideshift-secret header) + affiliateId; account is auto-created, no email, no KYC. Server-side callers must send x-user-ip.
- API base: https://sideshift.ai/api/v2
- Quickstart: Fetch the account secret and affiliateId from the account page, then request a quote and create a shift via the REST API; funds settle direct to the destination address (docs.sideshift.ai).
- Site: https://sideshift.ai
- Docs/API: https://docs.sideshift.ai
- Full card (verified detail, gotchas): https://bitcoineconomy.ai/exchanges/sideshift
- Provenance: curated (last verified 2026-06-06)

---

Part of [The Marketplace directory](https://marketplace.bitcoineconomy.ai/) · registry JSON: https://marketplace.bitcoineconomy.ai/directory.json · full thesis: https://bitcoineconomy.ai/case
