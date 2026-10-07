import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { normalizeYouTubeEmbeds } from '../import/youtube-markdown.mts';

const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log(
    'Usage: yarn normalize:youtube [--write]\nCheck all content Markdown for standalone images linked to YouTube videos; --write converts those thumbnails to the existing video embed syntax. Text links, bare URLs, prose and code are preserved.',
  );
  process.exit(0);
}
if (args.some((arg) => arg !== '--write')) throw new Error('Supported option: --write');
function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? files(file) : file.endsWith('.md') ? [file] : [];
  });
}
let changed = 0;
for (const file of files('content')) {
  const original = readFileSync(file, 'utf8');
  const normalized = normalizeYouTubeEmbeds(original);
  if (original === normalized) continue;
  changed++;
  console.log(file);
  if (args.includes('--write')) writeFileSync(file, normalized);
}
console.log(
  `${changed} files ${args.includes('--write') ? 'updated' : 'need conversion; use --write to apply'}.`,
);
