/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/fixtures/**', 'tests/e2e/**', 'node_modules/**'],
    testTimeout: 30_000,
  },
});
