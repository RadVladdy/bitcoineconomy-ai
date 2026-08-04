// taxonomy.mjs — the ONE category vocabulary for the mastered directory.
//
// Every row in /live/master.json — curated, self-announced, 402index-indexed, or
// gateway-observed — is classified into the SAME two-level vocabulary here, so a
// filter means the same thing no matter where the row came from. Before this,
// each source carried its own strings and the tabs couldn't share a filter.
//
// Why two levels. 402index publishes `category/subcategory` (e.g. `ai/llm`,
// `tools/search`) and that shape is worth adopting — it's real detail we were
// throwing away. Their VALUES are not: ~150 top-level categories, casing
// duplicates (`AI`/`ai`, `Security`/`security`, `Finance`/`finance`), and 72,819
// of ~86,000 endpoints sitting in `uncategorized`. So we take their SHAPE, keep
// our own controlled vocabulary, and crosswalk theirs onto ours.
//
// Two top-level categories are NEW (2026-07-29) and exist because without them
// most external rows have nowhere to land and collapse into `other` — the exact
// detail loss the merge is meant to fix:
//   - `data`     — the single biggest external cluster (search, scraping,
//                  finance, government, weather, social, enrichment)
//   - `payments` — gateways (l402.space), wallets, invoicing, indexes
//
// Honesty rule (same as the trust layer): classification NEVER destroys the
// input. Every row keeps `source_category` — the upstream's own raw string — so
// a reader can check our mapping and disagree with it. Rows we can't map keep
// `confidence: "unmapped"` rather than being quietly filed somewhere plausible.

// --- the controlled vocabulary -------------------------------------------------
// Order is the display order and it is editorial: what an agent buys to think
// and work first, the money plumbing last (sovereignty-first, fiat-ramp last —
// the same ordering rule the curated registry has always used).
export const CATEGORIES = {
  inference: {
    title: 'Inference',
    blurb: 'Model calls an agent pays for per request — text, image, video, audio, embeddings.',
    subcategories: ['llm', 'image', 'video', 'audio', 'embeddings', 'ml', 'code'],
  },
  compute: {
    title: 'Compute',
    blurb: 'Machines and storage an agent rents.',
    subcategories: ['vps', 'gpu', 'container', 'code-exec', 'storage'],
  },
  data: {
    title: 'Data',
    blurb: 'Facts an agent buys: search, scraping, feeds, registries, enrichment.',
    subcategories: [
      'search', 'web-scraping', 'finance', 'blockchain', 'government', 'weather',
      'social', 'news', 'enrichment', 'network-intel', 'location', 'science',
      'health', 'knowledge', 'commerce-data',
    ],
  },
  'machine-work': {
    title: 'Machine work',
    blurb: 'Work an agent hands to another agent or service to perform.',
    subcategories: ['dvm', 'agents', 'automation', 'translation', 'moderation', 'dev-tools', 'messaging'],
  },
  verification: {
    title: 'Verification',
    blurb: 'Checking a claim, an identity, a counterparty, or a payment before acting on it.',
    subcategories: ['identity', 'notary', 'attestation', 'reputation', 'compliance', 'security'],
  },
  commerce: {
    title: 'Commerce',
    blurb: 'Goods and services an agent buys for a person or for itself.',
    subcategories: ['retail', 'gift-cards', 'digital-goods', 'travel', 'media'],
  },
  privacy: {
    title: 'Privacy',
    blurb: 'Network and identity privacy an agent can buy without an account.',
    subcategories: ['vpn', 'proxy', 'mixing'],
  },
  swap: {
    title: 'Swap',
    blurb: 'Moving value between Bitcoin layers and other assets.',
    subcategories: ['btc-stablecoin', 'cross-chain', 'atomic'],
  },
  // Taking or hedging a POSITION is a different economic act from moving value
  // between layers, and `swap` was covering it only because nothing else did
  // (LN Markets sat under `swap` with no subcategory as the least-wrong bucket,
  // flagged rather than stretched silently — 2026-08-03). Added 2026-08-04,
  // deliberately BEFORE the buy-side spec generates its own category table, so
  // the published vocabulary changes once instead of twice.
  trading: {
    title: 'Trading',
    blurb: 'Taking or hedging a position — derivatives venues, spot venues, prediction markets.',
    subcategories: ['derivatives', 'spot', 'prediction'],
  },
  liquidity: {
    title: 'Liquidity',
    blurb: 'Lightning channel capacity, routing, and yield.',
    subcategories: ['channels', 'routing', 'yield'],
  },
  payments: {
    title: 'Payments',
    blurb: 'The paying itself: gateways, wallets, invoicing, and the indexes that find payable endpoints.',
    subcategories: ['gateway', 'wallet', 'invoicing', 'directory'],
  },
  'fiat-ramp': {
    title: 'Fiat ramp',
    blurb: 'The bank leg — where an agent economy touches the incumbent stack.',
    subcategories: ['exchange', 'brokerage', 'card'],
  },
};

