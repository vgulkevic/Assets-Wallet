import fx from "money";
import {roundNumberTo2Dp} from "./numberUtils";

export default function convertCurrency(amount, rates, currencyFrom, currencyTo) {
    return roundNumberTo2Dp(fx.convert(amount, {from: currencyFrom, to: currencyTo}));
}