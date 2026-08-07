---
name: PPQ.AI (PayPerQ)
slug: ppq-ai
layer: services
collection: services
tagline: Pay-per-query access to 500+ frontier models — image, video and data calls need no account at all (pay the Lightning invoice in the 402 and go); chat and audio need a key and a funded balance, which Nostr Wallet Connect can top up on its own.
tool-type: service
category: inference-gateway
featured: true
two-sided: consume
maintainer: PayPerQ
repo: https://github.com/PayPerQ
docs: https://ppq.ai/api-docs
site: https://ppq.ai
x: "@PPQdotAI"
payment: "L402 / Lightning, no account — on image, video and data-enrichment endpoints only. Chat and audio: sk- API key plus a funded balance (Lightning · on-chain BTC · Liquid · LTC · XMR · USDT/USDC · card), with NWC auto-topup."
custody: custodial gateway
kyc: none (crypto funding paths; card funding adds KYC)
bitcoin-native: true
stack-section: "§5"
status: published
last-verified: "2026-08-07 (llms.txt re-read and the access split measured directly: /v1/chat/completions unauthenticated returns 401, /v1/images/generations returns a live 402 + BOLT11)"
order: 41
tags:
  - ppq
  - payperq
  - l402
  - lightning
  - llm-api
  - pay-per-query
  - private-inference
  - tee
---

## What it is

PPQ.AI (PayPerQ) is a gateway to **500+** frontier chat, image, video, and audio models (OpenAI, Anthropic, Google, xAI, Mistral, Meta, Deepseek, Qwen, and more) behind one OpenAI-compatible API, paid per use with no subscription. Average query cost is around 1.5¢, with top-ups from about 10¢. It is a live instance of "an agent pays for its own inference" — the simplest on-ramp for an agent to buy frontier-model calls without provisioning an account with every provider separately.

> [!warning] **The no-account path does not cover chat — check which endpoint you need before you plan around it.**
> PPQ does support HTTP 402: send a request with no `Authorization` header, get back a Lightning invoice, pay it, replay with `Authorization: L402 <token>:<preimage>`. **But its own documentation lists the endpoints that work this way, and chat is not among them** — the accountless path covers **image generation, image editing, video generation, and data enrichment**. Measured directly on 2026-08-07: an unauthenticated `POST /v1/images/generations` returned **402** with a live 36-sat BOLT11 invoice in the `WWW-Authenticate` header, while the same unauthenticated `POST /v1/chat/completions` returned **401 — "Missing or invalid Authorization header."**
>
> So **buying an LLM call here needs an account, an `sk-` API key, and a funded balance.** That is a real thing to know, and it is not a small one: this card previously said the opposite.

**What makes it worth the account anyway.** The balance is funded over **Lightning, on-chain Bitcoin, Liquid BTC, Litecoin, Monero, USDT/USDC, or a card** — and, the part that matters most for an autonomous agent, it can be topped up by **Nostr Wallet Connect**: connect an NWC wallet (Alby Hub, LNbits, Primal) and PPQ refills the balance itself when it drops below a threshold. That is an agent buying its own inference indefinitely without a human returning to the payment screen, which is the behaviour this site keeps arguing for — reached through an account rather than around one. The Bitcoin and Lightning funding paths are the on-thesis ones; the rest is coverage recorded, not recommended.

It also runs a **private-inference tier**: a set of models served inside **TEEs** (trusted execution environments, on NVIDIA confidential-computing GPUs) with **end-to-end encryption** — the request body is encrypted **in your own process** (by the local proxy, using HPKE) before it reaches PPQ's servers, decrypted only inside the hardware-attested enclave, and encrypted again on the way back, so PPQ *"can only see ciphertext and routing metadata — never prompts or completions."* Private models are addressed with a `private/` prefix and currently include `private/glm-5-2` (384K context), Kimi K2.6, GPT-OSS 120B, Llama 3.3 70B, Qwen3-VL 30B, and Gemma 4 31B. It also publishes a `/llms.txt` and an API surface designed to be consumed directly by agents.

## When to use it

- **Accountless** image, video or data-enrichment calls — pay the 402's invoice and go, nothing to sign up for.
- Agents that need to buy inference on demand without managing a separate account with every model provider — one key here instead of eight elsewhere.
- **Unattended agents that must not run out of credit** — NWC auto-topup refills the balance from a Lightning wallet without a human.
- Privacy-sensitive workloads — the `private/` TEE tier keeps prompts unreadable to the gateway.
- Lightning-native metering of model usage.

## Dependencies & payment

