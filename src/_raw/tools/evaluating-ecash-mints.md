---
name: Evaluating an ecash mint
slug: evaluating-ecash-mints
layer: ecash
tagline: How to judge whether a Cashu or Fedimint mint is trustworthy — the hard solvency signals, the reputation layer, and the one rule that beats all of them.
tool-type: guide
maintainer: "reference page (this project)"
docs: https://bitcoinmints.com
stack-section: "§3"
status: v0-draft-2026-06-05 (pending review)
last-verified: 2026-06-05
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

- **Proof of liabilities + proof of reserves (together).** A serious mint publishes its **mint proofs** (all ecash issued) and **burn proofs** (all ecash redeemed); the difference is its outstanding liability, which must be backed by the Bitcoin it actually holds. A cheating mint can inflate apparent liabilities but cannot fake on-chain reserves — so the two published together are what make solvency *checkable* rather than *trusted*. (The scheme is `callebtc`'s "Proof of Liabilities for Ecash Mints"; formalized in arXiv 2306.12783.)
- **Keyset rotation / epochs.** A reputable mint runs its signing keys in epochs and rotates them, letting holders migrate tokens to the current keyset and retiring the old one. This bounds the auditable window and blocks a mint from quietly inflating the supply from a retired key. (Covered by **NUT-02**; "NUT" = *Notation, Utilization, and Terminology* — the Cashu protocol specs, nothing to do with Nostr.)
- **Trust model.** Single-operator (Cashu) means one party can defect or fail; a federation (Fedimint, typically 4–13 guardians under threshold signatures) reduces — but does not eliminate — that risk. All else equal, distributed custody is the higher-robustness option.
- **Lightning liquidity / uptime.** A healthy mint can pay out instantly; a mint that keeps failing to settle is the leading indicator of distress, well before any formal insolvency.

## The reputation layer (social proof)

Since mints work like local "banks," reputation does a lot of the work. Three kinds of signal exist today:

- **Mint registries / review directories.** **[bitcoinmints.com](https://bitcoinmints.com)** is the primary directory for both Cashu and Fedimint mints — it tracks each mint, its supported NUTs, and **user reviews + vouch counts** signed from Nostr identities. **cashumints.space** is a Cashu-focused sister index with per-mint pages and reliability history.
- **Nostr web-of-trust.** Because reviews are signed by Nostr keys, vetting can run through *your own* social graph: modern wallets surface a mint as higher-reputation when accounts you already follow vouch for it. Trusted operators broadcasting a mint list (or a warning) is a real signal — with the honest caveat that Nostr identities are free to create, so reviews are **sybil-able** and a mint can farm a reputation before exit-scamming.
- **Objective status boards.** Beyond subjective reviews, automated monitors give an empirical read: the **cashu-mint-status-board (cashu.live)** tracks live uptime, and **`cashu-auditor`** continuously circulates ecash between mints over Lightning and flags any that fail to pay. Uptime and pay-out behavior are harder to fake than star ratings.
- **In-wallet discovery + warnings.** You don't have to chase this down manually: wallets like **ZEUS** ship a "Discover Mint" view that pulls vouch counts and reliability straight from the registries, and (per the Bitcoin Design Guide) warn you when you paste a mint with zero vouches or a history of dropping offline.

## The rule that beats all of them: don't concentrate

Even a well-vetted mint can fail, and no proof is perfect. The only fully reliable mitigation is **don't keep meaningful balance in any single mint** — spread funds across several reputable ones and hold small operational amounts. ZEUS operationalizes exactly this with an **"automated bank run"**: pick five or six vetted mints and let the wallet distribute and rebalance across them, so any one mint failing is a survivable event, not a wipeout. For an agent, this is a treasury-policy default, not an afterthought: ecash is a *spending float*, not a *reserve* — the reserve belongs on L1 ([[Stack|The Stack]]).

## Gotchas

- **Proofs are aspirational, not universal.** The PoL/PoR tooling exists, but most live mints don't publish full proofs yet — treat a mint that *does* as notably more trustworthy, and don't assume one that doesn't is insolvent (most aren't), just unverified.
- **Reviews are gameable.** Vouch counts and Nostr reviews are a starting filter, never a solvency guarantee; weight your own web-of-trust over raw counts.
- **A rating is a snapshot.** Uptime and reputation can change fast; for anything beyond a small float, re-check rather than trusting a once-good mint indefinitely.

## Links

- **[bitcoinmints.com](https://bitcoinmints.com)** — primary Cashu + Fedimint mint registry (reviews / vouches / NUTs). · **cashumints.space** — Cashu-focused index. · **cashu.live** — mint status/uptime board.
- Proof-of-liabilities scheme: `callebtc` gist + arXiv 2306.12783. · `github.com/callebtc/cashu-auditor` — autonomous mint auditor.
- Protocol context: [Cashu](/tools/cashu) · [Fedimint](/tools/fedimint) · the NUTs specs at `cashubtc.github.io/nuts`.

---

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Built for inbox item 2026-06-04/05 (Scott): a link-out page answering "how do I evaluate the quality/trustworthiness of a specific ecash mint," with the **ratings/social-proof systems** he asked about surfaced explicitly. Placement per the ecash research (`_Product-Ideas-Research` 2026-06-05): a single shared page both the [[Cashu]] and [[Fedimint]] cards defer to from their Gotchas, rather than duplicating the material in each — and referenced from The Stack §3.

**Scope discipline — net-new only.** The Cashu card already says mints are custodial trust points + advises diversifying; the Fedimint card already explains the guardian/threshold "reduced, not eliminated" model. This page deliberately does **not** re-explain those basics — it adds the vetting layer neither card answers: the PoL+PoR audit scheme, keyset/epoch anti-inflation, and the discovery/ratings landscape (bitcoinmints.com, cashumints.space, ZEUS Discover Mint + automated-bank-run, cashu.live, cashu-auditor).

**Fact guard:** NUT = *Notation, Utilization, and Terminology* (Cashu specs) — not "Nostr Unified Ecash Transfer Standards." Don't let that drift back.

**⛔ PORT BUILD-BLOCKER:** this page's `tool-type: guide` is **not** in the repo tools-collection enum (`software | protocol | service`) in `~/dev/bitcoineconomy-ai/src/content.config.ts`. Porting it as-is **fails the Astro build**. Fix at port time: add `'guide'` to the `tool-type` enum (and a JSON-LD `@type` mapping, e.g. `TechArticle`), or relabel. Until the page is ported, the inbound `/tools/evaluating-ecash-mints` links (Cashu/Fedimint Gotchas, Stack §3) won't resolve — that's the "links not working," not a malformed-link bug.

**Pending:** Scott flagged he had more research to fold in before finalizing; this is a v0 draft built from the captured findings — open to his additions. Figures/tool-states are point-in-time (2026-06-05); the *structure* (hard signals → reputation → diversify) is the durable part. Verify cashu.live / cashu-auditor instance URLs before publish.

**Publications backlinks**

- [[Cashu]] (this project) — single-operator ecash protocol; defers here from its Gotchas
- [[Fedimint]] (this project) — federated ecash; defers here from its Gotchas
- [[Stack]] (this project) — §3 ecash layer; references this page
- [[_Product-Ideas-Research-Bitcoineconomy-ai]] (this project) — the source research (2026-06-05) + Scott's added findings
