import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {enqueueSnackbar} from "../../Notifier/notifierSlice";
import {confirmSignIn, getCurrentUser, signIn, signOut} from 'aws-amplify/auth';
import {addCaseReducers} from "../../../redux/utils/addCaseReducers";

const AUTH_STORE_NAME = "AUTH_STORE_NAME";

const loginAsyncThunk = createAsyncThunk(
    "/auth/login",
    async (arg, thunkAPI) => {

        const {currentRequestId, loading} = thunkAPI.getState()[AUTH_STORE_NAME];

        if (!loading || thunkAPI.requestId !== currentRequestId) {
            return;
        }
        
        const {nextStep} = await signIn({username: arg.username, password: arg.password});
        return {username: arg.username, signInStep: nextStep.signInStep};
    }
);

const changePassAsyncThunk = createAsyncThunk(
    "/auth/change-pass",
    async (arg, thunkAPI) => {
        const {currentRequestId, loading} = thunkAPI.getState()[AUTH_STORE_NAME];

        if (!loading || thunkAPI.requestId !== currentRequestId) {
            return;
        }

        const {nextStep} = await confirmSignIn({challengeResponse: arg.password});
        return {username: arg.user.username, signInStep: nextStep.signInStep};
    }
);

// Amplify keeps the session in local storage, so a signed in user stays signed in after a reload
const restoreSessionAsyncThunk = createAsyncThunk(
    "/auth/restore-session",
    async () => {
        try {
            const {username} = await getCurrentUser();
            return {username, signInStep: "DONE"};
        } catch (e) {
            return null;
        }
    }
);

const logoutAsyncThunk = createAsyncThunk(
    "/auth/logout",
    async () => {
        await signOut();
        // start from a clean page so no data from this session stays in the store
        window.location.assign("/");
    }
);

const authLoginSlice = createSlice({
    name: "authLogin",
    initialState: {
        user: null,
        changePassRequired: false,
        loading: false,
        currentRequestId: null,
        error: null,
        sessionRestored: false
    },
    extraReducers: addCaseReducers({
        [logoutAsyncThunk.rejected]: (state, action) => {
            action.asyncDispatch(enqueueSnackbar(
                {
                    message: action.error.message,
                    options: {
                        variant: 'error'
                    }
                }
            ));
        },

        [restoreSessionAsyncThunk.fulfilled]: (state, action) => {
            state.user = action.payload;
            state.sessionRestored = true;
        },

        [loginAsyncThunk.pending]: (state, action) => {
            if (!state.loading) {
                state.loading = true;
                state.currentRequestId = action.meta.requestId;
                state.error = null;
            }
        },
        [loginAsyncThunk.fulfilled]: (state, action) => {
            const {requestId} = action.meta;
            if (state.loading && state.currentRequestId === requestId) {
                state.user = action.payload;
                state.changePassRequired = action.payload.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED";
                state.loading = false;
                state.currentRequestId = null;
                state.error = null;
            }
        },
        [loginAsyncThunk.rejected]: (state, action) => {
            const {requestId} = action.meta;
            if (state.loading && state.currentRequestId === requestId) {
                state.loading = false;
                state.error = action.payload || action.error.message;

                action.asyncDispatch(enqueueSnackbar(
                    {
                        message: state.error,
                        options: {
                            variant: 'error'
                        }
                    }
                ));
            }
        },

        [changePassAsyncThunk.pending]: (state, action) => {
            if (!state.loading) {
                state.loading = true;
                state.currentRequestId = action.meta.requestId;
                state.error = null;
            }
        },
        [changePassAsyncThunk.fulfilled]: (state, action) => {
            const {requestId} = action.meta;
            if (state.loading && state.currentRequestId === requestId) {
                state.user = action.payload;
                state.changePassRequired = false;
                state.loading = false;
                state.currentRequestId = null;
                state.error = null;
            }
        },
        [changePassAsyncThunk.rejected]: (state, action) => {
            const {requestId} = action.meta;
            if (state.loading && state.currentRequestId === requestId) {
                state.loading = false;
                state.error = action.payload || action.error.message;

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
    })
});

const authReducer = authLoginSlice.reducer;
const login = loginAsyncThunk;
const changePass = changePassAsyncThunk
const restoreSession = restoreSessionAsyncThunk;
const logout = logoutAsyncThunk;

export {AUTH_STORE_NAME, authReducer, login, changePass, restoreSession, logout}
