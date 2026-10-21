import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';

export default defineConfig({
  site: 'https://event-driven.io',
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
        ignored: ['**/visual-artifacts/**', '**/.cache/**'],
      },
    },
    css: { modules: { localsConvention: 'camelCaseOnly' } },
  },
});
