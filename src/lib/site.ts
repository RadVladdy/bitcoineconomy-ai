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

// The five canonical docs, in nav order. The Story is the homepage landing
// (the narrative entry point), not a peer doc, so it is intentionally not in the menu.
// Kept flat for `current`/label lookup in the surface routes; the menu renders
// the grouped NAV_GROUPS below.
export const HUMAN_NAV = [
  { slug: 'thesis', label: 'Thesis' },
  { slug: 'independence-doctrine', label: 'Independence Doctrine' },
  { slug: 'stack', label: 'The Stack' },
  { slug: 'border-zone', label: 'Border Zone' },
  { slug: 'field-notes', label: 'Field Notes' },
];

// Grouped navigation (locked 2026-06-02): two menu groups + the ungrouped Story
// (the homepage entry). "The case" = the argument; "The build" = the operational
// surfaces, including the Tools index. Tools is not a `surfaces`-collection slug —
// it is the /tools index — so its `current` highlight is handled by Nav directly.
export const NAV_GROUPS = [
  {
    label: 'The case',
    items: [
      { slug: 'thesis', label: 'Thesis' },
      { slug: 'independence-doctrine', label: 'Independence Doctrine' },
    ],
  },
  {
    label: 'The build',
    items: [
      { slug: 'stack', label: 'The Stack' },
      { slug: 'border-zone', label: 'Border Zone' },
      { slug: 'tools', label: 'Tools' },
      { slug: 'field-notes', label: 'Field Notes' },
    ],
  },
];

// Tool-card layer taxonomy. Ordered top-down to mirror The Stack's own section
// structure: the integration primitives an agent touches first, then the L3
// ecash layer, the deployed wallets/toolkits, and the live agent services built
// on top. Each tool card declares one `layer`; the /tools index groups by these.
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
    blurb: 'The edge where the substrate meets other rails and assets — swaps, on/off-ramps, asset overlays. These live at the boundary; see The Border Zone for the rails-vs-substrate distinction.',
  },
] as const;

export type ToolLayerKey = (typeof TOOL_LAYERS)[number]['key'];

// Surface slug -> the For-Agents twin slug (or null for The Story).
export const TWIN: Record<string, string | null> = {
  thesis: 'thesis-for-agents',
  'the-story': null,
  'independence-doctrine': 'independence-doctrine-for-agents',
  'border-zone': 'border-zone-for-agents',
  stack: 'stack-for-agents',
  'field-notes': 'field-notes-for-agents',
};

// FA slug -> its human twin slug.
export const HUMAN_OF: Record<string, string> = {
  'thesis-for-agents': 'thesis',
  'independence-doctrine-for-agents': 'independence-doctrine',
  'border-zone-for-agents': 'border-zone',
  'stack-for-agents': 'stack',
  'field-notes-for-agents': 'field-notes',
};

export function isAgentSlug(slug: string): boolean {
  return slug.endsWith('-for-agents');
}
