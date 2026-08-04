---
title: LN Markets
slug: ln-markets
type: exchange-card
category: derivatives-venue
featured: false
custody: custodial-while-trading
lightning: true
stablecoins: [synthetic-USD]
fiat: false
agent-access: api
bridges:
  - Lightning↔trading balance
  - on-chain BTC↔trading balance
  - BTC↔synthetic USD
trust-model: custodial-venue
links:
  site: https://lnmarkets.com
  api-docs: https://docs.lnmarkets.com/en/api
status: v0-2026-08-03-structural-verified
links-verified: 2026-08-03
---

**What it is.** A Bitcoin derivatives venue built on Lightning — perpetual futures with leverage, and a swap between BTC and a synthetic USD balance. Deposits and withdrawals move over Lightning or on-chain, which is what makes it interesting here: an agent can fund a position, hold it, and pull the proceeds back to its own node without a bank anywhere in the loop.

**Agent access.** A documented **REST API at `api.lnmarkets.com/v3/`**, with official **TypeScript and Python SDKs** and a **signet endpoint** for testing against fake money first. Private endpoints are authenticated with signed requests using API keys created in the account profile, and keys carry scoped permissions — **Read** (balances, positions, history), **Trade** (open, modify, close), and **Withdraw** — issued separately. That separation is the useful part for delegation: an agent can be given trade rights and no withdrawal rights.

**Sign-in and identity.** Registration is **email and password with email verification**. **LNURL-auth is supported as an additional sign-in method** — passwordless proof of wallet ownership, with multiple wallets linkable so losing one doesn't lock you out — and TOTP 2FA can be required for withdrawals. Note the shape carefully: LNURL-auth **sits alongside** the email account rather than replacing it, so a Lightning key is a credential here, not a way to skip onboarding.

**How an agent uses it.** Fund the trading balance by paying a Lightning invoice from its own wallet, authenticate to the v3 API with a scoped key, open and manage positions programmatically, then withdraw over Lightning back to a self-custody node. Test the whole loop on signet before it costs anything.

**Custody.** **Funds sit with LN Markets while they are on the platform.** The venue's own framing is that it minimises custody risk rather than eliminating it — instant Lightning deposits and withdrawals, no mandatory holding periods, withdraw at any time — with the explicit advice to deposit only what you are trading and take profits off promptly. That is an honest description of a custodial venue with a short duration of exposure, and it should be read as exactly that: the exposure is short, not absent.

**Gotchas.** Leveraged derivatives can be liquidated, and an autonomous agent running a strategy unattended will be liquidated faster than a human who is watching. The **synthetic USD** balance is a venue-internal position, not a stablecoin an agent can spend anywhere else. **Withdraw permission on an API key is the whole balance** — scope keys down and keep withdrawal rights away from anything running unsupervised. Jurisdictional eligibility and any identity-verification requirements are not documented in the public API docs and are not stated here; check the venue directly before assuming access.

**Links.** [lnmarkets.com](https://lnmarkets.com) · API docs `docs.lnmarkets.com/en/api` · SDKs: [TypeScript](https://github.com/ln-markets/sdk-typescript), [Python](https://github.com/ln-markets/sdk-python).

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Carded 2026-08-03 from the TFTC × Vinny episode, where Marty Bent's agent logged in via LNURL-auth and ran a trend-following strategy autonomously for a month. Verified the same day against the v3 API docs, the security page, and the account page.

**Correction caught in verification, worth remembering:** the working assumption going in — from the podcast framing — was "LNURL-auth login, therefore no account, no KYC handshake." That is **wrong**. LN Markets' own docs are explicit that LNURL-auth is an *additional* sign-in method sitting alongside email/password, and registration requires a verified email address. The card states the real shape. This is the second time this session that a claim which sounded right from a podcast failed against primary sources; the KYC field is **omitted entirely** rather than guessed, per the verify-before-publish rule.

Custody is `custodial-while-trading` rather than plain `custodial` because the honest distinction is duration of exposure, not presence of it — and the neutrality rule means the body states the venue's framing *and* names what it actually is, without editorialising either way. The interesting property for this site is the closed Lightning loop (fund from your own node, withdraw to your own node) and the scoped-key separation, not the trading product.

Does clear the API inclusion bar — documented REST API, agent-drivable, real Lightning rails — so it belongs in the marketplace directory as well as on the Exchange map.

**Publications backlinks**

- [[Exchange]] (this project) — the BTC↔value crossing map this sits on
- [[phoenixd]] (this project) — the wallet that can sign its LNURL-auth challenge
- [[lnurl]] (this project) — the LNURL-auth primitive
- [[Field-Notes-Log]] (this project) — the 2026-08-03 entry citing the autonomous-trading run
