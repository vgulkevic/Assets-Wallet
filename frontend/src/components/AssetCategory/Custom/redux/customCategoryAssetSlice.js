import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {getHttpClient} from "../../../../utils/axiosUtil";
import {enqueueSnackbar} from "../../../Notifier/notifierSlice";
import {updateCategoryAsset as updateAsset, deleteCategoryAsset as deleteAsset, addCategoryAsset} from "../../redux/categoriesSlice"
import {BASE_API_URL, LOCAL} from "../../../../profile";
import {randomIntFromInterval} from "../../../../utils/randomNumber";
import {AUTH_STORE_NAME} from "../../../Authentication/redux/authSlice";

const CUSTOM_CATEGORY_ASSET_STORE_NAME = "CUSTOM_CATEGORY_ASSET_STORE_NAME";

const createCategoryAssetAsyncThunk = createAsyncThunk(
    "/category/asset/create",
    async (arg, thunkAPI) => {

        const {currentCreateRequestId, creating} = thunkAPI.getState()[CUSTOM_CATEGORY_ASSET_STORE_NAME];
        const {user} = thunkAPI.getState()[AUTH_STORE_NAME];

        if (!creating || thunkAPI.requestId !== currentCreateRequestId) {
            return;
        }

        if (LOCAL) {
            const debugResponse = new Promise((resolve, reject) => {
                const categoryAsset = arg.payload.asset;
                const categoryId = arg.payload.categoryId;
                categoryAsset.id = randomIntFromInterval(4000, 40000);

                setTimeout(() => resolve({categoryId: categoryId, asset: categoryAsset}), randomIntFromInterval(150, 300))
            });
            const res = await debugResponse;
            return res;
        } else {
            const authHeader = user ?  {
                "Authorization": user.signInUserSession.idToken.jwtToken
            } : {};

            const res = await getHttpClient().post(BASE_API_URL + "/asset-manager/create-asset", arg.payload, {headers: authHeader});
            return res.data;
        }
    }
);

const updateCategoryAssetAsyncThunk = createAsyncThunk(
    "/category/asset/update",
    async (arg, thunkAPI) => {

        const {currentUpdateRequestId, updating} = thunkAPI.getState()[CUSTOM_CATEGORY_ASSET_STORE_NAME];
        const {user} = thunkAPI.getState()[AUTH_STORE_NAME];

        if (!updating || thunkAPI.requestId !== currentUpdateRequestId) {
            return;
        }

        if (LOCAL) {
            const debugResponse = new Promise((resolve, reject) => {
                setTimeout(() => resolve(arg.payload), randomIntFromInterval(150, 300))
            });
            const res = await debugResponse;
            return res;
        } else {
            const authHeader = user ?  {
                "Authorization": user.signInUserSession.idToken.jwtToken
            } : {};

            const res = await getHttpClient().post(BASE_API_URL + "/asset-manager/update-asset", arg.payload, {headers: authHeader});
            return res.data;
        }
    }
);

const deleteCategoryAssetAsyncThunk = createAsyncThunk(
    "/category/asset/delete",
    async (arg, thunkAPI) => {

        const {currentDeleteRequestId, deleting} = thunkAPI.getState()[CUSTOM_CATEGORY_ASSET_STORE_NAME];
        const {user} = thunkAPI.getState()[AUTH_STORE_NAME];

        if (!deleting || thunkAPI.requestId !== currentDeleteRequestId) {
            return;
        }

        if (LOCAL) {
            const debugResponse = new Promise((resolve, reject) => {
                setTimeout(() => resolve(arg), randomIntFromInterval(150, 300))
            });
            const res = await debugResponse;
            return res;
        } else {
            const authHeader = user ?  {
                "Authorization": user.signInUserSession.idToken.jwtToken
            } : {};

            const res = await getHttpClient().delete(BASE_API_URL + "/asset-manager/delete-asset", { data: arg, headers: authHeader });
            return res.data;
        }
    }
);


