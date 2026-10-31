import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {confirmSignIn, getCurrentUser, signIn, signOut} from "aws-amplify/auth";
import {LOCAL} from "../profile";

const NEW_PASSWORD_REQUIRED = "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED";

// Amplify keeps the session in local storage, so a signed in user stays signed in after a reload
export const restoreSession = createAsyncThunk("auth/restoreSession", async () => {
    if (LOCAL) {
        return null;
    }
    try {
        const {username} = await getCurrentUser();
        return {username};
    } catch {
        return null;
    }
});

export const login = createAsyncThunk("auth/login", async ({username, password}) => {
    if (LOCAL) {
        return {username, signInStep: "DONE"};
    }
    const {nextStep} = await signIn({username, password});
    return {username, signInStep: nextStep.signInStep};
});

// first sign in of a user created with a temporary password
export const setNewPassword = createAsyncThunk("auth/setNewPassword", async (password) => {
    const {nextStep} = await confirmSignIn({challengeResponse: password});
    return {signInStep: nextStep.signInStep};
});

export const logout = createAsyncThunk("auth/logout", async () => {
    if (!LOCAL) {
        await signOut();
    }
    // start from a clean page so no data from this session stays in memory
    window.location.assign("/");
});

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        changePassRequired: false,
        sessionRestored: false
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(restoreSession.fulfilled, (state, action) => {
                state.user = action.payload;
                state.sessionRestored = true;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.user = {username: action.payload.username};
                state.changePassRequired = action.payload.signInStep === NEW_PASSWORD_REQUIRED;
            })
            .addCase(setNewPassword.fulfilled, (state) => {
                state.changePassRequired = false;
            });
    }
});

export const selectAuth = (state) => state.auth;
export const authReducer = authSlice.reducer;