export const CATEGORY_ORDER = Object.keys(CATEGORIES);

/** True if the pair is in the controlled vocabulary. */
export function isValidPair(category, subcategory) {
  const c = CATEGORIES[category];
  if (!c) return false;
  return !subcategory || c.subcategories.includes(subcategory);
}

// --- crosswalk: 402index raw strings → our pair --------------------------------
// Keys are lowercased raw upstream values. A key may be `top` or `top/sub`;
// `top/sub` wins over a bare `top` so their subcategory detail survives (this is
// the whole point — `ai/llm` and `tools/search` must not both flatten to one
// bucket). Values are [category, subcategory|null].
const CROSSWALK = {
  // --- their `ai` cluster (613 L402 endpoints — the densest Lightning-native one)
  ai: ['inference', null],
  'ai/llm': ['inference', 'llm'],
  'ai/ml': ['inference', 'ml'],
  'ai/image': ['inference', 'image'],
  'ai/image-generation': ['inference', 'image'],
  'ai/text': ['inference', 'llm'],
  'ai/video': ['inference', 'video'],
  'ai/video-generation': ['inference', 'video'],
  'ai/code': ['inference', 'code'],
  'ai/agents': ['machine-work', 'agents'],
  'ai/research': ['data', 'knowledge'],
  'ai/data': ['data', null],
  'ai/finance': ['data', 'finance'],
  'ai/security': ['verification', 'security'],
  'ai/pricing': ['data', 'finance'],
  llm: ['inference', 'llm'],
  'ai-inference': ['inference', null],
  'ai-api': ['inference', null],
  'ai & machine learning': ['inference', 'ml'],
  'ai infrastructure': ['inference', null],
  'ai-agents': ['machine-work', 'agents'],
  agents: ['machine-work', 'agents'],
  'agent-tools': ['machine-work', 'agents'],
  'agent-utilities': ['machine-work', 'agents'],
  'edge-ai-automation': ['machine-work', 'automation'],

  // --- generative media published under their own top-levels
  media: ['inference', 'image'],
  'media/images': ['inference', 'image'],
  image: ['inference', 'image'],
  'image/generation': ['inference', 'image'],
  'image/icons': ['inference', 'image'],
  'image/resize': ['machine-work', 'automation'],
  video: ['inference', 'video'],
  music: ['inference', 'audio'],
  'music/generation': ['inference', 'audio'],
  generated: ['inference', 'image'],
  'generated/music': ['inference', 'audio'],
  'generated/media': ['inference', 'image'],
  'generated/photo': ['inference', 'image'],

  // --- their `tools` cluster: the subcategory decides, not the top level
  tools: ['machine-work', 'automation'],
  'tools/search': ['data', 'search'],
  'tools/utilities': ['machine-work', 'automation'],
  'tools/productivity': ['machine-work', 'automation'],
  'tools/testing': ['machine-work', 'dev-tools'],
  'tools/security': ['verification', 'security'],
  'tools/monitoring': ['data', 'network-intel'],
  'tools/web-audit': ['data', 'network-intel'],
  'tools/finance': ['data', 'finance'],
  'tools/ai': ['inference', null],
  'tools/ai-agents': ['machine-work', 'agents'],
  'tools/moderation': ['machine-work', 'moderation'],
  'tools/directory': ['payments', 'directory'],
  'tools/discovery': ['payments', 'directory'],
  'tools/marketplace': ['payments', 'directory'],
  'tools/x402': ['payments', 'gateway'],

  // --- data
  data: ['data', null],
  'data/government': ['data', 'government'],
  'data/finance': ['data', 'finance'],
  'data/public-data': ['data', 'government'],
  'data/compliance': ['verification', 'compliance'],
  'data/network-intelligence': ['data', 'network-intel'],
  'data/social': ['data', 'social'],
  'data/whois': ['data', 'network-intel'],
  'data/dns': ['data', 'network-intel'],
  'data/networking': ['data', 'network-intel'],
  'data/weather': ['data', 'weather'],
  'data/enrichment': ['data', 'enrichment'],
  'data/health': ['data', 'health'],
  'data/wellness': ['data', 'health'],
  'data/web-scraping': ['data', 'web-scraping'],
  'data/web-intelligence': ['data', 'network-intel'],
  'data/web-analysis': ['data', 'network-intel'],
  'data/web': ['data', 'web-scraping'],
  'data/extraction': ['data', 'web-scraping'],
  'data/location': ['data', 'location'],
  'data/geolocation': ['data', 'location'],
  'data/web-search': ['data', 'search'],
  'data/science': ['data', 'science'],
  'data/astronomy': ['data', 'science'],
  'data/environment': ['data', 'science'],
  'data/genomics': ['data', 'science'],
  'data/sports': ['data', 'news'],
  'data/aviation': ['data', 'location'],
  'data/auto': ['data', 'commerce-data'],
  'data/market-research': ['data', 'commerce-data'],
  'data/market-data': ['data', 'finance'],
  'data/blockchain': ['data', 'blockchain'],
  'data/crypto': ['data', 'blockchain'],
  'data/oracle': ['data', 'blockchain'],
  'data/legal': ['data', 'government'],
  'data/freelance': ['data', 'commerce-data'],
  'data/random': ['machine-work', 'automation'],
  'data/util': ['machine-work', 'automation'],
  'data/misc': ['machine-work', 'automation'],
  'data/ai': ['inference', null],
  'data/dev': ['machine-work', 'dev-tools'],
  'data/developer': ['machine-work', 'dev-tools'],
  'real-time-data': ['data', 'news'],
  'real-time-data/weather': ['data', 'weather'],
  'real-time-data/news': ['data', 'news'],
  'real-time-data/finance': ['data', 'finance'],
  'real-time-data/geolocation': ['data', 'location'],
  'data-enrichment': ['data', 'enrichment'],
  'data-extraction': ['data', 'web-scraping'],
  weather: ['data', 'weather'],
  news: ['data', 'news'],
  government: ['data', 'government'],
  'government/procurement': ['data', 'government'],
  regulatory: ['data', 'government'],
  legal: ['data', 'government'],
  health: ['data', 'health'],
  science: ['data', 'science'],
  space: ['data', 'science'],
  astronomy: ['data', 'science'],
  agriculture: ['data', 'science'],
  aviation: ['data', 'location'],
  energy: ['data', 'science'],
  'energy/intelligence': ['data', 'science'],
  places: ['data', 'location'],
  networking: ['data', 'network-intel'],
  'real-estate': ['data', 'commerce-data'],
  jobs: ['data', 'commerce-data'],
  korea: ['data', 'news'],
  time: ['data', null],
  timeline: ['data', 'news'],
  phone: ['data', 'enrichment'],
  prospect: ['data', 'enrichment'],
  'commerce-data': ['data', 'commerce-data'],
  'documents-content': ['data', 'knowledge'],
  document: ['data', 'knowledge'],
  'document/parse': ['machine-work', 'automation'],
  'document processing': ['machine-work', 'automation'],
  'document-processing': ['machine-work', 'automation'],
  intelligence: ['data', 'enrichment'],
  knowledge: ['data', 'knowledge'],
  literature: ['data', 'knowledge'],
  research: ['data', 'knowledge'],
  'research/ai': ['data', 'knowledge'],
  'research/marketplaces': ['data', 'commerce-data'],
  guides: ['data', 'knowledge'],
  podcasts: ['data', 'knowledge'],
  content: ['data', 'knowledge'],
  'content feeds': ['data', 'news'],

  // --- search / scraping under their own top-levels
  search: ['data', 'search'],
  'search-web': ['data', 'search'],
  'web-scraping': ['data', 'web-scraping'],
  scraping: ['data', 'web-scraping'],
  crawl: ['data', 'web-scraping'],
  web: ['data', 'web-scraping'],
  browser: ['machine-work', 'automation'],
  seo: ['data', 'commerce-data'],

  // --- crypto / finance
  // NOTE: `crypto/trading` and `finance/trading` stay on `data/finance` even
  // though a `trading` top-level now exists (added 2026-08-04). An upstream row
  // labelled "trading" is overwhelmingly a market-DATA API, not a venue where an
  // agent takes a position, and a live check found ZERO external rows carrying a
  // trading/derivatives/prediction source_category. Re-routing them on the
  // strength of a string would be filing-somewhere-plausible, which the honesty
  // rule at the top of this file forbids. Move one only after probing it.
  crypto: ['data', 'blockchain'],
  'crypto/defi': ['data', 'blockchain'],
  'crypto/defi/arbitrage': ['data', 'blockchain'],
  'crypto/wallet': ['payments', 'wallet'],
  'crypto/transactions': ['data', 'blockchain'],
  'crypto/nft': ['data', 'blockchain'],
  'crypto/prices': ['data', 'finance'],
  'crypto/data': ['data', 'blockchain'],
  'crypto/balances': ['data', 'blockchain'],
  'crypto/trading': ['data', 'finance'],
  'crypto/analytics': ['data', 'blockchain'],
  'crypto/agents': ['machine-work', 'agents'],
  'crypto/security': ['verification', 'security'],
  'crypto/base-mainnet': ['data', 'blockchain'],
  'crypto/lightning': ['payments', 'wallet'],
  'crypto-data': ['data', 'blockchain'],
  'crypto market data': ['data', 'finance'],
  'crypto-market-data': ['data', 'finance'],
  'crypto-analytics': ['data', 'blockchain'],
  blockchain: ['data', 'blockchain'],
  'blockchain/data': ['data', 'blockchain'],
  'blockchain-data': ['data', 'blockchain'],
  'on-chain': ['data', 'blockchain'],
  nft: ['data', 'blockchain'],
  'pump.fun': ['data', 'blockchain'],
  defi: ['data', 'blockchain'],
  'defi/risk': ['data', 'blockchain'],
  'defi/monitoring': ['data', 'blockchain'],
  'defi/routing': ['data', 'blockchain'],
  finance: ['data', 'finance'],
  'finance/etf-data': ['data', 'finance'],
  'finance/predictive': ['data', 'finance'],
  'finance/regulatory': ['data', 'government'],
  'finance/payments': ['payments', null],
  'finance/crypto-data': ['data', 'blockchain'],
  'finance/market-intelligence': ['data', 'finance'],
  'finance/trading': ['data', 'finance'],
  'finance/crypto-market-data': ['data', 'finance'],
  'finance/macro': ['data', 'finance'],
  'finance/equity-research': ['data', 'finance'],
  'finance/housing': ['data', 'commerce-data'],
  'finance/invoicing': ['payments', 'invoicing'],
  'financial analysis': ['data', 'finance'],
  'financial-data': ['data', 'finance'],
  'financial data': ['data', 'finance'],
  'financial-intelligence': ['data', 'finance'],
  'market-data': ['data', 'finance'],
  'market-data/trading': ['data', 'finance'],
  'market-intelligence': ['data', 'finance'],
  trading: ['data', 'finance'],
  'trading-signals': ['data', 'finance'],
  predict: ['data', 'finance'],
  'prediction-markets': ['data', 'finance'],
  etf: ['data', 'finance'],
  'etf-data': ['data', 'finance'],
  yield: ['liquidity', 'yield'],
  quotes: ['data', 'finance'],
  cost: ['data', 'finance'],

  // --- bitcoin / lightning native
  bitcoin: ['data', 'blockchain'],
  'bitcoin/bolt11': ['payments', 'invoicing'],
  lightning: ['payments', 'wallet'],
  nostr: ['data', 'social'],
  'nostr/wot': ['verification', 'reputation'],
  earn: ['liquidity', 'yield'],
  'earn/cashback': ['commerce', 'retail'],
  'earn/optimization': ['liquidity', 'yield'],

  // --- payments / protocol plumbing
  payments: ['payments', null],
  l402: ['payments', 'gateway'],
  'l402/tools': ['payments', 'gateway'],
  x402: ['payments', 'gateway'],
  'agent-commerce': ['payments', 'gateway'],
  'agent-iam': ['verification', 'identity'],
  mcp: ['machine-work', 'agents'],
  directory: ['payments', 'directory'],
  marketplace: ['payments', 'directory'],
  swap: ['swap', null],
  business: ['payments', 'invoicing'],
  'business/invoicing': ['payments', 'invoicing'],
  'business/procurement': ['commerce', 'retail'],
  'business/research': ['data', 'commerce-data'],

  // --- verification / security / identity
  identity: ['verification', 'identity'],
  'identity/security': ['verification', 'security'],
  verification: ['verification', null],
  'verification/notary': ['verification', 'notary'],
  security: ['verification', 'security'],
  'security/wallet': ['verification', 'security'],
  'security/scanning': ['verification', 'security'],
  'security/reputation': ['verification', 'reputation'],
  cybersecurity: ['verification', 'security'],
  compliance: ['verification', 'compliance'],
  'compliance/kyb': ['verification', 'compliance'],
  'compliance/sanctions': ['verification', 'compliance'],
  'compliance/defi': ['verification', 'compliance'],
  c2pa: ['verification', 'attestation'],
  'launch-checks': ['verification', 'attestation'],
  'official-status': ['verification', 'attestation'],
  'bounty-operations-intelligence': ['verification', 'security'],

  // --- developer + infrastructure
  'developer-tools': ['machine-work', 'dev-tools'],
  'developer tools': ['machine-work', 'dev-tools'],
  'developer-tool': ['machine-work', 'dev-tools'],
  developer: ['machine-work', 'dev-tools'],
  'developer-utilities': ['machine-work', 'dev-tools'],
  'developer-tools/x402': ['payments', 'gateway'],
  'developer-tools/x402-security': ['verification', 'security'],
  'developer-tools/api-testing': ['machine-work', 'dev-tools'],
  'developer-tools/cloud-security': ['verification', 'security'],
  'developer-tools/container-security': ['verification', 'security'],
  'developer-tools/release-security': ['verification', 'security'],
  'developer-tools/api-security': ['verification', 'security'],
  'developer-tools/ci-cd-security': ['verification', 'security'],
  'developer-tools/repo-intelligence': ['machine-work', 'dev-tools'],
  'developer-tools/digital-products': ['commerce', 'digital-goods'],
  cicd: ['machine-work', 'dev-tools'],
  ci: ['machine-work', 'dev-tools'],
  database: ['compute', 'storage'],
  infrastructure: ['compute', null],
  'tool-kit': ['machine-work', 'dev-tools'],
  testing: ['machine-work', 'dev-tools'],
  cloud: ['compute', null],
  'cloud/status': ['data', 'network-intel'],

  // --- compute / storage
  compute: ['compute', null],
  'compute/code': ['compute', 'code-exec'],
  storage: ['compute', 'storage'],
  '3d printing': ['commerce', 'retail'],

  // --- machine work
  translation: ['machine-work', 'translation'],
  'translation/localization': ['machine-work', 'translation'],
  language: ['machine-work', 'translation'],
  marketing: ['machine-work', 'automation'],
  'marketing/copywriting': ['inference', 'llm'],
  'marketing/conversion': ['data', 'commerce-data'],
  email: ['machine-work', 'messaging'],
  sms: ['machine-work', 'messaging'],
  communication: ['machine-work', 'messaging'],
  'social-media': ['machine-work', 'messaging'],
  social: ['data', 'social'],

  // --- commerce + digital goods
  commerce: ['commerce', null],
  'commerce/retail': ['commerce', 'retail'],
  'commerce/shopping': ['commerce', 'retail'],
  'commerce/settlement': ['payments', null],
  'commerce/housing': ['data', 'commerce-data'],
  gaming: ['commerce', 'media'],
  'gaming/nft': ['data', 'blockchain'],
  games: ['commerce', 'media'],
  course: ['commerce', 'digital-goods'],
  ebook: ['commerce', 'digital-goods'],
  book: ['commerce', 'digital-goods'],
  audiobook: ['commerce', 'digital-goods'],
  reading: ['commerce', 'digital-goods'],
  'personalized-reading': ['commerce', 'digital-goods'],
  'digital products': ['commerce', 'digital-goods'],
  'digital-products': ['commerce', 'digital-goods'],
  'digital-products/creator-tools': ['commerce', 'digital-goods'],
  'digital-products/marketing-tools': ['commerce', 'digital-goods'],
  'meditation-audio': ['commerce', 'media'],
  education: ['commerce', 'digital-goods'],
  expertise: ['commerce', 'digital-goods'],
  consulting: ['commerce', 'digital-goods'],
  human: ['commerce', 'digital-goods'],
  'session-workshop': ['commerce', 'digital-goods'],
  technology: ['data', 'knowledge'],

  privacy: ['privacy', null],
};

