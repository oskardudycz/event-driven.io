import React from 'react';
import Contact from './contact.tsx';
import PageProvider from '../i18n/PageProvider.tsx';
import type { SitePageContext } from '../types/content.ts';

export default function ContactIsland({
  context,
}: {
  context: SitePageContext;
}) {
  return (
    <PageProvider context={context}>
      <Contact />
    </PageProvider>
  );
}
