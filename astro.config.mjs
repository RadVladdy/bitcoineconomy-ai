// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkVisuals from './src/lib/remark-visuals.mjs';
import remarkCallouts from './src/lib/remark-callouts.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://bitcoineconomy.ai',
  output: 'static',
  trailingSlash: 'never',
  integrations: [
    sitemap({
      // Include the clean .md routes alongside the HTML routes.
      customPages: [
        'https://bitcoineconomy.ai/thesis.md',
        'https://bitcoineconomy.ai/the-story.md',
        'https://bitcoineconomy.ai/independence-doctrine.md',
        'https://bitcoineconomy.ai/border-zone.md',
        'https://bitcoineconomy.ai/stack.md',
        'https://bitcoineconomy.ai/field-notes.md',
        'https://bitcoineconomy.ai/thesis-for-agents.md',
        'https://bitcoineconomy.ai/independence-doctrine-for-agents.md',
        'https://bitcoineconomy.ai/border-zone-for-agents.md',
        'https://bitcoineconomy.ai/stack-for-agents.md',
        'https://bitcoineconomy.ai/field-notes-for-agents.md',
      ],
    }),
  ],
  markdown: {
    remarkPlugins: [remarkCallouts, remarkVisuals],
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
