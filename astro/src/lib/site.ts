import type { ImageData } from '../../../src/types/image.ts';
import { responsiveImage } from './images.ts';
import { pageSeo } from './page-seo.ts';
import type {
  ArticleNode,
  ArticleEdge,
  GuideStep,
  SitePageContext,
  TagLink,
} from '../../../src/types/content.ts';
import {
  articleLanguages,
  relatedArticles,
} from '../../../src/content/routing.ts';
import {
  guideSteps,
  learningPathProblems,
  pathArticle,
  type LearningPathNode,
} from '../../../src/utils/learning-paths.ts';
import { tagsForLanguage, tagsForPost } from '../../../src/utils/tag-posts.ts';
import { tagSlug } from '../../../src/utils/tag-slug.ts';
import { tagDestination, tagRoute } from '../../../src/utils/tag-routes.ts';
import { readCatalog, type SourceDocument } from './catalog.ts';
import {
  renderDocument,
  renderCard,
  renderPart,
  renderListing,
} from './render-content.ts';

export type SitePage = {
  kind:
    | 'post'
    | 'guide'
    | 'page'
    | 'home'
    | 'archive'
    | 'newsletter'
    | 'tags'
    | 'guides'
    | 'contact'
    | 'talks'
    | 'search'
    | 'notFound';
  route: string;
  portrait?: ImageData;
  seo?: {
    title?: string;
    description?: string;
    schemaType?: string;
    noIndex?: boolean;
  };
  tagged?: ArticleNode[];
  tagContent?: { html: string; description?: string | undefined };
  context: SitePageContext;
  document: ArticleNode;
  pages: ArticleEdge[];
  footnote: string;
  authornote: string;
  articles: ArticleEdge[];
  related: ArticleEdge[];
  guides: GuideStep[];
  tagLinks: TagLink[];
};

export async function sitePages() {
  return buildPages();
}

function navigationArticle(node: SourceDocument): ArticleNode {
  return { id: node.id, fields: node.fields, frontmatter: node.frontmatter };
}

function documentKind(node: SourceDocument): SitePage['kind'] {
  if (node.fields.source === 'paths') return 'guide';
  if (['posts', 'newsletter-pl'].includes(node.fields.source || ''))
    return 'post';
  return 'page';
}

