// agent-connect.ts — the per-card "For agents" connect block (roadmap 10b).
//
// Single source of truth: the marketplace directory's GENERATED machine data
// (../../marketplace-site/{directory.json,tools.json}, produced by that folder's
// build.mjs from the cards + directory-overlay.json). This module reads it by
// slug so a card page can show — in HTML and in its clean .md route — exactly how
// an agent reaches the thing: pay/auth/api_base/quickstart, the provider's own MCP
// (connect-to-act), and the marketplace directory + /mcp pointers.
//
// Reference facts only (curation by what we show + order), per the card-neutrality
// rule. No preference editorializing here — that lives in Editor's Notes.

import directory from '../../marketplace-site/directory.json';
import toolsDoc from '../../marketplace-site/tools.json';

type McpEndpoint = {
  kind?: string;
  transport: string;
  package?: string;
  run?: string;
  url?: string;
  auth?: string;
  tools?: string[];
  repo?: string;
  license?: string;
  docs?: string;
  note?: string;
};

export type Connect = {
  slug: string;
  name: string;
  section: 'tools' | 'services' | 'exchanges';
  in_directory: boolean;
  mcp_call: 'get_service' | 'get_tool';
  // machine fields (present only where verified)
  automatability?: string;
  prereq_tier?: string;
  prereq_desc?: string;
  payment_methods?: string[];
  auth?: string;
  api_base?: string;
  pricing_url?: string;
  quickstart?: string;
  mcp_endpoint?: McpEndpoint;
  // pointers
  card_md: string; // this site's clean .md route for the card
  entry_md?: string; // the marketplace directory's md route (directory entries only)
  directory_base: string;
  mcp_url: string;
};

const DIR_BASE = (directory as any).url?.replace(/\/$/, '') || 'https://marketplace.bitcoineconomy.ai';
const MCP_URL = (directory as any).live_routes?.mcp || `${DIR_BASE}/mcp`;
const PREREQ_DESC: Record<string, string> = (toolsDoc as any).prereq_tiers || {};

const dirBySlug = new Map<string, any>(((directory as any).entries || []).map((e: any) => [e.slug, e]));
const toolBySlug = new Map<string, any>(((toolsDoc as any).tools || []).map((t: any) => [t.slug, t]));

// Whether a connect object carries anything richer than the bare catalog pointer
// (so a plain protocol-primitive card doesn't render a heavy block for nothing).
export function hasRichConnect(c: Connect): boolean {
  return !!(c.api_base || c.auth || c.quickstart || c.mcp_endpoint || (c.payment_methods && c.payment_methods.length));
}

// Build the connect object for a card, or null if it is neither a directory entry
// nor a catalogued tool (then there is no machine surface to advertise).
export function getConnect(slug: string, section: Connect['section']): Connect | null {
  const dir = dirBySlug.get(slug);
  const tool = toolBySlug.get(slug);
  if (!dir && !tool) return null;

  const prereq_tier = tool?.prereq_tier || undefined;
  return {
    slug,
    name: dir?.name || tool?.name || slug,
    section,
    in_directory: !!dir,
    mcp_call: dir ? 'get_service' : 'get_tool',
    automatability: dir?.automatability || undefined,
    prereq_tier,
    prereq_desc: prereq_tier ? PREREQ_DESC[prereq_tier] : undefined,
    payment_methods: dir?.payment_methods || undefined,
    auth: dir?.auth || undefined,
    api_base: dir?.api_base || undefined,
    pricing_url: dir?.pricing_url || undefined,
    quickstart: dir?.quickstart || undefined,
    mcp_endpoint: dir?.mcp_endpoint || tool?.mcp_endpoint || undefined,
    card_md: `/${section}/${slug}.md`,
    entry_md: dir?.entry_md || undefined,
    directory_base: DIR_BASE,
    mcp_url: MCP_URL,
  };
}

// One-line gloss for an MCP endpoint (shared by HTML + markdown renderers).
export function mcpEndpointLine(m: McpEndpoint): string {
  const where = m.transport === 'http' ? m.url : m.run || m.package;
  const tools = m.tools && m.tools.length ? ` (${m.tools.join(', ')})` : '';
  const kind = m.kind ? ` ${m.kind} MCP` : ' MCP';
  return `${m.transport}${kind} · ${where}${tools}`;
}

// The same block as Markdown, appended to the card's clean .md route so an agent
// that fetches the text gets the connect path too (not just the HTML reader).
export function connectToMarkdown(c: Connect): string {
  const lines: string[] = ['', '## For agents — connect', ''];
  if (hasRichConnect(c)) {
    lines.push('Reach this programmatically. Reference facts, not endorsements — verify before you depend on them.', '');
    if (c.prereq_desc) lines.push(`- Prerequisite: ${c.prereq_desc}${c.prereq_tier ? ` (\`${c.prereq_tier}\`)` : ''}`);
    if (c.automatability) lines.push(`- Automatability: \`${c.automatability}\``);
    if (c.payment_methods?.length) lines.push(`- Pay with: ${c.payment_methods.join(', ')}`);
    if (c.auth) lines.push(`- Auth: ${c.auth}`);
    if (c.api_base) lines.push(`- API base: \`${c.api_base}\``);
    if (c.pricing_url) lines.push(`- Pricing: ${c.pricing_url}`);
    if (c.quickstart) lines.push(`- First call: ${c.quickstart}`);
    if (c.mcp_endpoint) lines.push(`- Connect to act (the provider's own MCP): ${mcpEndpointLine(c.mcp_endpoint)}`);
  } else {
    lines.push('Catalogued for agents in the marketplace directory.', '');
    if (c.prereq_desc) lines.push(`- Prerequisite: ${c.prereq_desc}${c.prereq_tier ? ` (\`${c.prereq_tier}\`)` : ''}`);
  }
  lines.push(
    `- In the marketplace directory: call \`${c.mcp_call}\` with slug \`${c.slug}\` at ${c.mcp_url}` +
      (c.entry_md ? `, or fetch ${c.entry_md}` : ''),
    `- This card as data: ${c.card_md}`,
    '',
  );
  return lines.join('\n');
}
