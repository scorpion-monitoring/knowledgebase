import { expect, test } from '@playwright/test';

const base = '/knowledgebase';

const sections = [
  { path: '/start/', title: 'Start here' },
  { path: '/terminology/', title: 'Terminology' },
  { path: '/user/', title: 'User guide' },
  { path: '/admin/', title: 'Administrator guide' },
  { path: '/developer/', title: 'Developer guide' },
  { path: '/modules/', title: 'Modules' },
];

test('the landing page renders with a card for each audience', async ({ page }) => {
  await page.goto(`${base}/`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Scorpion Knowledge Base');
  for (const name of [
    'I use an instance',
    'I run an instance',
    'I build on Scorpion',
    'Terminology',
  ]) {
    await expect(page.getByText(name, { exact: true })).toBeVisible();
  }
});

for (const s of sections) {
  test(`the ${s.title} index renders`, async ({ page }) => {
    const response = await page.goto(`${base}${s.path}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(s.title);
  });
}

test('the sidebar has the six top-level groups', async ({ page }) => {
  await page.goto(`${base}/start/`);
  const groups = page.locator('nav[aria-label="Main"] ul.top-level > li > details > summary');
  await expect(groups).toHaveText([
    'Start here',
    'Terminology',
    'User guide',
    'Administrator guide',
    'Developer guide',
    'Modules',
  ]);
});

test('search finds a word from the landing page', async ({ page }) => {
  await page.goto(`${base}/`);
  await page.locator('site-search button').first().click();
  await page.locator('dialog input').first().fill('audience');
  await expect(page.locator('dialog .pagefind-ui__result').first()).toBeVisible({
    timeout: 15_000,
  });
});

test('the Mermaid diagram is an inline SVG', async ({ page }) => {
  await page.goto(`${base}/start/how-to-use-this-kb/`);
  const svg = page.locator('main svg[id^="mermaid"], main svg[aria-roledescription]').first();
  await expect(svg).toBeVisible();
  await expect(svg).toContainText('User guide');
});

test('no page requests another origin', async ({ page, baseURL }) => {
  const foreign: string[] = [];
  page.on('request', (r) => {
    const url = r.url();
    if (!url.startsWith('data:') && !url.startsWith(baseURL!)) foreign.push(url);
  });
  for (const path of ['/', ...sections.map((s) => s.path), '/start/how-to-use-this-kb/']) {
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  }
  expect(foreign).toEqual([]);
});
