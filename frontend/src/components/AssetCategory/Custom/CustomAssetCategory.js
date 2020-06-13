import React, {useState} from "react";
import CustomTable from "../../Table/CustomTable";
import {useDispatch, useSelector} from "react-redux";
import Typography from "@material-ui/core/Typography";
import {SELECTED_CURRENCIES_STATE_STORE_NAME} from "../../CurrencySelector/redux/selectedCurrenciesStateSlice";
import {CURRENCY_RATES_STORE_NAME} from "../../CurrencySelector/redux/currencyRatesSlice";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import {roundNumberTo2Dp} from "../../../utils/numberUtils";
import {CUSTOM_CATEGORY_ASSET_STORE_NAME, deleteCategoryAsset} from "./redux/customCategoryAssetSlice";
import CustomAssetEditDialog from "./CustomAssetEditDialog";
import EditIcon from '@material-ui/icons/Edit';
import CategoryEditDialog from "../CategoryEditDialog";
import IconButton from "@material-ui/core/IconButton";
import ConfirmationDialog from "../../ConfirmationDialog";
import AddIcon from '@material-ui/icons/Add';

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    addNewItemIcon: {
        position: 'absolute',
        right: theme.spacing(0),
        top: theme.spacing(0)
    }
}));

export default function CustomAssetCategory({category}) {
    const {entityState: selectedCurrenciesState} = useSelector(state => state[SELECTED_CURRENCIES_STATE_STORE_NAME]);
    const {loading: currencyRatesLoading} = useSelector(state => state[CURRENCY_RATES_STORE_NAME]);
    const {updating: updatingAsset, deleting: deletingAsset} = useSelector(state => state[CUSTOM_CATEGORY_ASSET_STORE_NAME]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [assetDialogOpen, setAssetDialogOpen] = useState(false);
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [assetIdToDelete, setAssetIdToDelete] = useState('');

    const dispatch = useDispatch();
    const classes = useStyles();

    const headCells = [
        {id: 'name', label: 'Name'},
        {id: 'rawAmount', label: 'Holdings'},
        {id: 'amountInMainCurrency', label: selectedCurrenciesState.main},
        {id: 'amountInSecondaryCurrency', label: selectedCurrenciesState.secondary},
        {
            id: 'edit', label: '', onClickCallback: (el) => {
                if (!updatingAsset && !deletingAsset) {
                    onAssetEditCallback(el);
                }
            }
        },
        {
            id: 'delete', label: '', onClickCallback: (el) => {
                if (!updatingAsset && !deletingAsset) {
                    setAssetIdToDelete(el.id);
                    setConfirmationDialogOpen(true);
                }
            }
        }
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
        },
        {},
        {}
    ]

    const onAssetEditCallback = (asset) => {
        setSelectedAsset(asset);
        setAssetDialogOpen(true);
    };

    const onAssetDialogClose = () => {
        setSelectedAsset(null);
        setAssetDialogOpen(false);
    }

    return (
        <>
            <Grid item xs={12}>
                <Paper className={classes.paper}>
                    <div style={{marginBottom: '15px'}}>
                        <Typography component="div" variant="h5" gutterBottom style={{textAlign: 'center', fontWeight: 600, position: 'relative'}}>
                            {category.name}
                            <IconButton aria-label="edit" onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.currentTarget.blur();
                                setCategoryDialogOpen(true);
                            }}>
                                <EditIcon size="small"/>
                            </IconButton>

                            <IconButton aria-label="close" className={classes.addNewItemIcon} onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.currentTarget.blur();
                                setAssetDialogOpen(true);
                            }}>
                                <AddIcon/>
                            </IconButton>
                        </Typography>
                    </div>

                    <CustomTable headCells={headCells} summaryRowCells={summaryRowCells} tableElements={category.assets || []} isLoading={currencyRatesLoading}/>
                    <CustomAssetEditDialog customAsset={selectedAsset} open={assetDialogOpen} handleClose={onAssetDialogClose} categoryId={category.id}/>
                    <CategoryEditDialog category={category} open={categoryDialogOpen} handleClose={() => setCategoryDialogOpen(false)}/>

                    <ConfirmationDialog open={confirmationDialogOpen}
                                        cancelCallback={() => {
                                            setConfirmationDialogOpen(false);
                                            setAssetIdToDelete("");
                                        }}
                                        description={"Do you want to delete this asset?"}
                                        isProcessing={false}
                                        applyCallback={() => {
                                            setConfirmationDialogOpen(false);
                                            dispatch(deleteCategoryAsset({
                                                categoryId: category.id,
                                                assetId: assetIdToDelete
                                            }));
                                            setAssetIdToDelete("");
                                        }}
                    />
                </Paper>
            </Grid>
        </>
    );
}