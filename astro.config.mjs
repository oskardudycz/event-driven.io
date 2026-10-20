import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';

// An isolated migration trial. Gatsby still owns public/ and publication.
export default defineConfig({
  site: 'https://event-driven.io',
  srcDir: './astro/src',
  publicDir: './static',
  outDir: './visual-artifacts/astro',
  cacheDir: './.cache/astro',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pl'],
    routing: { prefixDefaultLocale: true },
  },
  integrations: [react()],
  markdown: { processor: unified({ syntaxHighlight: 'prism' }) },
  vite: {
    css: { modules: { localsConvention: 'camelCaseOnly' } },
    // Gatsby hoists cookie 0.5; bundle Astro's own cookie 2 at its importer.
    environments: { prerender: { resolve: { noExternal: ['cookie'] } } },
  },
});
