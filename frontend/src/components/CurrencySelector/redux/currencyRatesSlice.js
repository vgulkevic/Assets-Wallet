import {createGetUpdateEntitySlice} from "../../../redux/utils/getUpdateEntitySliceFactory";
import {data} from "../../../data";
import {randomIntFromInterval} from "../../../utils/randomNumber";
import {FX_API_KEY} from "../../../profile";

const CURRENCY_RATES_STORE_NAME = "currencyRates";

const debugReturnPromise =  () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(data.cachedRates), randomIntFromInterval(150, 900))
    });
}

const {thunk: fetchCurrencyRates, slice} = createGetUpdateEntitySlice(
    "currencyRates",
    CURRENCY_RATES_STORE_NAME,
    `http://api.exchangerate.host/live?access_key=${FX_API_KEY}&currencies=GBP,USD,EUR&source=`,
    "currencyRates",
    true,
    debugReturnPromise,
    false
);
const currencyRatesReducer = slice.reducer;

export {CURRENCY_RATES_STORE_NAME, fetchCurrencyRates, currencyRatesReducer};
