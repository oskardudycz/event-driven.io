import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const pages = defineCollection({
  loader: glob({
    base: './content/pages/0--consulting',
    pattern: 'index.{en,pl}.md',
    generateId: ({ entry }) => entry.split('.')[1]!,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    summary: z.string(),
  }),
});

export const collections = { pages };
