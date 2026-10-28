import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';

const runbook = fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url));

export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [
    vitePreprocess(),
    mdsvex({ extensions: ['.svx'], layout: { runbook } }),
  ],
  kit: {
    // Published with GitHub Pages from the repo's docs/ folder.
    adapter: adapter({ pages: '../docs', assets: '../docs', strict: false }),
    paths: { base: '/what-it-shows' },
    alias: { '#lib': 'src/lib' },
    // The pages link to /kb/… without the base, so list every route instead of crawling.
    prerender: { entries: ['*'], handleHttpError: 'warn' },
  },
};
