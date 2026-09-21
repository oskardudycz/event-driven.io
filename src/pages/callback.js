import React from "react"
import Helmet from "react-helmet"
import { handleAuthentication } from "../utils/auth"

const Callback = () => {
    handleAuthentication()

    return (
        <React.Fragment>
            <Helmet>
                <title>Signing in - Event-Driven.io</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <p>Loading...</p>
        </React.Fragment>
    )
}

export default Callback
