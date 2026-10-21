import path from 'node:path';

export function localAssetPath(
  url: string,
  document: string,
  contentDirectory = 'content',
  additionalRoots: string[] = [],
) {
  if (!url || /^(?:[a-z][a-z0-9+.-]*:|\/\/|[/?#])/i.test(url)) return undefined;
  const file = path.resolve(
    path.dirname(document),
    decodeURIComponent(url.split(/[?#]/)[0]!),
  );
  const roots = [contentDirectory, ...additionalRoots].map(
    (root) => path.resolve(root) + path.sep,
  );
  if (!roots.some((root) => file.startsWith(root)))
    throw new Error(`Asset outside content directory: ${url}`);
  return file;
}
