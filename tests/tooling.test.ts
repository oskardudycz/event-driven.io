import { temporaryDirectory } from './helpers/temporary-directory.ts';
import assert from 'node:assert/strict';
import {
  copyFileSync,
  writeFileSync,
  readFileSync,
  symlinkSync,
  mkdirSync,
} from 'node:fs';
import { resolve, join, delimiter } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

void test('lint-staged formats code, preserves article formatting and blocks lint or image errors', (t) => {
  const root = resolve('.');
  const fixture = temporaryDirectory(t, 'gatsby-lint-staged-');
  const env = {
    ...process.env,
    PATH: `${join(root, 'node_modules/.bin')}${delimiter}${process.env.PATH}`,
  };
  const run = (command: string, args: string[]) =>
    spawnSync(command, args, { cwd: fixture, env, encoding: 'utf8' });
  for (const file of [
    'eslint.config.mjs',
    'lint-staged.config.mjs',
    '.prettierrc.json',
    '.prettierignore',
    'tsconfig.eslint.json',
  ])
    copyFileSync(join(root, file), join(fixture, file));
  writeFileSync(
    join(fixture, 'tsconfig.json'),
    JSON.stringify({
      extends: join(root, 'tsconfig.json'),
      include: ['example.ts'],
      exclude: [],
    }),
  );
  writeFileSync(
    join(fixture, 'package.json'),
    JSON.stringify({ private: true, type: 'module' }),
  );
  symlinkSync(join(root, 'node_modules'), join(fixture, 'node_modules'), 'dir');
  mkdirSync(join(fixture, 'scripts'));
  for (const file of [
    'package.json',
    'check-image-alternatives.ts',
    'image-alternatives.ts',
  ])
    copyFileSync(join(root, 'scripts', file), join(fixture, 'scripts', file));
  assert.equal(run('git', ['init', '--quiet']).status, 0);
  mkdirSync(join(fixture, 'content'));
  writeFileSync(
    join(fixture, 'example.ts'),
    'export const value: unknown = "hello"\n',
  );
  const article = '# Article\n\n```typescript\nconst value="unchanged"\n```\n';
  writeFileSync(join(fixture, 'content', 'example.md'), article);
  assert.equal(
    run('git', ['add', 'example.ts', 'content/example.md']).status,
    0,
  );
  const formatted = run('lint-staged', ['--no-stash']);
  assert.equal(formatted.status, 0, formatted.stdout + formatted.stderr);
  assert.equal(
    readFileSync(join(fixture, 'example.ts'), 'utf8'),
    "export const value: unknown = 'hello';\n",
  );
  assert.equal(
    readFileSync(join(fixture, 'content', 'example.md'), 'utf8'),
    article,
  );
  writeFileSync(join(fixture, 'example.ts'), "const unused: string = 'bad';\n");
  assert.equal(run('git', ['add', 'example.ts']).status, 0);
  const rejected = run('lint-staged', ['--no-stash']);
  assert.notEqual(rejected.status, 0);
  assert.match(
    rejected.stdout + rejected.stderr,
    /no-unused-vars/,
    JSON.stringify({
      status: rejected.status,
      signal: rejected.signal,
      error: rejected.error,
    }),
  );
  writeFileSync(
    join(fixture, 'example.ts'),
    "export const value: unknown = 'hello';\n",
  );
  writeFileSync(
    join(fixture, 'content', 'example.md'),
    '# Diagram\n\n![](queue.png)\n',
  );
  assert.equal(
    run('git', ['add', 'example.ts', 'content/example.md']).status,
    0,
  );
  const missingAlternative = run('lint-staged', ['--no-stash']);
  assert.notEqual(missingAlternative.status, 0);
  assert.match(
    missingAlternative.stdout + missingAlternative.stderr,
    /Describe this image/,
  );
});

void test('typed linting resolves the project when an editor opens a source subdirectory', async () => {
  const { ESLint } = await import('eslint');
  for (const directory of ['src', 'src/components/Video']) {
    const eslint = new ESLint({ cwd: resolve(directory) });
    const [result] = await eslint.lintFiles([
      resolve('src/components/Video/index.ts'),
    ]);
    assert.ok(result, `No lint result from ${directory}`);
    assert.equal(result.errorCount, 0, JSON.stringify(result.messages));
  }
});

void test('JSX linting rejects obsolete iframe attributes and accepts CSS styling', async () => {
  const { ESLint } = await import('eslint');
  const eslint = new ESLint();
  const source = (attributes: string) =>
    `import React from 'react'; export const Frame = () => <iframe title="Demo" ${attributes} />;`;
  const options = { filePath: 'src/components/Video/Video.tsx' };
  const [invalid] = await eslint.lintText(
    source('frameBorder="0" scrolling="no"'),
    options,
  );
  assert.ok(invalid);
  assert.equal(
    invalid.messages.filter(
      (message) => message.ruleId === 'react/forbid-dom-props',
    ).length,
    2,
  );
  const [valid] = await eslint.lintText(
    source('style={{ border: 0 }}'),
    options,
  );
  assert.ok(valid);
  assert.ok(
    !valid.messages.some(
      (message) => message.ruleId === 'react/forbid-dom-props',
    ),
  );
});
