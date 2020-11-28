import React from "react";
import { ThemeContext } from "../layouts";
import Article from "../components/Article";
import Account from "../components/Account";
import Headline from "../components/Article/Headline";

const AccountPage = () => {
    return (
        <React.Fragment>
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



