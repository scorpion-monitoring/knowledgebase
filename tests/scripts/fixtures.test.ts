// Rule fixtures: each one copies the site to a temporary directory, adds a page, runs the command and
// asserts the outcome. The control fixture proves the harness itself.

import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../..', import.meta.url));
const fixtures = join(root, 'tests/fixtures');
const COPY = [
  'src',
  'scripts',
  'styles',
  'scorpion.json',
  'package.json',
  'astro.config.mjs',
  'tsconfig.json',
  '.vale.ini',
];
// Copies live inside the repository so Node finds node_modules by walking up (a symlink breaks Vite).
const scratch = join(root, 'tmp-fixtures');
const temps: string[] = [];

interface Fixture {
  commands: string[][];
  expect: 'pass' | 'fail';
  message?: string;
}

function site(name: string): string {
  mkdirSync(scratch, { recursive: true });
  const dir = mkdtempSync(join(scratch, `${name}-`));
  temps.push(dir);
  for (const entry of COPY) cpSync(join(root, entry), join(dir, entry), { recursive: true });
  cpSync(join(fixtures, name, 'files'), dir, { recursive: true });
  return dir;
}

function run(dir: string, cmd: string[]) {
  const [bin, ...args] = cmd as [string, ...string[]];
  // Node tools come from node_modules; Vale is a pinned binary on the PATH.
  const local = join(root, 'node_modules/.bin', bin);
  const r = spawnSync(existsSync(local) ? local : bin, args, {
    cwd: dir,
    encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'production', ASTRO_TELEMETRY_DISABLED: '1' },
  });
  return { status: r.status, output: `${r.stdout}\n${r.stderr}` };
}

afterAll(() => {
  for (const d of temps) rmSync(d, { recursive: true, force: true });
  rmSync(scratch, { recursive: true, force: true });
});

describe('rule fixtures', () => {
  for (const name of readdirSync(fixtures)) {
    const spec = JSON.parse(readFileSync(join(fixtures, name, 'fixture.json'), 'utf8')) as Fixture;
    it(`${name}: ${spec.expect}`, { timeout: 180_000 }, () => {
      const dir = site(name);
      let failed: { status: number | null; output: string } | undefined;
      for (const cmd of spec.commands) {
        const r = run(dir, cmd);
        if (r.status !== 0) {
          failed = r;
          break;
        }
      }
      if (spec.expect === 'pass') {
        expect(failed?.output, 'a control command failed').toBeUndefined();
      } else {
        expect(failed, 'the command should have failed').toBeDefined();
        expect(failed!.status).not.toBe(0);
        expect(failed!.output).toContain(spec.message);
      }
    });
  }
});
