import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { vi } from 'vitest';

export async function render(
  component: Parameters<AstroContainer['renderToString']>[0],
  options: Parameters<AstroContainer['renderToString']>[1] = {},
  production = false,
): Promise<string> {
  vi.stubEnv('PROD', production);
  const container = await AstroContainer.create();
  return container.renderToString(component, options);
}
