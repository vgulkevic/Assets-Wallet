import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import React, {useEffect, useState} from "react";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import DialogActions from "@mui/material/DialogActions";
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import useMediaQuery from "@mui/material/useMediaQuery";
import CloseIcon from '@mui/icons-material/Close';
import {useTheme} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import globalStyles from "../../assets/globalStyles";
import SingleTextInput from "../Input/SingleTextInput";
import CustomButton from "../CustomButton";
import {CATEGORIES_STORE_NAME, createCategory} from "../AssetCategory/redux/categoriesSlice";
import {CUSTOM_CATEGORY} from "../AssetCategory/CategoryType";


export default function AddNewCategoryDialog({open, handleClose}) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const {classes: styles} = globalStyles();
    const dispatch = useDispatch();

    const {creating: creatingNewCategory} = useSelector(state => state[CATEGORIES_STORE_NAME]);

    const [showValidation, setShowValidation] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const [name, setName] = useState('');

    const validationRes = {
        name: false
    };

    useEffect(() => {
        if (!open) {
            setName('');
            setShowValidation(false);
            setInProgress(false);
        }
    }, [open]);

    useEffect(() => {
        if (inProgress && !creatingNewCategory) {
            handleClose();
        }
    }, [inProgress, creatingNewCategory, handleClose]);

    const isFormValid = () => {
        return validationRes.name;
    };

    const handleSaveButtonClick = () => {

        setShowValidation(true);

        if (isFormValid()) {
            setInProgress(true);
            dispatch(createCategory({
                payload: {
                    name: name,
                    categoryType: CUSTOM_CATEGORY
                }
            }));
        } else {
            console.log(validationRes);
            console.log("not valid");
        }
    };

    return (
        <>
            <Dialog
                fullWidth={true}
                fullScreen={fullScreen}
                open={open}
                onClose={() => handleClose()}
                maxWidth="sm"
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle className={styles.dialogTitle}>
                    {'Create Category'}
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
                                             validationFailText={'Please enter a category\'s name'}/>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions className={styles.dialogAction}>
                    <Grid container>
                        <CustomButton
                            variant="contained"
                            color="primary"
                            startIcon={<CloudOutlinedIcon/>}
                            onClick={handleSaveButtonClick}
                            loading={inProgress}
                        >
                            Save
                        </CustomButton>
                    </Grid>
                </DialogActions>
            </Dialog>
        </>
    );
}