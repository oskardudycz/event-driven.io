import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'vitest';
import * as yaml from 'js-yaml';
import {
  learningPathProblems,
  type LearningPathNode,
} from '../../src/utils/learning-paths.ts';
import { publishedContent } from '../helpers/published-content.ts';

const root = join(import.meta.dirname, '../../content/paths');
const languages = ['en', 'pl'];
const directories = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

function readPath(directory: string, language: string): LearningPathNode {
  const [prefix = '', pathSlug = ''] = directory.split('--');
  const markdown = readFileSync(
    join(root, directory, `index.${language}.md`),
    'utf8',
  );
  const header = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(markdown);
  assert.ok(header, `${directory}/index.${language}.md has no frontmatter`);
  return {
    fields: { pathSlug, langKey: language, prefix },
    frontmatter: yaml.load(header[1]!) as LearningPathNode['frontmatter'],
  };
}

const posts = publishedContent('posts').map((post) => ({
  fields: {
    slug: post.route.replace(/^\/(?:en|pl)/, ''),
    langKey: post.language,
    source: 'posts',
  },
  frontmatter: post.metadata,
}));

test('learning path folders are numbered once each and named in kebab case', () => {
  assert.ok(directories.length, 'No learning paths found');
  for (const directory of directories)
    assert.match(directory, /^\d{2}--[a-z0-9]+(?:-[a-z0-9]+)*$/);
  const prefixes = directories.map((directory) => directory.split('--')[0]);
  assert.equal(new Set(prefixes).size, prefixes.length);
});

test('every learning path has a titled English and Polish version with articles', () => {
  for (const directory of directories)
    for (const language of languages) {
      const { frontmatter } = readPath(directory, language);
      assert.ok(frontmatter.title, `${directory} (${language}) has no title`);
      assert.ok(
        frontmatter.articles?.length,
        `${directory} (${language}) has no articles`,
      );
    }
});

test('learning path articles resolve to posts and match across languages', () => {
  const paths = directories.flatMap((directory) =>
    languages.map((language) => readPath(directory, language)),
  );
  assert.deepEqual(learningPathProblems(paths, posts), []);
});

test('every learning path has an icon, a description and a cover file of its own', () => {
  for (const directory of directories)
    for (const language of languages) {
      const { frontmatter } = readPath(directory, language);
      const label = `${directory} (${language})`;
      assert.match(frontmatter.icon || '', /\p{Extended_Pictographic}/u, label);
      assert.ok(frontmatter.description?.trim(), `${label} has no description`);
      const { cover } = frontmatter;
      assert.ok(typeof cover === 'string', `${label} has no cover`);
      assert.ok(
        existsSync(join(root, directory, cover)),
        `${label} cover ${cover} is missing`,
      );
    }
});
