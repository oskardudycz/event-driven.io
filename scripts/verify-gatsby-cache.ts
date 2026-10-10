import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import MiniSearch from 'minisearch';
import { indexOptions } from '../src/search/options.ts';

// Opt-in integration check. Use an existing article and its non-indexed Polish
// placeholder; never create test publications or add entries to llms.txt.
const manifest = JSON.parse(
  fs.readFileSync('import/architecture-weekly-missing.json', 'utf8'),
) as {
  url: string;
}[];
const first = manifest[0];
assert(first, 'Expected at least one import entry');
const slug = new URL(first.url).pathname.split('/').filter(Boolean).pop();
const directory = fs
  .readdirSync('content/posts')
  .find((name) => name.endsWith(`--${slug}`));
assert(directory, 'Cache-check article not found');
const englishFile = path.join('content/posts', directory, 'index.en.md');
const polishFile = path.join('content/posts', directory, 'index.pl.md');
const english = fs.readFileSync(englishFile, 'utf8');
const polish = fs.readFileSync(polishFile, 'utf8');
assert(
  polish.includes('useDefaultLangCanonical: true'),
  'Deletion check must use a non-indexed placeholder',
);
const index = fs.readFileSync('static/llms.txt');
const logDirectory = fs.mkdtempSync(
  path.join(os.tmpdir(), 'gatsby-cache-check-'),
);
const marker = 'gatsbycachemodificationverificationtoken';
const searchId = `posts:/${slug}/`;
function searchIndex(language: 'en' | 'pl') {
  const manifest = JSON.parse(
    fs.readFileSync('public/search-index/manifest.json', 'utf8'),
  ) as Record<'en' | 'pl', string>;
  return MiniSearch.loadJSON(
    fs.readFileSync(path.join('public', manifest[language]), 'utf8'),
    indexOptions,
  );
}
function build(label: string) {
  const log = path.join(logDirectory, `${label}.log`);
  const fd = fs.openSync(log, 'w');
  console.log(`Building ${label}; log: ${log}`);
  try {
    const result = spawnSync('npm', ['run', 'build'], {
      stdio: ['ignore', fd, fd],
      env: {
        ...process.env,
        GATSBY_CPU_COUNT: process.env.GATSBY_CPU_COUNT || '4',
      },
    });
    assert.equal(result.status, 0, `Build failed; inspect ${log}`);
  } finally {
    fs.closeSync(fd);
  }
}
assert.ok(slug, 'Cache-check slug not found');
const articleHtml = path.join('public/en', slug, 'index.html');
const polishHtml = path.join('public/pl', slug, 'index.html');
const polishData = path.join('public/page-data/pl', slug, 'page-data.json');
try {
  fs.writeFileSync(englishFile, `${english}\n\n${marker}\n`);
  fs.unlinkSync(polishFile);
  build('modified-and-deleted');
  assert(
    fs.readFileSync(articleHtml, 'utf8').includes(marker),
    'Warm cache ignored modified content',
  );
  for (const language of ['en', 'pl'] as const) {
    const matches = searchIndex(language).search(marker, {
      fuzzy: false,
      prefix: false,
    });
    assert(
      matches.some((hit) => hit.id === searchId && hit.path === `/en/${slug}/`),
      'Warm search index ignored modified canonical content/fallback',
    );
  }
  assert(!fs.existsSync(polishData), 'Warm cache retained deleted page data');
  assert(!fs.existsSync(polishHtml), 'Warm cache retained deleted HTML');
  assert.deepEqual(
    fs.readFileSync('static/llms.txt'),
    index,
    'Cache check changed the publication index',
  );
  fs.unlinkSync(englishFile);
  build('deleted-canonical-article');
  for (const language of ['en', 'pl'] as const)
    assert(
      !searchIndex(language).has(searchId),
      'Warm search index retained a deleted canonical article',
    );
} finally {
  fs.writeFileSync(englishFile, english);
  fs.writeFileSync(polishFile, polish);
  fs.writeFileSync('static/llms.txt', index);
  try {
    build('restored');
  } finally {
    fs.writeFileSync('static/llms.txt', index);
  }
}
assert(
  !fs.readFileSync(articleHtml, 'utf8').includes(marker),
  'Warm cache retained removed text',
);
assert(
  fs.existsSync(polishData) && fs.existsSync(polishHtml),
  'Warm cache did not restore the page',
);
for (const language of ['en', 'pl'] as const) {
  assert(
    searchIndex(language).has(searchId),
    'Warm search index did not restore the canonical article',
  );
  assert.equal(
    searchIndex(language).search(marker, { fuzzy: false, prefix: false })
      .length,
    0,
    'Warm search index retained removed text',
  );
}
assert.deepEqual(fs.readFileSync('static/llms.txt'), index);
console.log(
  'Warm-cache modification, deletion and restoration passed; publication sources and index unchanged.',
);