**Dependencies — and they differ by endpoint.** For images, video and data enrichment: a [Lightning / L402](/tools/l402) wallet or L402-capable client, and nothing else — no account, no key. For chat and audio: an account, an `sk-` API key, and a funded balance. For `private/` models: all of the above **plus** the local encryption proxy, which is required rather than optional (Node 18+; it handles enclave attestation and the HPKE key exchange, powered by Tinfoil). **Payment:** pay-per-query, ~1.5¢ a query, top-ups from ~10¢ — funded over Lightning, on-chain Bitcoin, Liquid BTC, Litecoin, Monero, USDT/USDC, or card, with **NWC auto-topup** for unattended refills. Card funding adds KYC; the crypto paths do not.

## Quick start

**Which path you take depends on what you are buying.**

**Images, video, data enrichment — no account.** Send the request with no `Authorization` header, pay the Lightning invoice that comes back in the `402` challenge, and replay the request with `Authorization: L402 <token>:<preimage>`. Clients like `lnget` and `mppx` automate the challenge-pay-replay loop for you.

**Chat and audio — account, key, balance.** Sign up at `ppq.ai`, generate an `sk-` key at `ppq.ai/api-docs`, fund the balance (Lightning is the fastest, and NWC auto-topup keeps it funded), then call it like OpenAI:

```bash
curl https://api.ppq.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{"model":"claude-sonnet-5","messages":[{"role":"user","content":"Hello"}]}'
```

Chat, image, video and embeddings sit at `https://api.ppq.ai`; **audio is on a different base URL**, `https://ppq.ai/api/v1`.

**Private inference — the proxy is required, not optional.** You cannot call a `private/*` model against `api.ppq.ai` directly; PPQ says so in as many words. Run the open-source proxy locally and point an OpenAI- or Anthropic-SDK client at it — it handles attestation, the HPKE key exchange and the encryption:

```bash
PPQ_API_KEY=sk-YOUR_API_KEY npx ppq-private-mode   # starts on 127.0.0.1:8787
```

The proxy also speaks the Anthropic Messages API, so Claude Code and other Anthropic-SDK clients work against it directly. The core service itself is not open-source. Machine pointer: `ppq.ai/llms.txt`.

## Gotchas

- **The accountless L402 path does not include chat.** See the callout above — this is the single most important thing to check before designing around this service. Image, video and data-enrichment endpoints are accountless; LLM calls are not.
- It is a **centralized custodial gateway** to third-party providers — PPQ proxies your prompts upstream. Only the **`private/` TEE tier** (hardware-attested enclave + client-side encryption) keeps content unreadable to PPQ; the standard models do not.
- **The private tier is not more sovereign, it is more private.** It still needs an `sk-` key and a funded balance, and it adds a local proxy process you have to keep running. It reduces what PPQ can *read*, not what PPQ can *withhold*.
- The no-account L402 path stores the payment credential on your side — lose the token/preimage and you lose the call you paid for.
- Funding by card introduces KYC; the crypto funding paths do not. **NWC auto-topup is the one to reach for if the agent runs unattended** — otherwise a drained balance stops it silently.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

**This card was `featured: true` and carried a headline claim that measurement contradicted.** It said PPQ gives "hundreds of frontier chat, image, video, and audio models that you can pay for per request over Lightning / L402 with no account or API key required," and the directory entry rated it `api-no-account` under `inference/llm`. The vendor's own `llms.txt` enumerates the 402-enabled endpoints and chat is not one of them; probing confirmed it — 401 on `/v1/chat/completions`, 402-with-invoice on `/v1/images/generations`, same host, same absent header, so the control exercised the mechanism under test. **An agent searching this directory for accountless LLM inference was being sent somewhere that returns 401.**

**Directory rating changed `api-no-account` → `api-account`,** because the entry is categorised `inference/llm` and the llm path is the one that needs the account. The accountless capability is real and is stated in full on both surfaces — it just belongs to a different product surface than the one the entry describes.

**⚑ `featured: true` is left in place; changing it is an owner decision, not an editorial one.** The argument for keeping it: PPQ is deeply Bitcoin-native on funding (Lightning, on-chain, Liquid), and **NWC auto-topup is genuinely the best unattended-agent funding mechanism on any card in this directory** — that deserves emphasis. The argument against: the card is featured in an *inference* category on a bar that rewards accountless access, and it no longer meets that bar for inference. Recommendation to the owner: **keep it featured, on the NWC-auto-topup strength, now that the access split is stated honestly on both surfaces** — the reason to feature it changed, and the card now says which reason.

**Method note worth keeping.** This card had gone six weeks without a re-read while `featured`. Nothing broke; nothing 404'd; every link resolved. **The claim rotted while every automated check stayed green** — which is precisely what the venue-status rule was written for, and the first time it has caught an *access rule* rather than a shutdown.
