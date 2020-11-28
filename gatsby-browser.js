/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

// You can delete this file if you're not using it

import React from "react";
import i18next from 'i18next';
import { silentAuth } from "./src/utils/auth";
import { DEFAULT_OPTIONS } from './src/i18n/constants';
import merge from 'lodash.merge';
import { I18nextProvider } from 'react-i18next';


import { wrapRootElement as wrapRootElementFromSSR } from './gatsby-ssr';

export { wrapPageElement } from './gatsby-ssr';


class SessionCheck extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
        }
    }

    handleCheckSession = () => {
        this.setState({ loading: false })
    }

    componentDidMount() {
        silentAuth(this.handleCheckSession)
    }

    render() {
        return (
            this.state.loading === false && (
                <React.Fragment>{this.props.children}</React.Fragment>
            )
        )
    }
}

export const wrapRootElement = ({ element }, pluginOptions) => {
    return wrapRootElementFromSSR({ element: <SessionCheck>{element}</SessionCheck> }, pluginOptions);
}