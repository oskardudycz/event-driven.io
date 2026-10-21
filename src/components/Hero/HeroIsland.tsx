import React from 'react';
import PageProvider from '../../i18n/PageProvider.tsx';
import HeroContent from './HeroContent.tsx';
import ResponsiveImage from '../Image/ResponsiveImage.tsx';
import { localizedAnchor } from '../Link/anchor.tsx';
import type { ImageData } from '../../types/image.ts';
import type { SitePageContext } from '../../types/content.ts';

export default function HeroIsland({
  context,
  portrait,
}: {
  context: SitePageContext;
  portrait: ImageData;
}) {
  return (
    <PageProvider context={context}>
      <HeroContent
        renderLink={localizedAnchor(context.lang, `/${context.lang}/`)}
        portrait={<ResponsiveImage image={portrait} alt="" eager contain />}
        scrollToContent={() =>
          document.getElementById('latest-articles')?.scrollIntoView({
            block: 'start',
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
              .matches
              ? 'instant'
              : 'smooth',
          })
        }
      />
    </PageProvider>
  );
}
