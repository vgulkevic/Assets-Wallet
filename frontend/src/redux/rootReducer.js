import {combineReducers} from "redux";
import {NOTIFIER_STORE_NAME, notifierReducer} from "../components/Notifier/notifierSlice";
import {CURRENCY_RATES_STORE_NAME, currencyRatesReducer} from "../components/CurrencySelector/redux/currencyRatesSlice";
import {SELECTED_CURRENCIES_STORE_NAME, selectedCurrenciesReducer} from "../components/CurrencySelector/redux/selectedCurrenciesSlice";
import {CATEGORIES_STORE_NAME, categoriesReducer} from "../components/AssetCategory/redux/categoriesSlice";
import {SELECTED_CURRENCIES_STATE_STORE_NAME, selectedCurrenciesStateReducer} from "../components/CurrencySelector/redux/selectedCurrenciesStateSlice";
import {CUSTOM_CATEGORY_ASSET_STORE_NAME, customCategoryAssetReducer} from "../components/AssetCategory/Custom/redux/customCategoryAssetSlice";
import {AUTH_STORE_NAME, authReducer} from "../components/Authentication/redux/authSlice";

const reducerList = {};
reducerList[NOTIFIER_STORE_NAME] = notifierReducer;
reducerList[CURRENCY_RATES_STORE_NAME] = currencyRatesReducer;
reducerList[SELECTED_CURRENCIES_STORE_NAME] = selectedCurrenciesReducer;
reducerList[SELECTED_CURRENCIES_STATE_STORE_NAME] = selectedCurrenciesStateReducer;
reducerList[CATEGORIES_STORE_NAME] = categoriesReducer;
reducerList[CUSTOM_CATEGORY_ASSET_STORE_NAME] = customCategoryAssetReducer;
reducerList[AUTH_STORE_NAME] = authReducer;

const rootReducer = combineReducers(reducerList);

export default rootReducer;