const customCategoryAssetSlice = createSlice({
    name: "customerCategoryAsset",
    initialState: {
        creating: false,
        currentCreateRequestId: null,
        creationError: null,

        updating: false,
        currentUpdateRequestId: null,
        updateError: null,

        deleting: false,
        currentDeleteRequestId: null,
        deleteError: null
    },
    extraReducers: {
        // CREATE
        [createCategoryAssetAsyncThunk.pending]: (state, action) => {
            if (!state.creating) {
                state.creating = true;
                state.currentCreateRequestId = action.meta.requestId;
                state.creationError = null;
            }
        },
        [createCategoryAssetAsyncThunk.fulfilled]: (state, action) => {
            const {requestId} = action.meta;

            if (state.creating && state.currentCreateRequestId === requestId) {
                state.creating = false;
                state.currentCreateRequestId = null;
                state.creationError = null;

                action.asyncDispatch(addCategoryAsset(action.payload));
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
        [createCategoryAssetAsyncThunk.rejected]: (state, action) => {
            const {requestId} = action.meta;
            if (state.creating && state.currentCreateRequestId === requestId) {
                state.creating = false;
                state.creationError = action.payload || action.error.message;

                action.asyncDispatch(enqueueSnackbar(
                    {
                        message: state.creationError,
                        options: {
                            variant: 'error'
                        }
                    }
                ));
            }
        },

        // UPDATE
        [updateCategoryAssetAsyncThunk.pending]: (state, action) => {
            if (!state.updating) {
                state.updating = true;
                state.currentUpdateRequestId = action.meta.requestId;
                state.updateError = null;
            }
        },
        [updateCategoryAssetAsyncThunk.fulfilled]: (state, action) => {
            const {requestId} = action.meta;

            if (state.updating && state.currentUpdateRequestId === requestId) {
                state.updating = false;
                state.currentUpdateRequestId = null;
                state.updateError = null;

                action.asyncDispatch(updateAsset(action.payload));
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
        [updateCategoryAssetAsyncThunk.rejected]: (state, action) => {
            const {requestId} = action.meta;
            if (state.updating && state.currentUpdateRequestId === requestId) {
                state.updating = false;
                state.updateError = action.payload || action.error.message;

                action.asyncDispatch(enqueueSnackbar(
                    {
                        message: state.updateError,
                        options: {
                            variant: 'error'
                        }
                    }
                ));
            }
        },

        // DELETE
        [deleteCategoryAssetAsyncThunk.pending]: (state, action) => {
            if (!state.deleting) {
                state.deleting = true;
                state.currentDeleteRequestId = action.meta.requestId;
                state.deleteError = null;
            }
        },
        [deleteCategoryAssetAsyncThunk.fulfilled]: (state, action) => {
            const {requestId} = action.meta;

            if (state.deleting && state.currentDeleteRequestId === requestId) {
                state.deleting = false;
                state.currentDeleteRequestId = null;
                state.deleteError = null;

                action.asyncDispatch(deleteAsset(action.payload));
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
        [deleteCategoryAssetAsyncThunk.rejected]: (state, action) => {
            const {requestId} = action.meta;
            if (state.deleting && state.currentDeleteRequestId === requestId) {
                state.deleting = false;
                state.deleteError = action.payload || action.error.message;

                action.asyncDispatch(enqueueSnackbar(
                    {
                        message: state.deleteError,
                        options: {
                            variant: 'error'
                        }
                    }
                ));
            }
        }
    }
});

const customCategoryAssetReducer = customCategoryAssetSlice.reducer;
const createCategoryAsset = createCategoryAssetAsyncThunk;
const updateCategoryAsset = updateCategoryAssetAsyncThunk;
const deleteCategoryAsset = deleteCategoryAssetAsyncThunk;

export {CUSTOM_CATEGORY_ASSET_STORE_NAME, customCategoryAssetReducer, createCategoryAsset, updateCategoryAsset, deleteCategoryAsset};