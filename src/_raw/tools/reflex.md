---
name: Reflex
slug: reflex
layer: integration
toolbox-group: node-toolkits
tagline: Amboss's automation layer for a node you already run — pathfinding, routing/liquidity workflows, invoices, and triggers, all driven through one GraphQL API.
tool-type: service
maintainer: Amboss Technologies
docs: https://amboss.space/reflex/docs/api-docs
site: https://amboss.space
stack-section: "§2"
status: published
last-verified: 2026-06-27
order: 32
prereq-tier: lightning-node
prereqs:
  - "your own Lightning node (LND, Core Lightning, or Eclair) for Reflex to manage"
  - "an Amboss account and API key for the Reflex GraphQL endpoint"
tags:
  - amboss
  - reflex
  - node-management
  - pathfinding
  - routing
  - lightning
---

## What it is

Reflex is Amboss's automation layer for a Lightning node **you already run**. Instead of managing routing, liquidity, fees, and invoices by hand or through a dashboard, you drive them through a single **GraphQL API** — so the operational toil of running a node becomes programmable. Its documented modules cover the **Graph** (network data), **Invoices**, **Workflows** (Jobs, Templates, Triggers, Webhooks), **Pathfinding**, and **Runs**.

For an autonomous agent operating its own node, Reflex is the management plane: it turns "keep the node healthy and routing well" into API calls and scheduled workflows rather than human attention. It is the *manage-your-own-node* counterpart to [Magma](/services/amboss), which *buys* inbound capacity from a market.

## When to use it

- An agent runs its own Lightning node and needs **programmatic routing/liquidity automation** rather than a human at a dashboard.
- You want event-driven node operations — triggers and webhooks that act on network or channel conditions.
- You want Amboss's network/pathfinding data available to your own automation via API.

## Dependencies

Your own Lightning node (LND, Core Lightning, or Eclair) for Reflex to manage, plus an **Amboss account and API key**. The API is a GraphQL endpoint at `reflex.amboss.tech/graphql`, authenticated with a bearer token. As with Amboss's other APIs, **commercial use of the free tier is not permitted** — confirm terms for production use.

## Quick start

Create an API key in your Amboss account settings, then POST GraphQL queries/mutations to `reflex.amboss.tech/graphql` with `Authorization: Bearer <API_KEY>`. The available modules (Graph, Invoices, Workflows, Pathfinding, Runs) are documented at `amboss.space/reflex/docs/api-docs`.

## Gotchas

- **It manages a node you provide.** Reflex automates operations on your own LND/CLN/Eclair node — it is not a node-as-a-service and does not remove the need to run one.
- **Free-API commercial limit.** Amboss does not license free-API access for commercial use — clear production terms with Amboss.
- **Automation needs guardrails.** Trigger/workflow automation acts on your node's funds and channels; scope and test policies before letting an agent run them unattended.

## Editor's Notes

*Internal author perspective. Not published in produced derivatives.*

Placed in the Tools catalog under `node-toolkits` (equipment an agent runs), not as a directory "buy" entry — Reflex is node automation you operate against your own node, not a service purchased in the marketplace. It is the manage-side complement to the Amboss family: [Magma](/services/amboss) buys inbound liquidity, [Rails](/services/rails) earns yield providing it, and Reflex automates the node that does both. Thesis-clean: it operates a self-custodied Lightning node — no asset swap, no custody handover.
