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

test('related articles point to existing articles other than themselves', () => {
  const slugs = new Set(posts.map(slugOf));
  const unresolved = posts.flatMap((post) =>
    (post.metadata.related || [])
      .filter((slug) => slug === slugOf(post) || !slugs.has(slug))
      .map((slug) => `${post.route} → ${slug}`),
  );
  assert.deepEqual(unresolved, []);
});
