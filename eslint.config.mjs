import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import react from 'eslint-plugin-react';
import a11y from 'eslint-plugin-jsx-a11y';
import hooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  {
    ignores: [
      'node_modules/**',
      '.cache/**',
      'public/**',
      'static/**',
      'content/**',
      'report/**',
      'visual-artifacts/**',
      'tests/fixtures/**',
      'temp/**',
      '.husky/**',
      '**/*.d.ts',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...typescriptEslint.configs['flat/recommended'],
      ...typescriptEslint.configs['flat/recommended-type-checked'],
      prettierRecommended,
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },

      parserOptions: {
        project: './tsconfig.eslint.json',
      },
    },

    settings: {
      'import/resolver': {
        typescript: {},
      },
    },

    rules: {
      'no-unused-vars': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',

      '@typescript-eslint/no-misused-promises': ['off'],
      '@typescript-eslint/prefer-namespace-keyword': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}', 'gatsby-browser.tsx', 'gatsby-ssr.tsx'],
    languageOptions: { globals: globals.browser },
    plugins: { react, 'react-hooks': hooks, 'jsx-a11y': a11y },
    settings: {
      react: { version: 'detect' },
      'jsx-a11y': { components: { GatsbyImage: 'img', StaticImage: 'img' } },
    },
    rules: {
      'jsx-a11y/alt-text': 'error',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  {
    files: ['**/*.mjs'],
    extends: [js.configs.recommended, prettierRecommended],
    languageOptions: { globals: globals.node },
  },
]);
