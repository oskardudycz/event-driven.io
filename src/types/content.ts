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
};

export type Frontmatter = {
  title: string;
  description?: string;
  summary?: string;
  category?: string;
  categories?: string[];
  cover?: ImageFile;
  author?: string;
  publishedAt?: string;
  disqusId?: string;
  useDefaultLangCanonical?: boolean;
  redirectFrom?: string;
  redirectAliases?: string[];
  related?: string[];
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
  category?: string;
  categoryDescription?: string;
  recommendedSlugs?: string[];
  next?: ArticleNode;
  prev?: ArticleNode;
  relatedPostIds?: string[];
  relatedIds?: string[];
};
export type PageData = {
  posts: { edges: ArticleEdge[] };
  post: ArticleNode;
  page: ArticleNode;
  authornote: { html: string };
  relatedPosts: { edges: ArticleEdge[] };
  site: { siteMetadata: { facebook: { appId?: string } } };
  bgDesktop: { resize: { src: string } };
  bgTablet: { resize: { src: string } };
  bgMobile: { resize: { src: string } };
  allVideosJson: { edges: { node: VideoDetails }[] };
};
export type SitePageProps<Fields extends keyof PageData> = PageProps<
  Pick<PageData, Fields>,
  SitePageContext
>;
export type TranslatedPageProps<Fields extends keyof PageData> = SitePageProps<Fields> &
  WithTranslation;
