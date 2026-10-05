import js from '@eslint/js';
import babelParser from '@babel/eslint-parser';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
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
    plugins: { react, 'react-hooks': hooks },
    settings: { react: { version: 'detect' } },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },
  { files: ['**/*.{ts,tsx,mts}'], languageOptions: { parser: tsParser } },
  { ...prettier, files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts}'] },
];
