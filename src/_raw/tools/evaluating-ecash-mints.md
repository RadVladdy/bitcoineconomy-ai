---
name: Evaluating an ecash mint
slug: evaluating-ecash-mints
layer: ecash
toolbox-group: ecash
tagline: How to judge whether a Cashu or Fedimint mint is trustworthy — the hard solvency signals, the reputation layer, and the one rule that beats all of them.
tool-type: guide
maintainer: "reference page (this project)"
docs: https://bitcoinmints.com
stack-section: "§3"
status: published
last-verified: 2026-08-07 (ZEUS source read at HEAD; cashu.live and the auditor repo re-probed; NUT expansion sourced)
order: 22
tags:
  - ecash
  - cashu
  - fedimint
  - mint
  - proof-of-reserves
  - ratings
  - trust
  - l3
---

## What this is

Ecash is the lightest layer in the stack — but it is **custodial**: a [Cashu](/tools/cashu) mint or a [Fedimint](/tools/fedimint) federation holds the underlying Bitcoin and issues bearer tokens against it, on a fractional-reserve trust model. The token is only as good as the mint behind it. Because anyone can stand up a mint, the practical question for an agent (or its operator) is not *"is ecash safe?"* but *"is **this** mint one I should hold a balance with?"* This page is how to answer that — the objective signals, the reputation layer, and the rule that matters more than either.

(The [Cashu](/tools/cashu) and [Fedimint](/tools/fedimint) cards cover what each protocol *is* and the single-operator-vs-federated trust split; this page is the **vetting** companion to both.)

## The hard signals (objective)

These are the closest thing to proof, and the strongest filter — though, honestly, **few mints publish all of them yet, so "does this mint publish proofs at all?" is itself a quality signal.**

- **Proof of liabilities + proof of reserves (together).** A serious mint publishes its **mint proofs** (all ecash issued) and **burn proofs** (all ecash redeemed); the difference is its outstanding liability, which must be backed by the Bitcoin it actually holds. A cheating mint can inflate apparent liabilities but cannot fake on-chain reserves — so the two published together are what make solvency *checkable* rather than *trusted*. (Two separate works, one per half. The **liabilities** scheme is `callebtc`'s gist, "A Proof of Liabilities Scheme for Ecash Mints" (May 2023). The **reserves** half is a different paper by different authors — Grunspan & Perez-Marco, "Proof of reserves and non-double spends for Chaumian Mints", arXiv 2306.12783. Don't cite one as the formalization of the other; they sit on opposite sides of the solvency equation.)
- **Keyset rotation / epochs.** A reputable mint runs its signing keys in epochs and rotates them, letting holders migrate tokens to the current keyset and retiring the old one. This bounds the auditable window and blocks a mint from quietly inflating the supply from a retired key. (Covered by **NUT-02**; "NUT" = *Notation, Usage, and Terminology* — the Cashu protocol specs, nothing to do with Nostr.)
- **Trust model.** Single-operator (Cashu) means one party can defect or fail; a federation (Fedimint, minimum 4, commonly 4/7/10, capped at 20 guardians under threshold signatures) reduces — but does not eliminate — that risk. All else equal, distributed custody is the higher-robustness option.
- **Lightning liquidity / uptime.** A healthy mint can pay out instantly; a mint that keeps failing to settle is the leading indicator of distress, well before any formal insolvency.

## The reputation layer (social proof)

Since mints work like local "banks," reputation does a lot of the work. Three kinds of signal exist today:

- **Mint registries / review directories.** **[bitcoinmints.com](https://bitcoinmints.com)** is the primary directory for both Cashu and Fedimint mints — it tracks each mint, its supported NUTs, and **user reviews + vouch counts** signed from Nostr identities. **cashumints.space** is a Cashu-focused sister index with per-mint pages and reliability history.
- **Nostr web-of-trust.** Because reviews are signed by Nostr keys, vetting can run through *your own* social graph: modern wallets surface a mint as higher-reputation when accounts you already follow vouch for it. Trusted operators broadcasting a mint list (or a warning) is a real signal — with the honest caveat that Nostr identities are free to create, so reviews are **sybil-able** and a mint can farm a reputation before exit-scamming.
- **Objective status boards.** Beyond subjective reviews, automated monitors give an empirical read: **calle's Mint Auditor (`audit.8333.space`)** continuously circulates ecash between mints over Lightning and flags any that fail to pay. *(The former `cashu.live` status board is gone — it has served nothing since 2026-05-18 and its backing repo has been unpushed since 2025-12; `github.com/callebtc/cashu-auditor` is now a 404, so use the running service rather than the repo path.)* Uptime and pay-out behavior are harder to fake than star ratings.
- **In-wallet discovery + warnings.** You don't have to chase this down manually: wallets like **ZEUS** ship a **Discover Mints** view — which reads **NIP-87 mint-recommendation events (kind 38000) off Nostr**, filtered to the npubs ZEUS follows, to everyone, or to accounts you name, and points you to bitcoinmints.com to read the reviews yourself. Note what that means for sybil-resistance: the filter is **your own follow graph**, not a registry's moderation. Separately, the Bitcoin Design Guide *recommends* warning a user who pastes a mint with zero vouches or a history of dropping offline.

## The rule that beats all of them: don't concentrate

Even a well-vetted mint can fail, and no proof is perfect. The only fully reliable mitigation is **don't keep meaningful balance in any single mint** — spread funds across several reputable ones and hold small operational amounts. ZEUS's Evan Kaloudis has described an **"automated bank run"** — guiding users to five or six reputable mints and rebalancing between them — but as a **stated intention** (Bitcoin Magazine, May 2025, future tense), and as of August 2026 it is **not shipped**: the phrase appears nowhere in the ZEUS codebase. What ZEUS does ship addresses the same concentration risk from the other end — an **automatic sweep to self-custody** above a per-mint threshold, which moves value out of ecash entirely rather than spreading it across mints. Plan for the shipped behaviour, not the announced one.

## Gotchas

- **Proofs are aspirational, not universal.** The PoL/PoR tooling exists, but most live mints don't publish full proofs yet — treat a mint that *does* as notably more trustworthy, and don't assume one that doesn't is insolvent (most aren't), just unverified.
- **Reviews are gameable.** Vouch counts and Nostr reviews are a starting filter, never a solvency guarantee; weight your own web-of-trust over raw counts.
- **A rating is a snapshot.** Uptime and reputation can change fast; for anything beyond a small float, re-check rather than trusting a once-good mint indefinitely.

