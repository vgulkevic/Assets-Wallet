import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import {applyMiddleware, compose, createStore} from "redux";
import {Provider} from "react-redux";
import thunk from "redux-thunk";
import rootReducer from "./redux/rootReducer";
import asyncDispatchMiddleware from "./redux/middleware/asyncDispatchMiddleware";

const composeEnhancers =
    typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
        })
        : compose;

const middleware = [thunk, asyncDispatchMiddleware];

const enhancer = composeEnhancers(
    applyMiddleware(...middleware)
    // other store enhancers if any
);

const store = createStore(rootReducer, enhancer);


ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>,
    document.getElementById('root'));
