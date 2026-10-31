// Currencies offered in the pickers. Keep in sync with SUPPORTED_CURRENCIES in backend/category-api/currency-rates-lambda.
const SUPPORTED_CURRENCIES = [
    {
        id: "GBP",
        name: "£ (Pound)"
    },
    {
        id: "USD",
        name: "$ (Dollar)"
    },
    {
        id: "EUR",
        name: "€ (Euro)"
    }
];

const DEFAULT_SELECTED_CURRENCIES = {main: "GBP", secondary: "USD"};

const isSupportedCurrency = (currency) => SUPPORTED_CURRENCIES.some(option => option.id === currency);

// A saved profile may still use a currency that is no longer offered (e.g. JPY); fall back to the defaults for those.
// The stored profile only changes when the user presses Save.
function withSupportedCurrencies(selectedCurrencies) {
    if (!selectedCurrencies) {
        return selectedCurrencies;
    }

    return {
        ...selectedCurrencies,
        main: isSupportedCurrency(selectedCurrencies.main) ? selectedCurrencies.main : DEFAULT_SELECTED_CURRENCIES.main,
        secondary: isSupportedCurrency(selectedCurrencies.secondary) ? selectedCurrencies.secondary : DEFAULT_SELECTED_CURRENCIES.secondary
    };
}

export {SUPPORTED_CURRENCIES, withSupportedCurrencies};
