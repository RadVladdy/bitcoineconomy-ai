// Remark plugin: expand visual-asset placeholders that were inserted into the
// ported markdown as raw HTML blocks. Astro passes raw HTML through as mdast
// `html` nodes, so we rewrite the node's `value` in place.
//   <div data-diagram="NAME"></div>             -> inline SVG/table diagram
//   <div data-hero="file" data-alt="..."></div>  -> full-width hero figure
//   <figure data-image="file" ...></figure>      -> in-article figure + caption
import { DIAGRAMS } from './diagrams.ts';
import { visit } from 'unist-util-visit';

function getAttr(html, name) {
  const m = html.match(new RegExp(`${name}="([^"]*)"`));
  return m ? m[1] : undefined;
}

export default function remarkVisuals() {
  return (tree) => {
    visit(tree, 'html', (node) => {
      const v = node.value || '';

      const diagram = getAttr(v, 'data-diagram');
      if (diagram && DIAGRAMS[diagram]) {
        node.value = DIAGRAMS[diagram]();
        return;
      }

      const hero = getAttr(v, 'data-hero');
      if (hero) {
        const alt = getAttr(v, 'data-alt') || '';
        node.value = `<figure class="hero-img"><img src="/images/${hero}" alt="${alt}" loading="eager" /></figure>`;
        return;
      }

      const image = getAttr(v, 'data-image');
      if (image) {
        const alt = getAttr(v, 'data-alt') || '';
        const caption = getAttr(v, 'data-caption') || '';
        const cap = caption ? `<figcaption>${caption}</figcaption>` : '';
        node.value = `<figure class="surface-fig"><img src="/images/${image}" alt="${alt}" loading="lazy" />${cap}</figure>`;
        return;
      }
    });
  };
}
