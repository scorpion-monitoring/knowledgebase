// The sidebar definition. astro.config.mjs builds Starlight's sidebar from `buildSidebar()`.
// Add every page that should appear in the sidebar here, in the same commit as the page.
// Pages that are missing, or drafts in a production build, are left out automatically, and so are
// groups that end up empty.

import { journeyPagePath, journeys } from './journeys';
import { optionalModules } from './modules';
import { docsRoot, listPages } from './pages';
import { termGroups, terms } from './terms';

export type NavEntry =
  { slug: string; label?: string } | { label: string; items: NavEntry[]; collapsed?: boolean };

/** User how-to pages for core features (`pnpm new` adds to these lists). */
export const userHowTo: string[] = [];
/** Administrator guide pages by section. */
export const adminPages = {
  operate: [] as string[],
  administer: [] as string[],
  reference: [] as string[],
};
/** Developer guide pages by section. */
export const developerPages = {
  'get-started': [] as string[],
  architecture: [] as string[],
  'module-authoring': [] as string[],
  api: [] as string[],
  reference: [] as string[],
};
/** Extra pages per module directory, besides `index` and `reference` (relative to modules/<dir>/). */
export const modulePages: Record<string, string[]> = {};

const group = (label: string, items: NavEntry[], collapsed = false): NavEntry => ({
  label,
  items,
  collapsed,
});
const page = (slug: string, label?: string): NavEntry => ({ slug, label });
const pages = (slugs: string[]): NavEntry[] => slugs.map((s) => page(s));

function moduleGroup(m: (typeof optionalModules)[number]): NavEntry {
  const base = `modules/${m.dir}`;
  return group(
    m.name,
    [
      page(base, 'Overview'),
      ...(modulePages[m.dir] ?? []).map((p) => page(`${base}/${p}`)),
      page(`${base}/reference`, 'Reference'),
    ],
    true,
  );
}

export function navigationTree(): NavEntry[] {
  return [
    group('Start here', [
      page('start', 'Overview'),
      page('start/how-to-use-this-kb'),
      page('start/what-is-scorpion'),
      page('start/profiles'),
      page('start/which-modules'),
      page('start/scorpion-terms'),
      page('start/whats-new'),
    ]),
    group('Terminology', [
      page('terminology', 'Overview'),
      ...termGroups.map((g) =>
        group(
          g,
          terms.filter((t) => t.group === g).map((t) => page(`terminology/${t.id}`)),
          true,
        ),
      ),
    ]),
    group('User guide', [
      page('user', 'Overview'),
      group(
        'Journeys',
        journeys.map((j) => page(journeyPagePath(j), `${j.id.toUpperCase()}: ${j.title}`)),
        true,
      ),
      group('How-to', pages(userHowTo)),
    ]),
    group('Administrator guide', [
      page('admin', 'Overview'),
      group('Operate', pages(adminPages.operate)),
      group('Administer', pages(adminPages.administer)),
      group('Reference', pages(adminPages.reference)),
    ]),
    group('Developer guide', [
      page('developer', 'Overview'),
      group('Get started', pages(developerPages['get-started'])),
      group('Architecture', pages(developerPages.architecture)),
      group('Module authoring', pages(developerPages['module-authoring'])),
      group('Public API', pages(developerPages.api)),
      group('Reference', pages(developerPages.reference)),
    ]),
    group('Modules', [page('modules', 'Overview'), ...optionalModules.map(moduleGroup)]),
  ];
}

export interface StarlightSidebarItem {
  label: string;
  slug?: string;
  items?: StarlightSidebarItem[];
  collapsed?: boolean;
}

/** Prunes missing pages, drafts (in production) and empty groups. */
export function buildSidebar(
  production: boolean,
  root: string = docsRoot(),
): StarlightSidebarItem[] {
  const available = new Map(listPages(root).map((p) => [p.slug, p]));
  const keep = (slug: string) => {
    const p = available.get(slug);
    return p !== undefined && !(production && p.draft);
  };
  const walk = (entries: NavEntry[]): StarlightSidebarItem[] => {
    const out: StarlightSidebarItem[] = [];
    for (const e of entries) {
      if ('slug' in e) {
        if (keep(e.slug))
          out.push(
            e.label ? { label: e.label, slug: e.slug } : ({ slug: e.slug } as StarlightSidebarItem),
          );
      } else {
        const items = walk(e.items);
        if (items.length > 0) out.push({ label: e.label, items, collapsed: e.collapsed });
      }
    }
    return out;
  };
  return walk(navigationTree());
}
