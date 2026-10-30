// Reads the page inventory straight from src/content/docs. Used where the Astro content API is not
// available yet (astro.config.mjs builds the sidebar from it) and by the scripts.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

// Relative to the working directory, not to this file: in a build the code runs from bundled chunks
// in dist/, where import.meta.url no longer points into src/. Every command runs from the project root.
// `KB_DOCS_ROOT` lets tests point at a scratch tree.
export function docsRoot(): string {
  return process.env.KB_DOCS_ROOT ?? resolve(process.cwd(), 'src/content/docs');
}

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

export function listPages(root: string = docsRoot()): PageInfo[] {
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
