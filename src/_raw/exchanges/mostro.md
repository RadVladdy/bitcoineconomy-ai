---
title: Mostro
slug: mostro
type: exchange-card
category: p2p-noncustodial
featured: false
kyc: none
custody: self-custody (Lightning hold-invoice escrow)
lightning: true
stablecoins: []
fiat: true (P2P — bank transfer / cash, human-executed leg)
agent-access: protocol (Nostr events + CLI; the fiat leg is human)
bridges:
  - BTC↔fiat (peer-to-peer)
trust-model: p2p-hold-invoice
links:
  site: https://mostro.network
  repo: https://github.com/MostroP2P
status: v0-2026-06-11-structural-verified
links-verified: "2026-08-20 (site re-read, not pinged: the no-KYC claim is stated outright by the venue — no registration, email or phone, identity generated client-side behind a 12-word recovery phrase — and the hold-invoice escrow description matches this card. Org repos all pushed within days: mostro v0.18.5, mobile, mostrix, mostro-cli. Fees/dispute mechanics still deferred to the venue.)"
---

**What it is.** A peer-to-peer, non-custodial protocol for exchanging **Bitcoin against bank fiat or cash** over **Nostr**, with **no registration, no identity checks, no KYC**. Free and open-source software, supported by OpenSats and the Human Rights Foundation.

**How custody works.** **Lightning hold invoices** act as the escrow: the seller's sats stay locked in the seller's own wallet until they confirm the fiat arrived, then release instantly. Minimal, non-permanent custody — no platform balance to freeze.

**What it bridges.** BTC ↔ bank fiat / cash — the one direction the no-KYC swap services above don't reach. The price: the fiat leg is a **human action** (a bank transfer or a cash handoff), settled peer-to-peer against the order book peers post.

**Privacy.** Identities are client-generated keys with **per-trade ephemeral keys**, preventing trade linking; communications are end-to-end encrypted over Nostr.

**Agent access.** A published **protocol specification** (Nostr event formats, now on its own documentation site) plus clients (mobile app, a web client, the Mostrix terminal UI, CLI) — an agent can programmatically post and take orders and manage the escrow leg, but **cannot complete a trade end-to-end alone**: the fiat side needs the human (or the counterparty's human). For agents this is operator-assisted, not autonomous.

**Caveats.** P2P counterparty risk is the structural trade-off the hold-invoice escrow only partially bounds; liquidity is whatever the order book holds in your currency and region; dispute mechanics and fees are the venue's — verify current details there. Note that "Mostro" is a role, not a single operator: several Mostro nodes compete, users rate them, and the project now ships reputation tooling of its own — so counterparty diligence covers the *node* you route through as well as the person on the other side of the trade.
