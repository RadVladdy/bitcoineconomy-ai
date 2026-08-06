---
name: Reflex
slug: reflex
layer: integration
toolbox-group: node-toolkits
tagline: Amboss's risk and compliance layer for Lightning — screen channel peers, invoices, and addresses against sanctions lists, monitor payments continuously, and generate compliance reports through one API.
tool-type: service
maintainer: Amboss Technologies
docs: https://docs.amboss.tech/reflex
site: https://amboss.tech
stack-section: "§2"
status: published
last-verified: 2026-08-06
order: 32
prereq-tier: account
prereqs:
  - "an Amboss account and API key for the Reflex API"
  - "a Lightning node, invoice, or address to screen — Reflex checks a target, it does not run one"
tags:
  - amboss
  - reflex
  - compliance
  - risk
  - sanctions
  - lightning
---

## What it is

Reflex is Amboss's **risk and compliance layer for Lightning operations**. Amboss describes it as letting a business "incorporate your risk policies directly into your payment operations": it screens channel peers, watches payments over time, and produces compliance reports, through an API or a dashboard.

The documented capabilities are **sanctions and IP screening** (checking channel peers by IP address and funding source against sanctions lists), **OFAC channel compliance** (screening channels against OFAC-sanctioned Bitcoin addresses, with automated alerts and configurable risk policies), **continuous monitoring** of historical payments and peers against criteria you set, **automated workflows** that run checks on a node, an invoice, or a Lightning address, **manual research** into any node on the network, and **deterministic reports** — reports built so the same inputs give the same answer, which is what makes them usable as evidence.

Amboss states the intended users are node operators and enterprises. The three documented checks are the shape of the product: *check a Lightning node*, *check a Lightning invoice*, *check a Lightning address*.

## When to use it

- A business moving money over Lightning has a **compliance obligation** and needs peer, invoice, or address screening it can run automatically rather than by hand.
- You want **alerts on your own channels** when a peer or a funding source matches a sanctions list.
- You need **repeatable reports** that show a policy was applied consistently.

## Dependencies

An **Amboss account and API key**, plus whatever you are screening — a node, an invoice, or a Lightning address. Reflex checks a target; it does not operate one for you, so no node of your own is required simply to run a check. Pricing is **volume-tiered per workflow**, and Amboss states there is **no approval process** to start.

## Quick start

Create an API key in your Amboss account, then follow the "First compliance check" walkthrough at `docs.amboss.tech/reflex` to run a workflow against a node, an invoice, or a Lightning address. The API reference and webhook-payload verification are documented in the same place.

## Gotchas

- **It screens; it does not automate a node.** Reflex answers "is this counterparty a risk under my policy" — it is not node management, routing automation, or liquidity tooling.
- **An older Amboss doc site still describes a different Reflex.** `amboss.space/reflex/docs/api-docs` still resolves and still documents a node-automation API (Graph, Invoices, Workflows, Pathfinding, Runs). The current product is documented at `docs.amboss.tech/reflex`; treat the older pages as legacy and confirm anything you rely on against the current docs.
- **Screening depends on lists and heuristics you do not control.** Sanctions matching by IP address and funding source produces both misses and false matches, and a match is an input to your policy rather than a verdict. Whether an alert blocks a payment is a decision you configure.
- **Using it puts a third party in the path of who you transact with.** That is the point of the product, and it is worth stating plainly: screening decisions are made against data Amboss holds and lists Amboss ingests.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

**Rewritten end-to-end 2026-08-06. The previous card described a product Amboss no longer sells** — node automation (pathfinding, routing/liquidity workflows, invoices, triggers) — which was accurate when written and is now the *legacy* doc site's content, not the live product. Verified against `docs.amboss.tech/reflex` on 2026-08-06: the live page is headed "Compliance — screen payments and investigate nodes." Amboss's own 2026-07-27 timeline post says the same ("2024: Reflex — compliance tool, aimed at institutions"), so this is their repositioning, not our misreading of a redesign.

**A checked detail worth keeping, because it is the reason the drift survived a year:** the old URL `amboss.space/reflex/docs/api-docs` **still returns 200 and still documents the old API** — zero occurrences of "sanctions", "OFAC", "compliance" or "screening" on that page, against 3 / 2 / 11 / 1 on the current one. A link-checker would have found nothing wrong here, and a `last-verified` bump that only confirmed the URL resolved would have re-certified a wrong card. **Reading the page, not the status code, is the only thing that catches this class of drift** — the same lesson this project already holds about `/live/` routes and third-party 200s.

**⚑ Placement is now a live question for the editor, and the recommendation is to MOVE it — not executed here, because it changes a route.** Tools is "equipment an agent runs" (the 2026-06-27 Tools-vs-Services rationale). Compliance screening you call over someone else's API is not equipment; it is a service. None of the four toolbox groups fits either — it is not a wallet, node toolkit, ecash tool, or bridge — and it is filed under `node-toolkits` here only as the least-wrong bucket, exactly the pattern that got LN Markets refiled out of `swap`. **Recommend moving it to Services** at the next structural pass, with the usual redirect discipline; left in place for now so this fix ships without a route change riding on it.

**Thesis line, and it is not a small one.** Reflex-as-compliance means Amboss is building **the sanctions-screening layer for Lightning**, sold to institutions — a censorship surface appearing on the rails this project champions, and a *distinct axis* from issuer freeze: routing-layer screening rather than asset-level seizure. It belongs on the censorship-gradient exhibit as its own dimension. The body above states the fact plainly and without hostility, which is the house discipline (same as the stablecoin legs on [Amboss Payments](/services/amboss-payments)) — the honest framing is *"compliance-optional infrastructure is appearing at every layer, including the ones we like"*, never *"Amboss is censoring Lightning."* **A Field Note or a Border-Skirmishes paragraph is the editor's decision**, not an automatic ship: Amboss is a warm relationship (Jesse Shrader, intro via Stillmark 2026-06-30).
