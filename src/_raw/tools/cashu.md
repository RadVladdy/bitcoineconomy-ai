---
name: Cashu
slug: cashu
layer: ecash
tagline: Chaumian bearer ecash on Bitcoin — instant, private, lightweight tokens an agent can hold and spend without channels or accounts.
tool-type: protocol
maintainer: Cashu (calle / OpenSats)
repo: https://github.com/cashubtc
docs: https://cashubtc.github.io/nuts/
site: https://cashu.space
x: "@cashubtc"
stack-section: "§3"
status: published
last-verified: 2026-06-02
order: 20
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
- Bearer-token API access patterns (see [Routstr](/tools/routstr), where the token *is* the API key).

## Quick start

Run or connect to a mint with the reference implementation, **Nutshell** (`github.com/cashubtc/nutshell`), or build on a client SDK such as **CDK** (Rust, `github.com/cashubtc/cdk`). The NUTs spec at `cashubtc.github.io/nuts` defines token format and mint operations. Check the repo's releases page for the current version before deploying.

## Gotchas

- **Mints are custodial trust points** — a malicious or insolvent mint can lose the ecash it issued. Diversify across independent mints rather than concentrating balance in one.
- Bearer model: losing the token means losing the funds, with no chargeback or recovery without the mint's cooperation.
- Mint upgrades can involve database migrations — back up before upgrading, per release notes.
