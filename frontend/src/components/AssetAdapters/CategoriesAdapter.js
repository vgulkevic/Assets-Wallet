import {API_CATEGORY, BINANCE_API_INTEGRATION, BITTREX_API_INTEGRATION, CUSTOM_CATEGORY, KRAKEN_API_INTEGRATION, STARLING_BANK_API_INTEGRATION} from "../AssetCategory/CategoryType";
import adaptCustomCategory from "./CustomCategoryAdapter";
import adaptStarlingBankCategory from "./StarlingBankCategoryAdapter";
import adaptBittrexCategory from "./BittrexCategoryAdapter";
import adaptKrakenCategory from "./KrakenCategoryAdapter";
import adaptBinanceCategory from "./BinanceCategoryAdapter";

export default function adaptCategories(categories, selectedCurrencies, rates) {
    if (!categories) {
        return [];
    }

    return categories.map((category) => {
        if (category.categoryType === CUSTOM_CATEGORY) {
            return adaptCustomCategory(category, selectedCurrencies, rates);
        }

        if (category.categoryType === API_CATEGORY) {
            if (category.integrationService === STARLING_BANK_API_INTEGRATION) {
                return adaptStarlingBankCategory(category, selectedCurrencies, rates);
            }

            if (category.integrationService === BITTREX_API_INTEGRATION) {
                return adaptBittrexCategory(category, selectedCurrencies, rates);
            }

            if (category.integrationService === KRAKEN_API_INTEGRATION) {
                return adaptKrakenCategory(category, selectedCurrencies, rates);
            }

            if (category.integrationService === BINANCE_API_INTEGRATION) {
                return adaptBinanceCategory(category, selectedCurrencies, rates);
            }
        }

        return category;
    });
}