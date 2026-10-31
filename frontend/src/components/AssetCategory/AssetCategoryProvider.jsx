import {CUSTOM_CATEGORY, API_CATEGORY} from "./CategoryType";
import CustomAssetCategory from "./Custom/CustomAssetCategory";
import React from "react";
import ApiServiceIntegratedCategory from "./ApiServiceIntegratedCategory";

export default function getAssetCategoryViewForType(assetCategory, key) {
    switch (assetCategory.categoryType) {
        case CUSTOM_CATEGORY:
            return <CustomAssetCategory category={assetCategory} key={key}/>
        case API_CATEGORY:
            return <ApiServiceIntegratedCategory category={assetCategory} key={key}/>;
        default:
            throw new Error("Unknown Asset Category Type");
    }
}