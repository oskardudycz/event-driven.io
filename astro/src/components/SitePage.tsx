import Guide from '../../../src/page-views/Guide.tsx';
import PageContent from './PageContent.tsx';
import React, { useState } from 'react';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { DEFAULT_OPTIONS } from '../../../src/i18n/constants.ts';
import { PageContext } from '../../../src/i18n/page-context.ts';
import LayoutView from '../../../src/layouts/LayoutView.tsx';
import Article from '../../../src/components/Article/Article.tsx';
import PostView from '../../../src/components/Post/PostView.tsx';
import Page from '../../../src/components/Page/Page.tsx';
import { localizedHref } from '../../../src/content/links.ts';
import type { RenderLink } from '../../../src/components/Link/anchor.tsx';
import type { SitePage } from '../lib/site.ts';

export default function SitePage({
  page,
  disqusShortname,
}: {
  page: SitePage;
  disqusShortname: string;
}) {
  const [translations] = useState(() => {
    const instance = i18next.createInstance();
    void instance.init({
      ...DEFAULT_OPTIONS.i18nextConfig,
      lng: page.context.lang,
      initAsync: false,
    });
    return instance;
  });
  const currentPath = page.route;
  const renderLink: RenderLink = ({ href, ...attributes }) => {
    const destination = localizedHref(href, page.context.lang);
    return (
      <a
        {...attributes}
        href={destination}
        aria-current={
          attributes['aria-current'] ??
          (destination === currentPath ? 'page' : undefined)
        }
      />
    );
  };
  return (
    <I18nextProvider i18n={translations}>
      <PageContext.Provider value={page.context}>
        <LayoutView
          location={{
            pathname: currentPath,
          }}
          data={{
            pages: { edges: page.pages },
            footnote: { html: page.footnote },
          }}
          renderLink={renderLink}
        >
          {!['post', 'page', 'guide'].includes(page.kind) && (
            <PageContent
              page={page}
              renderLink={renderLink}
              {...(page.portrait ? { portrait: page.portrait } : {})}
            />
          )}
          {page.kind === 'guide' && (
            <Guide
              data={{
                guide: {
                  ...page.document,
                  fields: {
                    pathSlug: page.document.fields.pathSlug!,
                    langKey: page.context.lang,
                  },
                },
                articles: { edges: page.articles },
              }}
              pageContext={{
                ...page.context,
                articleIds: page.articles.map(({ node }) => node.id!),
              }}
            />
          )}
          {['post', 'page'].includes(page.kind) && (
            <Article>
              {page.kind === 'post' && (
                <PostView
                  post={page.document}
                  authornote={page.authornote}
                  related={page.related}
                  guides={page.guides}
                  tagLinks={page.tagLinks}
                  next={page.context.next}
                  prev={page.context.prev}
                  renderLink={renderLink}
                  disqusShortname={disqusShortname}
                />
              )}
              {page.kind === 'page' && <Page page={page.document} />}
            </Article>
          )}
        </LayoutView>
      </PageContext.Provider>
    </I18nextProvider>
  );
}
