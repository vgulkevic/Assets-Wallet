import getCurrencySymbolFromCurrencyCode from "../../utils/currencySymbol";
import convertCurrency from "../../utils/currencyConverter";

export default function adaptCustomCategory(category, selectedCurrencies, rates) {
    return mapCategory(category, selectedCurrencies, rates);
}

const mapCategory = (category, selectedCurrencies, rates) => {
    const result = {
        id: category.id,
        name: category.name,
        categoryType: category.categoryType,
        assets: []
    };

    result.assets = category.assets.map((asset) => {
        return {
            id: asset.id,
            name: asset.name,
            amount: asset.amount,
            currency: asset.currency,
            rawAmount: getCurrencySymbolFromCurrencyCode(asset.currency) + convertCurrency(asset.amount, rates, asset.currency, asset.currency),
            amountInMainCurrency: convertCurrency(asset.amount, rates, asset.currency, selectedCurrencies.main),
            amountInSecondaryCurrency: convertCurrency(asset.amount, rates, asset.currency, selectedCurrencies.secondary),
        };
    });

    return result;
}
