# Maple AI

> Private TEE-encrypted LLM inference through an OpenAI-compatible API — prompts provably unreadable to the provider

End-to-end-encrypted AI inference an agent can drive through an OpenAI-compatible API — TEE-attested privacy, Bitcoin-accepted subscriptions.

- Category: inference
- Payment methods: fiat
- Payment detail: subscription (card, or Bitcoin on yearly plans at a 10% discount) + usage credits
- KYC: none
- Custody: n/a (TEE-attested, end-to-end-encrypted inference)
- Automatability: api-account — API after account setup — no identity check, but a human creates the account first
- Auth: Maple API key as Bearer (Pro+ subscription, $20/mo+; account via email/Google/GitHub — no KYC). Bitcoin accepted on YEARLY plans (10% discount) via human checkout: the operator funds the account; the agent drives the API. No sats-per-call path.
- Quickstart: Run Maple Proxy (docker run -p 8080:8080 -e MAPLE_BACKEND_URL=https://enclave.trymaple.ai ghcr.io/opensecretcloud/maple-proxy:latest), then point any OpenAI client at http://localhost:8080/v1 with the API key. Streaming responses only.
- Direction: consume
- Maintainer: OpenSecret
- Site: https://trymaple.ai
- Docs/API: https://blog.trymaple.ai/maple-proxy-documentation/
- Full card (verified detail, gotchas): https://bitcoineconomy.ai/services/maple
- Provenance: curated (last verified 2026-06-11)

Privacy-axis inference: TEE-attested end-to-end encryption, open-source server code, 7 open-weight models. Subscription, not pay-per-use — for sats-native pay-per-call see routstr/ppq-ai.

---

Part of [The Marketplace directory](https://marketplace.bitcoineconomy.ai/) · registry JSON: https://marketplace.bitcoineconomy.ai/directory.json · full thesis: https://bitcoineconomy.ai/case
