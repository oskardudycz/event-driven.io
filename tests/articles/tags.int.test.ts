import assert from 'node:assert/strict';
import { test } from 'vitest';
import { tagsForLanguage } from '../../src/utils/tag-posts.ts';
import { tagSlug } from '../../src/utils/tag-slug.ts';
import {
  publishedContent,
  publishedTagFile,
} from '../helpers/published-content.ts';

const posts = publishedContent('posts').map((post) => ({
  fields: {
    slug: post.route.replace(/^\/(?:en|pl)/, ''),
    langKey: post.language,
    source: 'posts',
  },
  frontmatter: post.metadata,
}));

test('a post carries the same tags in every language', () => {
  const tagsByRoute = new Map<string, Map<string, string[]>>();
  for (const post of publishedContent('posts')) {
    const slug = post.route.replace(/^\/(?:en|pl)/, '');
    const languages = tagsByRoute.get(slug) || new Map<string, string[]>();
    languages.set(post.language, post.metadata.tags || []);
    tagsByRoute.set(slug, languages);
  }
  const different = [...tagsByRoute]
    .filter(([, languages]) => languages.size > 1)
    .filter(([, languages]) => {
      const [first, ...others] = [...languages.values()];
      return others.some(
        (tags) => JSON.stringify(tags) !== JSON.stringify(first),
      );
    })
    .map(([slug]) => slug);
  assert.deepEqual(different, []);
});

function tagFileProblems(slug: string, language: string): string[] {
  const file = `content/tags/${slug}/index.${language}.md`;
  const tagFile = publishedTagFile(slug, language);
  if (!tagFile) return [`${file} is missing`];
  const { description, body } = tagFile;
  return [
    ...(description ? [] : [`${file} has no description`]),
    ...(description.length > 160
      ? [`${file} description has ${description.length} characters`]
      : []),
    ...(body.trim() ? [] : [`${file} has no intro`]),
  ];
}

test('every tag page has a Markdown intro and a description that fits a meta description', () => {
  const problems = ['en', 'pl'].flatMap((language) => {
    const tags = tagsForLanguage(posts, language);
    assert.ok(tags.length, `No tag pages in ${language}`);
    return tags.flatMap(([tag]) => tagFileProblems(tagSlug(tag), language));
  });
  assert.deepEqual(problems, []);
});
