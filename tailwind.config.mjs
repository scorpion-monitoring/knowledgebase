import starlightPlugin from '@astrojs/starlight-tailwind';

// Generated color palettes
const accent = { 200: 'oklch(0.7706 0.0691 259.51)', 600: 'oklch(0.6794 0.1554 259.51)', 900: 'oklch(0.6371 0.1953 259.51)', 950: 'oklch(0.5882 0.2171 259.51)' };
const gray = { 100: '#f3f7fb', 200: '#e6eff8', 300: '#b9c3ce', 400: '#7a8ea2', 500: '#485a6d', 700: '#293a4c', 800: '#182839', 900: '#121921' };

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue,yml}'],
	theme: {
		extend: {
      colors: { accent, gray },
    },
	},
	plugins: [starlightPlugin()],
}