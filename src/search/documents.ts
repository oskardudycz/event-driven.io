import type { ArticleNode } from '../types/content.ts';
import type { IGatsbyImageData } from 'gatsby-plugin-image';
import type { TFunction } from 'i18next';
import { tagsForLanguage } from '../utils/tag-posts.ts';
import { tagSlug } from '../utils/tag-slug.ts';
import { tagDescription, tagLabel } from '../utils/tag-label.ts';
import { tagRoute } from '../utils/tag-routes.ts';
export function searchableText(raw?: string) {
  return (raw || '')
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
    .replace(/<(script|style|iframe)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(
      /<\/?(?:p|div|span|em|strong|a|img|br|figure|figcaption|details|summary|h[1-6])\b[^>]*>/gi,
      ' ',
    )
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/```[^\n]*\n?/g, '')
    .replace(/[*`~]/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}
// Guides have no slug of their own; they are published under /guides/.
const routeSlug = ({ fields }: ArticleNode) =>
  fields.source === 'paths' && fields.pathSlug
    ? `/guides/${fields.pathSlug}/`
    : fields.slug;

const searchableContent = (node: ArticleNode) =>
  node.fields.source === 'paths'
    ? searchableText(
        [node.frontmatter.description, node.rawMarkdownBody].join('\n'),
      )
    : searchableText(node.rawMarkdownBody || node.internal?.content);

export function searchDocuments(
  nodes: ArticleNode[],
  language: string,
  defaultLanguage = 'en',
  covers: Map<string, IGatsbyImageData> = new Map(),
) {
  const groups = new Map<string, ArticleNode[]>();
  for (const node of nodes) {
    const { fields, frontmatter } = node;
    const slug = fields && routeSlug(node);
    if (
      !slug ||
      !frontmatter?.title ||
      !['posts', 'pages', 'newsletter-pl', 'paths'].includes(
        fields.source || '',
      )
    )
      continue;
    // Search is a public discovery index: utility/auth routes stay excluded.
    if (
      fields.source === 'pages' &&
      /^\/(?:search|404|signin|callback|billing)\//.test(slug)
    )
      continue;
    const key = `${fields.source}:${slug}`;
    const versions = groups.get(key) || [];
    versions.push(node);
    groups.set(key, versions);
  }
  return [...groups]
    .filter(([, versions]) =>
      versions.some((node) => !node.frontmatter.useDefaultLangCanonical),
    )
    .map(([id, versions]) => {
      const originals = versions.filter(
        (node) => !node.frontmatter.useDefaultLangCanonical,
      );
      const node =
        originals.find((node) => node.fields.langKey === language) ||
        originals.find((node) => node.fields.langKey === defaultLanguage) ||
        originals[0];
      if (!node) throw new Error(`Missing canonical search document: ${id}`);
      const { fields, frontmatter } = node;
      // Content language and indexing identity do not choose the interface locale.
      const routeLanguage = versions.some(
        (version) => version.fields.langKey === language,
      )
        ? language
        : fields.langKey;
      return {
        id,
        title: frontmatter.title,
        cover: covers.get(node.id || '') || null,
        path: `/${routeLanguage}${routeSlug(node)}`,
        langKey: fields.langKey,
        source: fields.source || '',
        tags: [...new Set(frontmatter.tags || [])].join(' · '),
        date: /^\d{4}-\d{2}-\d{2}$/.test(fields.prefix || '')
          ? fields.prefix || ''
          : '',
        content: searchableContent(node),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

const tagFileDescription = (
  nodes: ArticleNode[],
  slug: string,
  language: string,
) =>
  nodes.find(
    ({ fields }) =>
      fields.source === 'tags' &&
      fields.tagSlug === slug &&
      fields.langKey === language,
  )?.frontmatter.description;

// A tag without a page in the index language leads to the default
// language's tag page, like an untranslated article.
export function tagSearchDocuments(
  nodes: ArticleNode[],
  language: string,
  t: TFunction,
  defaultLanguage = 'en',
) {
  const tags = new Map<string, { tag: string; langKey: string }>();
  for (const langKey of [defaultLanguage, language])
    for (const [tag] of tagsForLanguage(nodes, langKey))
      tags.set(tagSlug(tag), { tag, langKey });
  return [...tags]
    .map(([slug, { tag, langKey }]) => ({
      id: `tags:${slug}`,
      title: tagLabel(t, tag),
      cover: null,
      path: tagRoute(langKey, slug),
      langKey,
      source: 'tags',
      tags: '',
      date: '',
      content: tagDescription(
        t,
        tag,
        tagFileDescription(nodes, slug, language),
      ),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}
