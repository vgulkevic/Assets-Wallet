// rates: response of the currency-rates endpoint, e.g. {source: "GBP", quotes: {GBPUSD: 1.34, GBPEUR: 1.2}}
export function convertCurrency(amount, rates, from, to) {
    const value = parseFloat(amount);
    if (from === to) {
        return value;
    }

    const {source, quotes} = rates;
    // how many units of a currency one unit of the source currency buys
    const perSource = (currency) => currency === source ? 1 : quotes[source + currency];
    return value / perSource(from) * perSource(to);
}

const formatters = {};

export function formatMoney(value, currency) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return "—";
    }
    formatters[currency] ??= new Intl.NumberFormat("en-GB", {style: "currency", currency, currencyDisplay: "narrowSymbol"});
    return formatters[currency].format(value);
}

export const sum = (values) => values.reduce((total, value) => total + value, 0);
