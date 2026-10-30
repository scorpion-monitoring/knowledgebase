// Prefixes root-absolute links in Markdown and MDX with the configured base path, so authors write
// `/start/profiles/` and the site still works under any KB_BASE. Links that already start with the
// base, protocol-relative links (`//host`) and anchors are left alone.

/** @param {{ base: string }} options */
export default function rehypeBaseLinks({ base }) {
  const prefix = base.replace(/\/+$/, '');
  /** @param {any} node */
  const walk = (node) => {
    if (
      node.type === 'element' &&
      node.tagName === 'a' &&
      typeof node.properties?.href === 'string'
    ) {
      const href = node.properties.href;
      if (
        prefix !== '' &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        href !== prefix &&
        !href.startsWith(`${prefix}/`)
      ) {
        node.properties.href = `${prefix}${href}`;
      }
    }
    for (const child of node.children ?? []) walk(child);
  };
  return (/** @type {any} */ tree) => walk(tree);
}
