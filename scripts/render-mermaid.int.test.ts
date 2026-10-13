import { temporaryDirectory } from '../tests/helpers/temporary-directory.ts';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { test } from 'vitest';
import { findDiagrams } from './render-mermaid.ts';

const script = join(import.meta.dirname, './render-mermaid.ts');

function renderDiagrams(...args: string[]) {
  return spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
}

test("diagram sources are mapped to the post's mermaid PNG names by their number prefix", async () => {
  const postDir = join(
    temporaryDirectory('render-mermaid-'),
    '2026-10-12--some-post',
  );
  await mkdir(join(postDir, 'code/diagrams'), { recursive: true });
  await mkdir(join(postDir, 'code/node_modules/pkg'), { recursive: true });
  await writeFile(join(postDir, 'code/diagrams/2-transaction-mode.mmd'), '');
  await writeFile(join(postDir, 'code/diagrams/10-later.mmd'), '');
  await writeFile(join(postDir, 'code/diagrams/1-session-mode.mmd'), '');
  await writeFile(join(postDir, 'code/node_modules/pkg/1-ignored.mmd'), '');

  const diagrams = await findDiagrams(postDir);

  assert.deepEqual(
    diagrams.map(({ source, output }) => [
      relative(postDir, source),
      relative(postDir, output),
    ]),
    [
      ['code/diagrams/1-session-mode.mmd', '2026-10-12-mermaid1.png'],
      ['code/diagrams/2-transaction-mode.mmd', '2026-10-12-mermaid2.png'],
      ['code/diagrams/10-later.mmd', '2026-10-12-mermaid10.png'],
    ],
  );
});

test('diagram sources without a number prefix are rejected', async () => {
  const postDir = join(
    temporaryDirectory('render-mermaid-'),
    '2026-10-12--some-post',
  );
  await mkdir(postDir, { recursive: true });
  await writeFile(join(postDir, 'session-mode.mmd'), '');

  await assert.rejects(
    findDiagrams(postDir),
    /session-mode\.mmd must start with a number/,
  );
});

test('post folders without a date prefix are rejected', async () => {
  const root = temporaryDirectory('render-mermaid-');

  await assert.rejects(findDiagrams(root), /must start with YYYY-MM-DD--/);
});

test('running without a post folder prints usage and fails', () => {
  const result = renderDiagrams();

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage: npm run render-diagrams /);
});

test('running on a post folder without diagrams fails without rendering', async () => {
  const postDir = join(
    temporaryDirectory('render-mermaid-'),
    '2026-10-12--some-post',
  );
  await mkdir(postDir, { recursive: true });

  const result = renderDiagrams(postDir);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /No \.mmd files found/);
});
