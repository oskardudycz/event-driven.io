import React from 'react';
import Guide from '../page-views/Guide.tsx';
import PageContent from './PageContent.tsx';
import PageProvider from '../i18n/PageProvider.tsx';
import Article from './Article/Article.tsx';
import PostView from './Post/PostView.tsx';
import Page from './Page/Page.tsx';
import { localizedAnchor } from './Link/anchor.tsx';
import type { SitePage } from '../lib/site.ts';

// This component is server-rendered. Interactive children arrive as native
// Astro slots; article bodies and archive records never become island props.
export default function StaticPage({
  page,
  hero,
  subscription,
  share,
  comments,
}: {
  page: SitePage;
  hero?: React.ReactNode;
  subscription?: React.ReactNode;
  share?: React.ReactNode;
  comments?: React.ReactNode;
}) {
  const renderLink = localizedAnchor(page.context.lang, page.route);
  return (
    <PageProvider context={page.context}>
      {!['post', 'page', 'guide'].includes(page.kind) && (
        <PageContent page={page} renderLink={renderLink} hero={hero} />
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
              subscription={subscription}
              share={share}
              comments={comments}
            />
          )}
          {page.kind === 'page' && <Page page={page.document} />}
        </Article>
      )}
    </PageProvider>
  );
}
