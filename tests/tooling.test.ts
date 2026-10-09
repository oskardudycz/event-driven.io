import { temporaryDirectory } from './helpers/temporary-directory.ts';
import assert from 'node:assert/strict';
import { copyFileSync, writeFileSync, readFileSync, symlinkSync, mkdirSync } from 'node:fs';
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
    '.prettierrc',
    '.prettierignore',
  ])
    copyFileSync(join(root, file), join(fixture, file));
  symlinkSync(join(root, 'node_modules'), join(fixture, 'node_modules'), 'dir');
  mkdirSync(join(fixture, 'scripts'));
  for (const file of ['package.json', 'check-image-alternatives.ts', 'image-alternatives.ts'])
    copyFileSync(join(root, 'scripts', file), join(fixture, 'scripts', file));
  assert.equal(run('git', ['init', '--quiet']).status, 0);
  mkdirSync(join(fixture, 'content'));
  writeFileSync(join(fixture, 'example.mjs'), 'export const value = "hello"\n');
  const article = '# Article\n\n```typescript\nconst value="unchanged"\n```\n';
  writeFileSync(join(fixture, 'content', 'example.md'), article);
  assert.equal(run('git', ['add', 'example.mjs', 'content/example.md']).status, 0);
  const formatted = run('lint-staged', ['--no-stash']);
  assert.equal(formatted.status, 0, formatted.stdout + formatted.stderr);
  assert.equal(
    readFileSync(join(fixture, 'example.mjs'), 'utf8'),
    "export const value = 'hello';\n",
  );
  assert.equal(readFileSync(join(fixture, 'content', 'example.md'), 'utf8'), article);
  writeFileSync(join(fixture, 'example.mjs'), "const unused = 'bad';\n");
  assert.equal(run('git', ['add', 'example.mjs']).status, 0);
  const rejected = run('lint-staged', ['--no-stash']);
  assert.notEqual(rejected.status, 0);
  assert.match(
    rejected.stdout + rejected.stderr,
    /no-unused-vars/,
    JSON.stringify({ status: rejected.status, signal: rejected.signal, error: rejected.error }),
  );
  writeFileSync(join(fixture, 'example.mjs'), "export const value = 'hello';\n");
  writeFileSync(join(fixture, 'content', 'example.md'), '# Diagram\n\n![](queue.png)\n');
  assert.equal(run('git', ['add', 'example.mjs', 'content/example.md']).status, 0);
  const missingAlternative = run('lint-staged', ['--no-stash']);
  assert.notEqual(missingAlternative.status, 0);
  assert.match(missingAlternative.stdout + missingAlternative.stderr, /Describe this image/);
});
