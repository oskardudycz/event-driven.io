import type { SitePageProps } from '../types/content.ts';
import React from 'react';
import { graphql } from 'gatsby';
import { useTranslation } from 'react-i18next';

import Article from '../components/Article/index.ts';
import Headline from '../components/Article/Headline.tsx';
import { Link } from '../components/Link/index.tsx';
import { createHead } from '../components/Seo/index.ts';

const GuidesTemplate = (props: SitePageProps<'guides'>) => {
  const { t } = useTranslation();
  const {
    data: { guides },
  } = props;

  return (
    <React.Fragment>
      <Article>
        <header className="mb-section">
          <Headline title={t('guides.title')} />
          <p className="mt-gutter text-summary">{t('guides.description')}</p>
        </header>
        <ul className="grid list-none gap-gutter sm:grid-cols-2">
          {guides.nodes.map(({ fields, frontmatter }) => {
            const cover = frontmatter.cover?.childImageSharp?.resize;
            return (
              <li key={fields.pathSlug}>
                <Link
                  to={`/${fields.langKey}/guides/${fields.pathSlug}/`}
                  className="flex h-full flex-col overflow-hidden rounded-panel border border-solid border-line text-ink transition-colors hover:border-brand-decoration"
                >
                  {cover && (
                    <img
                      className="block aspect-video w-full object-cover"
                      src={cover.src}
                      alt=""
                      loading="lazy"
                      width="420"
                      height="240"
                    />
                  )}
                  <span className="flex flex-1 flex-col gap-2 p-gutter">
                    <h2 className="text-summary">
                      <span aria-hidden="true">{frontmatter.icon}</span>{' '}
                      {frontmatter.title}
                    </h2>
                    <span className="leading-summary">
                      {frontmatter.description}
                    </span>
                    <strong className="mt-auto text-ink">
                      {t('guides.articleCount', {
                        count: frontmatter.articles?.length || 0,
                      })}{' '}
                      →
                    </strong>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Article>
    </React.Fragment>
  );
};

export default GuidesTemplate;

export const query = graphql`
  query GuidesByLanguage($langKey: String!, $language: String!) {
    locales: allLocale(filter: { language: { in: [$language, "en"] } }) {
      ...TranslationResources
    }
    guides: allMarkdownRemark(
      filter: { fields: { source: { eq: "paths" }, langKey: { eq: $langKey } } }
      sort: { fields: { prefix: ASC } }
    ) {
      nodes {
        fields {
          pathSlug
          langKey
        }
        frontmatter {
          title
          description
          icon
          articles
          cover {
            childImageSharp {
              resize(
                width: 420
                height: 240
                quality: 78
                cropFocus: CENTER
                toFormat: WEBP
              ) {
                src
              }
            }
          }
        }
      }
    }
    site {
      siteMetadata {
        facebook {
          appId
        }
      }
    }
  }
`;

export const Head = createHead(({ t }) => ({
  title: t('guides.title'),
  description: t('guides.description'),
  schemaType: 'CollectionPage',
}));
