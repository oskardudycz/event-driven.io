/* eslint no-unused-vars: 0 */

import React from "react";

import { ThemeContext } from "../../layouts";

const Billing = () => {
    return (
        <React.Fragment>
            <ThemeContext.Consumer>
                {theme => (
                    <div >
                        <p>This is billing.</p>
                    </div>
                )}
            </ThemeContext.Consumer>
        </React.Fragment >
    );
};

export default Billing