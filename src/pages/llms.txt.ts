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
  lines.push('Every page below has a clean Markdown route (append `.md`) and a JSON-LD block. Most canonical surfaces have a separately-authored, claims-indexed For-Agents twin.');
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

  const exchanges = await getCollection('exchanges');
  if (exchanges.length) {
    lines.push('## Exchanges (BTC↔fiat directory)');
    lines.push('');
    lines.push(`On/off-ramp venues to move between Bitcoin and fiat. Directory: ${SITE.url}/exchanges`);
    lines.push('');
    for (const x of exchanges
      .map((e) => e.data)
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))) {
      const desc = x.tagline ?? x.category;
      lines.push(`- [${x.title}](${SITE.url}/exchanges/${x.slug}): ${desc}`);
    }
    lines.push('');
  }

  const services = await getCollection('services');
  if (services.length) {
    lines.push('## Services (what an agent buys/sells)');
    lines.push('');
    lines.push(`Live services an agent transacts with on the Bitcoin substrate. Directory: ${SITE.url}/services`);
    lines.push('');
    for (const s of services
      .map((e) => e.data)
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))) {
      lines.push(`- [${s.name}](${SITE.url}/services/${s.slug}): ${s.tagline}`);
    }
    lines.push('');
  }

  lines.push('## The Marketplace — live directory (separate site)');
  lines.push('');
  lines.push('The live, self-refreshing directory of agent-payable services at https://marketplace.bitcoineconomy.ai — a curated registry (agent-drivable-API bar) + live Nostr announcements + six-hourly liveness probes + a cross-provider sats price index. Agent-readable by design.');
  lines.push('- Directory manifest: https://marketplace.bitcoineconomy.ai/llms.txt (opens with a three-fetch recipe)');
  lines.push('- Registry JSON: https://marketplace.bitcoineconomy.ai/directory.json');
  lines.push('- Live snapshot: https://marketplace.bitcoineconomy.ai/live/snapshot.json');
  lines.push('- Cross-provider price index: https://marketplace.bitcoineconomy.ai/live/models.json');
  lines.push('');

  lines.push('## Machine infrastructure');
  lines.push('');
  lines.push(`- [llms-full.txt](${SITE.url}/llms-full.txt): concatenated full text of all canonical surfaces for single-fetch ingestion.`);
  lines.push(`- [agents.txt](${SITE.url}/agents.txt): the canonical map oriented to autonomous agents — what each surface asserts, plus the claim-IDs.`);
  lines.push(`- [sitemap.xml](${SITE.url}/sitemap-index.xml): all HTML and .md routes.`);
  lines.push(`- Raw markdown: append \`.md\` to any surface URL (e.g. ${SITE.url}/case.md).`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
