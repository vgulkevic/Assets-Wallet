import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {CATEGORIES_STORE_NAME, fetchCategories} from "./AssetCategory/redux/categoriesSlice";
import {CURRENCY_RATES_STORE_NAME} from "./CurrencySelector/redux/currencyRatesSlice";
import {SELECTED_CURRENCIES_STATE_STORE_NAME} from "./CurrencySelector/redux/selectedCurrenciesStateSlice";
import getAssetCategoryViewForType from "./AssetCategory/AssetCategoryProvider";
import TotalsBox from "./TotalsBox";
import adaptCategories from "./AssetAdapters/CategoriesAdapter";

export default function CategoriesList() {
    const {entityState: selectedCurrenciesState} = useSelector(state => state[SELECTED_CURRENCIES_STATE_STORE_NAME]);
    const {entity: fetchedCategories} = useSelector(state => state[CATEGORIES_STORE_NAME]);
    const {entity: currencyRates} = useSelector(state => state[CURRENCY_RATES_STORE_NAME]);
    const dispatch = useDispatch();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);


    useEffect(() => {
        if (fetchedCategories && selectedCurrenciesState && currencyRates) {
            setCategories(adaptCategories(fetchedCategories, selectedCurrenciesState, currencyRates));
        }
    }, [fetchedCategories, selectedCurrenciesState, currencyRates]);

    return (
        <>
            {
                categories.map((assetCategory, i) => {
                    return (
                        getAssetCategoryViewForType(assetCategory, i)
                    );
                })
            }
            <TotalsBox categories={categories}/>
        </>
    );
};
