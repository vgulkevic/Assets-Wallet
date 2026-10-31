import {configureStore, isRejectedWithValue} from "@reduxjs/toolkit";
import {enqueueSnackbar} from "notistack";
import {assetManagerApi} from "./api/assetManagerApi";
import {authReducer} from "./auth/authSlice";

// show every failed API call as an error snackbar
const apiErrorNotifier = () => (next) => (action) => {
    if (isRejectedWithValue(action)) {
        const {status, data} = action.payload || {};
        const message = typeof data === "string" ? data : `Request failed (${status})`;
        enqueueSnackbar(message, {variant: "error"});
    }
    return next(action);
};

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [assetManagerApi.reducerPath]: assetManagerApi.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(assetManagerApi.middleware, apiErrorNotifier)
});
