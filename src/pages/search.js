import React from 'react';
import Article from '../components/Article';
import Search from '../components/Search';
import { ThemeContext } from '../layouts';
import { createHead } from '../components/Seo';
import Headline from '../components/Article/Headline';
import { usePageContext } from '../i18n/page-context';

const SearchPage = () => {
  const { lang = 'en' } = usePageContext();
  return (
    <ThemeContext.Consumer>
      {(theme) => (
        <Article theme={theme}>
          <Headline title={lang === 'pl' ? 'Szukaj' : 'Search'} theme={theme} />
          <Search />
        </Article>
      )}
    </ThemeContext.Consumer>
  );
};
export default SearchPage;
export const Head = createHead(({ pageContext }) => ({
  title: pageContext.lang === 'pl' ? 'Szukaj' : 'Search',
  noIndex: true,
}));
