import type { ArticleNode, ArticleEdge } from '../../types/content.ts';
import React from 'react';
import 'prismjs/themes/prism-okaidia.css';

import asyncComponent from '../AsyncComponent/index.ts';
import Headline from '../Article/Headline.tsx';
import Bodytext from '../Article/Bodytext.tsx';
import Meta from './Meta.tsx';
import Author from './Author.tsx';
import Substack from './Substack.tsx';
import NextPrev from './NextPrev.tsx';
import Summary from '../Article/Summary.tsx';
import Related from './Related.tsx';
import { DiscussionEmbed } from 'disqus-react';

const Share = asyncComponent(() =>
  import('./Share.tsx')
    .then((module) => {
      return module.default;
    })
    .catch(() => {}),
);

const Post = (props: {
  post: ArticleNode;
  authornote: string;
  related?: ArticleEdge[];
  next?: ArticleNode;
  prev?: ArticleNode;
}) => {
  const {
    post,
    post: {
      html,
      fields: { prefix, slug, originalSlug },
      frontmatter: { title, summary, author, category, categories, disqusId },
    },
    authornote,
    related,
    next: nextPost,
    prev: prevPost,
  } = props;

  const disqusConfig = {
    shortname: process.env.GATSBY_DISQUS_NAME || '',
    config: { identifier: disqusId || originalSlug || slug, title },
  };

  return (
    <React.Fragment>
      <header>
        <Headline title={title} />
        <Summary>{summary}</Summary>
        <Meta prefix={prefix} author={author} category={category} categories={categories} />
      </header>
      <Bodytext html={html} />
      <footer>
        <Substack />
        <Related posts={related} />
        <Share post={post} />
        <Author note={authornote} />
        <NextPrev next={nextPost} prev={prevPost} />
        <DiscussionEmbed {...disqusConfig} />
      </footer>
    </React.Fragment>
  );
};

export default Post;
