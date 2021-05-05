import PropTypes from "prop-types";
import React from "react";
import { graphql } from "gatsby";
import { ThemeContext } from "../layouts";
import Article from "../components/Article";
import Page from "../components/Page";
import Seo from "../components/Seo";

const ArchitectureWeeklyPage = props => {
  const {
    data: {
      page: { edges: pages },
      site: {
        siteMetadata: { facebook }
      }
    }
  } = props;

  const [page] = pages;
  page.frontmatter = page.frontmatter || { title: "Architecture Weekly" };

  return (
    <React.Fragment>
      <ThemeContext.Consumer>
        {theme => (
          <Article theme={theme}>
            <Page page={page} theme={theme} />
          </Article>
        )}
      </ThemeContext.Consumer>

      <Seo data={page} facebook={facebook} />
    </React.Fragment>
  );
};

ArchitectureWeeklyPage.propTypes = {
  data: PropTypes.object.isRequired
};

export default ArchitectureWeeklyPage;

//eslint-disable-next-line no-undef
export const query = graphql`
  query ArchitectureWeeklyQuery {
    page: allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "//architecture-weekly/README\\.md/" } }
    ) {
      edges {
        node {
          id
          html
          frontmatter {
            title
          }
        }
      }
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

//hero-background
