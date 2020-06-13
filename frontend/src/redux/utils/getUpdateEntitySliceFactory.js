import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {enqueueSnackbar} from "../../components/Notifier/notifierSlice";
import {getHttpClient} from "../../utils/axiosUtil";
import {LOCAL} from "../../profile";
import {AUTH_STORE_NAME} from "../../components/Authentication/redux/authSlice";

export function createGetUpdateEntitySlice(thunkType, rootReducerStorePropertyName, url, name, showSnackbarOnFailure, debugReturnPromise, createUpdateThunk, reducers, addAuthHeader) {
    const getAsyncThunk = createAsyncThunk(
        thunkType + "/get",
        async (arg, thunkAPI) => {

            const {currentRequestId, loading} = thunkAPI.getState()[rootReducerStorePropertyName];
            const {user} = thunkAPI.getState()[AUTH_STORE_NAME];

            if (!loading || thunkAPI.requestId !== currentRequestId) {
                return;
            }

            if (LOCAL && debugReturnPromise) {
                let promise = debugReturnPromise();
                const res = await promise;
                return res;
            } else {
                const authHeader = (addAuthHeader && user) ?  {
                    "Authorization": user.signInUserSession.idToken.jwtToken
                } : {};

                const res = await getHttpClient().get(url + (arg || ""), {headers: authHeader});

                return res.data;
            }
        }
    );

    const extraGetReducers = {
        [getAsyncThunk.pending]: (state, action) => {
            if (!state.loading) {
                state.loading = true;
                state.currentRequestId = action.meta.requestId;
                state.error = null;
            }
        },
        [getAsyncThunk.fulfilled]: (state, action) => {
            const {requestId} = action.meta;
            if (state.loading && state.currentRequestId === requestId) {
                state.entity = action.payload;
                state.loading = false;
                state.currentRequestId = null;
                state.error = null;
            }
        },
        [getAsyncThunk.rejected]: (state, action) => {
            const {requestId} = action.meta;
            if (state.loading && state.currentRequestId === requestId) {
                state.loading = false;
                state.error = action.payload || action.error.message;

                if (showSnackbarOnFailure) {
                    action.asyncDispatch(enqueueSnackbar(
                        {
                            message: state.error,
                            options: {
                                variant: 'error'
                            }
                        }
                    ));
                }
            }
        }
    }


    let updateAsyncThunk = null;
    let extraUpdateReducers = {};
    if (createUpdateThunk) {
        updateAsyncThunk = createAsyncThunk(
            thunkType + "/update",
            async (arg, thunkAPI) => {
                const {currentUpdateRequestId, entityUpdating} = thunkAPI.getState()[rootReducerStorePropertyName];
                const {user} = thunkAPI.getState()[AUTH_STORE_NAME];

                if (!entityUpdating || thunkAPI.requestId !== currentUpdateRequestId) {
                    return;
                }

                if (LOCAL && debugReturnPromise) {
                    let promise = debugReturnPromise();
                    let res = await promise;
                    res = arg.payload;
                    return res;
                } else {
                    const authHeader = (addAuthHeader && user) ?  {
                        "Authorization": user.signInUserSession.idToken.jwtToken
                    } : {};

                    const res = await getHttpClient().post(url + arg.urlParam || "", arg.payload, {headers: authHeader});
                    return res.data;
                }
            }
        );

        extraUpdateReducers = {
            [updateAsyncThunk.pending]: (state, action) => {
                if (!state.entityUpdating) {
                    state.entityUpdating = true;
                    state.currentUpdateRequestId = action.meta.requestId;
                    state.entityUpdateError = null;
                }
            },
            [updateAsyncThunk.fulfilled]: (state, action) => {
                const {requestId} = action.meta;

                if (state.entityUpdating && state.currentUpdateRequestId === requestId) {
                    state.entityUpdating = false;
                    state.currentUpdateRequestId = null;
                    state.entityUpdateError = null;
                    state.entity = {...action.payload};

                    action.asyncDispatch(enqueueSnackbar(
                        {
                            message: "Success",
                            options: {
                                variant: 'success'
                            }
                        }
                    ));
                }
            },
            [updateAsyncThunk.rejected]: (state, action) => {
                const {requestId} = action.meta;
                if (state.entityUpdating && state.currentUpdateRequestId === requestId) {
                    state.entityUpdating = false;
                    state.entityUpdateError = action.payload || action.error.message;

                    if (showSnackbarOnFailure) {
                        action.asyncDispatch(enqueueSnackbar(
                            {
                                message: state.entityUpdateError,
                                options: {
                                    variant: 'error'
                                }
                            }
                        ));
                    }
                }
            }
        }
    }

    const extraReducers = {...extraGetReducers, ...extraUpdateReducers};
    const slice = createSlice({
        name: name,
        initialState: {
            entity: null,
            loading: false,
            currentRequestId: null,
            error: null,

            entityUpdating: false,
            currentUpdateRequestId: null,
            entityUpdateError: null
        },
        extraReducers: {
            ...extraReducers
        },
        reducers: {
            ...(reducers || {})
        }
    });

    return {
        thunk: getAsyncThunk,
        updateThunk: updateAsyncThunk,
        slice: slice
    };
}
