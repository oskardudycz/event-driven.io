import { globSync, readFileSync, writeFileSync } from 'node:fs';
import { normalizeYouTubeEmbeds } from '../import/youtube-markdown.ts';

const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log(
    'Usage: yarn normalize:youtube [--write]\nCheck all content Markdown for standalone images linked to YouTube videos; --write converts those thumbnails to the existing video embed syntax. Text links, bare URLs, prose and code are preserved.',
  );
  process.exit(0);
}
if (args.some((arg) => arg !== '--write'))
  throw new Error('Supported option: --write');

let changed = 0;
for (const file of globSync('content/**/*.md')) {
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
