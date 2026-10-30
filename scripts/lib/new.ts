// `pnpm new <kind> <id> [title]`: scaffolds a page from a template. It refuses to overwrite a page,
// checks ids against the data files and adds the page to src/data/navigation.ts where that file
// lists pages by hand.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { journeyPagePath, getJourney } from '../../src/data/journeys';
import { getModule } from '../../src/data/modules';
import { getTerm } from '../../src/data/terms';
import { adminTaskPage, developerPage, journeyPage, modulePage, termPage } from './templates';

export const kinds = ['journey', 'term', 'module', 'admin-task', 'developer'] as const;
export type Kind = (typeof kinds)[number];

const adminSections = ['operate', 'administer', 'reference'];
const developerSections = ['get-started', 'architecture', 'module-authoring', 'api', 'reference'];

export const usage = `Usage: pnpm new <kind> <id> [title] [--section <name>] [--module <module-id>]

  journey <jNN> [title]      id must be in src/data/journeys.ts
  term <id> [title]          id must be in src/data/terms.ts
  module <module-id>         optional module from src/data/modules.ts
  admin-task <slug> [title]  --section ${adminSections.join('|')} (default administer)
  developer <slug> [title]   --section ${developerSections.join('|')} (default get-started)

admin-task and developer take --module to create a module-specific page.`;

export class UsageError extends Error {}

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a.startsWith('--')) {
      const value = argv[++i];
      if (value === undefined) throw new UsageError(`${a} needs a value`);
      flags[a.slice(2)] = value;
    } else positional.push(a);
  }
  return { positional, flags };
}

const titleCase = (slug: string) => {
  const words = slug.replace(/[-_]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/**
 * Adds `slug` to the list `key` inside the object `block` of navigation.ts (for example block
 * `adminPages`, key `operate`). A missing key is created, which is how module pages are added.
 */
export function addToNavigation(file: string, block: string, key: string, slug: string): void {
  const source = readFileSync(file, 'utf8');
  const open = new RegExp(`export const ${block}[^=]*=\\s*\\{`).exec(source);
  if (!open) throw new Error(`${file}: cannot find "${block}"`);
  const start = open.index + open[0].length;
  const end = source.indexOf('};', start);
  const body = source.slice(start, end);
  const re = new RegExp(`(['"]?${key}['"]?:\\s*\\[)([^\\]]*)(\\])`);
  const m = re.exec(body);
  let next: string;
  if (m) {
    const items = m[2]!.trim().replace(/,\s*$/, '');
    next = body.replace(re, `${m[1]}${items ? `${items}, ` : ''}'${slug}'${m[3]}`);
  } else {
    next = `${body.trimEnd()}\n  '${key}': ['${slug}'],\n`;
  }
  writeFileSync(file, source.slice(0, start) + next + source.slice(end));
}

export interface Scaffolded {
  file: string;
  /** True when src/data/navigation.ts was edited. */
  navigation: boolean;
}

export function scaffold(root: string, argv: string[]): Scaffolded {
  const { positional, flags } = parseArgs(argv);
  const [kind, id, ...rest] = positional;
  if (!kind || !kinds.includes(kind as Kind))
    throw new UsageError(`Unknown kind "${kind ?? ''}".\n\n${usage}`);
  if (!id) throw new UsageError(`Missing id.\n\n${usage}`);
  const title = rest.join(' ').trim();
  const docs = join(root, 'src/content/docs');
  const nav = join(root, 'src/data/navigation.ts');

  let rel: string;
  let content: string;
  let navigation: { block: string; key: string; slug: string } | undefined;

  switch (kind as Kind) {
    case 'journey': {
      const j = getJourney(id);
      if (!j)
        throw new UsageError(`Unknown journey id "${id}". Add it to src/data/journeys.ts first.`);
      rel = `${journeyPagePath(j)}.mdx`;
      content = journeyPage(j, title || j.title);
      break;
    }
    case 'term': {
      const t = getTerm(id);
      if (!t) throw new UsageError(`Unknown term id "${id}". Add it to src/data/terms.ts first.`);
      rel = `terminology/${id}.mdx`;
      content = termPage(t, title || titleCase(id));
      break;
    }
    case 'module': {
      const m = getModule(id);
      if (!m)
        throw new UsageError(`Unknown module id "${id}". Add it to src/data/modules.ts first.`);
      if (m.kind === 'core') {
        throw new UsageError(`${id} is a core module: core modules have no module section.`);
      }
      rel = `modules/${m.dir}/index.mdx`;
      content = modulePage(m);
      break;
    }
    case 'admin-task':
    case 'developer': {
      const admin = kind === 'admin-task';
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id))
        throw new UsageError(`"${id}" is not a kebab-case slug.`);
      const moduleId = flags.module;
      const mod = moduleId ? getModule(moduleId) : undefined;
      if (moduleId && !mod) throw new UsageError(`Unknown module id "${moduleId}".`);
      if (mod && mod.kind === 'core')
        throw new UsageError(`${moduleId} is a core module: it has no module section.`);
      const page = title || titleCase(id);
      content = admin
        ? adminTaskPage(page, mod ? [mod.id] : [])
        : developerPage(page, mod ? [mod.id] : []);
      if (mod) {
        const audience = admin ? 'admin' : 'developer';
        rel = `modules/${mod.dir}/${audience}/${id}.mdx`;
        navigation = { block: 'modulePages', key: mod.dir, slug: `${audience}/${id}` };
      } else {
        const sections = admin ? adminSections : developerSections;
        const section = flags.section ?? (admin ? 'administer' : 'get-started');
        if (!sections.includes(section)) {
          throw new UsageError(`Unknown section "${section}". Use one of: ${sections.join(', ')}.`);
        }
        rel = `${admin ? 'admin' : 'developer'}/${section}/${id}.mdx`;
        navigation = {
          block: admin ? 'adminPages' : 'developerPages',
          key: section,
          slug: rel.replace(/\.mdx$/, ''),
        };
      }
      break;
    }
  }

  const file = join(docs, rel);
  if (existsSync(file)) throw new UsageError(`${rel} already exists; not overwriting.`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);

  if (navigation) {
    addToNavigation(nav, navigation.block, navigation.key, navigation.slug);
  }
  return { file, navigation: navigation !== undefined };
}
