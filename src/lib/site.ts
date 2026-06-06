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
// a peer doc, so it is intentionally not in the menu. Ancillary pages
// (Why Bitcoin Not a New Coin, The Stablecoin Landscape, About) are reached via
// in-body + read-next links and the footer, not the menu (sprawl control).
export const HUMAN_NAV = [
  { slug: 'case', label: 'The Case' },
  { slug: 'agent-economy', label: 'The Agent Economy' },
  { slug: 'adoption-asymmetry', label: 'The Adoption Asymmetry' },
  { slug: 'independence-doctrine', label: 'Independence Doctrine' },
  { slug: 'border-skirmishes', label: 'Border Skirmishes' },
  { slug: 'convergence', label: 'The Convergence' },
  { slug: 'why-bitcoin-not-a-new-coin', label: 'Why Bitcoin, Not a New Coin' },
  { slug: 'stack', label: 'The Stack' },
  { slug: 'marketplace', label: 'The Marketplace' },
  { slug: 'exchange', label: 'Exchange' },
  { slug: 'services', label: 'Services' },
  { slug: 'stablecoin-landscape', label: 'The Stablecoin Landscape' },
  { slug: 'field-notes', label: 'Field Notes' },
];

// Grouped navigation — the three-section IA (locked 2026-06-03):
// Case (why agents choose Bitcoin) · Stack (equip your agent) · Marketplace
// (exchange & services). Each section's anchor doc leads its group. Ancillary
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
      { slug: 'independence-doctrine', label: 'Independence Doctrine' },
      { slug: 'border-skirmishes', label: 'Border Skirmishes' },
      { slug: 'convergence', label: 'The Convergence' },
    ],
  },
  {
    label: 'Stack',
    items: [
      { slug: 'stack', label: 'The Stack' },
      { slug: 'tools', label: 'Tools' },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      { slug: 'marketplace', label: 'The Marketplace' },
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
export const SLUG_TAGS: Record<string, string> = {
  case: 'Why agents choose Bitcoin',
  'agent-economy': 'Agents become economic actors',
  'adoption-asymmetry': 'Agents overcome BTC UI/UX',
  'independence-doctrine': 'Parallel not integrated economies',
  'border-skirmishes': 'TradFi vs. BTC agent economy',
  convergence: 'Timing the BTC move',
  stack: 'The Bitcoin tech stack',
  tools: 'BTC implementation tools',
  marketplace: 'Agent treasury, exchange and services',
  exchange: 'BTC ↔ fiat',
  services: 'A2A and A2B services',
  'field-notes': 'Agent BTC economy - live record',
};

// Tool-card layer taxonomy. Ordered top-down to mirror The Stack's own section
// structure. Each tool card declares one `layer`; the /tools index groups by these.
export const TOOL_LAYERS = [
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
    blurb: 'The edge where the substrate meets other rails and assets — swaps, on/off-ramps, asset overlays. These live at the boundary; see The Marketplace for the rails-vs-substrate distinction.',
  },
] as const;

export type ToolLayerKey = (typeof TOOL_LAYERS)[number]['key'];

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
  stack: 'stack-for-agents',
  marketplace: 'marketplace-for-agents',
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
  'stack-for-agents': 'stack',
  'marketplace-for-agents': 'marketplace',
  'exchange-for-agents': 'exchange',
  'services-for-agents': 'services',
  'field-notes-for-agents': 'field-notes',
};

export function isAgentSlug(slug: string): boolean {
  return slug.endsWith('-for-agents');
}
