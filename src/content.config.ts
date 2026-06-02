import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// A single content collection holding all 11 surfaces (6 human + 5 For-Agents),
// discriminated by `surface` + `audience`. Frontmatter keys are hyphenated in
// the vault source, so they are quoted here. The schema is the actual superset
// observed across all 11 files (spec §5, read before finalizing).

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
    slug: z.string(),
    type: z.string().optional(),
    surface: z.enum([
      'thesis',
      'the-story',
      'independence-doctrine',
      'border-zone',
      'stack',
      'field-notes',
    ]),
    // The Story is authored as `humans-only`; everything else is humans|agents.
    audience: z.enum(['humans', 'humans-only', 'agents']),
    'twin-page': z.string(),
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
    'agent-tldr': z.string(),
    'dual-track-exception': z.boolean().optional(),
    'style-guide': z.string().optional(),
    'source-surface': z.string().optional(),
    'former-title': z.string().optional(),
    'former-slug': z.string().optional(),
    renamed: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

// Tool cards — the /tools implementation reference. A separate collection (not a
// surface): no For-Agents twin, no claims-index; structured metadata in
// frontmatter + a short body (What it is / When to use / Quick start / Gotchas).
// Each card declares one `layer` (see TOOL_LAYERS in site.ts) and gets
// SoftwareApplication JSON-LD + a clean .md route. Ported from src/_raw/tools/*.md.
const tools = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tools' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    layer: z.enum(['integration', 'ecash', 'wallets', 'services', 'bridges']),
    tagline: z.string(),
    // 'software' | 'protocol' | 'service' — drives JSON-LD @type nuance + label.
    'tool-type': z.enum(['software', 'protocol', 'service']).default('software'),
    maintainer: z.string().optional(),
    repo: z.string().url().optional(),
    docs: z.string().url().optional(),
    site: z.string().url().optional(),
    x: z.string().optional(), // @handle
    nostr: z.string().optional(), // npub / NIP-05
    'latest-release': z.string().optional(),
    'release-date': z.string().optional(),
    license: z.string().optional(),
    'stack-section': z.string().optional(), // e.g. "§4" — where The Stack treats it
    status: z.string().default('draft'),
    'last-verified': z.coerce.date().optional(),
    order: z.number().default(0),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { surfaces, tools };
