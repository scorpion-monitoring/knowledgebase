import { describe, expect, it } from 'vitest';
import RequiresModule from '../../src/components/RequiresModule.astro';
import { render } from './helpers';

describe('RequiresModule', () => {
  it('renders a labelled aside with the badge and the content', async () => {
    const html = await render(RequiresModule, {
      props: { id: 'public-api' },
      slots: { default: '<p>Needs the API.</p>' },
    });
    expect(html).toContain('aria-label="Requires a module"');
    expect(html).toContain('Public API');
    expect(html).toContain('Needs the API.');
  });
  it('fails on an unknown id', async () => {
    await expect(render(RequiresModule, { props: { id: 'nope' } })).rejects.toThrow(
      /unknown module id/,
    );
  });
});
