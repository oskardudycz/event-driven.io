import React from 'react';
import PageProvider from '../../i18n/PageProvider.tsx';
import Article from '../Article/Article.tsx';
import Headline from '../Article/Headline.tsx';
import ResponsiveImage from '../Image/ResponsiveImage.tsx';
import SearchView from './SearchView.tsx';
import SearchResult from './SearchResult.tsx';
import { localizedAnchor } from '../Link/anchor.tsx';
import type { SitePageContext } from '../../types/content.ts';

export default function SearchIsland({
  context,
}: {
  context: SitePageContext;
}) {
  const renderLink = localizedAnchor(context.lang, `/${context.lang}/search/`);
  return (
    <PageProvider context={context}>
      <Article>
        <Headline title={context.lang === 'pl' ? 'Szukaj' : 'Search'} />
        <SearchView
          renderHit={(hit) => (
            <SearchResult
              hit={hit}
              lang={context.lang}
              renderLink={renderLink}
              cover={
                hit.cover ? (
                  <ResponsiveImage
                    image={hit.cover}
                    alt=""
                    contain
                    fill
                    sizes="(max-width: 599px) 88px, 180px"
                  />
                ) : null
              }
            />
          )}
        />
      </Article>
    </PageProvider>
  );
}
