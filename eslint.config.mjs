import js from '@eslint/js';
import babelParser from '@babel/eslint-parser';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import react from 'eslint-plugin-react';
import a11y from 'eslint-plugin-jsx-a11y';
import hooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default [
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
    ],
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: { babelrc: false, configFile: false, parserOpts: { plugins: ['jsx'] } },
      },
      ecmaVersion: 'latest',
      globals: { ...globals.node, ...globals.browser },
    },
    plugins: { react, 'react-hooks': hooks, 'jsx-a11y': a11y },
    settings: {
      react: { version: 'detect' },
      'jsx-a11y': { components: { GatsbyImage: 'img', StaticImage: 'img' } },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'jsx-a11y/alt-text': 'error',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx,mts}'],
    languageOptions: { parser: tsParser },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['tests/browser/**/*.ts', 'playwright.config.ts'],
    // TypeScript checks these files, including DOM types, through test:browser-types.
    rules: { 'no-undef': 'off' },
  },
  { ...prettier, files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts}'] },
];
