import Grid from "@mui/material/Grid";
import CurrencySelector from "./CurrencySelector";
import React from "react";
import CustomButton from "../CustomButton";
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import {useDispatch, useSelector} from "react-redux";
import {SELECTED_CURRENCIES_STORE_NAME, updateSelectedCurrencies} from "./redux/selectedCurrenciesSlice";
import {SELECTED_CURRENCIES_STATE_STORE_NAME} from "./redux/selectedCurrenciesStateSlice";

export default function CurrencySelectorView() {
    const {entityUpdating: selectedCurrenciesUpdating} = useSelector(state => state[SELECTED_CURRENCIES_STORE_NAME]);
    const {entityState: selectedCurrenciesState} = useSelector(state => state[SELECTED_CURRENCIES_STATE_STORE_NAME]);

    const dispatch = useDispatch();

    const handleSaveButtonClick = () => {
        dispatch(updateSelectedCurrencies(
            {
                urlParam: "/create-user-profile",
                payload: selectedCurrenciesState
            }
        ));
    }

    return (
        <>
            <Grid sx={{alignItems: "flex-end"}} container spacing={3} direction="row">

                <Grid size={{xs: 12, sm: 10}}>
                    <Grid container spacing={3}>
                        <Grid size={{xs: 12, sm: 6}}>
                            <CurrencySelector label={'Base currency'} currencyPropName={"main"}/>
                        </Grid>
                        <Grid size={{xs: 12, sm: 6}}>
                            <CurrencySelector label={'Secondary currency'} currencyPropName={"secondary"}/>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid size={2}>
                    <CustomButton
                        variant="contained"
                        color="primary"
                        startIcon={<CloudOutlinedIcon/>}
                        onClick={handleSaveButtonClick}
                        loading={selectedCurrenciesUpdating}
                    >
                        Save
                    </CustomButton>
                </Grid>
            </Grid>
        </>
    );
}
