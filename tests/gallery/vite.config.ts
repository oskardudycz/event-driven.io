import { defineConfig, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  root: import.meta.dirname,
  publicDir: '../../static',
  plugins: [react()],
  css: { modules: { localsConvention: 'camelCaseOnly' } },
  server: {
    host: '127.0.0.1',
    port: 9001,
    strictPort: true,
    fs: {
      allow: [
        searchForWorkspaceRoot(import.meta.dirname),
        resolve(import.meta.dirname, '../../src'),
      ],
    },
  },
});