## Links

- **[bitcoinmints.com](https://bitcoinmints.com)** — primary Cashu + Fedimint mint registry (reviews / vouches / NUTs). · **cashumints.space** — Cashu-focused index. · **[audit.8333.space](https://audit.8333.space)** — calle's Mint Auditor (live). *(`cashu.live` is dead — no response since 2026-05-18.)*
- Proof-of-liabilities scheme: `callebtc`'s gist "A Proof of Liabilities Scheme for Ecash Mints" (May 2023). For the **reserves** half — a separate work by different authors — see Grunspan & Perez-Marco, "Proof of reserves and non-double spends for Chaumian Mints", arXiv 2306.12783 (note the authors' own published erratum on §3.1). · **[audit.8333.space](https://audit.8333.space)** — autonomous mint auditor *(the old `callebtc/cashu-auditor` repo is a 404)*.
- Protocol context: [Cashu](/tools/cashu) · [Fedimint](/tools/fedimint) · the NUTs specs at `cashubtc.github.io/nuts`.

---

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Built for inbox item 2026-06-04/05 (user request): a link-out page answering "how do I evaluate the quality/trustworthiness of a specific ecash mint," with the **ratings/social-proof systems** requested surfaced explicitly. Placement per the ecash research (`_Product-Ideas-Research` 2026-06-05): a single shared page both the [[Cashu]] and [[Fedimint]] cards defer to from their Gotchas, rather than duplicating the material in each — and referenced from The Stack §3.

**Scope discipline — net-new only.** The Cashu card already says mints are custodial trust points + advises diversifying; the Fedimint card already explains the guardian/threshold "reduced, not eliminated" model. This page deliberately does **not** re-explain those basics — it adds the vetting layer neither card answers: the PoL+PoR audit scheme, keyset/epoch anti-inflation, and the discovery/ratings landscape (bitcoinmints.com, cashumints.space, ZEUS Discover Mint + automated-bank-run, cashu.live, cashu-auditor).

**Fact guard:** NUT = *Notation, Usage, and Terminology* (Cashu specs) — not "Nostr Unified Ecash Transfer Standards." Source: the first line of `github.com/cashubtc/nuts/README.md`. Don't let that drift back. ⚠ **This guard itself carried the wrong expansion (*Utilization*) until 2026-08-07** — which is worse than having no guard, because it instructed the next editor to revert a correct fix. **A guard must cite the source it is defending.**

**~~⛔ PORT BUILD-BLOCKER~~ — RESOLVED, and the note is kept only to stop it being re-derived.** `tool-type: guide` was once absent from the tools-collection enum in `src/content.config.ts`, so porting this page failed the Astro build. **`'guide'` is in the enum now** (verified 2026-08-07) and the page is live with its inbound links resolving. **An instruction to fix something already fixed is a defect in its own right** — it sends the next editor to change working code. The general form is the same one this project keeps meeting: *a guard that encodes a stale fact is worse than no guard.*

**Status.** Promoted `v0-draft (pending review)` → `published` on 2026-08-07. It had carried a draft label for fourteen months while serving live — the label rendered nowhere, so nothing surfaced the mismatch. Figures and tool-states are point-in-time; the *structure* (hard signals → reputation → diversify) is the durable part, and it has held. More research can still be folded in — that is an open door, not a pending gate.

**Publications backlinks**

- [[Cashu]] (this project) — single-operator ecash protocol; defers here from its Gotchas
- [[Fedimint]] (this project) — federated ecash; defers here from its Gotchas
- [[Stack]] (this project) — §3 ecash layer; references this page
- [[_Product-Ideas-Research-Bitcoineconomy-ai]] (this project) — the source research (2026-06-05) + added findings
