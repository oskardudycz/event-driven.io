import type { ArticleNode } from '../types/content.ts';
import type { IGatsbyImageData } from 'gatsby-plugin-image';
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
export function searchDocuments(
  nodes: ArticleNode[],
  language: string,
  defaultLanguage = 'en',
  covers: Map<string, IGatsbyImageData> = new Map(),
) {
  const groups = new Map<string, ArticleNode[]>();
  for (const node of nodes) {
    const { fields, frontmatter } = node;
    if (
      !fields?.slug ||
      !frontmatter?.title ||
      !['posts', 'pages', 'newsletter-pl'].includes(fields.source || '')
    )
      continue;
    // Search is a public discovery index: utility/auth routes stay excluded.
    if (
      fields.source === 'pages' &&
      /^\/(?:search|404|signin|callback|billing)\//.test(fields.slug)
    )
      continue;
    const key = `${fields.source}:${fields.slug}`;
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
        path: `/${routeLanguage}${fields.slug}`,
        langKey: fields.langKey,
        source: fields.source || '',
        category: [
          ...new Set(
            [frontmatter.category, ...(frontmatter.categories || [])].filter(
              Boolean,
            ),
          ),
        ].join(' · '),
        date: /^\d{4}-\d{2}-\d{2}$/.test(fields.prefix || '')
          ? fields.prefix || ''
          : '',
        content: searchableText(node.rawMarkdownBody || node.internal?.content),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}
