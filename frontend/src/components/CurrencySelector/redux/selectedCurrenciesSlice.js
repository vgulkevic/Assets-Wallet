import {createGetUpdateEntitySlice} from "../../../redux/utils/getUpdateEntitySliceFactory";
import {data} from "../../../data";
import {randomIntFromInterval} from "../../../utils/randomNumber";
import {BASE_API_URL} from "../../../profile";

const SELECTED_CURRENCIES_STORE_NAME = "selectedCurrencies";

const debugReturnPromise = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(data.selectedCurrencies), randomIntFromInterval(150,300))
    });
}

const {thunk: fetchSelectedCurrencies, updateThunk: updateSelectedCurrencies, slice} = createGetUpdateEntitySlice(
    "selectedCurrencies",
    SELECTED_CURRENCIES_STORE_NAME,
    BASE_API_URL + "/asset-manager",
    "selectedCurrencies",
    true,
    debugReturnPromise,
    true,
    null,
    true
);
const selectedCurrenciesReducer = slice.reducer;

export {SELECTED_CURRENCIES_STORE_NAME, fetchSelectedCurrencies, updateSelectedCurrencies, selectedCurrenciesReducer};
