import {randomIntFromInterval} from "../../../utils/randomNumber";
import {data} from "../../../data";
import {BASE_API_URL, LOCAL} from "../../../profile"
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {AUTH_STORE_NAME} from "../../Authentication/redux/authSlice";
import {getHttpClient} from "../../../utils/axiosUtil";
import {enqueueSnackbar} from "../../Notifier/notifierSlice";

const CATEGORIES_STORE_NAME = "CATEGORIES_STORE_NAME";

const fetchCategoriesAsyncThunk = createAsyncThunk(
    "/category/get",
    async (arg, thunkAPI) => {

        const {currentFetchRequestId, fetching} = thunkAPI.getState()[CATEGORIES_STORE_NAME];
        const {user} = thunkAPI.getState()[AUTH_STORE_NAME];

        if (!fetching || thunkAPI.requestId !== currentFetchRequestId) {
            return;
        }

        if (LOCAL) {
            let promise = new Promise((resolve, reject) => {
                setTimeout(() => resolve(data.categories), randomIntFromInterval(150, 300));
            });
            const res = await promise;
            return res;
        } else {
            const authHeader = user ?  {"Authorization": user.signInUserSession.idToken.jwtToken} : {};

            const res = await getHttpClient().get(BASE_API_URL + "/asset-manager/categories" + (arg || ""), {headers: authHeader});

            return res.data;
        }
    }
);

const createCategoryAsyncThunk = createAsyncThunk(
    "/category/create",
    async (arg, thunkAPI) => {

        const {currentCreateRequestId, creating} = thunkAPI.getState()[CATEGORIES_STORE_NAME];
        const {user} = thunkAPI.getState()[AUTH_STORE_NAME];

        if (!creating || thunkAPI.requestId !== currentCreateRequestId) {
            return;
        }

        if (LOCAL) {
            const category = arg.payload;

            const debugResponse = new Promise((resolve, reject) => {
                setTimeout(() => resolve({
                    id: randomIntFromInterval(4000, 40000),
                    name: category.name,
                    categoryType: category.categoryType,
                    assets: []
                }), randomIntFromInterval(150, 300))
            });
            const res = await debugResponse;
            return res;
        } else {
            const authHeader = {
                "Authorization": user.signInUserSession.idToken.jwtToken
            };
            console.log(arg.payload);
            const res = await getHttpClient().post(BASE_API_URL + "/asset-manager/create-category", arg.payload, {headers: authHeader});
            return res.data;
        }
    }
);

const updateCategoryAsyncThunk = createAsyncThunk(
    "/category/update",
    async (arg, thunkAPI) => {
        const {currentUpdateRequestId, updating} = thunkAPI.getState()[CATEGORIES_STORE_NAME];
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
            const authHeader = {
                "Authorization": user.signInUserSession.idToken.jwtToken
            };
            console.log(arg.payload);
            const res = await getHttpClient().post(BASE_API_URL + "/asset-manager/update-category", arg.payload, {headers: authHeader});
            return res.data;
        }
    }
);

const deleteCategoryAsyncThunk = createAsyncThunk(
    "/category/delete",
    async (arg, thunkAPI) => {

        const {currentDeleteRequestId, deleting} = thunkAPI.getState()[CATEGORIES_STORE_NAME];
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
            const authHeader = {
                "Authorization": user.signInUserSession.idToken.jwtToken
            };

            const res = await getHttpClient().delete(BASE_API_URL + "/asset-manager/delete-category", { data: arg, headers: authHeader });
            return res.data;
        }
    }
);

const fetchCategoryAssetsAsyncThunk = createAsyncThunk(
    "/category/assets/get",
    async (arg, thunkAPI) => {

        const categoryId = arg;

        const {categoryAssetsFetchRequestIds, categoryAssetsFetching} = thunkAPI.getState()[CATEGORIES_STORE_NAME];
        const {user} = thunkAPI.getState()[AUTH_STORE_NAME];

        if (!categoryAssetsFetching[categoryId] || thunkAPI.requestId !== categoryAssetsFetchRequestIds[categoryId]) {
            return;
        }

        const authHeader = user ? {"Authorization": user.signInUserSession.idToken.jwtToken} : {};

        const res = await getHttpClient().get(BASE_API_URL + "/asset-manager/fetch-assets?categoryId=" + arg, {headers: authHeader});

        return res.data;

    }
);

