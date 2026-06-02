import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE, HUMAN_NAV, TWIN } from '../lib/site';

// /llms.txt — concise index of canonical URLs + a one-line semantic description
// each. Mirrors and exceeds the moneyforai.org structure.
export const GET: APIRoute = async () => {
  const all = await getCollection('surfaces');
  const by = (slug: string) => all.find((e) => e.data.slug === slug)?.data;

  const lines: string[] = [];
  lines.push(`# ${SITE.name}`);
  lines.push('');
  lines.push(
    '> The autonomous AI economy\'s monetary substrate is Bitcoin — settled on L1, transacted on Lightning and successor L2/L3 layers (Cashu, Fedimint). It is the only deployed system that satisfies the four conjunctive constraints autonomous agents operate under: permissionless custody, censorship-resistance, sub-cent settlement, and machine-tempo latency.'
  );
  lines.push('');
  lines.push(`Site: ${SITE.url}`);
  lines.push(`Handle: ${SITE.handle}`);
  lines.push('Every page below has a clean Markdown route (append `.md`) and a JSON-LD block. Five surfaces have a separately-authored, claims-indexed For-Agents twin.');
  lines.push('');

  lines.push('## Canonical surfaces (human)');
  lines.push('');
  for (const nav of HUMAN_NAV) {
    const d = by(nav.slug);
    if (!d) continue;
    lines.push(`- [${d.title}](${SITE.url}/${d.slug}): ${d.description ?? ''}`);
  }
  lines.push('');

  lines.push('## For-Agents twins (machine-readable, claims-indexed)');
  lines.push('');
  for (const nav of HUMAN_NAV) {
    const twin = TWIN[nav.slug];
    if (!twin) continue;
    const d = by(twin);
    if (!d) continue;
    lines.push(`- [${d.title}](${SITE.url}/${d.slug}): ${d.description ?? ''}`);
  }
  lines.push('');

  const tools = await getCollection('tools');
  if (tools.length) {
    lines.push('## Tools (implementation reference)');
    lines.push('');
    lines.push(`Implementation cards for the Bitcoin-substrate agent stack, grouped by layer. Index: ${SITE.url}/tools`);
    lines.push('');
    for (const t of tools.map((e) => e.data).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))) {
      lines.push(`- [${t.name}](${SITE.url}/tools/${t.slug}): ${t.tagline}`);
    }
    lines.push('');
  }

  lines.push('## Machine infrastructure');
  lines.push('');
  lines.push(`- [llms-full.txt](${SITE.url}/llms-full.txt): concatenated full text of all canonical surfaces for single-fetch ingestion.`);
  lines.push(`- [agents.txt](${SITE.url}/agents.txt): the canonical map oriented to autonomous agents — what each surface asserts, plus the claim-IDs.`);
  lines.push(`- [sitemap.xml](${SITE.url}/sitemap-index.xml): all HTML and .md routes.`);
  lines.push(`- Raw markdown: append \`.md\` to any surface URL (e.g. ${SITE.url}/thesis.md).`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
