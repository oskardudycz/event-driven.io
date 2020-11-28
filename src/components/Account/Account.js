/* eslint no-unused-vars: 0 */

import React from "react"
import { Router } from "@reach/router"
import { login, logout, isAuthenticated, getProfile } from "../../utils/auth"
import { Link } from "../Link"

import { ThemeContext } from "../../layouts";


const Home = ({ user }) => {
    return <p>Hi, {user.name ? user.name : "friend"}!</p>
}
const Billing = () => <p>Billing</p>

const Account = () => {
    if (!isAuthenticated()) {
        login()
        return <p>Redirecting to login...</p>
    }

    const user = getProfile()

    return (
        <React.Fragment>
            <ThemeContext.Consumer>
                {theme => (
                    <>
                        <nav>
                            <Link to="/account/">Home</Link>{" "}
                            <Link to="/account/billing/">Billing</Link>{" "}
                            <a
                                href="#logout"
                                onClick={e => {
                                    logout()
                                    e.preventDefault()
                                }}
                            >
                                Log Out
                        </a>
                        </nav>
                        <Router>
                            <Home path="/account/" user={user} />
                            <Billing path="/account/billing" />
                        </Router>
                    </>

                )}
            </ThemeContext.Consumer>
        </React.Fragment >
    );
};

export default Account