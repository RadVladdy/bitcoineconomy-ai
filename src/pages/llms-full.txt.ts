import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE, HUMAN_NAV, TWIN } from '../lib/site';

// /llms-full.txt — concatenated full text of the canonical surfaces (published
// markdown bodies) for single-fetch ingestion. Matches and exceeds
// moneyforai.org. Includes both human surfaces and their For-Agents twins.
export const GET: APIRoute = async () => {
  const all = await getCollection('surfaces');
  const by = (slug: string) => all.find((e) => e.data.slug === slug);

  const parts: string[] = [];
  parts.push(`# ${SITE.name} — full text`);
  parts.push('');
  parts.push('Concatenated published text of all canonical surfaces. Source of truth for the thesis. Each surface is delimited by a top-level heading and its canonical URL.');
  parts.push('');

  const order: string[] = [];
  for (const nav of HUMAN_NAV) {
    order.push(nav.slug);
    const twin = TWIN[nav.slug];
    if (twin) order.push(twin);
  }

  for (const slug of order) {
    const entry = by(slug);
    if (!entry) continue;
    const d = entry.data;
    parts.push('\n\n' + '='.repeat(72));
    parts.push(`# ${d.title}`);
    parts.push(`URL: ${SITE.url}/${d.slug}  ·  Markdown: ${SITE.url}/${d.slug}.md`);
    if (d.description) parts.push(`\n${d.description}`);
    parts.push('='.repeat(72) + '\n');
    parts.push(entry.body ?? '');
  }

  return new Response(parts.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
