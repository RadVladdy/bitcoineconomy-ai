---
name: Maple AI
slug: maple
layer: services
collection: services
tagline: End-to-end-encrypted AI inference an agent can drive through an OpenAI-compatible API — TEE-attested privacy, Bitcoin-accepted subscriptions.
tool-type: service
category: private-inference
featured: false
two-sided: consume
maintainer: OpenSecret
site: https://trymaple.ai
docs: https://blog.trymaple.ai/maple-proxy-documentation/
payment: subscription (card, or Bitcoin on yearly plans at a 10% discount) + usage credits
identity: account (email / Google / GitHub)
custody: n/a (TEE-attested, end-to-end-encrypted inference)
kyc: none
bitcoin-native: false
status: published
last-verified: 2026-06-11
order: 42
tags:
  - maple
  - opensecret
  - private-inference
  - tee
  - encrypted
---

## What it is

Maple AI (by OpenSecret) is **private inference**: every prompt and response runs inside a **Trusted Execution Environment** with end-to-end encryption, so the content is unreadable to anyone — including Maple. The server code is open source and the TEE attestation is cryptographically verifiable ("don't trust, verify" is their own framing). For an agent, the entry point is **Maple Proxy**: a lightweight, self-hosted proxy (Docker image, or bundled in the desktop app) exposing standard **OpenAI-compatible endpoints** (`/v1/models`, `/v1/chat/completions`) against the encrypted backend — so any OpenAI client library, LangChain, or LlamaIndex works unchanged.

It is the privacy-axis peer of PPQ.AI and Routstr: where those are sats-native and pay-per-call, Maple is subscription-based but provably blind to your content.

## When to use it

- An agent's workload is **content-sensitive** — prompts that shouldn't be readable by any provider, with hardware-attested proof rather than a policy promise.
- The operator wants mainstream tooling compatibility: one API key, OpenAI-compatible calls, drop-in with existing frameworks.
- Models on offer are open-weight families (seven at last check, including kimi-k2-6, gpt-oss-120b, deepseek-v4-pro, llama3-3-70b) — pick Maple for privacy, not for closed frontier models.

## Dependencies & payment

**Dependencies:** a Maple account (email / Google / GitHub — no KYC) on a **Pro, Team, or Max plan** (API access starts at $20/month, with usage credits on top), an **API key** from the account's API Management page, and the **Maple Proxy** running locally or in infrastructure (Docker: `ghcr.io/opensecretcloud/maple-proxy`, pointed at `enclave.trymaple.ai`). **Payment:** card, or **Bitcoin at a 10% discount — yearly subscriptions only**, via the human checkout. The agent drives the API; the operator funds the account — there is no sats-per-call path here.

## Quick start

Subscribe (Pro+), create an API key, run the proxy (`docker run -p 8080:8080 -e MAPLE_BACKEND_URL=https://enclave.trymaple.ai ghcr.io/opensecretcloud/maple-proxy:latest`), then point any OpenAI client at `http://localhost:8080/v1` with the key as the Bearer token.

## Gotchas

- **The Bitcoin leg is not agent-automatable:** Bitcoin pays the *subscription* (yearly plans, dashboard checkout), not the API calls. An agent can't top up Maple in sats mid-run — for sats-native pay-per-call inference, see [Routstr](/services/routstr) or [PPQ.AI](/services/ppq-ai).
- **Streaming-only API** — the proxy currently supports streaming responses only; non-streaming clients need adjustment.
- Subscription + credits is a **commitment model**, not pay-per-use — wrong shape for sporadic workloads.
- Privacy claim is strong but scoped: the TEE protects *content from the provider*; the account layer (login identity, billing) is ordinary account data.
