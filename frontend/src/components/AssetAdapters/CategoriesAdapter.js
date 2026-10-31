import {CUSTOM_CATEGORY} from "../AssetCategory/CategoryType";
import adaptCustomCategory from "./CustomCategoryAdapter";

export default function adaptCategories(categories, selectedCurrencies, rates) {
    if (!categories) {
        return [];
    }

    return categories.map((category) => {
        if (category.categoryType === CUSTOM_CATEGORY) {
            return adaptCustomCategory(category, selectedCurrencies, rates);
        }

        return category;
    });
}