// Keyword fallback, tried in order, for rows with no usable upstream category —
// notably l402.space, whose directory carries a description but no category at
// all. Matched against `${name} ${description}`. First hit wins, so the more
// specific patterns come first.
const KEYWORDS = [
  // Aggregators first: a service that resells MANY other APIs across categories
  // is a directory, not an instance of whichever category it lists first. Keyed
  // on "APIs" (plural, counted) and explicit index/gateway language — NOT on
  // "endpoints", because a single specialist provider legitimately advertises
  // "100 pay-per-call endpoints" and must stay in its own category.
  [/everything api|ecosystem explorer|api marketplace|discover (&|and) call|indexing .*endpoints|universal .*gateway|pay for any|\b\d+\+?\s*(pay[- ]per[- ]call\s+)?apis\b/i, ['payments', 'directory']],
  // Inference gateways resell models rather than APIs — still inference.
  [/ai gateway|inference gateway|\d+\+?\s*(chat|llm|ai)\b.*\bmodels\b|text, image|ai (&|and) comms/i, ['inference', 'llm']],
  // Multi-modal generative before the single-modality rules, so "image, video
  // and music" doesn't get filed as audio on the strength of one word.
  [/generative media|image, video/i, ['inference', 'image']],

  [/text[- ]to[- ]speech|\btts\b|speech[- ]to[- ]text|\bstt\b|voice|transcri/i, ['inference', 'audio']],
  [/music generation|generate music|\bsong\b/i, ['inference', 'audio']],
  [/video (generation|model)|generate video/i, ['inference', 'video']],
  [/image (generation|model)|generate image|text[- ]to[- ]image/i, ['inference', 'image']],
  [/embedding/i, ['inference', 'embeddings']],
  [/\bllm\b|inference|openai[- ]compatible|chat model|language model|\bgpt\b/i, ['inference', 'llm']],

  [/company data|business data|company registr/i, ['data', 'enrichment']],
  [/sanctions|\bpep\b|\bkyb\b|\bkyc\b|screening|compliance/i, ['verification', 'compliance']],
  [/risk[- ]signal|before an agent pays|endpoint evidence|reputation/i, ['verification', 'reputation']],
  [/notar|attestation|proof of/i, ['verification', 'notary']],

  [/flight|aviation|airport/i, ['data', 'location']],
  [/weather|forecast|earthquake|air quality/i, ['data', 'weather']],
  [/onchain analytics|smart money|token .*intelligence|wallet intelligence|block(chain)? data/i, ['data', 'blockchain']],
  [/enrich|influencer|creator search|profile search/i, ['data', 'enrichment']],
  [/web search|search across|semantic search|real[- ]time (twitter|x )|reddit|search for ai agents/i, ['data', 'search']],
  [/scrap|crawl|clean[- ]markdown|page read/i, ['data', 'web-scraping']],
  [/economic indicator|company registr|market data|stock|equity/i, ['data', 'finance']],
  [/network .*intelligence|whois|\bdns\b|ip lookup/i, ['data', 'network-intel']],
  [/podcast|semantic search across .*clips/i, ['data', 'knowledge']],

  [/file hosting|upload a file|object storage|\bstorage\b/i, ['compute', 'storage']],
  [/\bvps\b|virtual (private )?server|gpu|container/i, ['compute', 'vps']],
  [/code exec|sandbox/i, ['compute', 'code-exec']],

  [/gateway|pay[- ]per[- ]call apis|402 (index|gateway)|marketplace|directory|discover .*pay/i, ['payments', 'directory']],
  [/wallet|payments? (infrastructure|for ai agents)|agent (wallets|payments)/i, ['payments', 'wallet']],
  [/invoice|billing/i, ['payments', 'invoicing']],

  [/\bvpn\b|tor |proxy/i, ['privacy', 'vpn']],
  [/swap|exchange .*between|cross[- ]chain/i, ['swap', null]],
  [/channel|routing|liquidity/i, ['liquidity', 'channels']],
  [/gift card|refill|top ?up|buy .*online/i, ['commerce', 'retail']],
  [/translat|localiz/i, ['machine-work', 'translation']],
  [/agent infra|automation|workflow/i, ['machine-work', 'automation']],
  [/\bapi\b.*(tools|utilities)|developer/i, ['machine-work', 'dev-tools']],
];

