import { copyFileSync, mkdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { TestContext } from 'node:test';
import { ESLint } from 'eslint';
import { temporaryDirectory } from './temporary-directory.ts';

export async function lintTsxFixtures(
  context: Pick<TestContext, 'after'>,
  sources: Record<string, string>,
): Promise<ESLint.LintResult[]> {
  const root = resolve('.');
  const directory = temporaryDirectory(context, 'gatsby-jsx-lint-');
  for (const file of [
    'eslint.config.mjs',
    '.prettierrc.json',
    'tsconfig.eslint.json',
  ])
    copyFileSync(join(root, file), join(directory, file));
  writeFileSync(
    join(directory, 'tsconfig.json'),
    JSON.stringify({
      extends: join(root, 'tsconfig.json'),
      include: ['src/**/*.tsx'],
      exclude: [],
    }),
  );
  symlinkSync(
    join(root, 'node_modules'),
    join(directory, 'node_modules'),
    'dir',
  );
  mkdirSync(join(directory, 'src'));
  const files: string[] = [];
  // CI's immutable TypeScript program must see the same code as ESLint.
  for (const [name, source] of Object.entries(sources)) {
    const file = join('src', name);
    writeFileSync(join(directory, file), source);
    files.push(file);
  }
  return new ESLint({ cwd: directory }).lintFiles(files);
}
