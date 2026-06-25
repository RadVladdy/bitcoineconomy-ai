// Shared site constants and the surface route map.

export const SITE = {
  url: 'https://bitcoineconomy.ai',
  name: 'The Bitcoin Economy for AI',
  shortName: 'bitcoineconomy.ai',
  handle: '@BitcoinEconAI',
  x: 'https://x.com/BitcoinEconAI',
  repo: 'https://github.com/RadVladdy/bitcoineconomy-ai',
  tagline: 'The autonomous AI economy runs on Bitcoin.',
};

// Flat list of canonical human surfaces, for `current`/label lookup in the
// surface routes. The Story is the homepage landing (narrative entry point), not
// a peer doc, so it is intentionally not in the menu. The two "Why X, not Y"
// supports now sit in the Case menu in their phase positions (Why Lightning =
// Phase 1, Why Bitcoin = Phase 2) — see NAV_GROUPS. Ancillary pages (The
// Stablecoin Landscape, Treasury, About) are reached via in-body + read-next
// links and the footer, not the menu (sprawl control).
export const HUMAN_NAV = [
  { slug: 'case', label: 'The Case' },
  { slug: 'agent-economy', label: 'The Agent Economy' },
  { slug: 'adoption-asymmetry', label: 'The Adoption Asymmetry' },
  { slug: 'why-lightning-not-a-fast-chain', label: 'Why Lightning, Not a "Fast" Chain' },
  { slug: 'border-skirmishes', label: 'Border Skirmishes' },
  { slug: 'why-bitcoin-not-a-new-coin', label: 'Why Bitcoin, Not a New Coin' },
  { slug: 'independence-doctrine', label: 'Independence Doctrine' },
  { slug: 'convergence', label: 'The Convergence' },
  { slug: 'stack', label: 'The Stack' },
  { slug: 'quickstart', label: 'Quickstart' },
  { slug: 'marketplace', label: 'The Marketplace' },
  { slug: 'exchange', label: 'Exchange' },
  { slug: 'services', label: 'Services' },
  { slug: 'treasury', label: 'Treasury' },
  { slug: 'stablecoin-landscape', label: 'The Stablecoin Landscape' },
  { slug: 'field-notes', label: 'Field Notes' },
];

// Grouped navigation — the three-section IA (locked 2026-06-03):
// Case (why agents choose Bitcoin) · Stack (equip your agent) · The Market
// (the live Marketplace directory, Exchange & Services). Each section's anchor
// doc leads its group. Ancillary
// pages get no menu slot (link-only); About lives in the footer; The Story is
// the homepage. 'tools' is the /tools index, not a surfaces slug — its `current`
// highlight is handled by Nav directly.
export const NAV_GROUPS = [
  {
    label: 'Case',
    items: [
      { slug: 'case', label: 'The Case' },
      { slug: 'agent-economy', label: 'The Agent Economy' },
      { slug: 'adoption-asymmetry', label: 'The Adoption Asymmetry' },
      { slug: 'why-lightning-not-a-fast-chain', label: 'Why Lightning, Not a "Fast" Chain' },
      { slug: 'border-skirmishes', label: 'Border Skirmishes' },
      { slug: 'why-bitcoin-not-a-new-coin', label: 'Why Bitcoin, Not a New Coin' },
      { slug: 'independence-doctrine', label: 'Independence Doctrine' },
      { slug: 'convergence', label: 'The Convergence' },
    ],
  },
  {
    label: 'Stack',
    items: [
      { slug: 'stack', label: 'The Stack' },
      { slug: 'quickstart', label: 'Quickstart' },
      { slug: 'tools', label: 'Tools' },
    ],
  },
  {
    label: 'Market',
    items: [
      { slug: 'marketplace', label: 'Marketplace' },
      { slug: 'exchange', label: 'Exchange' },
      { slug: 'services', label: 'Services' },
    ],
  },
];

// Cross-cutting surfaces shown as standalone top-level nav items (not inside a
// section dropdown). Field Notes is the live record every section defers to.
export const NAV_STANDALONE = [{ slug: 'field-notes', label: 'Field Notes' }];

