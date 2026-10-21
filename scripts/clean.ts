import { rm } from 'node:fs/promises';
for (const directory of ['dist', '.astro', '.cache/astro'])
  await rm(directory, { recursive: true, force: true });
