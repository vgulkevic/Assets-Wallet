import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {useSelector} from "react-redux";
import {roundNumberTo2Dp} from "../utils/numberUtils";
import {SELECTED_CURRENCIES_STATE_STORE_NAME} from "./CurrencySelector/redux/selectedCurrenciesStateSlice";


const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }
}));

export default function TotalsBox({categories}) {
    const {entityState: selectedCurrenciesState} = useSelector(state => state[SELECTED_CURRENCIES_STATE_STORE_NAME]);
    const classes = useStyles();

    const calculateTotal = (categories, property) => {
        const res = categories.reduce(function (accumulator, category) {
            return accumulator + category.assets.reduce(function (accumulator, asset) {
                return accumulator + asset[property];
            }, 0);
        }, 0);

        return roundNumberTo2Dp(res);
    }

    return (
        <>
            <Grid item xs={12}>
                <Paper className={classes.paper}>
                    <div style={{marginBottom: '15px'}}>
                        <Typography component="div" variant="h5" gutterBottom style={{textAlign: 'center', fontWeight: 600, position: 'relative'}}>
                            Totals
                        </Typography>
                    </div>

                    <Grid container style={{textAlign: 'left', color: 'rgba(0, 0, 0, 0.87)'}}>
                        <Grid item xs={12}>
                            <Typography component="span" variant="body1">
                                {selectedCurrenciesState.main}
                            </Typography> : {calculateTotal(categories, 'amountInMainCurrency')}
                        </Grid>

                        <Grid item xs={12}>
                            <Typography component="span" variant="body1">
                                {selectedCurrenciesState.secondary}
                            </Typography> : {calculateTotal(categories, 'amountInSecondaryCurrency')}
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        </>
    );
}