// One-glance descriptors per page, shown as a small dim sub-label under the
// title in both the homepage rail and the nav dropdowns. Keyed by slug.
// One-glance descriptor per page — plain-Joe, jargon-free (no "UI/UX", "TradFi",
// "A2A/A2B"). Shown under the page label in the homepage rail, the nav dropdowns,
// AND the internal-page rail (PageRail). Keep them short and explanatory: the
// label names the page, the descriptor says what it's about.
export const SLUG_TAGS: Record<string, string> = {
  case: 'Why agents choose Bitcoin',
  'agent-economy': 'How agents became economic actors',
  'adoption-asymmetry': 'Why agents adopt faster than people',
  'why-lightning-not-a-fast-chain': 'Why scaling needs Lightning, not a faster chain',
  'border-skirmishes': 'Where legacy finance pushes back',
  'why-bitcoin-not-a-new-coin': 'Why not just build a new coin',
  'independence-doctrine': 'Why it grows as a parallel economy',
  convergence: 'Why the shift is happening now',
  stack: 'The Bitcoin tech agents run on',
  quickstart: 'Four ways to connect an agent, fastest first',
  tools: 'Building blocks, with how-to cards',
  marketplace: 'The live services directory',
  treasury: 'What an agent holds — and the border it crosses',
  exchange: 'Moving between bitcoin and dollars',
  services: 'What agents buy and sell',
  'field-notes': 'The live record, week to week',
};

// Tool-card layer taxonomy. Ordered top-down to mirror The Stack's own section
// structure. Each tool card declares one `layer`; the /tools index groups by these.
export const TOOL_LAYERS = [
  {
    key: 'base',
    label: 'L1 — running a node (the base layer)',
    blurb: 'The Bitcoin node every self-custodial Lightning setup sits on — verify the chain yourself and hold your own keys, or delegate this layer and accept the trade-off.',
  },
  {
    key: 'integration',
    label: 'Agent-integration primitives',
    blurb: 'The protocol affordances an agent pays and authenticates with — HTTP-payment gating and key-free remote wallet control.',
  },
  {
    key: 'ecash',
    label: 'L3 — ecash & scaling layers',
    blurb: 'Privacy-preserving bearer tokens and shared-UTXO scaling layers above Lightning — lightweight at the agent layer, no channel management.',
  },
  {
    key: 'wallets',
    label: 'Wallets & toolkits',
    blurb: 'Deployed architectures an agent actually runs — node toolkits, programmable wallet platforms, agent-native wallets and frameworks.',
  },
  {
    key: 'services',
    label: 'Agent services & marketplaces',
    blurb: 'Live deployments where an agent buys a service on the Bitcoin stack — the thesis, running in production.',
  },
  {
    key: 'bridges',
    label: 'Bridges & conversion',
    blurb: 'The edge where the substrate meets other rails and assets — swaps, on/off-ramps, asset overlays. These live at the boundary; see Exchange for the rails-vs-substrate distinction.',
  },
] as const;

export type ToolLayerKey = (typeof TOOL_LAYERS)[number]['key'];

// The prerequisite ladder (audit 2026-06-23 → surfaced 2026-06-25). The second
// navigation axis over /tools: the cards stay grouped by Stack layer, but every
// card also declares what an agent must already have in place to run it. Ordered
// lightest commitment → most sovereign, so an agent can jump straight to the rung
// it has already reached. `tier` matches the card `prereq-tier`; `gloss` is the
// one-line concrete requirement shown in the orientation ladder.
export const PREREQ_TIERS = [
  { key: 'keys-only', label: 'Keys only', gloss: 'a keypair — no funds, no account', tag: 'needs: keys only' },
  { key: 'account', label: 'An account', gloss: 'a login at a hosted service', tag: 'needs: an account' },
  { key: 'wallet', label: 'A wallet', gloss: 'a funded Lightning wallet you control', tag: 'needs: a wallet' },
  { key: 'l2-network', label: 'An L2 connection', gloss: 'a Cashu / Fedimint mint or a shared-UTXO layer (Spark)', tag: 'needs: an L2 / mint' },
  { key: 'lightning-node', label: 'Your own Lightning node', gloss: 'a node with a funded channel', tag: 'needs: a Lightning node' },
  { key: 'bitcoin-node', label: 'Your own Bitcoin node', gloss: 'the base layer beneath a fully sovereign setup — needs only a machine', tag: 'the base layer' },
] as const;

