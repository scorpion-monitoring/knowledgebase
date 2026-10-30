// The site is fully static: no analytics, no third-party scripts, fonts or stylesheets, no CDN.

import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../..', import.meta.url));
const out = join(root, 'tmp-fixtures/dist-external');

function files(dir: string, ext: RegExp): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p, ext) : ext.test(n) ? [p] : [];
  });
}

afterAll(() => rmSync(out, { recursive: true, force: true }));

describe('built site', () => {
  it('references no external script, stylesheet or font', { timeout: 180_000 }, () => {
    mkdirSync(join(root, 'tmp-fixtures'), { recursive: true });
    const build = spawnSync(join(root, 'node_modules/.bin/astro'), ['build', '--outDir', out], {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
    });
    expect(build.status, build.stdout + build.stderr).toBe(0);

    const problems: string[] = [];
    for (const f of files(out, /\.html$/)) {
      const html = readFileSync(f, 'utf8');
      for (const m of html.matchAll(/<script\b[^>]*\bsrc="(https?:)?\/\/[^"]+"/g))
        problems.push(`${f}: ${m[0]}`);
      for (const m of html.matchAll(
        /<link\b[^>]*\brel="(stylesheet|preload|preconnect|prefetch|dns-prefetch)"[^>]*>/g,
      )) {
        if (/href="(https?:)?\/\//.test(m[0])) problems.push(`${f}: ${m[0]}`);
      }
    }
    for (const f of files(out, /\.css$/)) {
      const css = readFileSync(f, 'utf8');
      for (const m of css.matchAll(/(url\(|@import\s+)['"]?(https?:)?\/\/[^)'"\s]+/g))
        problems.push(`${f}: ${m[0]}`);
    }
    expect(problems).toEqual([]);
  });
});
