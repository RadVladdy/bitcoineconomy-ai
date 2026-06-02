import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Clean `.md` route for every tool card — same path + `.md`, raw published
// Markdown for direct agent consumption, with a structured frontmatter header.
export async function getStaticPaths() {
  const all = await getCollection('tools');
  return all.map((entry) => ({ params: { slug: entry.data.slug }, props: { entry } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { entry } = props as { entry: Awaited<ReturnType<typeof getCollection>>[number] };
  const d = entry.data;
  const fm = [
    `name: ${JSON.stringify(d.name)}`,
    `slug: ${d.slug}`,
    `layer: ${d.layer}`,
    `tool-type: ${d['tool-type']}`,
    d.maintainer ? `maintainer: ${JSON.stringify(d.maintainer)}` : null,
    d.repo ? `repo: ${d.repo}` : null,
    d.docs ? `docs: ${d.docs}` : null,
    d.site ? `site: ${d.site}` : null,
    d.x ? `x: ${d.x}` : null,
    d.nostr ? `nostr: ${d.nostr}` : null,
    d['latest-release'] ? `latest-release: ${JSON.stringify(d['latest-release'])}` : null,
    d['release-date'] ? `release-date: ${d['release-date']}` : null,
    d.license ? `license: ${JSON.stringify(d.license)}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const out = `---\n${fm}\n---\n\n# ${d.name}\n\n> ${d.tagline}\n\n${entry.body ?? ''}`;

  return new Response(out, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
