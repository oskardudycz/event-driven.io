import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

function collection(base: string) {
  return defineCollection({
    loader: glob({
      base,
      pattern: ['**/index.{en,pl}.md', '!**/code/**'],
      generateId: ({ entry }) => entry,
      deferRender: true,
    }),
    schema: z.object({
      title: base.endsWith('/tags') ? z.string().default('') : z.string(),
      description: z.string().optional(),
      summary: z.string().optional(),
      cover: z.string().optional(),
      author: z.string().optional(),
      tags: z.array(z.string()).optional(),
      related: z.array(z.string()).optional(),
      articles: z.array(z.string()).optional(),
      useDefaultLangCanonical: z.boolean().optional(),
      disqusId: z.string().optional(),
      redirectFrom: z.string().optional(),
      redirectAliases: z.array(z.string()).optional(),
      menuTitle: z.string().optional(),
      icon: z.string().optional(),
      publishedAt: z.string().optional(),
    }),
  });
}

export const collections = {
  posts: collection('./content/posts'),
  paths: collection('./content/paths'),
  pages: collection('./content/pages'),
  'newsletter-pl': collection('./content/newsletter-pl'),
  tags: collection('./content/tags'),
};
