import type {
  ArticleFields,
  Frontmatter,
  SitePageContext,
} from '../types/content.ts';
type SeoData = {
  frontmatter?: Partial<Frontmatter>;
  fields?: Partial<ArticleFields>;
  excerpt?: string;
};
type SeoProps = {
  pageContext: Partial<SitePageContext>;
  data?: SeoData;
  facebook?: { appId?: string } | undefined;
  meta?: React.ComponentProps<'meta'>[];
  useDefaultLangCanonical?: boolean | undefined;
  title?: string;
  description?: string;
  noIndex?: boolean;
  schemaType?: string;
};
import i18next from 'i18next';
import { DEFAULT_OPTIONS } from '../i18n/constants.ts';
import { publicationDate } from '../utils/publication-date.ts';
import config from '../config.ts';

const normalizePath = (path?: string) => {
  const pathWithoutSlashes = (path || '').replace(/^\/+|\/+$/g, '');
  return pathWithoutSlashes ? `/${pathWithoutSlashes}/` : '/';
};

const absoluteUrl = (host: string, path?: string) =>
  path && path.startsWith('http') ? path : `${host}${path || ''}`;

// Metadata is also rendered outside the page provider tree. Use its explicit page context and a
// fixed-language translator so parallel SSR and navigation cannot mix locales.
const metadataI18n = i18next.createInstance();
void metadataI18n.init({ ...DEFAULT_OPTIONS.i18nextConfig, initAsync: false });

export const seoMetadata = (props: SeoProps) => {
  const t = metadataI18n.getFixedT(
    props.pageContext.lang || DEFAULT_OPTIONS.defaultLanguage,
  );
  const {
    lang,
    originalPath,
    supportedLanguages = [],
    availableLanguages,
    canonicalLanguages,
    defaultLanguage = 'en',
  } = props.pageContext;

  const {
    data,
    facebook = {},
    meta,
    useDefaultLangCanonical,
    title: suppliedTitle,
    description: suppliedDescription,
    noIndex = false,
    schemaType,
  } = props;
  const frontmatter = (data || {}).frontmatter || {};
  const fields = (data || {}).fields || {};
  const published = publicationDate(frontmatter.publishedAt, fields.prefix);
  const postTitle = frontmatter.title;
  const postDescription = frontmatter.description;
  const postCover = frontmatter.cover;
  const primaryTag = frontmatter.tags?.[0];
  const postSlug = fields.slug || '';

  const pageTitle = suppliedTitle || postTitle;
  const title = pageTitle
    ? `${pageTitle} - ${config.shortSiteTitle}`
    : config.siteTitle;
  const description =
    suppliedDescription ||
    postDescription ||
    (data || {}).excerpt ||
    t('seo.siteDescription', { defaultValue: config.siteDescription });
  const host = config.siteUrl.replace(/\/$/, '');
  const imagePath = postCover?.src || config.siteImage;
  const image = absoluteUrl(host, imagePath);
  const pagePath = normalizePath(originalPath || postSlug || '/');
  const canonicalLanguage = useDefaultLangCanonical
    ? defaultLanguage
    : lang || defaultLanguage;
  const canonicalUrl = `${host}/${canonicalLanguage}${pagePath}`;
  const requestedLanguages =
    canonicalLanguages || availableLanguages || supportedLanguages;
  const languages = requestedLanguages
    .filter(Boolean)
    .filter(
      (language, index, allLanguages) =>
        allLanguages.indexOf(language) === index,
    );
  const defaultAlternateLanguage = languages.includes(defaultLanguage)
    ? defaultLanguage
    : languages[0] || canonicalLanguage;
  const isArticle = schemaType === 'BlogPosting' || fields.source === 'posts';
  const isService =
    fields.source === 'pages' &&
    /training|szkolenie|workshop|consult/i.test(pagePath);
  const isProfile = fields.source === 'pages' && pagePath === '/about/';
  const person = {
    '@type': 'Person',
    name: config.authorName,
    url: `${host}/${canonicalLanguage}/about/`,
    sameAs: Object.values(config.socialLinks || {})
      .map((link) => link.url)
      .filter(Boolean),
  };
  const resolvedSchemaType =
    schemaType ||
    (isArticle
      ? 'BlogPosting'
      : isService
        ? 'Service'
        : isProfile
          ? 'ProfilePage'
          : pagePath === '/'
            ? 'WebSite'
            : 'WebPage');
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': resolvedSchemaType,
    name: pageTitle || config.siteTitle,
    ...(isArticle ? { headline: pageTitle || config.siteTitle } : {}),
    description,
    url: canonicalUrl,
    ...(resolvedSchemaType !== 'Service'
      ? { inLanguage: canonicalLanguage }
      : {}),
    ...(image ? { image } : {}),
    ...(isArticle && fields.prefix
      ? {
          datePublished: published,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonicalUrl,
          },
          ...(primaryTag ? { articleSection: primaryTag } : {}),
          author: person,
          publisher: person,
        }
      : {}),
    ...(resolvedSchemaType === 'Service'
      ? {
          serviceType:
            pageTitle || 'Software architecture consulting and training',
          provider: person,
          areaServed: 'Worldwide',
        }
      : {}),
    ...(resolvedSchemaType === 'ProfilePage' ? { mainEntity: person } : {}),
    ...(resolvedSchemaType === 'WebSite'
      ? {
          author: person,
        }
      : {}),
  };

  const metaTags: React.ComponentProps<'meta'>[] = [
    { name: 'description', content: description },
    ...(noIndex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
    { property: 'og:title', content: title },
    { property: 'og:image', content: image },
    { property: 'og:image:alt', content: pageTitle || config.siteTitle },
    { property: 'og:type', content: isArticle ? 'article' : 'website' },
    { property: 'og:description', content: description },
    {
      property: 'og:locale',
      content: canonicalLanguage === 'pl' ? 'pl_PL' : 'en_US',
    },
    { property: 'og:url', content: canonicalUrl },
    ...(isArticle && fields.prefix
      ? [{ property: 'article:published_time', content: published }]
      : []),
    ...(isArticle && primaryTag
      ? [{ property: 'article:section', content: primaryTag }]
      : []),
    ...(facebook.appId
      ? [{ property: 'fb:app_id', content: facebook.appId }]
      : []),
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
    { name: 'twitter:image:alt', content: pageTitle || config.siteTitle },
    ...(meta || []),
  ];

  const linkTags = [
    { rel: 'canonical', href: canonicalUrl },
    ...(!noIndex && languages.length > 1
      ? [
          {
            rel: 'alternate',
            hrefLang: 'x-default',
            href: `${host}/${defaultAlternateLanguage}${pagePath}`,
          },
          ...languages.map((language) => ({
            rel: 'alternate',
            hrefLang: language,
            href: `${host}/${language}${pagePath}`,
          })),
        ]
      : []),
  ];

  return { lang, title, metaTags, linkTags, structuredData, noIndex };
};
