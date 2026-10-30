import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import GeneratedTable from '../../src/components/GeneratedTable.astro';
import { render } from './helpers';

const generatedRoot = mkdtempSync(join(tmpdir(), 'kb-generated-'));
process.env.KB_GENERATED_ROOT = generatedRoot;

describe('GeneratedTable', () => {
  it('shows a visible notice when the file is missing', async () => {
    const html = await render(GeneratedTable, { props: { file: 'missing-table.json' } });
    expect(html).toContain('Reference not yet generated');
  });
  it('renders rows from a generated file', async () => {
    mkdirSync(generatedRoot, { recursive: true });
    const file = join(generatedRoot, 'unit-test-table.json');
    writeFileSync(file, JSON.stringify([{ id: 'a.b', label: 'First' }]));
    try {
      const html = await render(GeneratedTable, {
        props: { file: 'unit-test-table.json', columns: [{ key: 'id', label: 'Id' }] },
      });
      expect(html).toContain('<th scope="col">Id</th>');
      expect(html).toContain('a.b');
    } finally {
      rmSync(file);
    }
  });
  it('rejects a path outside src/data/generated', async () => {
    await expect(render(GeneratedTable, { props: { file: '../x.json' } })).rejects.toThrow(
      /must be a \.json file name/,
    );
  });
});
