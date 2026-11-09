import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'vitest';
import { temporaryDirectory } from '../tests/helpers/temporary-directory.ts';
import { generateTagFiles } from './generate-tag-files.ts';

function writeFile(root: string, file: string, content: string) {
  mkdirSync(dirname(join(root, file)), { recursive: true });
  writeFileSync(join(root, file), content);
}

function writePost(
  root: string,
  directory: string,
  language: string,
  frontmatter: string,
) {
  writeFile(
    root,
    `content/posts/${directory}/index.${language}.md`,
    `---\ntitle: "Post"\n${frontmatter}\n---\n\nBody\n`,
  );
}

test('creates an empty Markdown file for every language a new tag has a page in', () => {
  const root = temporaryDirectory('tag-files-');
  writePost(root, '2026-11-09--new_post', 'en', 'tags:\n  - EventStorming');
  writePost(
    root,
    '2026-11-09--new_post',
    'pl',
    'tags:\n  - EventStorming\nuseDefaultLangCanonical: true',
  );

  const created = generateTagFiles(root);

  assert.deepEqual(created.sort(), [
    'content/tags/event-storming/index.en.md',
    'content/tags/event-storming/index.pl.md',
  ]);
  for (const file of created)
    assert.equal(readFileSync(join(root, file), 'utf8'), '---\n---\n');
});

test('creates no file for a language without the tag page', () => {
  const root = temporaryDirectory('tag-files-');
  writePost(root, '2026-11-09--english_only', 'en', 'tags:\n  - Modelling');

  assert.deepEqual(generateTagFiles(root), [
    'content/tags/modelling/index.en.md',
  ]);
});

test('keeps existing tag files unchanged and creates nothing on a second run', () => {
  const root = temporaryDirectory('tag-files-');
  writePost(root, '2026-11-09--new_post', 'en', 'tags:\n  - Event Sourcing');
  const existing = 'content/tags/event-sourcing/index.en.md';
  const written = '---\ndescription: "Written by hand."\n---\n\nIntro\n';
  writeFile(root, existing, written);

  assert.deepEqual(generateTagFiles(root), []);
  assert.equal(readFileSync(join(root, existing), 'utf8'), written);
});
