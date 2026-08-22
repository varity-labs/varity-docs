import { visit } from 'unist-util-visit';

/**
 * Wrap markdown tables in a scrollable, keyboard-focusable region.
 *
 * Making the table itself `display: block` was the CSS-only way to stop wide
 * tables widening the document, but it removes the table from the accessibility
 * tree, so screen readers stop announcing rows and columns. Wrapping keeps the
 * table a real table and moves the scrolling to the wrapper.
 */
export function rehypeTableScroll() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'table' || !parent || index === null) return;
      const cls = parent.properties?.className;
      if (Array.isArray(cls) && cls.includes('table-scroll')) return;
      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['table-scroll'],
          tabIndex: 0,
          role: 'region',
          'aria-label': 'Scrollable table',
        },
        children: [node],
      };
    });
  };
}
