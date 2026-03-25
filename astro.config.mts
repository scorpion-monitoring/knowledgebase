// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightOpenAPI, { openAPISidebarGroups } from 'starlight-openapi'
import rehypeSlug from 'rehype-slug';
import { rehypeAutolink } from './plugins/rehype-autolink';
import tailwind from '@astrojs/tailwind';
import starlightLinksValidator from 'starlight-links-validator'
import starlightImageZoom from 'starlight-image-zoom'
import icon from "astro-icon";

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	base: '/knowledgebase',
	integrations: [
		icon(),
		starlight({
			title: 'Scorpion Knowledge Base',
			favicon: "favicon.png",
			customCss: [
				// Relative path to your custom CSS file
				'./src/styles/tailwind.css',
				'./src/styles/custom.css',
			],
			components: {
				MarkdownContent: '@components/starlight/MarkdownContent.astro',
				Footer: '@components/starlight/Footer.astro',
			},
			editLink: {
				baseUrl: 'https://github.com/scorpion-monitoring/scorpion-knowledgebase/edit/main/'
			},
			social: [
				{ icon: 'github', href: 'https://github.com/scorpion-monitoring/scorpion-knowledgebase', label: 'GitHub' },
			],
			plugins: [
				starlightLinksValidator(),
				starlightImageZoom(),
				starlightOpenAPI([
					{
					base: 'api',
					schema: 'src/schemas/api-schema.yaml',
					},
				]),
			],
			sidebar: [
				{
					label: 'About',
					collapsed: true,
					autogenerate: { directory: '01-about' },
				},
				{
					label: 'Concepts',
					collapsed: true,
					autogenerate: { directory: '02-concepts' },
				},
				{
					label: 'User Documentation',
					collapsed: true,
					autogenerate: { directory: '03-user-documentation' },
				},
				{
					label: 'Instance Administration',
					collapsed: true,
					autogenerate: { directory: '04-admin-documentation' },
				},
				{
					label: 'Developer Documentation',
					collapsed: true,
					autogenerate: { directory: '05-developer-documentation' },
				},
				...openAPISidebarGroups,
			],
			expressiveCode: {
				defaultProps: {
					// Enable wrap for specific languages
					overridesByLang: {
						'txt,md,bash': { wrap: true },
					},
				},
			},
		}),
		tailwind({
			// Disable the default base styles:
			applyBaseStyles: false,
		}),
		react()],
	markdown: {
		rehypePlugins: [rehypeSlug, ...rehypeAutolink()],
	},
});
