import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import Term from '../../src/components/Term.astro';
import { resetPageCache } from '../../src/lib/pages';
import { render } from './helpers';

// Term pages arrive in K1: use a scratch docs tree, never the real one.
const docs = mkdtempSync(join(tmpdir(), 'kb-term-'));
process.env.KB_DOCS_ROOT = docs;
const dir = join(docs, 'terminology');
const file = join(dir, 'indicator.mdx');

function page(draft: boolean) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    file,
    `---\ntitle: Indicator\ndescription: x\npageType: explanation\naudience: all\ndraft: ${draft}\nshort: A measurable sign of progress.\n---\n`,
  );
  resetPageCache();
}

describe('Term', () => {
  it('links to the term page with the short text as tooltip', async () => {
    page(false);
    try {
      const html = await render(Term, { props: { id: 'indicator' } });
      expect(html).toContain('href="/terminology/indicator/"');
      expect(html).toContain('title="A measurable sign of progress."');
    } finally {
      rmSync(file);
      resetPageCache();
    }
  });
  it('renders plain text for a draft page in production', async () => {
    page(true);
    try {
      const html = await render(Term, { props: { id: 'indicator' } }, true);
      expect(html).not.toContain('<a');
      expect(html).toContain('indicator');
    } finally {
      rmSync(file);
      resetPageCache();
    }
  });
  it('fails on an unknown id', async () => {
    await expect(render(Term, { props: { id: 'no-such-term' } })).rejects.toThrow(
      /unknown term id/,
    );
  });
});
