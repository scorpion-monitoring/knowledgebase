import { defineConfig } from '@playwright/test';

const base = '/knowledgebase';
const port = 4322;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${port}` },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  // Builds with the default base first, so the smoke test does not depend on what ran before.
  webServer: {
    command: `pnpm exec astro build && pnpm exec astro preview --ignore-lock --port ${port}`,
    url: `http://localhost:${port}${base}/`,
    env: { KB_BASE: base },
    reuseExistingServer: false,
    timeout: 240_000,
  },
});
