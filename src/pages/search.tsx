import { graphql } from 'gatsby';
import React from 'react';
import Article from '../components/Article/index.ts';
import Headline from '../components/Article/Headline.tsx';
import Search from '../components/Search/index.ts';

import { createHead } from '../components/Seo/index.ts';
import { usePageContext } from '../i18n/page-context.ts';

const SearchPage = () => {
  const { lang = 'en' } = usePageContext();
  return (
    <Article>
      <Headline title={lang === 'pl' ? 'Szukaj' : 'Search'} />
      <Search />
    </Article>
  );
};
export default SearchPage;
export const Head = createHead(({ pageContext }) => ({
  title: pageContext.lang === 'pl' ? 'Szukaj' : 'Search',
  noIndex: true,
}));

export const query = graphql`
  query ($language: String!) {
    locales: allLocale(filter: { language: { in: [$language, "en"] } }) {
      ...TranslationResources
    }
  }
`;
