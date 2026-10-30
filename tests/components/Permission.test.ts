import { describe, expect, it } from 'vitest';
import Permission from '../../src/components/Permission.astro';
import { assertKnownPermission } from '../../src/lib/permissions';
import { render } from './helpers';

describe('Permission', () => {
  it('renders the id as code', async () => {
    const html = await render(Permission, { props: { id: 'registry.services.service.publish' } });
    expect(html).toContain('<code class="kb-permission"');
    expect(html).toContain('registry.services.service.publish');
  });
  it('fails on something that is not a permission id', async () => {
    await expect(render(Permission, { props: { id: 'not an id' } })).rejects.toThrow(
      /not a permission id/,
    );
  });
  it('checks against generated data once it exists (K3 hook)', () => {
    expect(() => assertKnownPermission('a.b.c', new Set(['x.y.z']))).toThrow(
      /not in the generated/,
    );
    expect(() => assertKnownPermission('x.y.z', new Set(['x.y.z']))).not.toThrow();
  });
});
