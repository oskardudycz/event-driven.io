import React from 'react';
import PageProvider from '../../i18n/PageProvider.tsx';
import Substack from './Substack.tsx';
import type { SitePageContext } from '../../types/content.ts';

export default function NewsletterIsland({
  context,
}: {
  context: SitePageContext;
}) {
  return (
    <PageProvider context={context}>
      <Substack />
    </PageProvider>
  );
}
