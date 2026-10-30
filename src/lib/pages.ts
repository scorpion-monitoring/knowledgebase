// Page lookups for components. Reads src/content/docs directly so components work in the Astro
// container API (tests) as well as in builds.

import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { frontmatterOf, listPages, type PageInfo } from '../data/pages';

export interface PageData extends PageInfo {
  title: string;
  short?: string;
}

let cache: Map<string, PageData> | undefined;

export function resetPageCache(): void {
  cache = undefined;
}

function load(): Map<string, PageData> {
  if (cache) return cache;
  cache = new Map();
  for (const p of listPages()) {
    const fm = parse(frontmatterOf(readFileSync(p.file, 'utf8'))) as Record<string, unknown> | null;
    cache.set(p.slug, {
      ...p,
      title: typeof fm?.title === 'string' ? fm.title : p.slug,
      short: typeof fm?.short === 'string' ? fm.short : undefined,
    });
  }
  return cache;
}

export function getPage(slug: string): PageData | undefined {
  return load().get(slug);
}

/** True when the page exists and is visible in the current build (drafts are hidden in production). */
export function isLinkable(slug: string): boolean {
  const p = getPage(slug);
  return p !== undefined && !(import.meta.env.PROD && p.draft);
}

/** Site-relative URL of a page, honouring the configured base path. */
export function pageUrl(slug: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return slug === '' ? `${base}/` : `${base}/${slug}/`;
}
