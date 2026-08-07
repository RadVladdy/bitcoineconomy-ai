---
title: RailsX
slug: railsx
type: exchange-card
category: noncustodial-swap
featured: false
kyc: none
custody: self-custody
lightning: true
stablecoins: [USDT, USDC]
fiat: false
agent-access: limited
bridges:
  - Lightning BTC↔stablecoin (P2P atomic swap)
trust-model: cryptographic-atomic
links:
  site: https://amboss.tech/blog/railsx-launch
status: v0-2026-06-27-structural-verified
links-verified: 2026-08-07 (both Amboss RailsX posts read; site link repointed, launch date and Taproot Assets mechanism corrected)
---

**What it is.** Amboss's Lightning-native, peer-to-peer decentralized exchange — **unveiled 2026-01-23 at the PlanB Forum and live since 2026-04-28** — executing **bitcoin ↔ stablecoin** trades entirely over the Lightning Network, with no separate chain and no custodial order book.

**What it bridges.** Bitcoin ↔ **USDT-L / USDC-L** — stablecoins wrapped on **Taproot Assets** (built and deployed by Speed, not issued natively on Lightning by Tether or Circle). A trade starts in a bitcoin Lightning channel, routes through the network, and completes in a **Taproot Asset channel** denominated in the stablecoin; because the payment is atomic end to end, the swap is atomic too.

**How it works.** Trades execute as **circular self-payments**: funds route out through existing Lightning channels, swap atomically, and loop back to the sender — so either the swap completes or it doesn't, with no custody handover in between.

**Agent access.** **No public trading API is documented.** Access is through **Thunderhub** — Amboss's stated delivery vehicle: *"To access RailsX Trading, update Thunderhub to the latest version and connect litd."* Trading runs inside the node interface an operator already runs, with no separate install, which makes it scriptable by whoever drives Thunderhub but **not** a programmatic endpoint. Carded for reference; it sits below the directory's machine-actionable bar until a documented API exists.

**Custody.** Self-custodial / Lightning-native — you trade from your own channels, not a venue-held balance.

**Dependencies.** A Lightning node running **Thunderhub with `litd` connected**, Lightning capacity to route the swap, and a **Taproot Asset channel** for the stablecoin leg. Verify supported pairs, fees, and regional availability on the venue.

**Gotchas.** The atomic Lightning execution protects **custody** (you don't hand funds to a counterparty mid-swap) — it does **not** make the stablecoin legs censorship-resistant: USDT/USDC remain issuer-freezable by Tether/Circle. There is a **third party in the stablecoin leg** beyond the issuer: USDT-L and USDC-L are Speed's Taproot-Assets wrappers, so the wrapper is a dependency on top of Tether's and Circle's freeze surface. Live since April 2026; no public API; confirm pairs, fees, and availability before relying on it.

**Links.** [RailsX launch post](https://amboss.tech/blog/railsx-launch) · [the January unveiling](https://amboss.tech/blog/railsx-first-lightning-native-dex) · [amboss.tech](https://amboss.tech). *(Amboss's site has no RailsX product page — it is absent from the nav, footer, products list and sitemap; these two posts are the only primary pages, and `railsx.io` serves an empty redirect stub.)*
