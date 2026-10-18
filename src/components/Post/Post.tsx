import type {
  ArticleNode,
  ArticleEdge,
  GuideStep,
  TagLink,
} from '../../types/content.ts';
import React from 'react';
import { Link } from '../Link/index.tsx';
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
import GuideSteps from './GuideSteps.tsx';
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
  related?: ArticleEdge[] | undefined;
  guides?: GuideStep[] | undefined;
  tagLinks?: TagLink[] | undefined;
  next?: ArticleNode | undefined;
  prev?: ArticleNode | undefined;
}) => {
  const {
    post,
    post: {
      html,
      fields: { prefix, slug, originalSlug },
      frontmatter: { title, summary, author, disqusId },
    },
    authornote,
    related,
    guides,
    tagLinks,
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
        <Meta
          prefix={prefix}
          author={author}
          tags={tagLinks}
          guides={guides}
          renderLink={({ href, ...props }) => <Link {...props} to={href} />}
        />
      </header>
      {/* Imported article diagrams need a light canvas for their dark lettering. */}
      <Bodytext
        html={html}
        className="[&_img.gatsby-resp-image-image]:bg-[var(--color-image-canvas)]"
      />
      <footer>
        <Substack />
        <GuideSteps guides={guides} />
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
