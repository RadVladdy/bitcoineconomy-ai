#!/usr/bin/env python3
"""Fail the push if this repo's generated Nostr relay set has drifted from the registry.

The single source of truth is ~/dev/nostr-publisher/nostr-registry.json. This repo
carries a GENERATED copy because the marketplace board runs in a Cloudflare Worker:
no filesystem at runtime, no cross-repo imports, so the relay set has to be inside
the bundle. That constraint is real, and it is exactly the constraint that produced
the drift the registry exists to stop — a sibling tool hand-copied this list and
still named a relay dropped two days earlier, which cost nothing only by accident.

So the copy is allowed, and hand-editing it is not. Regenerate with:

    cd ~/dev/nostr-publisher && node gen-registry-copies.mjs --write

Picked up automatically by the pre-push hook's scripts/check-*.py glob.
"""
import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GENERATED = os.path.join(REPO, "marketplace-site", "nostr-relays.generated.mjs")
NIP05 = os.path.join(REPO, "public", ".well-known", "nostr.json")
REGISTRY = os.path.join(os.path.expanduser("~"), "dev", "nostr-publisher", "nostr-registry.json")

RANK = {"ok": 0, "degraded": 1}

# The NIP-05 names this site serves. WHICH names is site config; WHO each one
# is — the pubkey — is the registry's fact, checked below. The relays hint per
# pubkey is that identity's publish set.
NIP05_NAMES = {"_": "bea", "hello": "bea", "beef": "beef"}
NIP05_RELAY_ACCOUNTS = ["bea", "beef"]


def relays_for(reg, purpose, account=None):
    excluded = set((reg["identities"].get(account) or {}).get("relay_exclusions") or []) if account else set()
    rows = [
        r for r in reg["relays"]
        if r.get("status") in RANK and purpose in (r.get("purposes") or []) and r["url"] not in excluded
    ]
    return [r["url"] for r in sorted(rows, key=lambda r: RANK[r["status"]])]


def fail(msg):
    print(f"check-nostr-registry: {msg}")
    sys.exit(1)


def main():
    # A check that cannot read its subject must never report clean — the rule this
    # portfolio already applies to every other gate. Missing registry is DEGRADED
    # and non-zero, not a silent pass.
    if not os.path.exists(REGISTRY):
        fail(f"DEGRADED — the registry is missing at {REGISTRY}; cannot verify the generated copy")
    if not os.path.exists(GENERATED):
        fail(f"the generated relay set is missing at {GENERATED} — run gen-registry-copies.mjs --write")

    reg = json.load(open(REGISTRY, encoding="utf-8"))
    # Mirror registry.mjs relaysFor({purpose:'board'}) exactly: usable statuses
    # only, purpose-tagged, healthiest first.
    want = [
        r["url"]
        for r in sorted(
            [r for r in reg["relays"] if r.get("status") in RANK and "board" in (r.get("purposes") or [])],
            key=lambda r: RANK[r["status"]],
        )
    ]

    src = open(GENERATED, encoding="utf-8").read()
    m = re.search(r"export const RELAYS = (\[[^\]]*\]);", src, re.S)
    if not m:
        fail("the generated file has no parseable `export const RELAYS = [...]`")
    have = json.loads(m.group(1))

    if have != want:
        missing = [u for u in want if u not in have]
        extra = [u for u in have if u not in want]
        detail = []
        if missing:
            detail.append(f"missing {missing}")
        if extra:
            detail.append(f"unexpected {extra}")
        if not detail:
            detail.append(f"order differs — registry says {want}, file says {have}")
        fail(
            "the generated relay set has DRIFTED from the registry: "
            + "; ".join(detail)
            + "\n  regenerate: cd ~/dev/nostr-publisher && node gen-registry-copies.mjs --write"
        )

    # The NIP-05 file is generator-owned since 2026-08-08 — it advertised
    # retired nostr.mom in the bea relays hint for a month before this check.
    problems = []
    if not os.path.exists(NIP05):
        problems.append(f"{NIP05} is missing")
    else:
        doc = json.load(open(NIP05, encoding="utf-8"))
        for name, ident in NIP05_NAMES.items():
            want_pk = reg["identities"][ident]["pubkey"]
            if (doc.get("names") or {}).get(name) != want_pk:
                problems.append(f"nostr.json names.{name} does not match the registry's {ident} pubkey")
        extra = set(doc.get("names") or {}) - set(NIP05_NAMES)
        if extra:
            problems.append(f"nostr.json carries unexpected names {sorted(extra)}")
        for acct in NIP05_RELAY_ACCOUNTS:
            pk = reg["identities"][acct]["pubkey"]
            if (doc.get("relays") or {}).get(pk) != relays_for(reg, "publish", acct):
                problems.append(f"nostr.json relays hint for {acct} has drifted from the registry's publish set")
    if problems:
        fail(
            "the NIP-05 nostr.json DISAGREES with the registry:\n  - " + "\n  - ".join(problems)
            + "\n  regenerate: cd ~/dev/nostr-publisher && node gen-registry-copies.mjs --write"
        )

    print(f"clean — Nostr relay set + NIP-05 match the registry ({len(want)} board relays, registry v{reg.get('version')})")


if __name__ == "__main__":
    main()
