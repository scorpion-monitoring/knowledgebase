import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { scaffold, UsageError } from '../../scripts/lib/new';

const repo = fileURLToPath(new URL('../..', import.meta.url));

function root(): string {
  const dir = mkdtempSync(join(tmpdir(), 'kb-new-'));
  mkdirSync(join(dir, 'src/data'), { recursive: true });
  cpSync(join(repo, 'src/data/navigation.ts'), join(dir, 'src/data/navigation.ts'));
  return dir;
}
const read = (dir: string, rel: string) => readFileSync(join(dir, rel), 'utf8');
const headings = (md: string) => [...md.matchAll(/^## (.*)$/gm)].map((m) => m[1]);

describe('pnpm new', () => {
  it('journey: uses the journey template and the catalogue title', () => {
    const dir = root();
    scaffold(dir, ['journey', 'j06']);
    const page = read(dir, 'src/content/docs/user/journeys/j06-create-service.mdx');
    expect(headings(page)).toEqual([
      'Overview',
      'Before you start',
      'Steps',
      'Result',
      'If something goes wrong',
      'Related',
    ]);
    expect(page).toContain('journey: j06');
    expect(page).toContain('modules: [registry.services]');
    expect(page).toContain('draft: true');
  });

  it('term: uses the term template', () => {
    const dir = root();
    scaffold(dir, ['term', 'indicator']);
    const page = read(dir, 'src/content/docs/terminology/indicator.mdx');
    expect(headings(page)).toEqual([
      'Definition',
      'Explanation',
      'Example',
      'Not to be confused with',
      'References',
    ]);
    expect(page).toContain('short:');
  });

  it('module: uses the router template, and refuses a core module', () => {
    const dir = root();
    scaffold(dir, ['module', 'kpi.ingestion']);
    const page = read(dir, 'src/content/docs/modules/kpi-ingestion/index.mdx');
    expect(headings(page)).toEqual([
      'What it does',
      'Included in profiles',
      'Depends on',
      'For users',
      'For administrators',
      'For developers',
    ]);
    expect(page).toContain('<ProfileMatrix module="kpi.ingestion" />');
    expect(() => scaffold(dir, ['module', 'core.authz'])).toThrow(/core module/);
  });

  it('admin-task: uses the template and adds the page to navigation.ts', () => {
    const dir = root();
    scaffold(dir, ['admin-task', 'configure-oidc', '--section', 'operate']);
    const page = read(dir, 'src/content/docs/admin/operate/configure-oidc.mdx');
    expect(headings(page)).toEqual([
      'Goal',
      'Before you start',
      'Steps',
      'Check that it worked',
      'Undo or roll back',
      'Related settings',
    ]);
    expect(read(dir, 'src/data/navigation.ts')).toMatch(
      /operate: \[\s*'admin\/operate\/configure-oidc'/,
    );
  });

  it('admin-task: adds a module page to modulePages', () => {
    const dir = root();
    scaffold(dir, ['admin-task', 'import-templates', '--module', 'kpi.ingestion']);
    expect(
      existsSync(join(dir, 'src/content/docs/modules/kpi-ingestion/admin/import-templates.mdx')),
    ).toBe(true);
    expect(read(dir, 'src/data/navigation.ts')).toContain(
      "'kpi-ingestion': ['admin/import-templates']",
    );
    scaffold(dir, ['admin-task', 'second', '--module', 'kpi.ingestion']);
    expect(read(dir, 'src/data/navigation.ts')).toContain(
      "['admin/import-templates', 'admin/second']",
    );
  });

  it('developer: uses the template and the right section list', () => {
    const dir = root();
    scaffold(dir, ['developer', 'write-a-migration', '--section', 'module-authoring']);
    const page = read(dir, 'src/content/docs/developer/module-authoring/write-a-migration.mdx');
    expect(headings(page)).toEqual([
      'Goal or concept',
      'How it works',
      'Example',
      'Rules and pitfalls',
      'Reference links',
    ]);
    const nav = read(dir, 'src/data/navigation.ts');
    expect(nav).toMatch(
      /'module-authoring': \[\s*'developer\/module-authoring\/write-a-migration'/,
    );
    // The same key in adminPages is untouched.
    expect(nav).toMatch(/adminPages = \{[^}]*reference: \[\] as string\[\]/);
  });

  it('refuses to overwrite a page', () => {
    const dir = root();
    scaffold(dir, ['journey', 'j01']);
    expect(() => scaffold(dir, ['journey', 'j01'])).toThrow(/already exists/);
  });

  it('checks ids against the data files', () => {
    const dir = root();
    expect(() => scaffold(dir, ['journey', 'j99'])).toThrow(UsageError);
    expect(() => scaffold(dir, ['term', 'no-such-term'])).toThrow(/Unknown term id/);
    expect(() => scaffold(dir, ['module', 'no.such'])).toThrow(/Unknown module id/);
    expect(() => scaffold(dir, ['admin-task', 'x', '--module', 'no.such'])).toThrow(
      /Unknown module id/,
    );
    expect(() => scaffold(dir, ['admin-task', 'x', '--section', 'nope'])).toThrow(
      /Unknown section/,
    );
    expect(() => scaffold(dir, ['nonsense', 'x'])).toThrow(/Unknown kind/);
  });
});
