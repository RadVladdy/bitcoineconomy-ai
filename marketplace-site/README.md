# marketplace-site — placeholder for marketplace.bitcoineconomy.ai

A single self-contained `index.html`: the elegant under-construction page for the
future community-rated services directory (the "separate sibling site" the
Marketplace/Services surfaces reference). On-brand: dark-futuristic, the violet
Marketplace accent, the terminal-window motif, CTAs back to the main site.

This folder is **not** part of the main Astro build (`npm run build` only
publishes `dist/`); it deploys as its **own Cloudflare Pages project**.

## Deploy (one-time, Cloudflare dashboard — ~5 minutes)

Recommended: git-connected, so future updates ship on push.

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**
   → pick `RadVladdy/bitcoineconomy-ai`.
2. Project name: `bitcoineconomy-marketplace` (any name works).
   **Build command:** *(leave empty)* · **Build output directory:** `marketplace-site`.
3. Deploy, then in the project → **Custom domains → Set up a custom domain** →
   `marketplace.bitcoineconomy.ai`. The zone is already on Cloudflare, so the
   DNS record + certificate are created automatically.
4. Verify `https://marketplace.bitcoineconomy.ai` loads.

(Alternative: **Upload assets** / direct upload of this folder — fastest, but
each future change is a manual re-upload.)

## After it's live

Flip the `marketplace.bitcoineconomy.ai` mentions on the main site from inline
code to real links (Marketplace, Services, Services-FA, Exchange — they are
deliberately not hyperlinks today because the subdomain didn't resolve).

When the real directory is built (v2 — see the vault `_Progress` backlog and the
Nostr-marketplace research), it replaces this folder's content or gets its own
repo; the Pages project and domain stay.
