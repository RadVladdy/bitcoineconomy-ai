import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Clean `.md` route for every exchange card — same path + `.md`, raw published
// Markdown for direct agent consumption, with a structured frontmatter header.
// Exchange cards have `title` (not name) and no tagline; the frontmatter is
// reconstructed from the fields the card actually carries.
export async function getStaticPaths() {
  const all = await getCollection('exchanges');
  return all.map((entry) => ({ params: { slug: entry.data.slug }, props: { entry } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { entry } = props as { entry: Awaited<ReturnType<typeof getCollection>>[number] };
  const d = entry.data;
  const fmt = (date?: Date) => (date ? date.toISOString().slice(0, 10) : null);
  const fm = [
    `title: ${JSON.stringify(d.title)}`,
    `slug: ${d.slug}`,
    `category: ${d.category}`,
    d.custody ? `custody: ${JSON.stringify(d.custody)}` : null,
    d.kyc ? `kyc: ${JSON.stringify(d.kyc)}` : null,
    d.lightning !== undefined ? `lightning: ${d.lightning}` : null,
    d['trust-model'] ? `trust-model: ${JSON.stringify(d['trust-model'])}` : null,
    d['agent-access'] ? `agent-access: ${JSON.stringify(d['agent-access'])}` : null,
    d.status ? `status: ${JSON.stringify(d.status)}` : null,
    fmt(d['links-verified']) ? `links-verified: ${fmt(d['links-verified'])}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const tagline = d.tagline ? `\n\n> ${d.tagline}` : '';
  const out = `---\n${fm}\n---\n\n# ${d.title}${tagline}\n\n${entry.body ?? ''}`;

  return new Response(out, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
