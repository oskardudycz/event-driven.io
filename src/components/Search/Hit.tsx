import React from 'react';
import type { SearchHit } from '../../search/types.ts';
import { Link } from '../Link/index.tsx';
import ResponsiveImage from '../Image/ResponsiveImage.tsx';
import { usePageContext } from '../../i18n/page-context.ts';
import SearchResult from './SearchResult.tsx';

export default function Hit({ hit }: { hit: SearchHit }) {
  const { lang = 'en' } = usePageContext();
  return (
    <SearchResult
      hit={hit}
      lang={lang}
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
      renderLink={({ href, ...props }) => <Link {...props} to={href} />}
    />
  );
}
