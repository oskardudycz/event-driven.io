import path from 'node:path';
import type { ArticleFields, ArticleNode } from '../types/content.ts';

// The directory prefix controls ordering; original case remains a feed/comment identity.
export function contentFields(
  source: string,
  relativePath: string,
): ArticleFields {
  const language = relativePath.match(/\w+\.(\w+)\.\w+$/)?.[1] || 'en';
  const directory = path.posix.dirname(relativePath);
  const separator = directory.indexOf('--');
  const prefix = separator >= 0 ? directory.slice(0, separator) : '';
  const name = separator >= 0 ? directory.slice(separator + 2) : directory;
  const originalSlug = `/${name === '.' ? '' : name + '/'}`;
  const fields: ArticleFields = {
    slug: originalSlug.toLowerCase(),
    originalSlug,
    prefix,
    source,
    langKey: language,
  };
  if (source === 'paths') fields.pathSlug = name.toLowerCase();
  if (source === 'tags') fields.tagSlug = directory;
  return fields;
}

export function articleLanguages(nodes: ArticleNode[], article: ArticleNode) {
  const versions = nodes.filter(
    ({ fields }) =>
      fields.source === article.fields.source &&
      fields.slug === article.fields.slug,
  );
  return {
    availableLanguages: versions.map(({ fields }) => fields.langKey),
    canonicalLanguages: versions
      .filter(({ frontmatter }) => !frontmatter.useDefaultLangCanonical)
      .map(({ fields }) => fields.langKey),
  };
}

function findRelated(
  nodes: ArticleNode[],
  article: ArticleNode,
  route: string,
  defaultLanguage: string,
) {
  const candidates = nodes.filter(
    (candidate) =>
      candidate.id !== article.id &&
      candidate.fields.slug === route &&
      candidate.fields.source === article.fields.source,
  );
  return (
    candidates.find(
      ({ fields }) => fields.langKey === article.fields.langKey,
    ) ||
    candidates.find(
      ({ fields, frontmatter }) =>
        fields.langKey === defaultLanguage &&
        !frontmatter.useDefaultLangCanonical,
    ) ||
    candidates.find(({ frontmatter }) => !frontmatter.useDefaultLangCanonical)
  );
}

function routesReferencing(nodes: ArticleNode[], article: ArticleNode) {
  const referrers = nodes.filter(
    ({ fields, frontmatter }) =>
      fields.source === article.fields.source &&
      (frontmatter.related || []).some(
        (slug) => `/${slug}/` === article.fields.slug,
      ),
  );
  const newestFirst = referrers.sort((a, b) =>
    (b.fields.prefix || '').localeCompare(a.fields.prefix || ''),
  );
  return new Set(newestFirst.map(({ fields }) => fields.slug));
}

export function relatedArticles(
  nodes: ArticleNode[],
  article: ArticleNode,
  defaultLanguage = 'en',
) {
  const explicit = (article.frontmatter.related || []).map((slug) => {
    const match = findRelated(nodes, article, `/${slug}/`, defaultLanguage);
    if (!match)
      throw new Error(
        `Invalid related article "${slug}" for ${article.fields.langKey}${article.fields.slug}`,
      );
    return match;
  });
  const explicitRoutes = new Set(explicit.map(({ fields }) => fields.slug));
  const backReferences: ArticleNode[] = [];
  for (const route of routesReferencing(nodes, article)) {
    if (explicitRoutes.has(route)) continue;
    const match = findRelated(nodes, article, route, defaultLanguage);
    if (match) backReferences.push(match);
  }
  return [...explicit, ...backReferences];
}

export function articleAliases(article: ArticleNode) {
  if (article.fields.langKey !== 'en') return [];
  const destination = `/en${article.fields.slug}`;
  const aliases = new Set(
    [
      article.frontmatter.redirectFrom,
      ...(article.frontmatter.redirectAliases || []),
    ].filter((alias): alias is string => Boolean(alias)),
  );
  aliases.delete(destination);
  return [...aliases].map((fromPath) => ({ fromPath, toPath: destination }));
}
