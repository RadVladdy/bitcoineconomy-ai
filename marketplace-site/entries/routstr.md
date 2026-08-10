# Routstr

> LLM inference — OpenAI-compatible API calls from independent providers

A decentralized AI-inference marketplace where a Cashu token is the API key — pay per request in private Bitcoin ecash, no login, no KYC.

- Category: inference / llm
- Payment methods: cashu, lightning
- Payment detail: cashu ecash over Lightning (bearer token = API key)
- KYC: none
- Custody: self-custodial (bearer Cashu tokens)
- Automatability: api-no-account — API with no account — payment or a key is the credential; zero human onboarding
- Auth: none — a funded Cashu token is the API key
- Pricing: https://routstr.com/models
- Quickstart: Routstr is a NODE NETWORK, not one endpoint — there is no canonical api_base, and the team's own api.routstr.com has left the network (404 on every path; absent from the live provider directory). Discover a node first: browse https://routstr.com/providers, or read Nostr kind 38421 announcements from any node's /v1/providers/ (e.g. https://routstr.otrta.me/v1/providers/). Then call {node}/v1 as an OpenAI-compatible base URL, paying per request with Cashu. Easiest path for an agent: `routstrd`, their local routing daemon, which discovers nodes over Nostr and fails over automatically. This directory's own /live/models.json prices models across the live nodes.
- Direction: consume + offer
- Maintainer: Routstr
- Site: https://routstr.com
- Docs/API: https://docs.routstr.com
- Repo: https://github.com/Routstr
- Full card (verified detail, gotchas): https://bitcoineconomy.ai/services/routstr
- Provenance: curated (last verified 2026-06-02)

---

Part of the [Agent Marketplace](https://marketplace.bitcoineconomy.ai/) · registry JSON: https://marketplace.bitcoineconomy.ai/directory.json · full thesis: https://bitcoineconomy.ai/case
