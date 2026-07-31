---
name: l402.space
slug: l402-space
layer: services
collection: services
tagline: A universal 402 gateway — pay it in sats over Lightning and it pays the upstream API on your behalf in USDC or Tempo stablecoins, so an agent holding only bitcoin can buy from endpoints that don't accept bitcoin.
tool-type: service
category: payments-gateway
featured: false
two-sided: consume
maintainer: Alby
docs: https://l402.space/docs
site: https://l402.space
payment: per-call, priced in your own rail — L402 or MPP over Lightning, x402 (USDC on Base/Solana), or MPP over Tempo; the quote is the upstream's price plus a gateway markup and routing fee
identity: none — no signup and no API key; the whole interface is a URL scheme plus the standard HTTP 402 challenge/retry
custody: the gateway holds the sats you pay it and settles upstream from its own USDC/Tempo float — a custodial hop for the duration of the call
kyc: none
bitcoin-native: true
status: published
last-verified: 2026-07-29
order: 60
tags:
  - l402-space
  - alby
  - gateway
  - l402
  - x402
  - mpp
  - lightning
  - interoperability
---

## What it is

l402.space is a **paid proxy that translates between the three HTTP-402 payment protocols**. Paid APIs for agents have split across incompatible rails — **L402** (Lightning sats), **x402** (USDC on Base and Solana), and **MPP** (Lightning or Tempo stablecoins) — and an agent can normally only buy from the slice its own wallet speaks. The gateway removes that constraint: you pay *it* over your rail, it pays the upstream API over whichever rail *that* API requires, and it returns the upstream's response to you unchanged.

The interface is deliberately minimal. URL-encode the full upstream URL, append it to `https://l402.space/`, and send your request; your HTTP method and body are forwarded untouched. If the upstream charges, you get a `402` back carrying payment challenges for every inbound rail the gateway accepts, plus a JSON body stating the price in sats and dollars. Pay over your rail, retry the same URL with that rail's credential header, and the response comes back. Dedicated single-protocol endpoints (`/l402/`, `/x402/`, `/mpp-lightning/`, `/mpp-tempo/`) are available if you'd rather not parse the multi-rail challenge. There is no signup, no API key, and no account — the standard 402 flow *is* the authentication. If the upstream turns out to be free, the gateway simply proxies it and no payment happens.

Built by **Alby**, the team behind the Alby browser extension, Alby Hub, and the NWC tooling already listed in [the Stack](/stack). Alongside the proxy it publishes a live directory of every host it has seen settle (`/api/services`) with observed price ranges, transaction volume and delivery-success rates, plus aggregate stats, an OpenAPI 3.1 spec, an `llms.txt`, and a public spend-float monitor.

## When to use it

- An agent holds only bitcoin, and the API it needs prices in USDC over x402 — the common case, since x402 endpoints outnumber L402 endpoints by roughly 65 to 1.
- Testing whether your wallet can pay a given rail at all: `GET /l402/ping` or `/x402/ping` settles a ~1-sat challenge and returns `{pong: true}`.
- Reaching a one-off endpoint where standing up the other rail's wallet costs more than the call is worth.
- Discovery: `/api/services` is a short, real list of paid APIs with actual settlement behind them, which is a different and in some ways stronger signal than a crawler's endpoint count.

**When not to use it.** Any endpoint that already accepts Lightning or L402 directly — paying it through a gateway adds a markup, a routing fee, and a trusted third party for no benefit. The directory labels rows `bitcoin-native` or `via-gateway` precisely so an agent can prefer the former.

## Dependencies & payment

Nothing to install and nothing to register. You need a wallet that speaks one of the four inbound rails: L402 or MPP over Lightning, x402 (USDC on Base or Solana), or MPP on Tempo. Alby publishes a payments skill (`npx skills add getAlby/payments-skill`) and a CLI (`npx -y @getalby/cli@latest fetch <url> --max-amount 1000 --currency BTC --unit sats --network lightning`) that handle the challenge/retry loop; any standard x402 or mppx client works on the matching dedicated endpoint.

