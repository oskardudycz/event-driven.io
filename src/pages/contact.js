import PropTypes from "prop-types";
import React from "react";
import { graphql } from "gatsby";
import { ThemeContext } from "../layouts";
import Article from "../components/Article";
import Contact from "../components/Contact";
import Headline from "../components/Article/Headline";
import Seo from "../components/Seo";
import { useTranslation } from "react-i18next";

const ContactPage = (props) => {
  const { t } = useTranslation();
  const {
    data: {
      site: {
        siteMetadata: { facebook },
      },
    },
  } = props;

  return (
    <React.Fragment>
      <ThemeContext.Consumer>
        {(theme) => (
          <Article theme={theme}>
            <header>
              <Headline title={t("contact.title")} theme={theme} />
            </header>
            <Contact theme={theme} />
          </Article>
        )}
      </ThemeContext.Consumer>

      <Seo
        facebook={facebook}
        title={t("contact.seoTitle")}
        description={t("contact.description")}
        schemaType="ContactPage"
      />
    </React.Fragment>
  );
};

ContactPage.propTypes = {
  data: PropTypes.object.isRequired,
};

export default ContactPage;

//eslint-disable-next-line no-undef
export const query = graphql`
  query ContactQuery {
    site {
      siteMetadata {
        facebook {
          appId
        }
      }
    }
  }
`;
