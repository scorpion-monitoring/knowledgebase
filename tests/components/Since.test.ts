import { describe, expect, it } from 'vitest';
import Since from '../../src/components/Since.astro';
import { render } from './helpers';

describe('Since', () => {
  it('renders the marker', async () => {
    expect(await render(Since, { props: { version: 'v0.13.0' } })).toContain('Since v0.13.0');
  });
  it('rejects a malformed version', async () => {
    await expect(render(Since, { props: { version: '0.13' } })).rejects.toThrow(/release tag/);
  });
});
