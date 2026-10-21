import { afterEach, expect, test } from 'vitest';
import { mkdtemp, writeFile, symlink, rm } from 'node:fs/promises';
import path from 'node:path';
import { assetFile } from './asset-file.ts';
const directories: string[] = [];
afterEach(async () => {
  for (const directory of directories.splice(0))
    await rm(directory, { recursive: true, force: true });
});

test('asset reads stay inside editorial roots even when a relative path resolves through a symlink', async () => {
  const directory = await mkdtemp(path.resolve('content/.asset-security-'));
  directories.push(directory);
  const file = path.join(directory, 'image.png');
  await writeFile(file, 'fixture');
  expect(await assetFile(file)).toBe(file);
  const outside = await mkdtemp('/tmp/astro-asset-security-');
  directories.push(outside);
  await writeFile(path.join(outside, 'private.txt'), 'must not be published');
  const linked = path.join(directory, 'linked.txt');
  await symlink(path.join(outside, 'private.txt'), linked);
  await expect(assetFile(linked)).rejects.toThrow(
    'Asset outside editorial roots',
  );
});
