import {createGetUpdateEntitySlice} from "../../../redux/utils/getUpdateEntitySliceFactory";
import {data} from "../../../data";
import {randomIntFromInterval} from "../../../utils/randomNumber";

const CURRENCY_RATES_STORE_NAME = "currencyRates";

const debugReturnPromise =  () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(data.cachedRates), randomIntFromInterval(150, 900))
    });
}

const {thunk: fetchCurrencyRates, slice} = createGetUpdateEntitySlice(
    "currencyRates",
    CURRENCY_RATES_STORE_NAME,
    "https://api.exchangeratesapi.io/latest?base=",
    "currencyRates",
    true,
    debugReturnPromise,
    false
);
const currencyRatesReducer = slice.reducer;

export {CURRENCY_RATES_STORE_NAME, fetchCurrencyRates, currencyRatesReducer};
