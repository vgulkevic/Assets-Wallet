import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';

import {configureStore} from "@reduxjs/toolkit";
import {Provider} from "react-redux";
import rootReducer from "./redux/rootReducer";
import asyncDispatchMiddleware from "./redux/middleware/asyncDispatchMiddleware";

const store = configureStore({
    reducer: rootReducer,
    // asyncDispatchMiddleware attaches a function to every action, so the serializability check would flag all of them
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}).concat(asyncDispatchMiddleware)
});

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <App/>
    </Provider>
);
