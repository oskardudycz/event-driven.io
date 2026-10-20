import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

// Read published documents, excluding bundler fragments and data caches.
export function publishedPages(
  directory: string,
): { route: string; file: string }[] {
  function walk(current: string): string[] {
    return readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
      const file = join(current, entry.name);
      if (entry.isDirectory()) {
        if (['_gatsby', '_astro', 'page-data'].includes(entry.name)) return [];
        return walk(file);
      }
      return entry.isFile() && entry.name.endsWith('.html') ? [file] : [];
    });
  }
  return walk(directory)
    .map((file) => ({
      file,
      route: `/${relative(directory, file)
        .split('\\')
        .join('/')
        .replace(/index\.html$/, '')}`,
    }))
    .sort((left, right) => left.route.localeCompare(right.route));
}
