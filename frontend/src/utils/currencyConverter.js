import {roundNumberTo2Dp} from "./numberUtils";

export default function convertCurrency(amount, rates, currencyFrom, currencyTo) {
    if (currencyFrom !== currencyTo) {
        if (rates.source !== currencyFrom && rates.source !== currencyTo) {
            let a = amount * (1 / rates.quotes[rates.source + currencyFrom]);
            return roundNumberTo2Dp(a * rates.quotes[rates.source + currencyTo]);
        }
        if (rates.source !== currencyFrom) {
            return roundNumberTo2Dp(amount * (1 / rates.quotes[currencyTo + currencyFrom]));
        } else {
            return roundNumberTo2Dp(amount * rates.quotes[currencyFrom + currencyTo]);
        }
    } else {
        return roundNumberTo2Dp(parseInt(amount));
    }
}