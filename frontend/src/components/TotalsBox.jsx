import React from "react";
import {makeStyles} from "tss-react/mui";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import {useSelector} from "react-redux";
import {roundNumberTo2Dp} from "../utils/numberUtils";
import {SELECTED_CURRENCIES_STATE_STORE_NAME} from "./CurrencySelector/redux/selectedCurrenciesStateSlice";


const useStyles = makeStyles()((theme) => ({
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }
}));

export default function TotalsBox({categories}) {
    const {entityState: selectedCurrenciesState} = useSelector(state => state[SELECTED_CURRENCIES_STATE_STORE_NAME]);
    const {classes} = useStyles();

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
            <Grid size={12}>
                <Paper className={classes.paper}>
                    <div style={{marginBottom: '15px'}}>
                        <Typography component="div" variant="h5" gutterBottom style={{textAlign: 'center', fontWeight: 600, position: 'relative'}}>
                            Totals
                        </Typography>
                    </div>

                    <Grid container style={{textAlign: 'left', color: 'rgba(0, 0, 0, 0.87)'}}>
                        <Grid size={12}>
                            <Typography component="span" variant="body1">
                                {selectedCurrenciesState.main}
                            </Typography> : {calculateTotal(categories, 'amountInMainCurrency')}
                        </Grid>

                        <Grid size={12}>
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