Pricing is the upstream's own price plus a gateway markup and a routing fee, converted into your rail's currency. **The quote in the 402 challenge is authoritative — you never pay more than it states.** Receipts are reusable: one payment buys one upstream settlement, but the credential you retried with keeps working for follow-up requests that same upstream payment covers (polling an async job, or querying a prepaid upstream), and replaying it never charges twice. When the underlying upstream credential is spent you get a clean `402` asking for a new payment.

## Quick start

```
curl "https://l402.space/https%3A%2F%2Fx402.twit.sh%2Ftweets%2Fuser%3Fusername%3Dgetalby"
```

Returns `402` with a challenge and a price. Pay the BOLT11 invoice in the `WWW-Authenticate: L402` header with any Lightning wallet, then retry the same URL with `Authorization: L402 <token>:<preimage>` (preimage = lowercase 64-char hex). The gateway pays `x402.twit.sh` in USDC and hands you back its response. Machine-readable entry points: [`/llms.txt`](https://l402.space/llms.txt), [`/openapi.json`](https://l402.space/openapi.json), [`/api/info`](https://l402.space/api/info).

## Gotchas

- **It is a custodial hop, and that is the whole trade.** You hand sats to an intermediary that holds a USDC/Tempo float and pays out of it. For the duration of the call, an unfreezable asset is routed through a party that can be frozen, subpoenaed, or simply run out of float. That is a genuine dependency, not a detail — prefer a directly payable endpoint whenever one exists.
- **Very early.** The gateway's own stats at listing (2026-07-29): **848 transactions, $34.97 of lifetime volume, 157 endpoints, 38 domains.** A working demonstration, not a market. Don't size a dependency on it yet.
- **The float can run dry.** `/health/balances` returns `503` with a `needs topup on <network>` reason when any funded float (Lightning, Base/Solana USDC, Tempo USDC.e) runs low — an honest disclosure, and a live failure mode to handle. A `503` from the gateway means it temporarily cannot issue a challenge; retry later.
- **You pay a spread.** Markup plus routing fee on every call, on top of the upstream's price. Fine for occasional access; a real cost at volume, and a reason to push a frequently-used upstream to accept Lightning directly instead.
- **Not a discovery layer for Bitcoin-native services.** Its directory reflects what has settled *through the gateway*, which skews toward endpoints that needed translating — i.e. mostly non-Lightning ones.
- **The upstream is still the upstream.** `404`–`5xx` responses are passed through after delivery; paying the gateway does not make a broken API work, and the payment is spent either way.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Surfaced 2026-07-29 from the @getAlby launch thread; probed live the same day (`/api/info`, `/api/stats`, `/api/services`, `/docs`, `/llms.txt` all answering). **Directory: `payments` / `gateway`, automatability `api-no-account`** — clears the inclusion bar easily (no registration, real API, live 402 challenges on four rails).

Thesis read, and it needs holding in two hands. This is the **strongest practical answer yet to the "nothing to buy with Lightning" objection** — the single most honest criticism of our argument — and it comes from a Bitcoin-native team, which makes it a Border-Skirmishes exhibit of the best kind: the sovereign stack building the interface on its own terms rather than being absorbed. It also **cuts against us**, and the card says so in the body rather than hiding it here: a working bridge relieves exactly the pressure that would otherwise pull merchants onto L402 directly, and it reintroduces a freeze surface the Independence Doctrine exists to eliminate. Both are true; the Field Notes entry (2026-07-29) carries the full two-handed read and a dated falsifier — if gateway volume climbs while L402 merchant adoption stays flat over 2–4 quarters, the pressure-release effect is the dominant one.

Infrastructure note: this is now **load-bearing on our own directory**, not just a card. The marketplace ingests `/api/services` as its fourth source (`gateway-observed`) and mints a `gateway_url` for every x402/MPP row, which is why the merged table needed a `rail` field — "payable" had to stop meaning one thing. That we depend on it is itself a reason to keep the custodial-hop language prominent and un-softened.

Relationship angle: Alby is already carded (Alby NWC in the tool catalog) and `hello@getalby.com` explicitly invites listings. Warm two-way outreach is open — ask them to list the marketplace, and tell them we're carrying their data. Their `payments-skill` is also a Skills-page candidate (we ship six skills and none from Alby). Not actioned — outreach is an editorial decision, not a gap in this card.
