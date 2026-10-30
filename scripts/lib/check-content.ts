// Content checks for the KB. `runContentChecks(root)` is pure with respect to `root`, so the rule
// fixtures can run it against a temporary copy of the site.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'yaml';
import { compareVersions } from '../../src/data/scorpion';
import { journeys } from '../../src/data/journeys';
import { modules, optionalModules } from '../../src/data/modules';
import { terms } from '../../src/data/terms';
import { frontmatterOf, listPages } from '../../src/data/pages';

export interface Issue {
  file: string;
  message: string;
}

export interface ContentReport {
  errors: Issue[];
  /** `{/* source: … *\/}` comments, an inventory for K3 rather than a failure. */
  sources: { file: string; source: string }[];
  notices: string[];
}

interface Page {
  file: string;
  rel: string;
  slug: string;
  data: Record<string, unknown>;
  body: string;
}

function readPages(root: string): Page[] {
  const docs = join(root, 'src/content/docs');
  return listPages(docs).map((p) => {
    const source = readFileSync(p.file, 'utf8');
    const fm = frontmatterOf(source);
    return {
      file: p.file,
      rel: relative(root, p.file),
      slug: p.slug,
      data: (parse(fm) ?? {}) as Record<string, unknown>,
      body: source.slice(source.indexOf('---', 3) + 3),
    };
  });
}

const attr = (tag: string, name: string) => new RegExp(`<${tag}\\b[^>]*?\\b${name}="([^"]+)"`, 'g');

function matches(body: string, tag: string, name: string): string[] {
  return [...body.matchAll(attr(tag, name))].map((m) => m[1]!);
}

export function runContentChecks(root: string): ContentReport {
  const report: ContentReport = { errors: [], sources: [], notices: [] };
  const err = (file: string, message: string) => report.errors.push({ file, message });
  const docs = join(root, 'src/content/docs');
  const pages = readPages(root);

  const released = (
    JSON.parse(readFileSync(join(root, 'scorpion.json'), 'utf8')) as { documents: string }
  ).documents;
  const moduleIds = new Set<string>(modules.map((m) => m.id));
  const termIds = new Set(terms.map((t) => t.id));
  const journeyIds = new Set(journeys.map((j) => j.id));

  // 1. Every optional module has a router page.
  for (const m of optionalModules) {
    const rel = `src/content/docs/modules/${m.dir}/index.mdx`;
    if (!existsSync(join(root, rel))) err(rel, `module ${m.id} has no router page`);
  }

  // 2. Journeys and journey pages match one to one.
  const journeyDir = join(docs, 'user/journeys');
  const journeyFiles = existsSync(journeyDir)
    ? readdirSync(journeyDir).filter((f) => /\.mdx?$/.test(f) && !/^index\./.test(f))
    : [];
  for (const j of journeys) {
    const own = journeyFiles.filter((f) => f.startsWith(`${j.id}-`));
    if (own.length !== 1) {
      err(
        `src/content/docs/user/journeys/`,
        `journey ${j.id} must have exactly one page, found ${own.length}`,
      );
    }
  }
  for (const f of journeyFiles) {
    const id = /^(j\d+)-/.exec(f)?.[1];
    if (!id || !journeyIds.has(id)) {
      err(`src/content/docs/user/journeys/${f}`, `journey page is not in src/data/journeys.ts`);
    }
  }

  for (const p of pages) {
    // 3. Module ids in frontmatter and components.
    const fmModules = Array.isArray(p.data.modules) ? (p.data.modules as unknown[]) : [];
    for (const id of fmModules) {
      if (!moduleIds.has(String(id))) err(p.rel, `unknown module id "${id}" in modules:`);
    }
    const used = [
      ...matches(p.body, 'ModuleBadge', 'id'),
      ...matches(p.body, 'RequiresModule', 'id'),
      ...matches(p.body, 'ProfileMatrix', 'module'),
    ];
    for (const id of used) {
      if (!moduleIds.has(id)) err(p.rel, `unknown module id "${id}" in a component`);
    }

    // 4. Term ids.
    for (const id of matches(p.body, 'Term', 'id')) {
      if (!termIds.has(id)) err(p.rel, `<Term id="${id}"> is not in src/data/terms.ts`);
    }

    // 5. Draft status against the documented release.
    const since = p.data.since;
    if (p.data.draft !== true && typeof since === 'string' && /^v\d+\.\d+\.\d+$/.test(since)) {
      if (compareVersions(since, released) > 0) {
        err(p.rel, `since ${since} is later than scorpion.json (${released}); set draft: true`);
      }
    }

    // 6. Source comments.
    for (const m of p.body.matchAll(/\{\/\*\s*source:\s*([\s\S]*?)\s*\*\/\}/g)) {
      report.sources.push({ file: p.rel, source: m[1]!.replace(/\s+/g, ' ') });
    }

    // 7. Journey steps against the export.
    if (typeof p.data.journey === 'string' && !journeyIds.has(p.data.journey)) {
      err(p.rel, `journey ${p.data.journey} is not in src/data/journeys.ts`);
    }
  }

  checkJourneySteps(root, pages, report);
  return report;
}

/** Titles of the ordered list items inside the first <Steps> block. */
export function pageSteps(body: string): string[] {
  const block = /<Steps>([\s\S]*?)<\/Steps>/.exec(body)?.[1];
  if (!block) return [];
  return [...block.matchAll(/^\s*\d+\.\s+(.*)$/gm)].map((m) =>
    m[1]!
      .replace(/[*_`]/g, '')
      .replace(/[.:]\s*$/, '')
      .trim(),
  );
}

function checkJourneySteps(root: string, pages: Page[], report: ContentReport): void {
  const file = join(root, 'src/data/generated/journey-steps.json');
  if (!existsSync(file)) {
    report.notices.push(
      'SKIPPED journey step check: src/data/generated/journey-steps.json does not exist (no Scorpion docs export yet, R1 and R2).',
    );
    return;
  }
  const exported = JSON.parse(readFileSync(file, 'utf8')) as Record<string, string[]>;
  for (const p of pages) {
    const id = p.data.journey;
    if (typeof id !== 'string' || p.data.draft === true) continue;
    const expected = exported[id];
    if (!expected) {
      report.errors.push({ file: p.rel, message: `no step list for journey ${id} in the export` });
      continue;
    }
    const actual = pageSteps(p.body);
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      report.errors.push({
        file: p.rel,
        message: `steps differ from the export for ${id}.\n  page:   ${actual.join(' | ')}\n  export: ${expected.join(' | ')}`,
      });
    }
  }
}
