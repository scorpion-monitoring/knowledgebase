// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import { unified } from '@astrojs/markdown-remark';
import rehypeMermaid from 'rehype-mermaid';
import rehypeBaseLinks from './src/plugins/rehype-base-links.mjs';
import { buildSidebar } from './src/data/navigation.ts';

const site = process.env.KB_SITE ?? 'https://scorpion-monitoring.github.io';
const base = process.env.KB_BASE ?? '/knowledgebase';
const production = process.env.NODE_ENV === 'production' || process.argv.includes('build');

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  markdown: {
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    // Mermaid diagrams become inline SVG at build time; nothing runs in the browser.
    processor: unified({
      rehypePlugins: [
        [rehypeBaseLinks, { base }],
        [rehypeMermaid, { strategy: 'inline-svg' }],
      ],
    }),
  },
  integrations: [
    starlight({
      title: 'Scorpion Knowledge Base',
      description:
        'Documentation for Scorpion, the service registry and KPI tracker for research infrastructures.',
      social: [
        {
          icon: 'github',
          label: 'Scorpion on GitHub',
          href: 'https://github.com/scorpion-monitoring/scorpion',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/scorpion-monitoring/knowledgebase/edit/main/',
      },
      sidebar: /** @type {any} */ (buildSidebar(production)),
      customCss: ['./src/styles/kb.css'],
      components: {
        PageTitle: './src/components/overrides/PageTitle.astro',
        Footer: './src/components/overrides/Footer.astro',
      },
      plugins: [starlightLinksValidator()],
    }),
  ],
});
