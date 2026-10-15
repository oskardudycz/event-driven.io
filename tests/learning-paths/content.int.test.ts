import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'vitest';
import * as yaml from 'js-yaml';
import {
  learningPathProblems,
  type LearningPathNode,
} from '../../src/utils/learning-paths.ts';
import en from '../../src/i18n/locales/en/translation.json' with { type: 'json' };
import pl from '../../src/i18n/locales/pl/translation.json' with { type: 'json' };
import { publishedContent } from '../helpers/published-content.ts';

const root = join(import.meta.dirname, '../../content/paths');
const languages = ['en', 'pl'];
const directories = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const frontmatterBlock = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;
const readMarkdown = (directory: string, language: string) =>
  readFileSync(join(root, directory, `index.${language}.md`), 'utf8');

function readPath(directory: string, language: string): LearningPathNode {
  const [prefix = '', pathSlug = ''] = directory.split('--');
  const markdown = readMarkdown(directory, language);
  const header = frontmatterBlock.exec(markdown);
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

test('every learning path has a Markdown intro in every language', () => {
  for (const directory of directories)
    for (const language of languages) {
      const body = readMarkdown(directory, language).replace(
        frontmatterBlock,
        '',
      );
      assert.ok(body.trim(), `${directory} (${language}) has no intro`);
    }
});

test('every learning path description fits a meta description and is translated', () => {
  for (const directory of directories) {
    const descriptions = languages.map(
      (language) => readPath(directory, language).frontmatter.description ?? '',
    );
    for (const [index, description] of descriptions.entries())
      assert.ok(
        description.length <= 160,
        `${directory} (${languages[index]}) description has ${description.length} characters`,
      );
    const [english, polish] = descriptions;
    assert.notEqual(polish, english, `${directory} (pl) is not translated`);
  }
});

test('the guides index description fits a meta description in every language', () => {
  for (const [language, { guides }] of Object.entries({ en, pl }))
    assert.ok(
      guides.description.length <= 160,
      `guides (${language}) description has ${guides.description.length} characters`,
    );
});
