# invinoveritas

> Independent pre-action verdicts and signed proofs — a neutral approve/concerns/reject on a trade, diff, plan, command, or on-chain action before an irreversible step (~200 sats), a portable schnorr-signed audit proof after (100 sats), and free no-auth verification of any counterparty's proof

An independent verification layer an agent pays in sats — a neutral verdict before an irreversible action, a schnorr-signed proof after, and a public track record anyone can verify against the service's published key without trusting it.

- Category: verification / attestation
- Payment methods: l402, lightning, fiat
- Payment detail: per-call sats — L402, or a free API key funded over Lightning (USDC or XRP over x402, and card, also accepted)
- KYC: none
- Custody: prepaid sats balance held by the service (top-up model); card- and x402-funded sats are spendable on tools but not withdrawable over Lightning
- Automatability: api-no-account — API with no account — payment or a key is the credential; zero human onboarding
- Auth: none to start — POST /register {} returns an API key instantly (no email, no KYC); Bearer key on paid calls, funded by Lightning top-up (or L402 per-call where challenged); /verify-proof, /ledger, and /conformance need no auth at all
- API base: https://api.babyblueviper.com
- Pricing: https://api.babyblueviper.com/llms.txt
- Quickstart: POST /register with {} → api_key; POST /review with Authorization: Bearer <key> and {"artifact": "<diff/trade/command>", "artifact_type": "code_diff|trade|plan|shell_command|onchain_action"} → verdict + signed recomputable proof (first few calls free). Verify anyone's proof free at POST /verify-proof; public track record at GET /ledger.
- MCP server (connect to act): http (service) · https://api.babyblueviper.com/mcp — tools: review, prove, verify_proof, ledger
- Direction: consume + offer
- Maintainer: Baby Blue Viper (pseudonymous)
- Site: https://api.babyblueviper.com
- Docs/API: https://api.babyblueviper.com/llms.txt
- Full card (verified detail, gotchas): https://bitcoineconomy.ai/services/invinoveritas
- Provenance: curated (last verified 2026-08-07)

First verification-category entry (probed live 2026-07-23: 402 challenges on /review + /validate, /ledger JSON, /mcp initialize). Sats-denominated per-call billing; USDC (x402 on Base) and card funding also accepted — card/x402-funded sats are spendable but not withdrawable. Verdicts are published to Nostr before their outcomes and anchored to Bitcoin PoW via OpenTimestamps; outcomes settle on a public Hyperliquid account. Young track record (183 verdicts, 21W/20L settled, losses published — its own /ledger, read 2026-07-23; the counter moves, so recompute it there rather than trusting this line). A verdict is a paid second opinion, not an SLA.

---

Part of the [Agent Marketplace](https://marketplace.bitcoineconomy.ai/) · registry JSON: https://marketplace.bitcoineconomy.ai/directory.json · full thesis: https://bitcoineconomy.ai/case
