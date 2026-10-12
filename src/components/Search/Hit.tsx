import React from 'react';
import type { SearchHit } from '../../search/types.ts';
import { Link } from 'gatsby';
import { GatsbyImage } from 'gatsby-plugin-image';
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
          <GatsbyImage
            image={hit.cover}
            alt=""
            loading="lazy"
            objectFit="contain"
            sizes="(max-width: 599px) 88px, 180px"
            style={{ width: '100%', height: '100%' }}
          />
        ) : null
      }
      renderLink={({ href, ...props }) => <Link {...props} to={href} />}
    />
  );
}
