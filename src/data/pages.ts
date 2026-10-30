// Reads the page inventory straight from src/content/docs. Used where the Astro content API is not
// available yet (astro.config.mjs builds the sidebar from it) and by the scripts.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const docsRoot = fileURLToPath(new URL('../content/docs/', import.meta.url));

export interface PageInfo {
  /** Slug as Starlight sees it: path without extension, `index` folded into its folder. */
  slug: string;
  file: string;
  draft: boolean;
}

export function frontmatterOf(source: string): string {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  return m?.[1] ?? '';
}

export function listPages(root: string = docsRoot): PageInfo[] {
  const out: PageInfo[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (/\.mdx?$/.test(name)) {
        const rel = relative(root, full)
          .split(sep)
          .join('/')
          .replace(/\.mdx?$/, '');
        const slug = rel === 'index' ? '' : rel.replace(/\/index$/, '');
        const draft = /^draft:\s*true\s*$/m.test(frontmatterOf(readFileSync(full, 'utf8')));
        out.push({ slug, file: full, draft });
      }
    }
  };
  walk(root);
  return out;
}
