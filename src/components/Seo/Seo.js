import React from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import config from "../../../content/meta/config";
import { useTranslation } from "react-i18next";
import { usePageContext } from "../../i18n/page-context";

const normalizePath = (path) => {
  const pathWithoutSlashes = (path || "").replace(/^\/+|\/+$/g, "");
  return pathWithoutSlashes ? `/${pathWithoutSlashes}/` : "/";
};

const absoluteUrl = (host, path) =>
  path && path.startsWith("http") ? path : `${host}${path || ""}`;

const Seo = (props) => {
  const { t } = useTranslation();
  const {
    lang,
    originalPath,
    supportedLanguages = [],
    availableLanguages,
    defaultLanguage = "en",
  } = usePageContext();

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
  const postTitle = frontmatter.title;
  const postDescription = frontmatter.description;
  const postCover = frontmatter.cover || {};
  const postSlug = fields.slug || "";

  const pageTitle = suppliedTitle || postTitle;
  const title = pageTitle ? `${pageTitle} - ${config.shortSiteTitle}` : config.siteTitle;
  const description =
    suppliedDescription ||
    postDescription ||
    (data || {}).excerpt ||
    t("seo.siteDescription", { defaultValue: config.siteDescription });
  const host = config.siteUrl.replace(/\/$/, "");
  const imagePath = ((postCover.childImageSharp || {}).resize || {}).src || config.siteImage;
  const image = absoluteUrl(host, imagePath);
  const pagePath = normalizePath(originalPath || postSlug || "/");
  const canonicalLanguage = useDefaultLangCanonical ? defaultLanguage : lang || defaultLanguage;
  const canonicalUrl = `${host}/${canonicalLanguage}${pagePath}`;
  const requestedLanguages = availableLanguages || supportedLanguages;
  const languages = requestedLanguages
    .filter(Boolean)
    .filter((language, index, allLanguages) => allLanguages.indexOf(language) === index);
  const defaultAlternateLanguage = languages.includes(defaultLanguage)
    ? defaultLanguage
    : languages[0] || canonicalLanguage;
  const isArticle = schemaType === "BlogPosting" || fields.source === "posts";
  const isService =
    fields.source === "pages" && /training|szkolenie|workshop|consult/i.test(pagePath);
  const isProfile = fields.source === "pages" && pagePath === "/about/";
  const person = {
    "@type": "Person",
    name: config.authorName,
    url: `${host}/${canonicalLanguage}/about/`,
    sameAs: Object.values(config.socialLinks || {})
      .map((link) => link.url)
      .filter(Boolean),
  };
  const resolvedSchemaType =
    schemaType ||
    (isArticle
      ? "BlogPosting"
      : isService
      ? "Service"
      : isProfile
      ? "ProfilePage"
      : pagePath === "/"
      ? "WebSite"
      : "WebPage");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": resolvedSchemaType,
    name: pageTitle || config.siteTitle,
    ...(isArticle ? { headline: pageTitle || config.siteTitle } : {}),
    description,
    url: canonicalUrl,
    inLanguage: canonicalLanguage,
    ...(image ? { image } : {}),
    ...(isArticle && fields.prefix
      ? {
          datePublished: fields.prefix,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": canonicalUrl,
          },
          ...([frontmatter.category, ...(frontmatter.categories || [])].filter(Boolean).length
            ? {
                articleSection: Array.from(
                  new Set([frontmatter.category, ...(frontmatter.categories || [])].filter(Boolean))
                ),
              }
            : {}),
          author: person,
          publisher: person,
        }
      : {}),
    ...(resolvedSchemaType === "Service"
      ? {
          serviceType: pageTitle || "Software architecture consulting and training",
          provider: person,
          areaServed: "Worldwide",
        }
      : {}),
    ...(resolvedSchemaType === "ProfilePage" ? { mainEntity: person } : {}),
    ...(resolvedSchemaType === "WebSite"
      ? {
          author: person,
        }
      : {}),
  };

  const metaTags = [
    { name: "description", content: description },
    ...(noIndex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
    { property: "og:title", content: title },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: pageTitle || config.siteTitle },
    { property: "og:type", content: isArticle ? "article" : "website" },
    { property: "og:description", content: description },
    { property: "og:locale", content: canonicalLanguage === "pl" ? "pl_PL" : "en_US" },
    { property: "og:url", content: canonicalUrl },
    ...(isArticle && fields.prefix
      ? [{ property: "article:published_time", content: fields.prefix }]
      : []),
    ...(isArticle && frontmatter.category
      ? [{ property: "article:section", content: frontmatter.category }]
      : []),
    ...(facebook.appId ? [{ property: "fb:app_id", content: facebook.appId }] : []),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: config.authorTwitterAccount || "" },
    { name: "twitter:creator", content: config.authorTwitterAccount || "" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: pageTitle || config.siteTitle },
  ].concat(meta || []);

  const linkTags = [
    { rel: "canonical", href: canonicalUrl },
    ...(languages.length > 1
      ? [
          {
            rel: "alternate",
            hrefLang: "x-default",
            href: `${host}/${defaultAlternateLanguage}${pagePath}`,
          },
          ...languages.map((language) => ({
            rel: "alternate",
            hrefLang: language,
            href: `${host}/${language}${pagePath}`,
          })),
        ]
      : []),
  ];

  return (
    <Helmet
      htmlAttributes={{ lang }}
      title={title}
      meta={metaTags}
      link={linkTags}
      script={
        noIndex
          ? []
          : [
              {
                type: "application/ld+json",
                innerHTML: JSON.stringify(structuredData),
              },
            ]
      }
    />
  );
};

Seo.propTypes = {
  data: PropTypes.object,
  facebook: PropTypes.object,
  meta: PropTypes.array,
  useDefaultLangCanonical: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
  noIndex: PropTypes.bool,
  schemaType: PropTypes.string,
};

export default Seo;
