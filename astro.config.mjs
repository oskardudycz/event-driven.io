import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';

// Static publication; ASTRO_OUTPUT_DIR optionally isolates a comparison build.
export default defineConfig({
  site: 'https://event-driven.io',
  srcDir: './astro/src',
  publicDir: './static',
  outDir: process.env.ASTRO_OUTPUT_DIR || './public',
  cacheDir: './.cache/astro',
  trailingSlash: 'always',
  build: { format: 'preserve' },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: { png: { compressionLevel: 9 }, jpeg: { progressive: true } },
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pl'],
    routing: { prefixDefaultLocale: true },
  },
  integrations: [react()],
  markdown: { processor: unified(), syntaxHighlight: false },
  vite: {
    server: {
      watch: {
        ignored: ['**/visual-artifacts/**', '**/.cache/**', '**/public/**'],
      },
    },
    css: { modules: { localsConvention: 'camelCaseOnly' } },
  },
});
