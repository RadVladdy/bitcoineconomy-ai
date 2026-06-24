---
name: bitcoin-core
slug: bitcoin-core
layer: base
tagline: The reference Bitcoin full node — the L1 root every self-custodial Lightning setup sits on. Validate the chain yourself, hold your own keys, and expose RPC for the tools above it.
tool-type: software
maintainer: Bitcoin Core project
repo: https://github.com/bitcoin/bitcoin
docs: https://bitcoincore.org/en/doc/
site: https://bitcoincore.org
latest-release: v31.0
stack-section: "§1"
status: published
last-verified: 2026-06-23
order: 10
prereq-tier: bitcoin-node
prereqs:
  - "a machine with enough disk + bandwidth (full node) or a few GB (pruned)"
  - "nothing else underneath — this is the root of the self-custodial stack"
tags:
  - bitcoin-core
  - bitcoind
  - full-node
  - l1
  - rpc
  - self-custody
  - pruned-node
  - neutrino
---

## What it is

Bitcoin Core is the reference implementation of a Bitcoin full node: it downloads, validates, and relays the whole blockchain, enforces consensus rules independently, and can hold keys in its own wallet. Running it (`bitcoind`, or the `bitcoin-qt` GUI) is what "don't trust, verify" means in practice — your node checks every block against the rules itself rather than asking someone else what's true. It exposes a JSON-RPC interface and ZeroMQ notifications that the rest of the stack — Lightning nodes, wallets, indexers — builds on top of.

For an agent stack, Bitcoin Core is the **L1 root**: a self-custodial Lightning node (LND, Core Lightning) needs a Bitcoin backend to watch the chain, and that backend is almost always Bitcoin Core. Everything an agent does at machine tempo over Lightning ultimately settles down to the chain this node verifies.

## When to use it

- You're running your own Lightning node ([lightning-agent-tools](/tools/lightning-agent-tools), [LNbits](/tools/lnbits), [Loop](/tools/loop)) and want it backed by a node you control rather than a third party's.
- You want full-validation self-custody for an agent treasury's reserve balance — no intermediary attesting to your balance.
- You need a local RPC endpoint for chain queries, broadcasting, or wallet operations under the agent's own control.
- You *don't* need it if the agent only holds ecash, uses a custodial wallet/API, or runs Lightning in Neutrino light-client mode (see Gotchas).

## Dependencies

A machine with enough disk and bandwidth to validate the chain — a full node stores the entire blockchain (hundreds of GB and growing), while a **pruned** node keeps only recent blocks and runs in a few GB, at the cost of not serving historical blocks. Initial block download (validating from genesis) takes hours to days depending on hardware and is much faster on an SSD. Nothing sits underneath it — Bitcoin Core is the root of the self-custodial stack.

## Quick start

Download the signed release from bitcoincore.org (verify the signatures), then run the daemon:

```
bitcoind -daemon -server=1 -txindex=1
```

Query it once synced:

```
bitcoin-cli getblockchaininfo
```

To back a Lightning node, enable ZeroMQ in `bitcoin.conf` (LND and CLN consume `zmqpubrawblock` / `zmqpubrawtx`) and point the Lightning node at the RPC + ZMQ endpoints.

## Gotchas

- **Pruned nodes back LND with caveats.** LND can run against a pruned `bitcoind`, but it must be able to reach any blocks since your wallet's birthday / earliest channel; aggressive pruning forces LND to fetch missing blocks elsewhere and costs performance. A pruned bitcoind backing Lightning must be compiled with ZeroMQ.
- **Neutrino is the no-full-node alternative.** LND can run in Neutrino (BIP157/158 light-client) mode with no local chain at all — lighter, but you trade away full validation and some privacy. Fine for small or mobile agents; not for a node verifying significant reserves.
- **Initial block download is slow and bandwidth-heavy.** Plan for it; an SSD makes a large difference.
- **Indexes and RPC exposure are deliberate.** Only enable the indexes (`-txindex`) and RPC surface your tools actually need, and never expose RPC to an untrusted network.
