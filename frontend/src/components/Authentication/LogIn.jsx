import React from "react";
import {Navigate, Route, Routes} from "react-router";

import {Container, CssBaseline} from "@mui/material";

import useStyles from "./LogInStyles";
import LogInForm from "./LogInForm";
import SetPassForm from "./SetPassForm";


export default function LogIn() {
    const {classes} = useStyles();

    return (
        <>
            <CssBaseline/>
            <main className={classes.content}>
                <Container className={classes.container}>
                    <Routes>
                        <Route path="/" element={<LogInForm/>}/>
                        <Route path="/set-pass" element={<SetPassForm/>}/>
                        <Route path="*" element={<Navigate to="/" replace/>}/>
                    </Routes>
                </Container>
            </main>
        </>
    );
}