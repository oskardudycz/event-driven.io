import { temporaryDirectory } from '../helpers/temporary-directory.ts';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'vitest';

const repository = path.resolve(import.meta.dirname, '../..');

function requestPlaceholders(image: string, count: number) {
  const directory = temporaryDirectory('sharp-placeholders-');
  const output = path.join(directory, 'result.json');
  const result = spawnSync(
    process.execPath,
    [
      'tests/images/placeholder-requests.ts',
      directory,
      image,
      String(count),
      output,
    ],
    { cwd: repository, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(readFileSync(output, 'utf8')) as {
    writes: number;
    sources: string[];
  };
}

test('concurrent listing queries generate one blurred placeholder per cover', () => {
  const { writes, sources } = requestPlaceholders(
    'content/posts/2025-10-06--new-recording-on-event-modelling/2025-10-06-cover.jpg',
    4,
  );

  assert.equal(writes, 1);
  assert.equal(sources.length, 4);
  assert.equal(new Set(sources).size, 1);
  assert.match(sources[0] ?? '', /^data:image\/jpeg;base64,/);
});
