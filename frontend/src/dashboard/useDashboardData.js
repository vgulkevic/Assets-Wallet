import {useMemo} from "react";
import {useGetCategoriesQuery, useGetCurrencyRatesQuery, useGetUserProfileQuery} from "../api/assetManagerApi";
import {withSupportedCurrencies} from "../utils/currencies";
import {convertCurrency, sum} from "../utils/money";

// Categories with every asset converted to the user's main and secondary currency, plus totals.
export default function useDashboardData() {
    const profileQuery = useGetUserProfileQuery();
    const currencies = useMemo(() => withSupportedCurrencies(profileQuery.data), [profileQuery.data]);

    const categoriesQuery = useGetCategoriesQuery();
    const ratesQuery = useGetCurrencyRatesQuery(currencies?.main, {skip: !currencies});
    const rates = ratesQuery.data;

    const categories = useMemo(() => {
        if (!categoriesQuery.data || !rates || !currencies) {
            return null;
        }

        return categoriesQuery.data.map((category) => {
            const assets = category.assets.map((asset) => ({
                ...asset,
                amountInMain: convertCurrency(asset.amount, rates, asset.currency, currencies.main),
                amountInSecondary: convertCurrency(asset.amount, rates, asset.currency, currencies.secondary)
            }));

            return {
                ...category,
                assets,
                totalInMain: sum(assets.map((asset) => asset.amountInMain)),
                totalInSecondary: sum(assets.map((asset) => asset.amountInSecondary))
            };
        });
    }, [categoriesQuery.data, rates, currencies]);

    const totals = useMemo(() => categories && {
        main: sum(categories.map((category) => category.totalInMain)),
        secondary: sum(categories.map((category) => category.totalInSecondary)),
        assetCount: sum(categories.map((category) => category.assets.length))
    }, [categories]);

    return {
        currencies,
        categories,
        totals,
        ratesDate: rates?.date,
        isLoading: profileQuery.isLoading || categoriesQuery.isLoading || ratesQuery.isLoading,
        isFetching: categoriesQuery.isFetching || ratesQuery.isFetching,
        isError: profileQuery.isError || categoriesQuery.isError || ratesQuery.isError,
        retry: () => {
            profileQuery.refetch();
            categoriesQuery.refetch();
            if (currencies) {
                ratesQuery.refetch();
            }
        }
    };
}
