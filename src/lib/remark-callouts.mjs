// Remark plugin: render Obsidian-style callouts.
//   > [!info] Title
//   > body...
// Astro's markdown parses these as plain blockquotes, leaving the literal
// "[!info] Title" text visible. This plugin detects the `[!type] Title` marker
// on the first line of a blockquote, strips it, and re-renders the blockquote
// as <aside class="callout callout-type"> with a <p class="callout-title">.
// Inline content (links, bold) inside the callout body is preserved as mdast.
import { visit } from 'unist-util-visit';

const MARKER = /^\[!(\w+)\]([^\n]*)\n?/;

export default function remarkCallouts() {
  return (tree) => {
    visit(tree, 'blockquote', (node) => {
      const first = node.children && node.children[0];
      if (!first || first.type !== 'paragraph') return;
      const firstText = first.children && first.children[0];
      if (!firstText || firstText.type !== 'text') return;

      const m = firstText.value.match(MARKER);
      if (!m) return;

      const type = m[1].toLowerCase();
      const title = m[2].trim();
      // Strip the marker line (incl. trailing newline) from the first text node.
      firstText.value = firstText.value.slice(m[0].length);

      node.data = node.data || {};
      node.data.hName = 'aside';
      node.data.hProperties = { className: ['callout', `callout-${type}`] };

      if (title) {
        node.children.unshift({
          type: 'paragraph',
          data: { hProperties: { className: ['callout-title'] } },
          children: [{ type: 'text', value: title }],
        });
      }
    });
  };
}
