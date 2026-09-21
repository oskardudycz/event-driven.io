import React from "react";
import { ThemeContext } from "../layouts";
import Article from "../components/Article";
import Account from "../components/Account";
import Headline from "../components/Article/Headline";
import Helmet from "react-helmet";

const AccountPage = () => {
    return (
        <React.Fragment>
            <Helmet>
                <title>Account - Event-Driven.io</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <ThemeContext.Consumer>
                {theme => (
                    <Article theme={theme}>
                        <header>
                            <Headline title="Account" theme={theme} />
                        </header>
                        <Account theme={theme} />
                    </Article>
                )}
            </ThemeContext.Consumer>
        </React.Fragment>
    );
};

export default AccountPage;



