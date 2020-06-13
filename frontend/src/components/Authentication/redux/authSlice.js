import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {enqueueSnackbar} from "../../Notifier/notifierSlice";
import {Auth} from 'aws-amplify';

const AUTH_STORE_NAME = "AUTH_STORE_NAME";

const loginAsyncThunk = createAsyncThunk(
    "/auth/login",
    async (arg, thunkAPI) => {

        const {currentRequestId, loading} = thunkAPI.getState()[AUTH_STORE_NAME];

        if (!loading || thunkAPI.requestId !== currentRequestId) {
            return;
        }
        
        const user = await Auth.signIn(arg.username, arg.password);
        console.log(user);
        return user;
    }
);

const changePassAsyncThunk = createAsyncThunk(
    "/auth/change-pass",
    async (arg, thunkAPI) => {
        const {currentRequestId, loading} = thunkAPI.getState()[AUTH_STORE_NAME];

        if (!loading || thunkAPI.requestId !== currentRequestId) {
            return;
        }

        const user = await Auth.completeNewPassword(arg.user, arg.password);
        return user;
    }
);

const authLoginSlice = createSlice({
    name: "authLogin",
    initialState: {
        user: null,
        changePassRequired: false,
        loading: false,
        currentRequestId: null,
        error: null
    },
    extraReducers: {
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

                if (state.user.challengeName === "NEW_PASSWORD_REQUIRED") {
                    state.changePassRequired = true;
                }
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
    }
});

const authReducer = authLoginSlice.reducer;
const login = loginAsyncThunk;
const changePass = changePassAsyncThunk

export {AUTH_STORE_NAME, authReducer, login, changePass}
