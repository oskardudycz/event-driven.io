import { expect, test } from 'vitest';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { temporaryDirectory } from '../tests/helpers/temporary-directory.ts';

test('clean removes generated output while preserving public source assets', () => {
  const root = temporaryDirectory('astro-clean-');
  for (const directory of ['public', 'dist', '.astro', '.cache/astro'])
    mkdirSync(join(root, directory), { recursive: true });
  writeFileSync(join(root, 'public/robots.txt'), 'Authored source');
  writeFileSync(join(root, 'dist/index.html'), 'Generated output');
  execFileSync(process.execPath, [resolve('scripts/clean.ts')], { cwd: root });
  expect(readFileSync(join(root, 'public/robots.txt'), 'utf8')).toBe(
    'Authored source',
  );
  expect(existsSync(join(root, 'dist'))).toBe(false);
  expect(existsSync(join(root, '.astro'))).toBe(false);
});
