import { describe, expect, it } from 'vitest';
import ProfileMatrix from '../../src/components/ProfileMatrix.astro';
import { modules } from '../../src/data/modules';
import { render } from './helpers';

describe('ProfileMatrix', () => {
  it('renders every module and marks planned profiles', async () => {
    const html = await render(ProfileMatrix, { props: {} });
    expect(html.match(/<tr>/g)?.length).toBe(modules.length + 1);
    expect(html).toContain('nfdi-onboarding');
    expect(html).toContain('(planned)');
  });
  it('renders one row for one module', async () => {
    const html = await render(ProfileMatrix, { props: { module: 'registry.services' } });
    expect(html.match(/<tr>/g)?.length).toBe(2);
  });
  it('fails on an unknown module', async () => {
    await expect(render(ProfileMatrix, { props: { module: 'nope' } })).rejects.toThrow(
      /unknown module id/,
    );
  });
});
