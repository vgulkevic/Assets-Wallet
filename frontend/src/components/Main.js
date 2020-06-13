import React from "react";
import Notifier from "./Notifier/Notifier";
import {BrowserRouter, Redirect, Route} from "react-router-dom";
import LogIn from "./Authentication/LogIn";
import Authenticated from "./Authentication/Authenticated";
import {useSelector} from "react-redux";
import {AUTH_STORE_NAME} from "./Authentication/redux/authSlice";

export default function App() {
    const {user, changePassRequired} = useSelector(state => state[AUTH_STORE_NAME]);

    return (
        <>
            <Notifier/>

            <BrowserRouter>
                <Route path="/" render={(props) => !user || changePassRequired ? <LogIn {...props} /> : <Authenticated {...props} />}/>
                <Redirect path="/*" to="/" />
            </BrowserRouter>
        </>
    );
}
