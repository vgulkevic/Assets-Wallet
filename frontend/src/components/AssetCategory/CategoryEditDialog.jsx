import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import React, {useEffect, useState} from "react";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import DialogActions from "@mui/material/DialogActions";
import CustomButton from "../CustomButton";
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import useMediaQuery from "@mui/material/useMediaQuery";
import globalStyles from "../../assets/globalStyles";
import CloseIcon from '@mui/icons-material/Close';
import {useTheme} from "@mui/material";
import SingleTextInput from "../Input/SingleTextInput";
import {useDispatch, useSelector} from "react-redux";
import Typography from "@mui/material/Typography";
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationDialog from "../ConfirmationDialog";
import {CATEGORIES_STORE_NAME, deleteCategory, updateCategory} from "./redux/categoriesSlice";

export default function CategoryEditDialog({open, handleClose, category}) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const {classes: styles} = globalStyles();
    const dispatch = useDispatch();

    const {updating: updatingCategory, deleting: deletingCategory} = useSelector(state => state[CATEGORIES_STORE_NAME]);

    const [showValidation, setShowValidation] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const [name, setName] = useState('');

    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

    const validationRes = {
        name: false
    };

    useEffect(() => {
        if (!open) {
            setName('');
            setShowValidation(false);
            setInProgress(false);
        } else {
            if (category) {
                setName(category.name);
            }
        }
    }, [open, category]);

    useEffect(() => {
        if (inProgress && !updatingCategory && !deletingCategory) {
            handleClose();
        }
    }, [inProgress, updatingCategory, deletingCategory, handleClose]);

    const isFormValid = () => {
        return validationRes.name;
    };

    const handleSaveButtonClick = () => {

        setShowValidation(true);

        if (isFormValid()) {
            setInProgress(true);

            dispatch(updateCategory({
                payload: {
                    id: category.id,
                    name: name,
                    categoryType: category.categoryType
                }
            }));
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
                    {'Update Category'}
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


                        <Grid size={12}>
                            <Typography component="span" variant="body1">
                                No. of assets: {category.assets.length}
                            </Typography>
                        </Grid>

                    </Grid>
                </DialogContent>
                <DialogActions className={styles.dialogAction}>
                    <Grid sx={{justifyContent: "space-between"}} container>
                        <CustomButton
                            variant="contained"
                            color="secondary"
                            startIcon={<DeleteIcon/>}
                            onClick={() => setConfirmationDialogOpen(true)}
                            loading={inProgress}
                        >
                            Delete
                        </CustomButton>

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

            <ConfirmationDialog open={confirmationDialogOpen}
                                cancelCallback={()=>setConfirmationDialogOpen(false)}
                                description={"Do you want to delete this category?"}
                                isProcessing={false}
                                applyCallback={() => {
                                    setConfirmationDialogOpen(false);
                                    setInProgress(true);
                                    dispatch(deleteCategory(category.id));
                                }}
            />
        </>
    );
}