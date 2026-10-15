import type { IGatsbyImageData } from 'gatsby-plugin-image';
import type { PageProps } from 'gatsby';
import type { WithTranslation } from 'react-i18next';

export type ImageFile = {
  childImageSharp?: {
    gatsbyImageData?: IGatsbyImageData;
    resize?: { src: string };
  };
};

export type ArticleFields = {
  slug: string;
  prefix?: string;
  langKey: string;
  source?: string;
  originalSlug?: string;
  pathSlug?: string;
  tagSlug?: string;
};

export type Frontmatter = {
  title: string;
  description?: string;
  summary?: string;
  tags?: string[];
  cover?: ImageFile;
  author?: string;
  publishedAt?: string;
  disqusId?: string;
  useDefaultLangCanonical?: boolean;
  redirectFrom?: string;
  redirectAliases?: string[];
  related?: string[];
  articles?: string[];
  menuTitle?: string;
  icon?: string;
};

export type ArticleNode = {
  id?: string;
  fields: ArticleFields;
  frontmatter: Frontmatter;
  html?: string;
  excerpt?: string;
  rawMarkdownBody?: string;
  internal?: { content?: string };
};
export type ArticleEdge = { node: ArticleNode };
export type GuideNode = {
  html?: string;
  fields: { pathSlug: string; langKey: string; source?: string };
  frontmatter: Frontmatter;
};
export type GuideStep = {
  title: string;
  path: string;
  step: number;
  total: number;
  next?: { title: string; path: string };
};
export type TagLink = { tag: string; path?: string };
export type TagContentNode = {
  html?: string;
  frontmatter: { description?: string };
};
export type VideoDetails = {
  VideoId: string;
  Title: string;
  Channel: string;
  Duration: string;
  Language: string;
};
export type SitePageContext = {
  slug?: string;
  lang: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  siteUrl?: string;
  originalPath?: string;
  availableLanguages?: string[];
  canonicalLanguages?: string[];
  tag?: string;
  tagSlug?: string;
  tagLinks?: TagLink[];
  next?: ArticleNode;
  prev?: ArticleNode;
  relatedPostIds?: string[];
  relatedIds?: string[];
  guides?: GuideStep[];
  pathSlug?: string;
  articleIds?: string[];
};
export type PageData = {
  posts: { edges: ArticleEdge[] };
  post: ArticleNode;
  page: ArticleNode;
  authornote: { html: string };
  relatedPosts: { edges: ArticleEdge[] };
  guide: GuideNode;
  guides: { nodes: GuideNode[] };
  articles: { edges: ArticleEdge[] };
  tagged: { nodes: ArticleNode[] };
  tagContent: TagContentNode | null;
  site: { siteMetadata: { facebook: { appId?: string } } };
};
export type SitePageProps<Fields extends keyof PageData> = PageProps<
  Pick<PageData, Fields>,
  SitePageContext
>;
export type TranslatedPageProps<Fields extends keyof PageData> =
  SitePageProps<Fields> & WithTranslation;
