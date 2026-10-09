import type { PageData } from '../types/content.ts';
import type { ArticleEdge } from '../types/content.ts';
import type { SitePageProps } from '../types/content.ts';
import React from 'react';
import { graphql } from 'gatsby';
import 'prismjs/themes/prism-okaidia.css';

import Article from '../components/Article/index.ts';
import Post from '../components/Post/index.ts';
import { createHead } from '../components/Seo/index.ts';

const PostTemplate = (props: SitePageProps<'post' | 'relatedPosts' | 'authornote' | 'site'>) => {
  const {
    data: {
      post,
      relatedPosts,
      authornote: { html: authorNote },
    },
    pageContext: { next, prev, relatedIds = [] },
  } = props;

  return (
    <React.Fragment>
      <Article>
        <Post
          post={post}
          next={next}
          prev={prev}
          authornote={authorNote}
          related={relatedIds
            .map((id) => relatedPosts.edges.find(({ node }) => node.id === id))
            .filter((edge): edge is ArticleEdge => Boolean(edge))}
        />
      </Article>
    </React.Fragment>
  );
};

export default PostTemplate;

export const postQuery = graphql`
  query PostBySlug($slug: String!, $langKey: String!, $relatedIds: [String!]!, $language: String!) {
    locales: allLocale(filter: { language: { in: [$language, "en"] } }) {
      ...TranslationResources
    }
    relatedPosts: allMarkdownRemark(filter: { id: { in: $relatedIds } }) {
      edges {
        node {
          id
          excerpt(pruneLength: 170)
          fields {
            slug
            prefix
            langKey
          }
          frontmatter {
            title
            cover {
              childImageSharp {
                resize(width: 420, height: 240, quality: 78, cropFocus: CENTER, toFormat: WEBP) {
                  src
                }
              }
            }
          }
        }
      }
    }
    post: markdownRemark(fields: { slug: { eq: $slug }, langKey: { eq: $langKey } }) {
      id
      html
      excerpt(pruneLength: 170)
      fields {
        slug
        originalSlug
        prefix
        langKey
        source
      }
      frontmatter {
        title
        description
        summary
        author
        category
        categories
        publishedAt
        disqusId
        useDefaultLangCanonical
        cover {
          childImageSharp {
            resize(width: 600) {
              src
            }
          }
        }
      }
    }
    authornote: markdownRemark(
      frontmatter: { title: { eq: "author" } }
      fields: { source: { eq: "parts" }, langKey: { eq: $langKey } }
    ) {
      id
      html
    }
    site {
      siteMetadata {
        facebook {
          appId
        }
      }
    }
  }
`;

export const Head = createHead<Pick<PageData, 'post' | 'site'>>(({ data }) => ({
  data: data.post,
  useDefaultLangCanonical: data.post.frontmatter.useDefaultLangCanonical,
  schemaType: 'BlogPosting',
}));
