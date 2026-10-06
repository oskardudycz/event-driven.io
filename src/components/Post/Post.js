import React from 'react';
import PropTypes from 'prop-types';
import 'prismjs/themes/prism-okaidia.css';

import asyncComponent from '../AsyncComponent';
import Headline from '../Article/Headline';
import Bodytext from '../Article/Bodytext';
import Meta from './Meta';
import Author from './Author';
import Substack from './Substack';
import NextPrev from './NextPrev';
import Summary from '../Article/Summary';
import Related from './Related';
import { DiscussionEmbed } from 'disqus-react';

const Share = asyncComponent(() =>
  import('./Share')
    .then((module) => {
      return module.default;
    })
    .catch(() => {}),
);

const Post = (props) => {
  const {
    post,
    post: {
      html,
      fields: { prefix, slug },
      frontmatter: { title, summary, author, category, categories, disqusId },
    },
    authornote,
    related,
    next: nextPost,
    prev: prevPost,
  } = props;

  const disqusConfig = {
    shortname: process.env.GATSBY_DISQUS_NAME,
    config: { identifier: disqusId || slug, title },
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

Post.propTypes = {
  post: PropTypes.object.isRequired,
  authornote: PropTypes.string.isRequired,
  related: PropTypes.array,
  facebook: PropTypes.object.isRequired,
  next: PropTypes.object,
  prev: PropTypes.object,
};

export default Post;
