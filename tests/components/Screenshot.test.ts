import { describe, expect, it } from 'vitest';
import Screenshot from '../../src/components/Screenshot.astro';
import { render } from './helpers';

describe('Screenshot', () => {
  it('renders a light and a dark image with the same alt text', async () => {
    const html = await render(Screenshot, {
      props: { light: '/l.png', dark: '/d.png', alt: 'The Submit button is disabled.' },
    });
    expect(html).toContain('kb-screenshot__light');
    expect(html).toContain('kb-screenshot__dark');
    expect(html.match(/alt="The Submit button is disabled\."/g)?.length).toBe(2);
  });
  it('requires alt text', async () => {
    await expect(
      render(Screenshot, { props: { light: '/l.png', dark: '/d.png', alt: ' ' } }),
    ).rejects.toThrow(/alt text is required/);
  });
});
