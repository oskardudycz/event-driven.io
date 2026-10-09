import type { ArticleNode } from '../../types/content.ts';
import React from 'react';

import Headline from '../Article/Headline.tsx';
import Bodytext from '../Article/Bodytext.tsx';
import Summary from '../Article/Summary.tsx';

const Page = (props: { page: ArticleNode }) => {
  const {
    page: {
      html,
      frontmatter: { title, summary },
    },
  } = props;

  return (
    <React.Fragment>
      <header>
        <Headline title={title} />
        <Summary>{summary}</Summary>
      </header>
      <Bodytext html={html} />
    </React.Fragment>
  );
};

export default Page;
