import { graphql } from 'gatsby';

export const translationResources = graphql`
  fragment TranslationResources on LocaleConnection {
    edges {
      node {
        language
        ns
        data
      }
    }
  }
`;
