import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Clean `.md` route for every surface (spec §6): same path + `.md`, serving the
// raw published Markdown for direct agent consumption. The published source is
// the ported file (Editor's Notes stripped, wikilinks resolved to site routes).
export async function getStaticPaths() {
  const all = await getCollection('surfaces');
  return all.map((entry) => ({
    params: { slug: entry.data.slug },
    props: { entry },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { entry } = props as { entry: Awaited<ReturnType<typeof getCollection>>[number] };
  const d = entry.data;
  // Reconstruct a clean frontmatter header + the published body.
  const fm = [
    `title: ${JSON.stringify(d.title)}`,
    `slug: ${d.slug}`,
    `surface: ${d.surface}`,
    `audience: ${d.audience}`,
    `twin-page: ${d['twin-page']}`,
    `status: ${d.status}`,
    `last-updated: ${d['last-updated'].toISOString().slice(0, 10)}`,
    d.description ? `description: ${JSON.stringify(d.description)}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const out = `---\n${fm}\n---\n\n# ${d.title}\n\n${entry.body ?? ''}`;

  return new Response(out, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
};
