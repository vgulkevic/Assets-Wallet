import React from "react";
import {Route, Switch} from "react-router-dom";

import {Container, CssBaseline} from "@material-ui/core";

import useStyles from "./LogInStyles";
import LogInForm from "./LogInForm";
import SetPassForm from "./SetPassForm";


export default function LogIn() {
    const classes = useStyles();

    return (
        <>
            <CssBaseline/>
            <main className={classes.content}>
                <Container className={classes.container}>
                    <Switch>
                        <Route exact path="/" render={(props) => <LogInForm {...props} />}/>
                        <Route exact path="/set-pass" render={(props) => <SetPassForm {...props} />}/>
                    </Switch>
                </Container>
            </main>
        </>
    );
}