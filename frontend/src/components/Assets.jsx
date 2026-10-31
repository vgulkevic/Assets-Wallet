import Grid from "@mui/material/Grid";
import React, {useEffect} from "react";
import {makeStyles} from "tss-react/mui";
import Container from "@mui/material/Container";
import {CURRENCY_RATES_STORE_NAME, fetchCurrencyRates} from "./CurrencySelector/redux/currencyRatesSlice";
import {Oval} from "react-loader-spinner";
import {useDispatch, useSelector} from "react-redux";
import {fetchSelectedCurrencies, SELECTED_CURRENCIES_STORE_NAME} from "./CurrencySelector/redux/selectedCurrenciesSlice";
import CategoriesList from "./CategoriesList";
import CurrencySelectorView from "./CurrencySelector/CurrencySelectorView";
import usePrevious from "../utils/previousValue";
import {isEqual} from "lodash";
import AddNewCategory from "./AddNewCategory/AddNewCategory";

const useStyles = makeStyles()((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: "#F4F4F4",
        minHeight: '100vh'
    }
}));

export default function Assets() {
    const {classes} = useStyles();
    const {entity: currencyRates, loading: currencyRatesLoading} = useSelector(state => state[CURRENCY_RATES_STORE_NAME]);
    const {entity: selectedCurrencies} = useSelector(state => state[SELECTED_CURRENCIES_STORE_NAME]);
    const previousSelectedCurrencies = usePrevious(selectedCurrencies);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchSelectedCurrencies("/user-profile"));
    }, [dispatch]);

    useEffect(() => {
        if ((selectedCurrencies && !previousSelectedCurrencies) || (selectedCurrencies && previousSelectedCurrencies && !isEqual(selectedCurrencies, previousSelectedCurrencies))) {
            dispatch(fetchCurrencyRates({payload: {baseCurrency: selectedCurrencies.main}}));
        }
    }, [dispatch, selectedCurrencies, previousSelectedCurrencies]);

    return (
        <div className={classes.root}>
            <Container maxWidth="lg">
                <Grid sx={{alignItems: "center", justifyContent: "center"}} container style={{paddingTop: "100px", paddingBottom: "100px"}}>
                    <Grid size={12}>
                        {
                            (!currencyRates && currencyRatesLoading) || !selectedCurrencies || !currencyRates
                                ?
                                <div style={{textAlign: 'center', marginTop: '50px', width: '100%'}}>
                                    <Oval wrapperClass="loader" wrapperStyle={{justifyContent: "center"}} color="#00BFFF" height="50" width="50"/>
                                </div>
                                :
                                <Grid container spacing={1}>
                                    <Grid size={12}>
                                        <Grid sx={{alignItems: "flex-end"}} container spacing={3} direction="row">

                                            <Grid size={{xs: 12, sm: 7}}>
                                                <CurrencySelectorView/>
                                            </Grid>

                                            <Grid size={{xs: 12, sm: 5}} style={{textAlign: 'right'}}>
                                                <AddNewCategory/>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    <Grid size={12}>
                                        <Grid container spacing={3}>
                                            <CategoriesList/>
                                        </Grid>
                                    </Grid>
                                </Grid>
                        }
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
}