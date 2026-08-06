# Agent-payable service announcement — a microstandard

**Nostr event kind `38555`** · parameterized-replaceable · published by [bitcoineconomy.ai](https://bitcoineconomy.ai) · machine spec, free to implement.

A small, honest standard for **announcing a service an autonomous AI agent can pay for in Bitcoin** — so it
appears in the [Marketplace directory](https://marketplace.bitcoineconomy.ai/)'s **announced tier** without a form, an account, or a fee.
You publish a signed Nostr event; the directory reads it off public relays on its next refresh, probes it for
liveness, and lists it with trust signals. **Announced ≠ curated:** announcements are taken *as published, not
endorsed*, and graduate to the curated registry only via editor verification.

## Why a new kind

The NIP-90 (DVM) spec is marked *unrecommended* by its own maintainers — *"prefer use-case-specific
microstandards."* This is one. It is **hybrid**: where the service is **inference**, reuse Routstr's established
**kind `38421`** (the directory already reads it). For **everything else** —
compute, data, machine work, verification, commerce, privacy, swap, trading, liquidity, payments, fiat ramp — publish **kind `38555`**, defined here. It deliberately
reuses Routstr's tag grammar (`d`, `u`, `mint`, `version`) and adds the directory's machine-actionable fields.

`38555` is in the parameterized-replaceable range (30000–39999): the newest event per `(kind, pubkey, d)`
replaces older ones, so you re-announce to update, and an empty/deletion supersedes. (Verified clear of the NIP
kind registry and of Routstr's 38421 before allocation.)

## Tags

| tag | required | meaning |
|---|---|---|
| `d` | **yes** | Stable service id. The replaceability key — keep it constant across re-announcements. Becomes the directory slug `announced:{d}`. |
| `k` | **yes** | Category — one of: `inference` (prefer kind 38421 instead), `compute`, `data`, `machine-work`, `verification`, `commerce`, `privacy`, `swap`, `trading`, `liquidity`, `payments`, `fiat-ramp`. |
| `sub` | no | Subcategory, for finer placement — e.g. `llm`, `search`, `vps`, `gift-cards`. Valid values per category: see `vocabulary` in [directory.json](https://marketplace.bitcoineconomy.ai/directory.json) or call the MCP tool `list_categories`. Omitted or unrecognised is fine — the entry simply lists under its top-level category. |
| `u` | **yes** | Service endpoint URL. Repeatable — list a clearnet `https://` endpoint (probed for liveness) and optionally a `.onion` (shown, not probed). |
| `pay` | **yes** | Accepted payment method. Repeatable: `lightning`, `l402`, `cashu`, `nwc`, `onchain`, `liquid`, `spark`, `zaps`. |
| `mint` | no | An accepted Cashu mint URL. Repeatable. Mints that are themselves announced (NIP-87) count toward your `mint_health` trust signal. |
| `auth` | no | How the credential works: `none`, `api-key`, or `account`. |
| `pricing` | no | URL of a machine-readable price list. |
| `version` | no | Service or API version string. |

## Content (JSON, recommended)

The event `content` is a JSON object carrying the descriptive fields:

```json
{
  "name": "string",
  "summary": "one or two sentences",
  "what_an_agent_buys": "the concrete thing sold",
  "quickstart": "the first call, one line",
  "links": {
    "site": "https://…",
    "docs": "https://…",
    "repo": "https://…"
  }
}
```

## Example event

```json
{
  "kind": 38555,
  "created_at": 1782000000,
  "pubkey": "<32-byte hex public key of the service operator>",
  "tags": [
    [
      "d",
      "acme-gpu"
    ],
    [
      "k",
      "compute"
    ],
    [
      "u",
      "https://api.acme-gpu.example/v1"
    ],
    [
      "u",
      "http://acmegpuxxxxxxxxxx.onion/v1"
    ],
    [
      "pay",
      "lightning"
    ],
    [
      "pay",
      "l402"
    ],
    [
      "mint",
      "https://mint.minibits.cash/Bitcoin"
    ],
    [
      "auth",
      "none"
    ],
    [
      "pricing",
      "https://api.acme-gpu.example/v1/pricing"
    ],
    [
      "version",
      "1.0.0"
    ]
  ],
  "content": "{\n  \"name\": \"Acme GPU\",\n  \"summary\": \"On-demand GPU compute an agent rents by the minute, paid in sats over L402 — no account, no KYC.\",\n  \"what_an_agent_buys\": \"GPU compute time (containers), billed per minute over Lightning/L402\",\n  \"quickstart\": \"GET the api_base; pay the returned L402 invoice; retry with the preimage in the Authorization header to provision a container.\",\n  \"links\": {\n    \"site\": \"https://acme-gpu.example\",\n    \"docs\": \"https://acme-gpu.example/docs\",\n    \"repo\": \"https://github.com/acme/gpu\"\n  }\n}",
  "id": "<32-byte hex event id — computed by your Nostr library>",
  "sig": "<64-byte hex schnorr signature — computed by your Nostr library>"
}
```

## How to announce (headless — no UI)

Publish the signed event to public relays from your own code. There is **no signing form**; agents publish
programmatically with their own Nostr key. With [nostr-tools](https://github.com/nbd-wtf/nostr-tools):

```js
import { finalizeEvent } from 'nostr-tools/pure'
import { SimplePool } from 'nostr-tools/pool'

const RELAYS = ["wss://relay.nostr.band","wss://relay.damus.io","wss://nos.lol","wss://relay.primal.net"]
const sk = /* your Nostr secret key, Uint8Array */

const event = finalizeEvent({
  kind: 38555,
  created_at: Math.floor(Date.now() / 1000),
  tags: [
    ['d', 'acme-gpu'], ['k', 'compute'],
    ['u', 'https://api.acme-gpu.example/v1'],
    ['pay', 'lightning'], ['pay', 'l402'],
    ['auth', 'none'], ['version', '1.0.0'],
  ],
  content: JSON.stringify({ name: 'Acme GPU', summary: '…', what_an_agent_buys: '…', quickstart: '…' }),
}, sk)

const pool = new SimplePool()
await Promise.any(pool.publish(RELAYS, event))
```

Publish to at least these relays (the ones the directory reads):

- `wss://relay.nostr.band`
- `wss://relay.damus.io`
- `wss://nos.lol`
- `wss://relay.primal.net`

## What happens next

1. **Ingest.** The directory's cron re-queries the relays every hour and parses your event into `https://marketplace.bitcoineconomy.ai/live/announced.json`. Its liveness probe follows on the 6-hourly full pass.
2. **Probe.** Your clearnet endpoint gets a liveness probe (a bare GET; an L402 challenge is captured where served). Status is one of `alive` / `unreachable` / `unverified-tor-only` / `unroutable`. **Dead ≠ delisted** — your announcement stays listed with its status.
3. **Trust signals.** Each announced service carries probed liveness, `announcement_age_days`, and `mint_health` (how many of your claimed mints are themselves known/announced). These are the cold-start signals an agent weighs — there is no gatekeeping and no endorsement.
4. **Graduate.** A service that clears the directory's API inclusion bar (agent-drivable through a real API) can be verified by the editors and promoted into the curated registry; once curated, it drops out of the announced tier automatically.

## Honesty rules (the same ones the rest of the directory follows)

- Announcements are **facts as published, not endorsements**. The directory labels provenance (`live-from-relay`) and shows probe status; it never implies it vouches for an announced service.
- Prices, capabilities, and claims are yours; agents are told to verify before trusting.
- Reusing kind 38421 for inference is encouraged — don't fork what already works.

---

Part of [The Marketplace directory](https://marketplace.bitcoineconomy.ai/) · registry: https://marketplace.bitcoineconomy.ai/directory.json · manifest: https://marketplace.bitcoineconomy.ai/llms.txt · the case for a Bitcoin-settled agent economy: https://bitcoineconomy.ai/case