const categorySlice = createSlice({
    name: "category",
    initialState: {
        entity: null,
        fetching: false,
        currentFetchRequestId: null,
        fetchError: null,

        creating: false,
        currentCreateRequestId: null,
        creationError: null,

        updating: false,
        currentUpdateRequestId: null,
        updateError: null,

        deleting: false,
        currentDeleteRequestId: null,
        deleteError: null,

        categoryAssetsFetching: {},
        categoryAssetsFetchRequestIds: {},
        categoryAssetsFetchErrors: {}
    },
    reducers: {
        // asset
        addCategoryAsset: (state, action) => {
            const {categoryId, asset} = action.payload;
            const category = state.entity.find((el) => {
                return el.id === categoryId;
            });

            if (category) {
                category.assets = [...category.assets, asset];
            }
        },
        updateCategoryAsset: (state, action) => {
            const {categoryId, asset} = action.payload;

            const category = state.entity.find((el) => {
                return el.id === categoryId;
            });

            if (category) {
                category.assets = category.assets.map((el) => {
                    return (el.id === asset.id) ? {...asset} : el;
                });
            }
        },
        deleteCategoryAsset: (state, action) => {
            const {categoryId, deletedAssetId} = action.payload;
            const category = state.entity.find((el) => {
                return el.id === categoryId;
            });

            if (category) {
                category.assets = category.assets.filter((el) => {
                    return el.id !== deletedAssetId;
                });
            }
        }
    },
    extraReducers: {
        // FETCH
        [fetchCategoriesAsyncThunk.pending]: (state, action) => {
            if (!state.fetching) {
                state.fetching = true;
                state.currentFetchRequestId = action.meta.requestId;
                state.fetchError = null;
            }
        },
        [fetchCategoriesAsyncThunk.fulfilled]: (state, action) => {
            const {requestId} = action.meta;
            if (state.fetching && state.currentFetchRequestId === requestId) {
                state.entity = action.payload;
                state.fetching = false;
                state.currentFetchRequestId = null;
                state.fetchError = null;
            }
        },
        [fetchCategoriesAsyncThunk.rejected]: (state, action) => {
            const {requestId} = action.meta;
            if (state.fetching && state.currentFetchRequestId === requestId) {
                state.fetching = false;
                state.fetchError = action.payload || action.error.message;

                action.asyncDispatch(enqueueSnackbar(
                    {
                        message: state.fetchError,
                        options: {
                            variant: 'error'
                        }
                    }
                ));
            }
        },

        // FETCH CATEGORY ASSETS
        [fetchCategoryAssetsAsyncThunk.pending]: (state, action) => {
            const categoryId = action.meta.arg;
            if (!state.categoryAssetsFetching[categoryId]) {
                state.categoryAssetsFetching[categoryId] = true;
                state.categoryAssetsFetchRequestIds[categoryId] = action.meta.requestId;
                state.categoryAssetsFetchErrors[categoryId] = null;
            }
        },
        [fetchCategoryAssetsAsyncThunk.fulfilled]: (state, action) => {
            const categoryId = action.meta.arg;

            const {requestId} = action.meta;
            if (state.categoryAssetsFetching[categoryId] && state.categoryAssetsFetchRequestIds[categoryId] === requestId) {

                const updatedCategory = action.payload;
                state.entity = state.entity.map((cat) => {
                    if (cat.id !== updatedCategory.id) {
                        return cat;
                    }

                    return {
                        ...cat,
                        assets: updatedCategory.assets
                    };
                });

                state.categoryAssetsFetching[categoryId] = false;
                state.categoryAssetsFetchRequestIds[categoryId] = null;
                state.categoryAssetsFetchErrors[categoryId] = null;
            }
        },
        [fetchCategoryAssetsAsyncThunk.rejected]: (state, action) => {
            const categoryId = action.meta.arg;

            const {requestId} = action.meta;
            if (state.categoryAssetsFetching[categoryId] && state.categoryAssetsFetchRequestIds[categoryId] === requestId) {
                state.categoryAssetsFetching[categoryId] = false;
                state.categoryAssetsFetchErrors[categoryId] = action.payload || action.error.message;

                action.asyncDispatch(enqueueSnackbar(
                    {
                        message: state.categoryAssetsFetchErrors[categoryId],
                        options: {
                            variant: 'error'
                        }
                    }
                ));
            }
        },

        // CREATE
        [createCategoryAsyncThunk.pending]: (state, action) => {
            if (!state.creating) {
                state.creating = true;
                state.currentCreateRequestId = action.meta.requestId;
                state.creationError = null;
            }
        },
        [createCategoryAsyncThunk.fulfilled]: (state, action) => {
            const {requestId} = action.meta;

            if (state.creating && state.currentCreateRequestId === requestId) {
                state.creating = false;
                state.currentCreateRequestId = null;
                state.creationError = null;

                state.entity = [...state.entity, action.payload];
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
        [createCategoryAsyncThunk.rejected]: (state, action) => {
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
        [updateCategoryAsyncThunk.pending]: (state, action) => {
            if (!state.updating) {
                state.updating = true;
                state.currentUpdateRequestId = action.meta.requestId;
                state.updateError = null;
            }
        },
        [updateCategoryAsyncThunk.fulfilled]: (state, action) => {
            const {requestId} = action.meta;

            if (state.updating && state.currentUpdateRequestId === requestId) {
                state.updating = false;
                state.currentUpdateRequestId = null;
                state.updateError = null;

                const updatedCategory = action.payload;
                state.entity = state.entity.map((cat) => {
                    if (cat.id !== updatedCategory.id) {
                        return cat;
                    }

                    return {
                        ...cat,
                        name: updatedCategory.name,
                        categoryType: updatedCategory.categoryType,
                        apiKey: updatedCategory.apiKey,
                        apiKeySecret: updatedCategory.apiKeySecret,
                        integrationService: updatedCategory.integrationService
                    };
                });

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
        [updateCategoryAsyncThunk.rejected]: (state, action) => {
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
        [deleteCategoryAsyncThunk.pending]: (state, action) => {
            if (!state.deleting) {
                state.deleting = true;
                state.currentDeleteRequestId = action.meta.requestId;
                state.deleteError = null;
            }
        },
        [deleteCategoryAsyncThunk.fulfilled]: (state, action) => {
            const {requestId} = action.meta;

            if (state.deleting && state.currentDeleteRequestId === requestId) {
                state.deleting = false;
                state.currentDeleteRequestId = null;
                state.deleteError = null;

                const deletedCategoryId = action.payload;
                state.entity = state.entity.filter((category) => {
                    return category.id !== deletedCategoryId;
                });

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
        [deleteCategoryAsyncThunk.rejected]: (state, action) => {
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


const categoriesReducer = categorySlice.reducer;

const fetchCategories = fetchCategoriesAsyncThunk;
const fetchCategoriesAssets = fetchCategoryAssetsAsyncThunk;
const createCategory = createCategoryAsyncThunk;
const updateCategory = updateCategoryAsyncThunk;
const deleteCategory = deleteCategoryAsyncThunk;

const addCategoryAsset = categorySlice.actions.addCategoryAsset;
const updateCategoryAsset = categorySlice.actions.updateCategoryAsset;
const deleteCategoryAsset = categorySlice.actions.deleteCategoryAsset;

export {
    // store name
    CATEGORIES_STORE_NAME,
    // reducer
    categoriesReducer,
    // apis
    fetchCategories, fetchCategoriesAssets, createCategory, updateCategory, deleteCategory,
    // store actions
    addCategoryAsset, updateCategoryAsset, deleteCategoryAsset,
};
