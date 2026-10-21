import type { ArticleEdge, PageData, SitePageProps } from '../types/content.ts';
import React from 'react';

import Article from '../components/Article/index.ts';
import Headline from '../components/Article/Headline.tsx';
import Bodytext from '../components/Article/Bodytext.tsx';
import List from '../components/List/index.ts';
import { createHead } from '../components/Seo/index.ts';

const GuideTemplate = (props: SitePageProps<'guide' | 'articles'>) => {
  const {
    data: { guide, articles },
    pageContext: { articleIds = [] },
  } = props;
  const { title, icon } = guide.frontmatter;
  const orderedArticles = articleIds
    .map((id) => articles.edges.find(({ node }) => node.id === id))
    .filter((edge): edge is ArticleEdge => Boolean(edge));

  return (
    <React.Fragment>
      <Article>
        <header className="mb-section">
          <Headline>
            <span aria-hidden="true">{icon}</span> {title}
          </Headline>
        </header>
        {guide.html && <Bodytext html={guide.html} />}
        <List edges={orderedArticles} ordered showImages />
      </Article>
    </React.Fragment>
  );
};

export default GuideTemplate;

export const Head = createHead<Pick<PageData, 'guide' | 'site'>>(
  ({ data }) => ({
    data: data.guide,
    schemaType: 'CollectionPage',
  }),
);
