import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as yaml from 'js-yaml';
import type { Frontmatter } from '../src/types/content.ts';
import { tagsForLanguage } from '../src/utils/tag-posts.ts';
import { tagSlug } from '../src/utils/tag-slug.ts';

type Post = {
  fields: { slug: string; langKey: string; source: string };
  frontmatter: Pick<Frontmatter, 'tags' | 'useDefaultLangCanonical'>;
};

const languages = ['en', 'pl'];
const emptyTagFile = '---\n---\n';

function readFrontmatter(file: string): Post['frontmatter'] {
  const markdown = fs.readFileSync(file, 'utf8');
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(markdown)?.[1] ?? '';
  return yaml.load(block) ?? {};
}

function readPosts(projectRoot: string): Post[] {
  const postsRoot = path.join(projectRoot, 'content/posts');
  const posts: Post[] = [];
  for (const directory of fs.readdirSync(postsRoot)) {
    const slug = /^\d{4}-\d{2}-\d{2}--(.+)$/.exec(directory)?.[1];
    if (!slug) continue;
    for (const language of languages) {
      const file = path.join(postsRoot, directory, `index.${language}.md`);
      if (!fs.existsSync(file)) continue;
      posts.push({
        fields: {
          slug: slug.toLowerCase(),
          langKey: language,
          source: 'posts',
        },
        frontmatter: readFrontmatter(file),
      });
    }
  }
  return posts;
}

function missingTagFiles(projectRoot: string): string[] {
  const posts = readPosts(projectRoot);
  const files = languages.flatMap((language) =>
    tagsForLanguage(posts, language).map(
      ([tag]) => `content/tags/${tagSlug(tag)}/index.${language}.md`,
    ),
  );
  return [...new Set(files)].filter(
    (file) => !fs.existsSync(path.join(projectRoot, file)),
  );
}

// Returns the created files relative to the project root.
export function generateTagFiles(projectRoot: string): string[] {
  const created = missingTagFiles(projectRoot);
  for (const file of created) {
    const target = path.join(projectRoot, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, emptyTagFile);
  }
  return created;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
)
  for (const file of generateTagFiles(path.resolve(import.meta.dirname, '..')))
    console.log(file);
