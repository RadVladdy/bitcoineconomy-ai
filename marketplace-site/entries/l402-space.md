# l402.space

> Access to paid APIs that don't accept bitcoin — pay the gateway in sats over Lightning (L402 or MPP) and it pays the upstream in USDC on Base/Solana or Tempo stablecoins on your behalf, returning that API's response unchanged

A universal 402 gateway — pay it in sats over Lightning and it pays the upstream API on your behalf in USDC or Tempo stablecoins, so an agent holding only bitcoin can buy from endpoints that don't accept bitcoin.

- Category: payments / gateway
- Payment methods: l402, lightning, x402, mpp
- Payment detail: per-call, priced in your own rail — L402 or MPP over Lightning, x402 (USDC on Base/Solana), or MPP over Tempo; the quote is the upstream's price plus a gateway markup and routing fee
- KYC: none
- Custody: the gateway holds the sats you pay it and settles upstream from its own USDC/Tempo float — a custodial hop for the duration of the call
- Automatability: api-no-account — API with no account — payment or a key is the credential; zero human onboarding
- Auth: none — no signup and no API key; the standard HTTP 402 challenge/retry IS the auth. Pay the challenge over your rail, retry the same URL with that rail's credential header (Authorization: L402 <token>:<preimage> for Lightning). Receipts are reusable for follow-up requests the same upstream payment covers
- API base: https://l402.space
- Pricing: https://l402.space/docs
- Quickstart: URL-encode the full upstream URL and append it: GET https://l402.space/{encodeURIComponent(upstreamUrl)}. You get a 402 with per-rail challenges and the price in sats + USD; pay over your rail and retry the same URL with its credential header. Test your wallet first with GET /l402/ping (~1 sat). Dedicated single-rail endpoints at /l402/, /x402/, /mpp-lightning/, /mpp-tempo/.
- Direction: consume
- Maintainer: Alby
- Site: https://l402.space
- Docs/API: https://l402.space/docs
- Full card (verified detail, gotchas): https://bitcoineconomy.ai/services/l402-space
- Provenance: curated (last verified 2026-07-29)

The gateway-observed source of this directory (/live/l402space.json) is its /api/services feed, and every via-gateway row here carries a gateway_url pointing through it. Custodial hop by design: it holds the sats you pay and settles upstream from its own USDC/Tempo float, so prefer a directly payable endpoint where one exists — rows are labelled bitcoin-native vs via-gateway for exactly this reason. Very early: 848 transactions and $34.97 lifetime volume across 157 endpoints at listing (its own /api/stats, 2026-07-29). Float exhaustion is a live failure mode — /health/balances 503s when a rail's float runs low. Price = upstream price + gateway markup + routing fee; the 402 quote is authoritative.

---

Part of [The Marketplace directory](https://marketplace.bitcoineconomy.ai/) · registry JSON: https://marketplace.bitcoineconomy.ai/directory.json · full thesis: https://bitcoineconomy.ai/case