const clean = (s) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');

// Upstream strings that carry no information. 402index files 72,819 of its
// ~86,000 endpoints under `uncategorized` — treating that as a real category
// would suppress the keyword fallback and throw away every row they haven't
// labelled, which is most of them. These fall through to the text classifier.
const NO_CATEGORY = new Set(['uncategorized', 'unknown', 'other', 'misc', 'n/a', 'none', '-']);

/**
 * Classify one row into the shared vocabulary.
 *
 * @param {object} input
 * @param {string} [input.rawCategory]  the upstream's own category string
 *   (`ai/llm`, `tools/search`, `Finance`, …) — may be absent
 * @param {string} [input.name]         used only by the keyword fallback
 * @param {string} [input.description]  used only by the keyword fallback
 * @returns {{category: string, subcategory: string|null, source_category: string|null,
 *            confidence: 'exact'|'top-level'|'inferred'|'unmapped'}}
 *
 * `confidence` is published on the row, not hidden:
 *   exact      — their `top/sub` mapped to one of our pairs
 *   top-level  — only their top level mapped; our subcategory is unknown
 *   inferred   — no usable upstream category; matched on name/description text
 *   unmapped   — nothing matched. The row still ships, filed under its raw
 *                string in `source_category`, because silently filing it
 *                somewhere plausible would be a worse lie than admitting this.
 */
