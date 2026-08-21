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
payment: subscription (card, or Bitcoin — see the card on what could not be re-confirmed) + usage credits
identity: account (email / Google / GitHub)
custody: n/a (TEE-attested, end-to-end-encrypted inference)
kyc: none
bitcoin-native: false
status: published
last-verified: "2026-08-20 (claims exercised against the vendor's own proxy documentation: the model roster is still SEVEN and all four this card named are still on it; API access still gated to Pro/Team/Max from $20/month; streaming-only stated outright by the vendor; the Docker image, MAPLE_BACKEND_URL and localhost:8080/v1 all match verbatim. ONE CLAIM COULD NOT BE RE-CONFIRMED and is softened rather than re-certified: the yearly-only 10% Bitcoin discount — the live pricing page shows a Pay with Bitcoin option against monthly plans with no discount or yearly-only language anywhere on it, and the terms sit behind a checkout this verification cannot reach.)"
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
- Models on offer are open-weight families — **seven**, priced per million tokens: `kimi-k2-6`, `gpt-oss-120b`, `deepseek-v4-pro`, `glm-5-1`, `llama3-3-70b`, `qwen3-vl-30b` and `gemma4-31b`, the cheapest roughly a quarter the price of the dearest. Pick Maple for privacy, not for closed frontier models.

## Dependencies & payment

**Dependencies:** a Maple account (email / Google / GitHub — no KYC) on a **Pro, Team, or Max plan** (API access starts at $20/month on Pro, $30/user on Team, $100 on Max, with usage credits on top, extra credits sold from $10), an **API key** from the account's API Management page, and the **Maple Proxy** running locally or in infrastructure (Docker: `ghcr.io/opensecretcloud/maple-proxy`, pointed at `enclave.trymaple.ai`). **Payment:** card, or **Bitcoin**, via the human checkout — the pricing page carries a *Pay with Bitcoin* option. This card previously specified that route as yearly-plans-only at a 10% discount; on re-verification in August 2026 neither condition appears anywhere on the live pricing page, and the actual terms are only visible inside a checkout, so treat the specifics as unconfirmed and read them at the venue before relying on them. The agent drives the API; the operator funds the account — there is no sats-per-call path here.

## Quick start

Subscribe (Pro+), create an API key, run the proxy (`docker run -p 8080:8080 -e MAPLE_BACKEND_URL=https://enclave.trymaple.ai ghcr.io/opensecretcloud/maple-proxy:latest`), then point any OpenAI client at `http://localhost:8080/v1` with the key as the Bearer token.

## Gotchas

- **The Bitcoin leg is not agent-automatable:** Bitcoin pays the *subscription*, through a human dashboard checkout, not the API calls. An agent can't top up Maple in sats mid-run — for sats-native pay-per-call inference, see [Routstr](/services/routstr) — [PPQ.AI](/services/ppq-ai)'s accountless path covers images, video and data enrichment, not chat.
- **Streaming-only API** — the proxy currently supports streaming responses only; non-streaming clients need adjustment.
- Subscription + credits is a **commitment model**, not pay-per-use — wrong shape for sporadic workloads.
- Privacy claim is strong but scoped: the TEE protects *content from the provider*; the account layer (login identity, billing) is ordinary account data.
