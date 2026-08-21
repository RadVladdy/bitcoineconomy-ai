---
name: Cashu
slug: cashu
layer: ecash
toolbox-group: ecash
tagline: Chaumian bearer ecash on Bitcoin — instant, private, lightweight tokens an agent can hold and spend without channels or accounts.
tool-type: protocol
maintainer: Cashu (calle / OpenSats)
repo: https://github.com/cashubtc
docs: https://cashubtc.github.io/nuts/
site: https://cashu.space
x: "@cashubtc"
stack-section: "§3"
status: published
last-verified: "2026-08-20 (protocol EXERCISED against live mints, not pinged: NUT-06 GET /v1/info answered unauthenticated on two independent public mints, one running Nutshell/0.20.3 and one running cdk-mintd/0.17.5 — both reference implementations this card names, both at their current released versions — each advertising the NUT set including 4, 5, 7-12, 14, 15, 17 and 20. Spec site and both repos 200.)"
order: 20
prereq-tier: wallet
prereqs:
  - "a Cashu wallet"
  - "a mint to issue/redeem tokens whose solvency you trust (diversify across mints)"
  - "a Lightning connection to fund the mint and cash out"
tags:
  - cashu
  - ecash
  - chaumian
  - bearer-token
  - privacy
  - l3
---

## What it is

Cashu is a free, open protocol for **Chaumian ecash** backed by Bitcoin and Lightning. A mint issues blind-signed bearer tokens against a Lightning deposit; because the signatures are blinded, the mint cannot link issuance to redemption, so payments are private by design. Tokens are bearer instruments — possession is title, and value transfers simply by handing over the token, with no on-chain or routing-layer footprint per transfer.

For agents, Cashu is the lightest-weight layer in the stack: no channel management, instant transfer, and a token small enough to pass around like a string. The reference implementation is **Nutshell** (mint + wallet); the protocol itself is defined by the **NUTs** specifications.

## When to use it

- Agent payments that need privacy or must be offline-capable.
- Lightweight wallets where running or managing Lightning channels at the agent layer is overkill.
- Bearer-token API access patterns (see [Routstr](/services/routstr), where the token *is* the API key).
- Paying for a priced MCP tool call — Cashu is a first-class rail in [ContextVM](/tools/contextvm)'s CEP-8 (the `bitcoin-cashu` method), and its bearer model lets an agent attach the token directly to the request, with change for any overpayment returned in the response.

## Dependencies

A Cashu wallet, a mint to issue and redeem tokens (whose solvency you trust), and a Lightning connection to fund the mint and cash out. Diversify across independent mints to spread the custodial trust.

## Quick start

Run or connect to a mint with the reference implementation, **Nutshell** (`github.com/cashubtc/nutshell`), or build on a client SDK such as **CDK** (Rust, `github.com/cashubtc/cdk`) — both are what public mints actually run today, and a mint will tell you which, along with the exact NUTs it supports, from an unauthenticated `GET /v1/info` (NUT-06). That single call is the cheapest way for an agent to decide whether a mint speaks the features it needs before touching it with funds. The NUTs spec at `cashubtc.github.io/nuts` defines token format and mint operations. Check the repo's releases page for the current version before deploying.

## Gotchas

- **Mints are custodial trust points** — a malicious or insolvent mint can lose the ecash it issued. Diversify across independent mints rather than concentrating balance in one. For how to judge a *specific* mint (solvency proofs, ratings/vouches, uptime boards), see [Evaluating an ecash mint](/tools/evaluating-ecash-mints).
- Bearer model: losing the token means losing the funds, with no chargeback or recovery without the mint's cooperation.
- Mint upgrades can involve database migrations — back up before upgrading, per release notes.
