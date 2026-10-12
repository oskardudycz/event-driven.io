import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Frontmatter } from '../../src/types/content.ts';
import { readFrontmatter } from './frontmatter.ts';

export type PublishedDocument = {
  route: string;
  language: string;
  date: string;
  metadata: Frontmatter;
  body: string;
};

// Read the authoring directory independently of Gatsby's generated output.
export function publishedContent(
  source: 'posts' | 'pages',
): PublishedDocument[] {
  const root = join(import.meta.dirname, '../../content', source);
  const posts: PublishedDocument[] = [];
  for (const directory of readdirSync(root, { withFileTypes: true })) {
    const match = /^(\d{4}-\d{2}-\d{2})--(.+)$/.exec(directory.name);
    if (!directory.isDirectory() || (source === 'posts' && !match)) continue;
    const date = match?.[1] || '';
    const slug = directory.name.includes('--')
      ? directory.name.split('--').slice(1).join('--')
      : directory.name;
    for (const file of readdirSync(join(root, directory.name))) {
      const language = /^index\.(en|pl)\.md$/.exec(file)?.[1];
      if (!language) continue;
      const markdown = readFileSync(join(root, directory.name, file), 'utf8');
      const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(
        markdown,
      );
      posts.push({
        route: `/${language}/${slug.toLowerCase()}/`,
        language,
        date,
        metadata: readFrontmatter(frontmatter?.[1]),
        body: markdown.slice(frontmatter![0].length),
      });
    }
  }
  return posts;
}
