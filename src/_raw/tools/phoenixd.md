---
name: phoenixd
slug: phoenixd
layer: wallets
toolbox-group: wallets
tagline: ACINQ's self-custodial Lightning server for machines — no signup, no channel management, and an HTTP API that lets an agent hold its own keys, pay, get paid, and sign LNURL-auth logins.
tool-type: software
maintainer: ACINQ
repo: https://github.com/ACINQ/phoenixd
docs: https://phoenix.acinq.co/server/api
site: https://phoenix.acinq.co/server
license: Apache-2.0
stack-section: "§2"
latest-release: v0.9.0
release-date: "2026-07-13"
status: published
last-verified: 2026-08-03
order: 38
prereq-tier: keys-only
prereqs:
  - "a server you control (Linux x86/ARM, macOS, or Windows via WSL) — a small VPS is enough"
  - "bitcoin to fund the first channel; inbound liquidity is handled for you"
tags:
  - phoenixd
  - acinq
  - lightning
  - self-custody
  - wallet
  - lnurl-auth
  - agent-wallet
---

## What it is

**phoenixd** is the server-side sibling of ACINQ's Phoenix mobile wallet: a self-custodial Lightning node you run as a daemon, written in Kotlin Multiplatform and shipped as native binaries for Linux (x86 and ARM), macOS, and Windows/WSL. It is Apache-2.0 licensed, needs no email and no signup, and — the part that matters here — it does **no channel management**. Liquidity is automated, so the operator never opens a channel, rebalances, or watches for a stuck payment.

That combination is why it keeps turning up as the answer to *"how does a software agent hold its own money?"* Everything an agent needs is one HTTP call away: create an invoice, pay an invoice, pay a BOLT12 offer, pay a Lightning address, run an LNURL-pay, sign an **LNURL-auth** challenge, send on-chain. The keys stay on the agent's own server.

## When to use it

- **Giving an autonomous agent a wallet of its own** on a VPS it already runs — the shortest path from "my agent has a server" to "my agent can pay and be paid."
- **A2A (agent-to-agent) payments** where a human is never going to be around to babysit inbound liquidity.
- **Key-based login** — the LNURL-auth endpoint means the agent's node key doubles as its credential at any service that accepts LNURL-auth, with no username or password anywhere.
- Small services, tipping endpoints, and paywalled APIs where the operator wants self-custody without becoming a node operator.

## Dependencies

A server you control and some bitcoin to get started. No account, no KYC, no external wallet provider. Channels and inbound liquidity are established automatically with ACINQ as the counterparty (see Gotchas), and payment notifications arrive by webhook or websocket.

## Quick start

Download the binary from `github.com/ACINQ/phoenixd` (or build with `./gradlew linuxX64DistZip`), run it, and read the generated passwords out of `~/.phoenix/phoenix.conf`. Then it is plain HTTP with Basic auth — `POST /createinvoice` to get paid, `POST /payinvoice` to pay, `POST /lnurlauth` to sign a login challenge. Full endpoint reference at `phoenix.acinq.co/server/api` (documented for v0.9.0).

## Gotchas

- **⚠ The API gives access to your funds and must not be exposed to the internet.** ACINQ's own documentation says this in as many words. Bind it to loopback, reach it over a tunnel or private network, and treat the primary password like a spending key. An agent that can reach the API can drain the wallet — this is the single most important line on this card.
- **Two password tiers — use the weaker one.** `http-password-limited-access` cannot call `payinvoice`, `payoffer`, `paylnaddress`, `lnurlpay`, `lnurlauth`, `sendtoaddress`, `closechannel`, or `export`. Any agent component that only needs to *receive* should hold that one, not the primary. The split exists precisely for delegating to something you trust less than yourself.
- **Self-custodial, but not counterparty-free.** Automated liquidity means ACINQ is your channel peer. Your keys are yours and you can force-close, but the convenience is bought with a specific, named dependency, and ACINQ publishes **~1% on receive** as the price of it. Compare against running your own LND/CLN before assuming it is free.
- **It is a wallet, not a treasury.** Hot keys on a networked server are the right shape for an operating balance and the wrong shape for reserves. The two-tier split — hard settlement below, working balance above — is the whole point of [[Treasury|the Treasury surface]].

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Fills a real hole: phoenixd was named in [[Quickstart]] as an adoption path but had no card, so the site's most-asked practical question ("what wallet does the agent actually run?") pointed at a passing mention. Carded 2026-08-03 off the TFTC × Vinny episode (2026-08-01), where Marty Bent's OpenClaw agent researched its own options, chose phoenixd unprompted, ran the submarine swap, and then used the LNURL-auth endpoint to log into LN Markets — the primary-source demonstration that the endpoint list on this card is not theoretical. Verified against the repo, the v0.9.0 API reference, and the ACINQ product page the same day; the ~1% receive fee and the "must not be accessible from the outside world" warning are both ACINQ's own words, quoted deliberately rather than softened.

Agent-access is genuinely `api` and the auth model is `none` in the account sense (no signup) but password-gated in practice — that nuance is why the directory overlay carries `auth: api-key` rather than `none`. Do not simplify it to "no auth" in the connect block.

**Publications backlinks**

- [[Quickstart]] (this project) — the self-sovereign adoption pathway this equips
- [[Stack]] (this project) — §2 payment layer
- [[lnurl]] (this project) — the LNURL-auth primitive phoenixd can sign
- [[ln-markets]] (this project) — a venue that accepts LNURL-auth sign-in
