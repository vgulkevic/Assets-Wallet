import React from "react";
import Notifier from "./Notifier/Notifier";
import {BrowserRouter} from "react-router";
import LogIn from "./Authentication/LogIn";
import Authenticated from "./Authentication/Authenticated";
import {useSelector} from "react-redux";
import {AUTH_STORE_NAME} from "./Authentication/redux/authSlice";

export default function App() {
    const {user, changePassRequired, sessionRestored} = useSelector(state => state[AUTH_STORE_NAME]);

    if (!sessionRestored) {
        return null;
    }

    return (
        <>
            <Notifier/>

            <BrowserRouter>
                {!user || changePassRequired ? <LogIn/> : <Authenticated/>}
            </BrowserRouter>
        </>
    );
}
