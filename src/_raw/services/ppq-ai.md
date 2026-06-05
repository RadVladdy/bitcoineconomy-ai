---
name: PPQ.AI (PayPerQ)
slug: ppq-ai
layer: services
collection: services
tagline: Pay-per-query access to hundreds of frontier models over Lightning / L402 — no account, no API key, roughly a cent and a half a query.
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
last-verified: 2026-06-02
order: 41
tags:
  - ppq
  - payperq
  - l402
  - lightning
  - llm-api
  - pay-per-query
---

## What it is

PPQ.AI (PayPerQ) is a gateway to hundreds of frontier chat, image, video, and audio models (OpenAI, Anthropic, Perplexity, Meta, and more) that you can pay for **per request over Lightning / L402 with no account or API key required**. Average query cost is around 1.5¢, with top-ups from about 10¢. It is another live instance of "an agent pays for its own inference" — the simplest on-ramp for an agent to buy frontier-model calls without provisioning provider accounts.

It also publishes a `/llms.txt` and an API surface designed to be consumed directly by agents.

## When to use it

- Quick, accountless access to many models behind one pay-per-call endpoint.
- Agents that need to buy inference on demand without managing per-provider API keys.
- Lightning-native metering of model usage.

## Dependencies & payment

**Dependencies:** a [Lightning / L402](/tools/l402) wallet or L402-capable client — no account and no API key on the Lightning path — or a funded top-up balance; the optional `ppq-private-mode-proxy` adds TEE-backed private mode. **Payment:** Lightning / L402, pay-per-query (~1.5¢ a query; top-ups from ~10¢); credit-card funding is available but adds KYC.

## Quick start

Use the no-account L402 flow or top up a balance, then call the API documented at `ppq.ai/api-docs` (machine pointer at `ppq.ai/llms.txt`). The open-source `ppq-private-mode-proxy` repo provides a local encryption proxy for TEE-backed "private mode" models; the core service itself is not open-source.

## Gotchas

- It is a **centralized custodial gateway** to third-party providers — PPQ proxies your prompts upstream. Only the optional "private mode" (TEE + local encryption proxy) keeps content unreadable to PPQ.
- The no-account path stores balance and usage locally — losing local state or the payment credential can lose access.
- Funding by credit card introduces KYC; the Lightning/no-account path is the privacy-preserving one.