export function classify({ rawCategory, name, description } = {}) {
  const raw = clean(rawCategory);
  const out = (pair, confidence) => ({
    category: pair[0],
    subcategory: pair[1] || null,
    source_category: rawCategory || null,
    confidence,
  });

  if (raw && !NO_CATEGORY.has(raw)) {
    // Full `top/sub` first — their subcategory detail is the reason we're here.
    if (CROSSWALK[raw]) return out(CROSSWALK[raw], raw.includes('/') ? 'exact' : 'top-level');
    const [top, ...rest] = raw.split('/');
    const sub = rest.join('/');
    // An unknown subcategory under a known top level: keep the top level, and if
    // their subcategory happens to be one of ours, keep that too.
    if (CROSSWALK[top]) {
      const base = CROSSWALK[top];
      const subClean = clean(sub).replace(/[^a-z0-9-]/g, '-');
      if (sub && isValidPair(base[0], subClean)) return out([base[0], subClean], 'exact');
      return out(base, 'top-level');
    }
    // Their bare top level might itself be one of our category names.
    if (CATEGORIES[top]) {
      const subClean = clean(sub).replace(/[^a-z0-9-]/g, '-');
      if (sub && isValidPair(top, subClean)) return out([top, subClean], 'exact');
      return out([top, null], 'top-level');
    }
  }

  const hay = `${name || ''} ${description || ''}`;
  if (hay.trim()) {
    for (const [re, pair] of KEYWORDS) if (re.test(hay)) return out(pair, 'inferred');
  }

  return {
    category: null,
    subcategory: null,
    source_category: rawCategory || null,
    confidence: 'unmapped',
  };
}

