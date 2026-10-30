import { describe, expect, it } from 'vitest';
import ModuleBadge from '../../src/components/ModuleBadge.astro';
import { render } from './helpers';

describe('ModuleBadge', () => {
  it('shows the module name', async () => {
    const html = await render(ModuleBadge, { props: { id: 'kpi.ingestion' } });
    expect(html).toContain('KPI ingestion');
    expect(html).toContain('data-module="kpi.ingestion"');
  });
  it('is a plain badge while the router page is a draft (production) or missing', async () => {
    const html = await render(ModuleBadge, { props: { id: 'kpi.ingestion' } }, true);
    expect(html).not.toContain('<a');
  });
  it('is a plain badge for a core module', async () => {
    expect(await render(ModuleBadge, { props: { id: 'core.authz' } })).not.toContain('<a');
  });
  it('fails on an unknown id', async () => {
    await expect(render(ModuleBadge, { props: { id: 'nope' } })).rejects.toThrow(
      /unknown module id/,
    );
  });
});
