import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Gatsby's existing .js components contain JSX. Use the supported Babel
      // option until the coordinated TypeScript migration changes their extensions.
      babel: { presets: [['@babel/preset-react', { runtime: 'automatic' }]] },
    }),
  ],
  test: { include: ['tests/**/*.test.tsx'], clearMocks: true },
});
