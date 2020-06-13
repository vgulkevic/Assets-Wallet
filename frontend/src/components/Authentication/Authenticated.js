import React from 'react';
import {Route, Switch} from "react-router-dom";

import Assets from "../Assets";

export default function Authenticated() {

    return (
        <>
            <Switch>
                <Route path="/" component={Assets}/>
            </Switch>
        </>
    );
}
