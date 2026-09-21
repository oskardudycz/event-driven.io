import React from "react";
import { ThemeContext } from "../../layouts";
import Article from "../../components/Article";
import Billing from "../../components/Billing";
import Headline from "../../components/Article/Headline";
import Helmet from "react-helmet";

const BillingPage = () => {
    return (
        <React.Fragment>
            <Helmet>
                <title>Billing - Event-Driven.io</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <ThemeContext.Consumer>
                {theme => (
                    <Article theme={theme}>
                        <header>
                            <Headline title="Billing" theme={theme} />
                        </header>
                        <Billing theme={theme} />
                    </Article>
                )}
            </ThemeContext.Consumer>
        </React.Fragment>
    );
};

export default BillingPage;



