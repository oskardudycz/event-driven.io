import { realpath } from 'node:fs/promises';
import path from 'node:path';
export async function assetFile(file: string) {
  const resolved = await realpath(file);
  const roots = ['content', 'src/images'].map(
    (root) => path.resolve(root) + path.sep,
  );
  if (!roots.some((root) => resolved.startsWith(root)))
    throw new Error(`Asset outside editorial roots: ${file}`);
  return resolved;
}
