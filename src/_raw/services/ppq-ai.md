---
name: PPQ.AI (PayPerQ)
slug: ppq-ai
layer: services
collection: services
tagline: Pay-per-query access to hundreds of frontier models over Lightning / L402 — no account, no API key, roughly a cent and a half a query — now including end-to-end-encrypted private models.
tool-type: service
category: inference-gateway
featured: true
two-sided: consume
maintainer: PayPerQ
repo: https://github.com/PayPerQ
docs: https://ppq.ai/api-docs
site: https://ppq.ai
x: "@PPQdotAI"
payment: lightning / L402 (no account)
custody: custodial gateway
kyc: none (Lightning path)
bitcoin-native: true
stack-section: "§5"
status: published
last-verified: 2026-06-28
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

PPQ.AI (PayPerQ) is a gateway to hundreds of frontier chat, image, video, and audio models (OpenAI, Anthropic, Perplexity, Meta, and more) that you can pay for **per request over Lightning / L402 with no account or API key required**. Average query cost is around 1.5¢, with top-ups from about 10¢. It is another live instance of "an agent pays for its own inference" — the simplest on-ramp for an agent to buy frontier-model calls without provisioning provider accounts.

It also runs a **private-inference tier**: a set of models served inside **TEEs** (trusted execution environments, on NVIDIA confidential-computing GPUs) with **end-to-end encryption** — prompts are encrypted in your browser and decrypted only inside the hardware-attested enclave, so *"PayPerQ never sees your prompts or responses."* Private models are addressed with a `private/` prefix and currently include `private/glm-5-2` (384K context), Kimi K2.6, GPT-OSS 120B, Llama 3.3 70B, Qwen3-VL 30B, and Gemma 4 31B. It also publishes a `/llms.txt` and an API surface designed to be consumed directly by agents.

## When to use it

- Quick, accountless access to many models behind one pay-per-call endpoint.
- Agents that need to buy inference on demand without managing per-provider API keys.
- Privacy-sensitive workloads — the `private/` TEE tier keeps prompts unreadable to the gateway.
- Lightning-native metering of model usage.

## Dependencies & payment

**Dependencies:** a [Lightning / L402](/tools/l402) wallet or L402-capable client — no account and no API key on the Lightning path — or a funded top-up balance; the `private/` models add TEE-attested end-to-end encryption (Tinfoil-style encrypted-body protocol), with a local encryption proxy available open-source. **Payment:** Lightning / L402, pay-per-query (~1.5¢ a query; top-ups from ~10¢); credit-card funding is available but adds KYC.

## Quick start

Use the no-account L402 flow or top up a balance, then call the API documented at `ppq.ai/api-docs` (machine pointer at `ppq.ai/llms.txt`). For private inference, prefix the model id with `private/` (e.g. `private/glm-5-2`); the open-source `ppq-private-mode-proxy` repo provides a local encryption proxy. The core service itself is not open-source.

## Gotchas

- It is a **centralized custodial gateway** to third-party providers — PPQ proxies your prompts upstream. Only the **`private/` TEE tier** (hardware-attested enclave + browser-side encryption) keeps content unreadable to PPQ; the standard models do not.
- The no-account path stores balance and usage locally — losing local state or the payment credential can lose access.
- Funding by credit card introduces KYC; the Lightning/no-account path is the privacy-preserving one.
