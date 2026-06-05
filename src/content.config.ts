import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Content collections for the restructured site (2026-06 IA: Case / Stack /
// Marketplace sections). `surfaces` holds every human surface + its For-Agents
// twin, discriminated by `surface` + `audience`. `tools`, `exchanges`, and
// `services` are the three card collections. Frontmatter keys are hyphenated in
// the vault source, so they are quoted here. Schemas are permissive supersets:
// unknown keys are ignored, and only fields the site actually renders are typed.

const claim = z.object({
  id: z.string(),
  tag: z.string(),
  statement: z.string(),
  'defended-in': z.string().optional(),
});

const surfaces = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/surfaces' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    subtitle: z.string().optional(),
    slug: z.string(),
    type: z.string().optional(),
    // Section/surface key (was an enum; relaxed to a string so new surfaces
    // don't require a schema edit each time). 'the-story' is special-cased in
    // the renderer; everything else renders uniformly.
    surface: z.string(),
    audience: z.enum(['humans', 'humans-only', 'agents']),
    'twin-page': z.string().optional(),
    canonical: z.boolean().optional(),
    status: z.string(),
    created: z.coerce.date(),
    'last-updated': z.coerce.date(),
    'last-verified': z.coerce.date().optional(),
    'last-empirical-refresh': z.coerce.date().optional(),
    'section-A-last-refreshed': z.coerce.date().optional(),
    'word-count-target': z.number().optional(),
    'reading-level': z.number().optional(),
    voice: z.string().optional(),
    scope: z.string().optional(),
    'canonical-source': z.string().optional(),
    'epistemic-status': z.string().optional(),
    'claims-index': z.array(claim).optional(),
    'record-schema': z.string().optional(),
    // Optional: non-canonical pages (About, Stablecoin Landscape) carry no tldr.
    'agent-tldr': z.string().optional(),
    'dual-track-exception': z.boolean().optional(),
    'style-guide': z.string().optional(),
    'source-surface': z.string().optional(),
    'former-title': z.string().optional(),
    'former-slug': z.string().optional(),
    renamed: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

// Tool cards — the /tools implementation reference. Each card declares one
// `layer` (see TOOL_LAYERS in site.ts) and a `tool-type`. 'guide' was added for
// link-out explainer pages (e.g. evaluating-ecash-mints) that are not software.
const tools = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tools' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    layer: z.enum(['integration', 'ecash', 'wallets', 'services', 'bridges']),
    tagline: z.string(),
    'tool-type': z.enum(['software', 'protocol', 'service', 'guide']).default('software'),
    maintainer: z.string().optional(),
    repo: z.string().url().optional(),
    docs: z.string().url().optional(),
    site: z.string().url().optional(),
    x: z.string().optional(),
    nostr: z.string().optional(),
    'latest-release': z.string().optional(),
    'release-date': z.string().optional(),
    license: z.string().optional(),
    'stack-section': z.string().optional(),
    status: z.string().default('draft'),
    'last-verified': z.coerce.date().optional(),
    order: z.number().default(0),
    tags: z.array(z.string()).default([]),
  }),
});

// Exchange cards — BTC↔fiat (and crypto↔BTC) venues, the /exchanges directory.
// Distinct shape from tools: `title` (not name), structured facts, a `links` map.
const exchanges = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/exchanges' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    type: z.string().optional(),
    tagline: z.string().optional(),
    category: z.string().default('other'),
    featured: z.boolean().default(false),
    kyc: z.string().optional(),
    custody: z.string().optional(),
    // Card facts are loosely typed in the vault source (e.g. lightning: limited,
    // stablecoins: none) — accept the variants rather than force a shape.
    lightning: z.union([z.boolean(), z.string()]).optional(),
    stablecoins: z.union([z.array(z.string()), z.boolean(), z.string()]).optional(),
    fiat: z.union([z.boolean(), z.string()]).optional(),
    'agent-access': z.string().optional(),
    bridges: z.union([z.array(z.string()), z.string()]).optional(),
    'trust-model': z.string().optional(),
    jurisdiction: z.string().optional(),
    links: z.record(z.string()).optional(),
    status: z.string().default('draft'),
    'links-verified': z.coerce.date().optional(),
    order: z.number().default(0),
    tags: z.array(z.string()).default([]),
  }),
});

// Service cards — what an agent buys/sells, the /services directory. Tools-like
// shape (name + tagline + tool-type) plus consume/offer + payment metadata.
const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    tagline: z.string(),
    layer: z.string().optional(),
    collection: z.string().optional(),
    // Permissive: services carry varied types (service / marketplace / …); the
    // value is only a display label.
    'tool-type': z.string().default('service'),
    category: z.string().default('other'),
    featured: z.boolean().default(false),
    'two-sided': z.string().optional(),
    maintainer: z.string().optional(),
    repo: z.string().url().optional(),
    site: z.string().url().optional(),
    docs: z.string().url().optional(),
    x: z.string().optional(),
    nostr: z.string().optional(),
    payment: z.string().optional(),
    identity: z.string().optional(),
    custody: z.string().optional(),
    kyc: z.string().optional(),
    'bitcoin-native': z.boolean().optional(),
    status: z.string().default('draft'),
    'last-verified': z.coerce.date().optional(),
    order: z.number().default(0),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { surfaces, tools, exchanges, services };
