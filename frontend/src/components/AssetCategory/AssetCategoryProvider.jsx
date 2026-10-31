import {CUSTOM_CATEGORY} from "./CategoryType";
import CustomAssetCategory from "./Custom/CustomAssetCategory";
import React from "react";

export default function getAssetCategoryViewForType(assetCategory, key) {
    switch (assetCategory.categoryType) {
        case CUSTOM_CATEGORY:
            return <CustomAssetCategory category={assetCategory} key={key}/>
        default:
            throw new Error("Unknown Asset Category Type");
    }
}