export type PrereqTier = (typeof PREREQ_TIERS)[number]['key'];
// Card-tag text per tier (the scannable "what you need first" badge). The base
// layer reads as "the base layer" rather than "needs: a node" — it IS the node.
export const PREREQ_TAG: Record<string, string> = Object.fromEntries(
  PREREQ_TIERS.map((t) => [t.key, t.tag]),
);

// The /tools toolbox, re-cut function-first (2026-06-25). The page is a
// structured toolbox of *deployable* tools, grouped by what the tool does for an
// agent — decoupled from the Stack's layer taxonomy (which the explainer owns).
// Cards declare `toolbox-group`; `primitive` (L402/LNURL/BOLT12/MCP/Nostr) is a
// standard explained in The Stack, not a toolbox item, so it has no group here
// and drops out of the grid (its card stays live, linked from The Stack).
export const TOOLBOX_GROUPS = [
  {
    key: 'wallets',
    label: 'Wallets & treasuries',
    blurb: 'Where an agent holds and spends its funds — headless non-custodial wallets, key-free wallet connectors, and agent-native treasuries.',
  },
  {
    key: 'node-toolkits',
    label: 'Node toolkits — run your own',
    blurb: 'The infrastructure you run yourself: the base Bitcoin node, node-backed Lightning toolkits, and programmable wallet servers.',
  },
  {
    key: 'ecash',
    label: 'Ecash software',
    blurb: 'Bearer-token systems above Lightning — instant, private, and lightweight at the agent layer, with a custodial (mint or federation) trust trade-off.',
  },
  {
    key: 'bridges',
    label: 'Bridges & swaps',
    blurb: 'The edge where the substrate meets other rails and assets — submarine swaps, on/off-ramps, and issued-asset overlays.',
  },
] as const;

export type ToolboxGroupKey = (typeof TOOLBOX_GROUPS)[number]['key'];

// Surface slug -> the For-Agents twin slug (or null for surfaces with no twin:
// The Story, The Stablecoin Landscape, About).
export const TWIN: Record<string, string | null> = {
  case: 'case-for-agents',
  'the-story': null,
  'agent-economy': 'agent-economy-for-agents',
  'adoption-asymmetry': 'adoption-asymmetry-for-agents',
  'independence-doctrine': 'independence-doctrine-for-agents',
  'border-skirmishes': 'border-skirmishes-for-agents',
  convergence: 'convergence-for-agents',
  'why-bitcoin-not-a-new-coin': 'why-bitcoin-not-a-new-coin-for-agents',
  'why-lightning-not-a-fast-chain': 'why-lightning-not-a-fast-chain-for-agents',
  stack: 'stack-for-agents',
  quickstart: 'quickstart-for-agents',
  marketplace: null,
  treasury: 'treasury-for-agents',
  exchange: 'exchange-for-agents',
  services: 'services-for-agents',
  'stablecoin-landscape': null,
  'field-notes': 'field-notes-for-agents',
  about: null,
};

// FA slug -> its human twin slug.
export const HUMAN_OF: Record<string, string> = {
  'case-for-agents': 'case',
  'agent-economy-for-agents': 'agent-economy',
  'adoption-asymmetry-for-agents': 'adoption-asymmetry',
  'independence-doctrine-for-agents': 'independence-doctrine',
  'border-skirmishes-for-agents': 'border-skirmishes',
  'convergence-for-agents': 'convergence',
  'why-bitcoin-not-a-new-coin-for-agents': 'why-bitcoin-not-a-new-coin',
  'why-lightning-not-a-fast-chain-for-agents': 'why-lightning-not-a-fast-chain',
  'stack-for-agents': 'stack',
  'quickstart-for-agents': 'quickstart',
  'treasury-for-agents': 'treasury',
  'exchange-for-agents': 'exchange',
  'services-for-agents': 'services',
  'field-notes-for-agents': 'field-notes',
};

export function isAgentSlug(slug: string): boolean {
  return slug.endsWith('-for-agents');
}
