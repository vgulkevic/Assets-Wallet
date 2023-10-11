import Grid from "@material-ui/core/Grid";
import React, {useEffect} from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";
import {CURRENCY_RATES_STORE_NAME, fetchCurrencyRates} from "./CurrencySelector/redux/currencyRatesSlice";
import Loader from "react-loader-spinner";
import {useDispatch, useSelector} from "react-redux";
import fx from "money";
import {fetchSelectedCurrencies, SELECTED_CURRENCIES_STORE_NAME} from "./CurrencySelector/redux/selectedCurrenciesSlice";
import CategoriesList from "./CategoriesList";
import CurrencySelectorView from "./CurrencySelector/CurrencySelectorView";
import usePrevious from "../utils/previousValue";
import {isEqual} from "lodash";
import AddNewCategory from "./AddNewCategory/AddNewCategory";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: "#F4F4F4",
        minHeight: '100vh'
    }
}));

export default function Assets() {
    const classes = useStyles();
    const {entity: currencyRates, loading: currencyRatesLoading} = useSelector(state => state[CURRENCY_RATES_STORE_NAME]);
    const {entity: selectedCurrencies} = useSelector(state => state[SELECTED_CURRENCIES_STORE_NAME]);
    const previousSelectedCurrencies = usePrevious(selectedCurrencies);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchSelectedCurrencies("/user-profile"));
    }, [dispatch]);

    useEffect(() => {
        if ((selectedCurrencies && !previousSelectedCurrencies) || (selectedCurrencies && previousSelectedCurrencies && !isEqual(selectedCurrencies, previousSelectedCurrencies))) {
            dispatch(fetchCurrencyRates(selectedCurrencies.main));
        }
    }, [dispatch, selectedCurrencies, previousSelectedCurrencies]);

    return (
        <div className={classes.root}>
            <Container maxWidth="lg">
                <Grid container style={{paddingTop: "100px", paddingBottom: "100px"}} alignItems="center" justify="center">
                    <Grid item xs={12}>
                        {
                            (!currencyRates && currencyRatesLoading) || !selectedCurrencies || !currencyRates
                                ?
                                <div style={{textAlign: 'center', marginTop: '50px', width: '100%'}}>
                                    <Loader className="loader" type="Oval" color="#00BFFF" height="50" width="50"/>
                                </div>
                                :
                                <Grid container spacing={1}>
                                    <Grid item xs={12}>
                                        <Grid container spacing={3} direction="row" alignItems="flex-end">

                                            <Grid item xs={12} sm={7}>
                                                <CurrencySelectorView/>
                                            </Grid>

                                            <Grid item xs={12} sm={5} style={{textAlign: 'right'}}>
                                                <AddNewCategory/>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    <Grid item xs={12}>
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