import React, {lazy, Suspense, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import configureAmplify from "./auth/amplifyConfig";
import {restoreSession, selectAuth} from "./auth/authSlice";
import LoginPage from "./auth/LoginPage";
import FullPageSpinner from "./common/FullPageSpinner";

// loaded only after sign in, which keeps the login page small
const DashboardPage = lazy(() => import("./dashboard/DashboardPage"));

configureAmplify();

export default function App() {
    const dispatch = useDispatch();
    const {user, changePassRequired, sessionRestored} = useSelector(selectAuth);

    useEffect(() => {
        dispatch(restoreSession());
    }, [dispatch]);

    if (!sessionRestored) {
        return <FullPageSpinner/>;
    }

    if (!user || changePassRequired) {
        return <LoginPage/>;
    }

    return (
        <Suspense fallback={<FullPageSpinner/>}>
            <DashboardPage/>
        </Suspense>
    );
}
