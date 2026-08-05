#!/usr/bin/env bash
# Deploy this project to Cloudflare. Run via: npm run deploy
#
# TWO SURFACES, ONE COMMAND, and they are different kinds of thing:
#   • bitcoineconomy.ai            → a Worker serving dist/ as assets (root wrangler.jsonc)
#   • marketplace.bitcoineconomy.ai → its own Worker in marketplace-site/, with a
#                                     zone route in front and a KV SNAPSHOT binding
# Pass `main` or `marketplace` to deploy just one; no argument deploys both.
#
# WHY THIS EXISTS AT ALL (2026-08-05). Until today the main site auto-deployed from
# GitHub through Workers Builds — while this repo's own CLAUDE.md said "Push does NOT
# deploy the main site." Reality and documentation disagreed, which is worse than
# either arrangement: a push you believed was inert shipped to production. The git
# connections are gone and deploying is an explicit act again, matching the other
# three sites. GitHub is history and backup; it does not deploy anything.
#
# TOKEN — and note this is NOT the same file bitcoinkeys-guide uses (2026-08-05).
# This script originally copied that repo's fallback verbatim, reaching for
# ~/secure/cloudflare-pages-token "so there is one pattern across every repo".
# That file is a Pages-scoped token and it CANNOT deploy a Worker: wrangler fails
# with `Authentication error [code: 10000]` on /workers/services/…. The deploys that
# appeared to work were being run with a Workers-capable token already exported in
# the environment, so the fallback path was never actually exercised — the same
# shape of bug as the deploy docs themselves: a thing that reads as working because
# nothing had tried the broken path yet.
#
# Both surfaces here are Workers, so both need the broader token. bitcoinkeys-guide
# is a Pages direct-upload and its Pages token is correct for it. One pattern in
# SHAPE — env var, else a single file, never a token on the command line — but the
# file has to match what the target actually is.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  TOKEN_FILE="$HOME/secure/cloudflare-api-token"
  if [ -f "$TOKEN_FILE" ]; then
    CLOUDFLARE_API_TOKEN="$(tr -d '\n\r ' < "$TOKEN_FILE")"
    export CLOUDFLARE_API_TOKEN
  else
    echo "ERROR: set CLOUDFLARE_API_TOKEN or provide $TOKEN_FILE" >&2
    exit 1
  fi
fi

target="${1:-both}"

if [ "$target" = "main" ] || [ "$target" = "both" ]; then
  echo "── deploying bitcoineconomy.ai (Worker + dist/ assets)"
  npx wrangler deploy
fi

if [ "$target" = "marketplace" ] || [ "$target" = "both" ]; then
  echo "── deploying marketplace.bitcoineconomy.ai (Worker in marketplace-site/)"
  # A subshell, so a failure here cannot leave the caller in the wrong directory.
  ( cd marketplace-site && npx wrangler deploy )
fi

echo "── deployed. Verify on the live domain before calling it done: the first read
   after a deploy has served the previous build on these projects before."
