import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import React, {useEffect, useState} from "react";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import DialogActions from "@mui/material/DialogActions";
import CustomButton from "../../CustomButton";
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import useMediaQuery from "@mui/material/useMediaQuery";
import globalStyles from "../../../assets/globalStyles";
import CloseIcon from '@mui/icons-material/Close';
import {useTheme} from "@mui/material";
import SingleTextInput from "../../Input/SingleTextInput";
import BaseCurrencyPicker from "../../Input/BaseCurrencyPicker";
import {useDispatch, useSelector} from "react-redux";
import {createCategoryAsset, CUSTOM_CATEGORY_ASSET_STORE_NAME, updateCategoryAsset} from "./redux/customCategoryAssetSlice";

export default function CustomAssetEditDialog({open, handleClose, customAsset, categoryId}) {
    const isEdit = customAsset != null;
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const {classes: styles} = globalStyles();
    const dispatch = useDispatch();

    const {updating: updatingAsset, creating: creatingAsset} = useSelector(state => state[CUSTOM_CATEGORY_ASSET_STORE_NAME]);

    const [showValidation, setShowValidation] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('');
    const validationRes = {
        name: false,
        amount: false,
        currency: false
    };

    useEffect(() => {
        if (!open) {
            setName('');
            setAmount('');
            setCurrency('');
            setShowValidation(false);
            setInProgress(false);
        }
    }, [open]);

    useEffect(() => {
        if (customAsset) {
            console.log(customAsset);
            setName(customAsset.name);
            setAmount(customAsset.amount);
            setCurrency(customAsset.currency);
        }
    }, [customAsset]);

    useEffect(() => {
        if (inProgress && !updatingAsset && !creatingAsset) {
            handleClose();
        }
    }, [inProgress, updatingAsset, creatingAsset, handleClose]);

    const isFormValid = () => {
        return validationRes.name && validationRes.amount && validationRes.currency;
    };

    const handleSaveButtonClick = () => {

        setShowValidation(true);

        if (isFormValid()) {
            if (isEdit) {
                setInProgress(true);
                dispatch(updateCategoryAsset({
                    payload: {
                        categoryId: categoryId,
                        asset: {
                            id: customAsset.id,
                            name: name,
                            amount: amount,
                            currency: currency
                        }
                    }
                }));
            } else {
                setInProgress(true);
                dispatch(createCategoryAsset({
                    payload: {
                        categoryId: categoryId,
                        asset: {
                            name: name,
                            amount: amount,
                            currency
                        }
                    }
                }));
            }
        }
    };

    return (
        <Dialog
            fullWidth={true}
            fullScreen={fullScreen}
            open={open}
            onClose={() => handleClose()}
            maxWidth="sm"
            aria-labelledby="responsive-dialog-title"
        >
            <DialogTitle className={styles.dialogTitle}>
                {isEdit ? 'Update Asset' : 'New Asset'}
                <IconButton aria-label="close" className={styles.closeDialogButton} onClick={() => handleClose()}>
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>

            <DialogContent className={styles.dialogContent}>
                <Grid container direction="row" spacing={2}>
                    <Grid size={12}>
                        <SingleTextInput label="Name"
                                         id={'name'}
                                         value={name}
                                         setter={setName}
                                         validate={showValidation}
                                         validationRes={validationRes}
                                         validationFailText={'Please enter an asset\'s name'}/>
                    </Grid>

                    <Grid size={12}>
                        <SingleTextInput label="Amount"
                                         id={'amount'}
                                         value={amount}
                                         setter={(val) => {
                                             setAmount(val.replace(/\D/, ''));
                                         }}
                                         validate={showValidation}
                                         validationRes={validationRes}
                                         validationFailText={'Please enter an asset\'s amount'}/>
                    </Grid>

                    <Grid size={12}>
                        <BaseCurrencyPicker label="Currency"
                                            id="currency"
                                            value={currency}
                                            setter={setCurrency}
                                            validate={showValidation}
                                            validationRes={validationRes}
                                            validationFailText={'Please select a currency'}
                        />
                    </Grid>

                </Grid>
            </DialogContent>
            <DialogActions className={styles.dialogAction}>
                <CustomButton
                    variant="contained"
                    color="primary"
                    startIcon={<CloudOutlinedIcon/>}
                    onClick={handleSaveButtonClick}
                    loading={inProgress}
                >
                    {isEdit ? 'Save' : 'Create'}
                </CustomButton>
            </DialogActions>
        </Dialog>
    );
}