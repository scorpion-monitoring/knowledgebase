import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { journeys } from '../../src/data/journeys';
import { coreModules, modules, optionalModules } from '../../src/data/modules';
import { profiles } from '../../src/data/profiles';
import { compareVersions, documentedRelease } from '../../src/data/scorpion';
import { terms } from '../../src/data/terms';
import { buildSidebar } from '../../src/data/navigation';

const unique = (xs: string[]) => new Set(xs).size === xs.length;

describe('modules', () => {
  it('has seven core and thirteen optional modules', () => {
    expect(coreModules).toHaveLength(7);
    expect(optionalModules).toHaveLength(13);
  });
  it('has unique ids and directories derived from the id', () => {
    expect(unique(modules.map((m) => m.id))).toBe(true);
    for (const m of modules) expect(m.dir).toBe(m.id.replaceAll('.', '-'));
  });
  it('only depends on known modules, and core never on optional', () => {
    const ids = new Set<string>(modules.map((m) => m.id));
    for (const m of modules) {
      for (const d of m.dependsOn) {
        expect(ids.has(d), `${m.id} -> ${d}`).toBe(true);
        if (m.kind === 'core') expect(modules.find((x) => x.id === d)?.kind).toBe('core');
      }
    }
  });
});

describe('profiles', () => {
  it('has core-only, registry and full as existing and two planned profiles', () => {
    expect(profiles.filter((p) => p.status === 'exists').map((p) => p.id)).toEqual([
      'core-only',
      'registry',
      'full',
    ]);
    expect(profiles.filter((p) => p.status === 'planned').map((p) => p.id)).toEqual([
      'nfdi-onboarding',
      'kpi-tracker',
    ]);
  });
  it('includes every core module in every profile', () => {
    for (const p of profiles) {
      for (const m of coreModules) expect(p.modules[m.id], `${p.id} ${m.id}`).toBe('included');
    }
  });
  it('has every dependency of an included module included or optional in the same profile', () => {
    // A failure here points at the source matrix: report it, do not "fix" it.
    for (const p of profiles) {
      for (const m of modules) {
        if (p.modules[m.id] !== 'included') continue;
        for (const d of m.dependsOn) {
          expect(
            p.modules[d as keyof typeof p.modules],
            `${p.id}: ${m.id} needs ${d}`,
          ).toBeDefined();
        }
      }
    }
  });
});

describe('journeys', () => {
  it('has J01 to J18 with unique ids', () => {
    expect(journeys.map((j) => j.id)).toEqual(
      Array.from({ length: 18 }, (_, i) => `j${String(i + 1).padStart(2, '0')}`),
    );
  });
  it('only names known modules', () => {
    const ids = new Set<string>(modules.map((m) => m.id));
    for (const j of journeys) for (const m of j.modules) expect(ids.has(m)).toBe(true);
  });
});

describe('terms', () => {
  it('has unique ids', () => {
    expect(unique(terms.map((t) => t.id))).toBe(true);
  });
});

describe('scorpion.json', () => {
  it('is a release tag', () => {
    expect(documentedRelease).toMatch(/^v\d+\.\d+\.\d+$/);
  });
  it('compares versions numerically', () => {
    expect(compareVersions('v0.10.0', 'v0.9.0')).toBeGreaterThan(0);
    expect(compareVersions('v0.13.0', 'v0.13.0')).toBe(0);
  });
});

describe('navigation', () => {
  const root = mkdtempSync(join(tmpdir(), 'kb-nav-'));
  const write = (slug: string, draft: boolean) => {
    const file = join(root, `${slug}.mdx`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, `---\ntitle: T\ndraft: ${draft}\n---\n`);
  };
  write('start/index', false);
  write('start/profiles', true);
  write('modules/index', false);

  it('keeps drafts in development and drops them in production', () => {
    const slugs = (p: boolean) =>
      buildSidebar(p, root).flatMap((g) => g.items?.map((i) => i.slug) ?? []);
    expect(slugs(false)).toContain('start/profiles');
    expect(slugs(true)).not.toContain('start/profiles');
  });
  it('drops missing pages and groups that end up empty', () => {
    expect(buildSidebar(true, root).map((g) => g.label)).toEqual(['Start here', 'Modules']);
  });
});
