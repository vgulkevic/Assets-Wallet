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
    tagTypes: ["Categories", "Profile"],
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

        createAsset: build.mutation({
            query: ({categoryId, asset}) => ({url: "create-asset", method: "POST", body: {categoryId, asset}}),
            invalidatesTags: ["Categories"]
        }),
        updateAsset: build.mutation({
            query: ({categoryId, asset}) => ({url: "update-asset", method: "POST", body: {categoryId, asset}}),
            invalidatesTags: ["Categories"]
        }),
        deleteAsset: build.mutation({
            query: ({categoryId, assetId}) => ({url: "delete-asset", method: "DELETE", body: {categoryId, assetId}}),
            invalidatesTags: ["Categories"]
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

export const {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useRenameCategoryMutation,
    useDeleteCategoryMutation,
    useCreateAssetMutation,
    useUpdateAssetMutation,
    useDeleteAssetMutation,
    useGetUserProfileQuery,
    useUpdateUserProfileMutation,
    useGetCurrencyRatesQuery
} = assetManagerApi;
