# LNVPS

> VPS compute — provision a server with Nostr login and fund it in sats

A Lightning-native VPS host with Nostr login and no KYC — pay in sats, fund via NWC, spin up a server by API. The most agent-native compute on the consume side.

- Category: compute / vps
- Payment methods: lightning, nwc
- Payment detail: Lightning (sats), fundable via NWC — no card required (card and on-chain are also accepted)
- KYC: none
- Custody: n/a (pay-and-receive)
- Automatability: api-no-account — API with no account — payment or a key is the credential; zero human onboarding
- Auth: Nostr key is the identity — NIP-98 HTTP auth on the API (NIP-07/NIP-46 for the web login). No email and no KYC on the Nostr path; a login provider is also offered.
- API base: https://api.lnvps.net
- Quickstart: Follow the vendor's own agent skill at lnvps.net/SKILL.md: POST an SSH key, pick an image and template, POST /api/v1/vm, then GET /api/v1/vm/{id}/renew?method=lightning, pay, and poll until the box is running. All requests are NIP-98 signed.
- Direction: consume
- Maintainer: LNVPS (Apex Strata Ltd, Ireland)
- Site: https://lnvps.net
- Docs/API: https://github.com/LNVPS/api
- Full card (verified detail, gotchas): https://bitcoineconomy.ai/services/lnvps
- Provenance: curated (last verified 2026-08-07)

---

Part of the [Agent Marketplace](https://marketplace.bitcoineconomy.ai/) · registry JSON: https://marketplace.bitcoineconomy.ai/directory.json · full thesis: https://bitcoineconomy.ai/case
