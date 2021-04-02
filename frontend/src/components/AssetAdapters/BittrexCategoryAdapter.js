import getCurrencySymbolFromCurrencyCode from "../../utils/currencySymbol";
import convertCurrency from "../../utils/currencyConverter";
import {roundNumberToDp} from "../../utils/numberUtils";

export default function adaptBittrexCategory(category, selectedCurrencies, rates) {
    return mapCategory(category, selectedCurrencies, rates);
}

const mapCategory = (category, selectedCurrencies, rates) => {
    const result = {
        id: category.id,
        name: category.name,
        categoryType: category.categoryType,
        integrationService: category.integrationService,
        apiKey: category.apiKey,
        apiKeySecret: category.apiKeySecret,
        assets: []
    };

    result.assets = category.assets.map((asset) => {
        return {
            id: asset.id,
            name: asset.name,
            amount: asset.amount,
            currency: asset.currency,
            rawAmount: asset.btcValue ? roundNumberToDp(asset.btcValue, 8) + "₿" : getCurrencySymbolFromCurrencyCode(asset.currency) + convertCurrency(asset.amount, rates, asset.currency, asset.currency),
            amountInMainCurrency: convertCurrency(asset.amount, rates, asset.currency, selectedCurrencies.main),
            amountInSecondaryCurrency: convertCurrency(asset.amount, rates, asset.currency, selectedCurrencies.secondary),
        };
    });

    return result;
}
