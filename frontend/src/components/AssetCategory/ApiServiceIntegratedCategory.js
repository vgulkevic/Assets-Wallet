import makeStyles from "@material-ui/core/styles/makeStyles";
import {useDispatch, useSelector} from "react-redux";
import {SELECTED_CURRENCIES_STATE_STORE_NAME} from "../CurrencySelector/redux/selectedCurrenciesStateSlice";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import CustomTable from "../Table/CustomTable";
import React, {useEffect, useState} from "react";
import {roundNumberTo2Dp} from "../../utils/numberUtils";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from "@material-ui/icons/Edit";
import CategoryEditDialog from "./CategoryEditDialog";
import {CATEGORIES_STORE_NAME, fetchCategoriesAssets} from "./redux/categoriesSlice";

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
}));

export default function ApiServiceIntegratedCategory({category}) {
    const classes = useStyles();
    const dispatch = useDispatch();

    const {entityState: selectedCurrenciesState} = useSelector(state => state[SELECTED_CURRENCIES_STATE_STORE_NAME]);
    const {categoryAssetsFetching} = useSelector(state => state[CATEGORIES_STORE_NAME]);

    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchCategoriesAssets(category.id));
    }, [dispatch, category.id]);


    const headCells = [
        {id: 'name', label: 'Name'},
        {id: 'rawAmount', label: 'Holdings'},
        {id: 'amountInMainCurrency', label: selectedCurrenciesState.main},
        {id: 'amountInSecondaryCurrency', label: selectedCurrenciesState.secondary}
    ];

    const summaryRowCells = [
        {},
        {},
        {
            onCalculate: (assets) => {
                const res = assets.reduce(function (accumulator, asset) {
                    return accumulator + asset.amountInMainCurrency;
                }, 0);

                return roundNumberTo2Dp(res);
            }
        },
        {
            onCalculate: (assets) => {
                const res = assets.reduce(function (accumulator, asset) {
                    return accumulator + asset.amountInSecondaryCurrency;
                }, 0);

                return roundNumberTo2Dp(res);
            }
        }
    ]

    return (
        <>
            <Grid item xs={12}>
                <Paper className={classes.paper}>
                    <div style={{marginBottom: '15px'}}>
                        <Typography component="div" variant="h5" gutterBottom style={{textAlign: 'center', fontWeight: 600, position: 'relative'}}>
                            {category.name}
                            {
                                !categoryAssetsFetching[category.id] &&
                                <IconButton aria-label="edit" onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.currentTarget.blur();
                                    setCategoryDialogOpen(true);
                                }}>
                                    <EditIcon size="small"/>
                                </IconButton>
                            }
                        </Typography>
                    </div>

                    <CustomTable headCells={headCells} summaryRowCells={summaryRowCells} tableElements={category.assets || []} isLoading={categoryAssetsFetching[category.id]}/>
                    <CategoryEditDialog category={category} open={categoryDialogOpen} handleClose={() => setCategoryDialogOpen(false)}/>
                </Paper>
            </Grid>
        </>
    );
}