/** Vocabulary doc for /live/master.json + the MCP `list_categories` tool. */
export function vocabularyDoc() {
  return {
    note:
      'One two-level vocabulary for every source in this directory. Adopted 2026-07-29 when the ' +
      'curated / announced / external-index / gateway-observed tiers merged into one mastered ' +
      'directory: a filter now means the same thing regardless of where a row came from. The ' +
      'two-level SHAPE follows 402index.io\'s category/subcategory convention; the VALUES are ours ' +
      '(their ~150 top-level strings include casing duplicates and leave 72,819 of ~86,000 endpoints ' +
      'uncategorized, so we crosswalk rather than mirror). Every row keeps `source_category` — the ' +
      'upstream\'s own raw string — and a `classification_confidence` of exact | top-level | inferred | ' +
      'unmapped, so our mapping is checkable and disputable rather than asserted.',
    confidence_levels: {
      exact: 'The upstream category AND subcategory mapped onto a pair in this vocabulary.',
      'top-level': 'Only the upstream top-level category mapped; the subcategory is unknown, not guessed.',
      inferred: 'No usable upstream category — classified from the service name and description text.',
      unmapped: 'Nothing matched. The row is published uncategorized with its raw source_category intact rather than filed somewhere plausible.',
    },
    categories: Object.fromEntries(
      CATEGORY_ORDER.map((k) => [k, { title: CATEGORIES[k].title, blurb: CATEGORIES[k].blurb, subcategories: CATEGORIES[k].subcategories }]),
    ),
  };
}
