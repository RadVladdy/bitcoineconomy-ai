import type { APIRoute } from 'astro';
import { SITE } from '../lib/site';

// /robots.txt — explicitly allowlist AI crawlers (we WANT to be crawled and
// cited) plus a sitemap line. Matches the moneyforai.org agent-first benchmark.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'GoogleOther',
  'CCBot',
  'Applebot-Extended',
  'Amazonbot',
  'Bytespider',
  'Meta-ExternalAgent',
  'cohere-ai',
  'YouBot',
  'Diffbot',
  'DuckAssistBot',
  'Timpibot',
];

export const GET: APIRoute = async () => {
  const lines: string[] = [];

  // Explicit allow for every named AI crawler.
  for (const ua of AI_CRAWLERS) {
    lines.push(`User-agent: ${ua}`);
    lines.push('Allow: /');
    lines.push('');
  }

  // Everyone else: allow as well (static thesis site, nothing private).
  lines.push('User-agent: *');
  lines.push('Allow: /');
  lines.push('');
  lines.push(`Sitemap: ${SITE.url}/sitemap-index.xml`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
