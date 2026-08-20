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
# TOKEN — one file, identical in all four site repos (2026-08-05).
#
# This is worth knowing because it was briefly the opposite. There used to be two
# half-scoped Cloudflare tokens, one for Pages and one for Workers, and this script
# originally copied bitcoinkeys-guide's fallback verbatim "so there is one pattern
# across every repo" — reaching for the PAGES token, which cannot deploy a Worker.
# wrangler fails on it with `Authentication error [code: 10000]`, and both surfaces
# here are Workers, so the fallback could never have worked.
#
# It went unnoticed for weeks because every deploy ran with a Workers-capable token
# already exported in the environment, so the fallback was never once the path that
# actually ran — a thing that reads as working purely because nothing had yet tried
# the broken path. A single token carrying both scopes now removes the whole class
# of bug, and makes "one pattern across every repo" true rather than aspirational.
#
# Test this file the way it actually breaks: run with CLOUDFLARE_API_TOKEN unset.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  TOKEN_FILE="$HOME/secure/cloudflare-deploy-token"
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

# ── Drop the edge cache, then PROVE the edge matches origin ───────────────────
# The line directly above has said "the first read after a deploy has served the
# previous build on these projects before" for weeks, and nothing acted on it.
# radvladdy.com then hit exactly that twice (2026-08-15, 2026-08-20), serving the
# OLD HTML under `cf-cache-status: HIT` while the origin was already correct.
# Three separate places in this portfolio documented the trap; none automated it.
# This is the wiring, and it is the same line in all four repos.
#
# 🔀 BOTH SURFACES SIT IN THE ONE ZONE, so a single zone purge covers the Worker
# and the marketplace Worker together. The VERIFY is what has to be target-aware
# — proving bitcoineconomy.ai is fresh says nothing about a marketplace-only
# deploy, and a check aimed at the wrong surface is a check that reads nothing.
#
# ⚠️ IT RUNS BEFORE INDEXNOW ON PURPOSE. Telling six search engines to come and
# index right now, while the edge still hands out the previous version, is worse
# than not telling them — it banks the stale page.
#
# A failure here must NOT fail the deploy (the site is already live), but it must
# not be silent either. `cf-purge verify` is the half that can go red: it compares
# a cache-busted fetch against an ordinary one, because a plain check can be
# answered by the very cache it is meant to catch.
"$HOME/bin/cf-purge" purge bitcoineconomy.ai || echo "── ⚠️ CACHE PURGE FAILED — the deploy itself was fine. Retry: cf-purge purge bitcoineconomy.ai"

if [ "$target" = "main" ] || [ "$target" = "both" ]; then
  "$HOME/bin/cf-purge" verify https://bitcoineconomy.ai/ || echo "── ⚠️ EDGE STILL STALE on bitcoineconomy.ai — do not call it live yet"
fi
if [ "$target" = "marketplace" ] || [ "$target" = "both" ]; then
  "$HOME/bin/cf-purge" verify https://marketplace.bitcoineconomy.ai/ || echo "── ⚠️ EDGE STILL STALE on marketplace.bitcoineconomy.ai — do not call it live yet"
fi

# ── Tell the non-Google engines, immediately ──────────────────────────────────
# IndexNow reaches Bing, Yandex, Naver, Seznam.cz, Yep and DuckDuckGo in one
# call. NOT Google, which declined to adopt it — Google discovers this deploy on
# its own schedule and nothing here changes that.
#
# It lives HERE rather than in the nightly wrapper for the reason this file's own
# header gives about the deploy itself: the automated and manual paths must not
# drift into two implementations. Every route that ships this site runs this line.
#
# ⚠️ A FAILURE HERE MUST NOT FAIL THE DEPLOY — the site is already live and
# rolling that back over a search-engine ping would be absurd. But it must not be
# SILENT either, so it prints loudly and records the result to
# ~/.local/state/indexnow.json, which is what a staleness check reads later.
# Absolute path: cron's PATH does not include ~/bin.
"$HOME/bin/indexnow" submit bitcoineconomy.ai || echo "── ⚠️ IndexNow submission FAILED (the deploy itself was fine; run: indexnow check)"
