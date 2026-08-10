# PPQ.AI (PayPerQ)

> Pay-per-query frontier-model calls. IMPORTANT - the accountless L402 path does NOT cover chat: it covers image generation and editing, video generation, and data enrichment. Chat completions and audio require an sk- API key and a funded balance.

Pay-per-query access to 500+ frontier models — image, video and data calls need no account at all (pay the Lightning invoice in the 402 and go); chat and audio need a key and a funded balance, which Nostr Wallet Connect can top up on its own.

- Category: inference / llm
- Payment methods: l402, lightning
- Payment detail: L402 / Lightning, no account — on image, video and data-enrichment endpoints only. Chat and audio: sk- API key plus a funded balance (Lightning · on-chain BTC · Liquid · LTC · XMR · USDT/USDC · card), with NWC auto-topup.
- KYC: none (crypto funding paths; card funding adds KYC)
- Custody: custodial gateway
- Automatability: api-account — API after account setup — no identity check, but a human creates the account first
- Auth: SPLIT, and the split is the thing to plan around. Image generation/editing, video generation and data enrichment answer an unauthenticated request with HTTP 402 and a Lightning invoice - no account, no key (verified 2026-08-07: POST /v1/images/generations with no Authorization header returned 402 with a live BOLT11 in the WWW-Authenticate header). Chat completions and audio do NOT: the same request to /v1/chat/completions returns 401 'Missing or invalid Authorization header'. For LLM calls, create an account, generate an sk- key and fund a balance - which can be funded over Lightning, on-chain BTC, Liquid BTC, LTC, XMR, USDT/USDC, or card, and topped up automatically via Nostr Wallet Connect. Rated api-account because this entry is categorised inference/llm and the llm path is the one that needs the account.
- Quickstart: For LLM calls: sign up at ppq.ai, generate an sk- key, fund the balance (Lightning or NWC auto-topup), then POST https://api.ppq.ai/v1/chat/completions OpenAI-style. For images/video/data enrichment: send the request with NO Authorization header, pay the Lightning invoice in the 402 challenge, replay with 'Authorization: L402 <token>:<preimage>'. Private TEE models CANNOT be called directly - run the local proxy (npx ppq-private-mode, needs an sk- key) and point an OpenAI- or Anthropic-SDK client at it. Machine pointer: ppq.ai/llms.txt.
- Direction: consume
- Maintainer: PayPerQ
- Site: https://ppq.ai
- Docs/API: https://ppq.ai/api-docs
- Repo: https://github.com/PayPerQ
- Full card (verified detail, gotchas): https://bitcoineconomy.ai/services/ppq-ai
- Provenance: curated (last verified 2026-08-07)

---

Part of the [Agent Marketplace](https://marketplace.bitcoineconomy.ai/) · registry JSON: https://marketplace.bitcoineconomy.ai/directory.json · full thesis: https://bitcoineconomy.ai/case
