import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { pageSteps, runContentChecks } from '../../scripts/lib/check-content';

const repo = fileURLToPath(new URL('../..', import.meta.url));

function site(pages: Record<string, string>, files: Record<string, string> = {}) {
  const root = mkdtempSync(join(tmpdir(), 'kb-content-'));
  writeFileSync(join(root, 'scorpion.json'), '{ "documents": "v0.13.0" }');
  for (const [path, body] of Object.entries({
    ...Object.fromEntries(Object.entries(pages).map(([p, b]) => [`src/content/docs/${p}`, b])),
    ...files,
  })) {
    const f = join(root, path);
    mkdirSync(dirname(f), { recursive: true });
    writeFileSync(f, body);
  }
  mkdirSync(join(root, 'src/content/docs'), { recursive: true });
  return root;
}

const page = (fm: string, body = '') => `---\ntitle: T\ndescription: d\n${fm}\n---\n${body}\n`;
const messages = (root: string) =>
  runContentChecks(root).errors.map((e) => `${e.file}: ${e.message}`);

describe('content checks', () => {
  it('reports every optional module without a router page', () => {
    const m = messages(site({}));
    expect(m.filter((x) => x.includes('has no router page'))).toHaveLength(13);
  });
  it('accepts a router page', () => {
    const m = messages(site({ 'modules/kpi-ingestion/index.mdx': page('') }));
    expect(m.some((x) => x.includes('kpi.ingestion has no router'))).toBe(false);
  });
  it('requires exactly one page per journey and a journey for every page', () => {
    const m = messages(
      site({
        'user/journeys/j01-register-and-get-approved.mdx': page('journey: j01'),
        'user/journeys/j01-duplicate.mdx': page('journey: j01'),
        'user/journeys/j99-unknown.mdx': page(''),
      }),
    );
    expect(m.some((x) => x.includes('journey j01 must have exactly one page, found 2'))).toBe(true);
    expect(m.some((x) => x.includes('journey j02 must have exactly one page, found 0'))).toBe(true);
    expect(
      m.some((x) => x.includes('j99-unknown.mdx') && x.includes('not in src/data/journeys.ts')),
    ).toBe(true);
  });
  it('flags unknown module ids in frontmatter and components', () => {
    const m = messages(
      site({
        'a.mdx': page(
          'modules: [nope.one]',
          '<ModuleBadge id="nope.two" />\n<RequiresModule id="nope.three">x</RequiresModule>',
        ),
      }),
    );
    for (const id of ['nope.one', 'nope.two', 'nope.three']) {
      expect(m.some((x) => x.includes('a.mdx') && x.includes(id))).toBe(true);
    }
  });
  it('flags unknown term ids', () => {
    expect(
      messages(site({ 'a.mdx': page('', '<Term id="nope" />') })).some((x) =>
        x.includes('<Term id="nope">'),
      ),
    ).toBe(true);
    expect(
      messages(site({ 'a.mdx': page('', '<Term id="indicator" />') })).some((x) =>
        x.includes('<Term'),
      ),
    ).toBe(false);
  });
  it('flags a published page that is newer than scorpion.json, but not a draft', () => {
    expect(
      messages(site({ 'a.mdx': page('since: v0.14.0') })).some((x) =>
        x.includes('later than scorpion.json'),
      ),
    ).toBe(true);
    expect(
      messages(site({ 'a.mdx': page('since: v0.14.0\ndraft: true') })).some((x) =>
        x.includes('later than'),
      ),
    ).toBe(false);
    expect(
      messages(site({ 'a.mdx': page('since: v0.13.0') })).some((x) => x.includes('later than')),
    ).toBe(false);
  });
  it('inventories source comments without failing', () => {
    const r = runContentChecks(
      site({ 'a.mdx': page('', '{/* source: scorpion@v0.13.0 packages/kernel/README.md */}') }),
    );
    expect(r.sources).toEqual([
      { file: 'src/content/docs/a.mdx', source: 'scorpion@v0.13.0 packages/kernel/README.md' },
    ]);
  });
  it('skips the journey step check with a visible notice while there is no export', () => {
    expect(runContentChecks(site({})).notices.join('\n')).toContain('SKIPPED journey step check');
  });
  it('compares journey steps with the export when it exists', () => {
    const body = '<Steps>\n\n1. **Open the form**\n2. **Save**\n\n</Steps>';
    const ok = site(
      { 'a.mdx': page('journey: j01', body) },
      {
        'src/data/generated/journey-steps.json': JSON.stringify({ j01: ['Open the form', 'Save'] }),
      },
    );
    expect(messages(ok).some((x) => x.includes('steps differ'))).toBe(false);
    const bad = site(
      { 'a.mdx': page('journey: j01', body) },
      {
        'src/data/generated/journey-steps.json': JSON.stringify({
          j01: ['Open the form', 'Submit'],
        }),
      },
    );
    expect(messages(bad).some((x) => x.includes('steps differ'))).toBe(true);
  });
  it('extracts step titles', () => {
    expect(pageSteps('<Steps>\n1. **A.**\n2. B\n</Steps>')).toEqual(['A', 'B']);
  });
  it('passes on the real repository content once the skeleton exists', () => {
    // The skeleton branch fills the module routers and journey pages; until then this only runs the code path.
    expect(() => runContentChecks(repo)).not.toThrow();
  });
});