async function buildPages(): Promise<SitePage[]> {
  const documents = await readCatalog();
  const posts = documents.filter(({ fields }) => fields.source === 'posts');
  const paths = documents.filter(({ fields }) => fields.source === 'paths');
  const learningPaths: LearningPathNode[] = paths.map((node) => ({
    fields: {
      pathSlug: node.fields.pathSlug!,
      langKey: node.fields.langKey,
      prefix: node.fields.prefix || '',
    },
    frontmatter: {
      title: node.frontmatter.title,
      description: node.frontmatter.description || '',
      icon: node.frontmatter.icon || '',
      articles: node.frontmatter.articles || [],
      cover: node.coverFile || '',
    },
  }));
  const problems = learningPathProblems(learningPaths, posts, 'en');
  if (problems.length)
    throw new Error(`Invalid learning paths:\n${problems.join('\n')}`);
  const selected = documents.filter(({ fields }) => fields.source !== 'tags');
  const menuPages = documents.filter(
    ({ fields }) =>
      fields.source === 'pages' && /^\d+$/.test(fields.prefix || ''),
  );
  menuPages.sort((a, b) =>
    (a.fields.prefix || '').localeCompare(b.fields.prefix || ''),
  );
  const tagRoutes = new Set(
    ['en', 'pl'].flatMap((language) =>
      tagsForLanguage(posts, language).map(([tag]) =>
        tagRoute(language, tagSlug(tag)),
      ),
    ),
  );
  const result: SitePage[] = [];
  for (const node of selected) {
    const language = node.fields.langKey;
    const kind = documentKind(node);
    const originalPath =
      kind === 'guide' ? `/guides/${node.fields.pathSlug}/` : node.fields.slug;
    const translatedPaths = paths
      .filter(({ fields }) => fields.pathSlug === node.fields.pathSlug)
      .map(({ fields }) => fields.langKey);
    const context: SitePageContext = {
      lang: language,
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'pl'],
      originalPath,
      ...(kind === 'guide'
        ? { availableLanguages: translatedPaths }
        : articleLanguages(documents, node)),
    };
    const siblings = documents.filter(
      ({ fields }) =>
        fields.langKey === language && fields.source === node.fields.source,
    );
    const index = siblings.indexOf(node);
    if (kind === 'post') {
      if (index > 0) context.next = navigationArticle(siblings[index - 1]!);
      if (index >= 0 && index < siblings.length - 1)
        context.prev = navigationArticle(siblings[index + 1]!);
    }
    const articles: ArticleEdge[] = [];
    for (const slug of node.frontmatter.articles || []) {
      const article = pathArticle(posts, slug, language, 'en');
      if (!article) throw new Error(`Unknown guide article: ${slug}`);
      articles.push({ node: navigationArticle(article as SourceDocument) });
    }
    const related: ArticleEdge[] = [];
    for (const article of relatedArticles(documents, node))
      related.push({ node: navigationArticle(article as SourceDocument) });
    result.push({
      kind,
      route: `/${language}${originalPath}`,
      context,
      document: navigationArticle(node),
      pages: menuPages.map((node) => ({
        node: { fields: node.fields, frontmatter: node.frontmatter },
      })),
      footnote: '',
      authornote: '',
      articles,
      related,
      guides:
        kind === 'post'
          ? guideSteps(
              learningPaths,
              posts,
              node.fields.slug.slice(1, -1),
              language,
            )
          : [],
      tagLinks:
        kind === 'post'
          ? tagsForPost(node).map((tag) => ({
              tag,
              path: tagDestination(tagRoutes, language, tagSlug(tag), 'en')!,
            }))
          : [],
    });
  }
  for (const language of ['en', 'pl']) {
    const context = (originalPath: string): SitePageContext => ({
      lang: language,
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'pl'],
      availableLanguages: ['en', 'pl'],
      originalPath,
    });
    const empty: ArticleNode = {
      fields: { slug: '', langKey: language },
      frontmatter: { title: '' },
    };
    const base = {
      context: context('/'),
      document: empty,
      pages: menuPages.map((node) => ({ node: navigationArticle(node) })),
      footnote: '',
      authornote: '',
      articles: [],
      related: [],
      guides: [],
      tagLinks: [],
    };
    const localizedPosts = posts.filter(
      ({ fields }) => fields.langKey === language,
    );
    const listings: [SitePage['kind'], string, SourceDocument[]][] = [
      ['home', '/', localizedPosts.slice(0, 12)],
      ['archive', '/articles/', localizedPosts],
      [
        'newsletter',
        '/newsletter-pl/',
        documents.filter(
          ({ fields }) =>
            fields.source === 'newsletter-pl' && fields.langKey === language,
        ),
      ],
      [
        'guides',
        '/guides/',
        paths.filter(({ fields }) => fields.langKey === language).toReversed(),
      ],
      ['contact', '/contact/', []],
      ['talks', '/talks/', []],
      ['search', '/search/', []],
      ['notFound', '/404/', []],
      ['notFound', '/404.html', []],
    ];
    for (const [kind, originalPath, nodes] of listings) {
      const articles = [];
      for (const node of nodes)
        articles.push({ node: navigationArticle(node) });
      result.push({
        ...base,
        kind,
        route: `/${language}${originalPath}`,
        context: context(originalPath),
        articles,
        ...(kind === 'archive' ? { tagged: posts.map(navigationArticle) } : {}),
      });
    }
    for (const [tag, nodes] of tagsForLanguage(posts, language)) {
      const slug = tagSlug(tag);
      const originalPath = `/articles/tag/${slug}/`;
      const tagSource = documents.find(
        ({ fields }) =>
          fields.source === 'tags' &&
          fields.tagSlug === slug &&
          fields.langKey === language,
      );
      const articles = [];
      for (const node of nodes)
        articles.push({ node: navigationArticle(node) });
      const availableLanguages = ['en', 'pl'].filter((lang) =>
        tagRoutes.has(tagRoute(lang, slug)),
      );
      const tagContent = tagSource
        ? {
            html: '',
            description: tagSource.frontmatter.description,
          }
        : undefined;
      result.push({
        ...base,
        kind: 'tags',
        route: `/${language}${originalPath}`,
        context: {
          ...context(originalPath),
          tag,
          tagSlug: slug,
          availableLanguages,
        },
        articles,
        ...(tagContent ? { tagContent } : {}),
      });
    }
  }
  const fallback = result.find((page) => page.route === '/en/404/')!;
  result.push(
    { ...fallback, route: '/404.html' },
    { ...fallback, route: '/404/' },
  );
  const routes = new Set<string>();
  for (const page of result) {
    if (routes.has(page.route))
      throw new Error(`Duplicate published route: ${page.route}`);
    routes.add(page.route);
    page.seo = pageSeo(page);
  }
  return result;
}

export async function renderSitePage(
  definition: SitePage,
  documents?: SourceDocument[],
): Promise<SitePage> {
  const catalog = documents || (await readCatalog());
  const source = (id: string | undefined) => {
    const node = catalog.find((node) => node.id === id);
    if (!node) throw new Error(`Unknown content identity: ${id}`);
    return node;
  };
  const page = { ...definition };
  if (['post', 'page', 'guide'].includes(page.kind))
    page.document = await renderDocument(
      source(page.document.id),
      page.kind === 'post' ? 600 : 1200,
    );
  page.articles = [];
  // Bound image I/O and embed lookups without serializing the whole archive.
  for (let offset = 0; offset < definition.articles.length; offset += 8) {
    const batch = definition.articles.slice(offset, offset + 8);
    page.articles.push(
      ...(await Promise.all(
        batch.map((edge) =>
          ['guide', 'guides'].includes(page.kind)
            ? renderCard(source(edge.node.id))
            : renderListing(source(edge.node.id)),
        ),
      )),
    );
  }
  page.related = [];
  for (const edge of definition.related)
    page.related.push(await renderCard(source(edge.node.id)));
  page.footnote = await renderPart('footnote', page.context.lang);
  if (page.kind === 'post')
    page.authornote = await renderPart('author', page.context.lang);
  if (page.kind === 'home')
    page.portrait = await responsiveImage(
      'src/images/png/hero-speaker.png',
      'hero',
    );
  if (page.kind === 'tags' && page.tagContent) {
    const node = catalog.find(
      (node) =>
        node.fields.source === 'tags' &&
        node.fields.tagSlug === page.context.tagSlug &&
        node.fields.langKey === page.context.lang,
    )!;
    page.tagContent = {
      ...page.tagContent,
      html: (await renderDocument(node)).html || '',
    };
  }
  page.seo = pageSeo(page);
  return page;
}
