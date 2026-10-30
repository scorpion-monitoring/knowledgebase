import { describe, expect, it } from 'vitest';
import JourneyMeta from '../../src/components/JourneyMeta.astro';
import { render } from './helpers';

describe('JourneyMeta', () => {
  it('lists actors, roles and modules', async () => {
    const html = await render(JourneyMeta, { props: { id: 'j05' } });
    expect(html).toContain('User, Admin');
    expect(html).toContain('Organisations');
  });
  it('says so when no optional module is needed', async () => {
    expect(await render(JourneyMeta, { props: { id: 'j02' } })).toContain('Core only');
  });
  it('fails on an unknown journey', async () => {
    await expect(render(JourneyMeta, { props: { id: 'j99' } })).rejects.toThrow(
      /unknown journey id/,
    );
  });
});
