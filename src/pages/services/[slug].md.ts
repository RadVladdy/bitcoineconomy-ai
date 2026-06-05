import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Clean `.md` route for every service card — same path + `.md`, raw published
// Markdown for direct agent consumption, with a structured frontmatter header.
// Service cards are tools-like (name + tagline); frontmatter reconstructed from
// the fields the card carries.
export async function getStaticPaths() {
  const all = await getCollection('services');
  return all.map((entry) => ({ params: { slug: entry.data.slug }, props: { entry } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { entry } = props as { entry: Awaited<ReturnType<typeof getCollection>>[number] };
  const d = entry.data;
  const fm = [
    `name: ${JSON.stringify(d.name)}`,
    `slug: ${d.slug}`,
    `tool-type: ${d['tool-type']}`,
    `category: ${d.category}`,
    d['two-sided'] ? `two-sided: ${JSON.stringify(d['two-sided'])}` : null,
    d.maintainer ? `maintainer: ${JSON.stringify(d.maintainer)}` : null,
    d.repo ? `repo: ${d.repo}` : null,
    d.docs ? `docs: ${d.docs}` : null,
    d.site ? `site: ${d.site}` : null,
    d.x ? `x: ${d.x}` : null,
    d.nostr ? `nostr: ${d.nostr}` : null,
    d.payment ? `payment: ${JSON.stringify(d.payment)}` : null,
    d.kyc ? `kyc: ${JSON.stringify(d.kyc)}` : null,
    d.status ? `status: ${JSON.stringify(d.status)}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const out = `---\n${fm}\n---\n\n# ${d.name}\n\n> ${d.tagline}\n\n${entry.body ?? ''}`;

  return new Response(out, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
