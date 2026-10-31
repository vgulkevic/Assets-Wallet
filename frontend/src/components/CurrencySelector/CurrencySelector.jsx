import React, {useEffect} from 'react';
import BaseCurrencyPicker from "../Input/BaseCurrencyPicker";
import {useDispatch, useSelector} from "react-redux";
import {SELECTED_CURRENCIES_STORE_NAME} from "./redux/selectedCurrenciesSlice";
import {SELECTED_CURRENCIES_STATE_STORE_NAME, setSelectedCurrenciesState, updateSelectedCurrenciesStateProperty} from "./redux/selectedCurrenciesStateSlice";

export default function CurrencySelector({label, currencyPropName}) {
    const {entity: selectedCurrencies, loading: selectedCurrenciesLoading} = useSelector(state => state[SELECTED_CURRENCIES_STORE_NAME]);
    const {entityState: selectedCurrenciesState} = useSelector(state => state[SELECTED_CURRENCIES_STATE_STORE_NAME]);
    const dispatch = useDispatch();

    useEffect(() => {
        if (selectedCurrencies) {
            dispatch(setSelectedCurrenciesState(selectedCurrencies));
        }
    }, [dispatch, selectedCurrencies]);

    const currencySetter = (val) => {
        dispatch(updateSelectedCurrenciesStateProperty({
                propertyName: currencyPropName,
                newValue: val
            }
        ));
    };

    return (
        <>
            <BaseCurrencyPicker label={label} value={selectedCurrenciesState ? selectedCurrenciesState[currencyPropName] || null : null} setter={currencySetter} loading={selectedCurrenciesLoading}/>
        </>
    );
}