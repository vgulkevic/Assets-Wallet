import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {BASE_API_URL, LOCAL} from "../profile";
import {getIdToken} from "../auth/authToken";
import mockBaseQuery from "./mockBaseQuery";

const apiBaseQuery = fetchBaseQuery({
    baseUrl: `${(BASE_API_URL || "").replace(/\/$/, "")}/asset-manager`,
    prepareHeaders: async (headers) => {
        const token = await getIdToken();
        if (token) {
            headers.set("Authorization", token);
        }
        return headers;
    }
});

// The whole data set is small, so every change simply refetches the categories.
export const assetManagerApi = createApi({
    reducerPath: "assetManagerApi",
    baseQuery: LOCAL ? mockBaseQuery : apiBaseQuery,
    tagTypes: ["Categories", "Profile", "AssetHistory", "NetWorth"],
    endpoints: (build) => ({
        getCategories: build.query({
            query: () => "categories",
            providesTags: ["Categories"]
        }),
        createCategory: build.mutation({
            query: (name) => ({url: "create-category", method: "POST", body: {name, categoryType: "CUSTOM_CATEGORY"}}),
            invalidatesTags: ["Categories"]
        }),
        renameCategory: build.mutation({
            query: ({id, name}) => ({url: "update-category", method: "POST", body: {id, name, categoryType: "CUSTOM_CATEGORY"}}),
            invalidatesTags: ["Categories"]
        }),
        deleteCategory: build.mutation({
            // the backend reads the raw request body as the category id
            query: (id) => ({url: "delete-category", method: "DELETE", body: id}),
            invalidatesTags: ["Categories"]
        }),

        reorderCategories: build.mutation({
            query: (categoryIds) => ({url: "reorder-categories", method: "POST", body: {categoryIds}}),
            // move the cards straight away; put them back if saving fails
            async onQueryStarted(categoryIds, {dispatch, queryFulfilled}) {
                const patch = dispatch(assetManagerApi.util.updateQueryData("getCategories", undefined,
                    (categories) => orderBy(categories, categoryIds)));
                try {
                    await queryFulfilled;
                } catch {
                    patch.undo();
                }
            }
        }),

        createAsset: build.mutation({
            query: ({categoryId, asset}) => ({url: "create-asset", method: "POST", body: {categoryId, asset}}),
            invalidatesTags: ["Categories"]
        }),
        updateAsset: build.mutation({
            query: ({categoryId, asset}) => ({url: "update-asset", method: "POST", body: {categoryId, asset}}),
            invalidatesTags: (result, error, {asset}) => ["Categories", {type: "AssetHistory", id: asset.id}]
        }),
        deleteAsset: build.mutation({
            query: ({categoryId, assetId}) => ({url: "delete-asset", method: "DELETE", body: {categoryId, assetId}}),
            invalidatesTags: (result, error, {assetId}) => ["Categories", {type: "AssetHistory", id: assetId}]
        }),
        reorderAssets: build.mutation({
            query: ({categoryId, assetIds}) => ({url: "reorder-assets", method: "POST", body: {categoryId, assetIds}}),
            async onQueryStarted({categoryId, assetIds}, {dispatch, queryFulfilled}) {
                const patch = dispatch(assetManagerApi.util.updateQueryData("getCategories", undefined, (categories) => {
                    const category = categories.find((c) => c.id === categoryId);
                    if (category) {
                        category.assets = orderBy(category.assets, assetIds);
                    }
                }));
                try {
                    await queryFulfilled;
                } catch {
                    patch.undo();
                }
            }
        }),

        getAssetHistory: build.query({
            query: (assetId) => `asset-history?assetId=${encodeURIComponent(assetId)}`,
            providesTags: (result, error, assetId) => [{type: "AssetHistory", id: assetId}]
        }),
        setAssetChangeExcluded: build.mutation({
            query: ({changeId, excluded}) => ({url: "set-asset-change-excluded", method: "POST", body: {changeId, excluded}}),
            async onQueryStarted({assetId, changeId, excluded}, {dispatch, queryFulfilled}) {
                const patch = dispatch(assetManagerApi.util.updateQueryData("getAssetHistory", assetId, (changes) => {
                    const change = changes.find((c) => c.id === changeId);
                    if (change) {
                        change.excluded = excluded;
                    }
                }));
                try {
                    await queryFulfilled;
                } catch {
                    patch.undo();
                }
            }
        }),

        getNetWorthHistory: build.query({
            query: () => "net-worth-history",
            providesTags: ["NetWorth"]
        }),

        getUserProfile: build.query({
            query: () => "user-profile",
            providesTags: ["Profile"]
        }),
        updateUserProfile: build.mutation({
            query: ({main, secondary}) => ({url: "create-user-profile", method: "POST", body: {main, secondary}}),
            // show the new currencies straight away instead of waiting for the round trip
            async onQueryStarted(profile, {dispatch, queryFulfilled}) {
                const patch = dispatch(assetManagerApi.util.updateQueryData("getUserProfile", undefined, () => profile));
                try {
                    await queryFulfilled;
                } catch {
                    patch.undo();
                }
            }
        }),

        getCurrencyRates: build.query({
            query: (baseCurrency) => ({url: "currency-rates", method: "POST", body: {baseCurrency}}),
            keepUnusedDataFor: 3600
        })
    })
});

// items in the order of `ids`; anything not listed keeps its place after them
function orderBy(items, ids) {
    const position = new Map(ids.map((id, i) => [id, i]));
    return [...items].sort((a, b) => (position.get(a.id) ?? Infinity) - (position.get(b.id) ?? Infinity));
}

export const {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useRenameCategoryMutation,
    useDeleteCategoryMutation,
    useReorderCategoriesMutation,
    useReorderAssetsMutation,
    useGetAssetHistoryQuery,
    useSetAssetChangeExcludedMutation,
    useGetNetWorthHistoryQuery,
    useCreateAssetMutation,
    useUpdateAssetMutation,
    useDeleteAssetMutation,
    useGetUserProfileQuery,
    useUpdateUserProfileMutation,
    useGetCurrencyRatesQuery
} = assetManagerApi;
