import assert from 'node:assert/strict';
import { test } from 'vitest';
import {
  publishedContent,
  type PublishedDocument,
} from '../helpers/published-content.ts';

const posts = publishedContent('posts');

const slugOf = (post: PublishedDocument) => {
  const [, , slug] = post.route.split('/');
  assert.ok(slug, `Missing slug in ${post.route}`);
  return slug;
};

const findPost = (slug: string, language: string) =>
  posts.find((post) => slugOf(post) === slug && post.language === language);

test('related articles point to existing articles other than themselves', () => {
  const slugs = new Set(posts.map(slugOf));
  const unresolved = posts.flatMap((post) =>
    (post.metadata.related || [])
      .filter((slug) => slug === slugOf(post) || !slugs.has(slug))
      .map((slug) => `${post.route} → ${slug}`),
  );
  assert.deepEqual(unresolved, []);
});

test('related articles link back to each other in the same language', () => {
  const missingBackReferences = posts.flatMap((post) =>
    (post.metadata.related || []).flatMap((slug) => {
      const target = findPost(slug, post.language);
      if (!target || target.metadata.related?.includes(slugOf(post))) return [];
      return [`${target.route} should list ${slugOf(post)}`];
    }),
  );
  assert.deepEqual(missingBackReferences, []);
});
