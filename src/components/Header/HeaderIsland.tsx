import React from 'react';
import PageProvider from '../../i18n/PageProvider.tsx';
import HeaderView from './HeaderView.tsx';
import { localizedAnchor } from '../Link/anchor.tsx';
import type { ArticleEdge, SitePageContext } from '../../types/content.ts';

export default function HeaderIsland({
  context,
  route,
  pages,
}: {
  context: SitePageContext;
  route: string;
  pages: ArticleEdge[];
}) {
  return (
    <PageProvider context={context}>
      <HeaderView
        path={route}
        pages={pages}
        renderLink={localizedAnchor(context.lang, route)}
      />
    </PageProvider>
  );
}
