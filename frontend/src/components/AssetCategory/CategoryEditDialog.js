import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import React, {useEffect, useState} from "react";
import DialogContent from "@material-ui/core/DialogContent";
import Grid from "@material-ui/core/Grid";
import DialogActions from "@material-ui/core/DialogActions";
import CustomButton from "../CustomButton";
import CloudOutlinedIcon from '@material-ui/icons/CloudOutlined';
import useMediaQuery from "@material-ui/core/useMediaQuery";
import globalStyles from "../../assets/globalStyles";
import CloseIcon from '@material-ui/icons/Close';
import {useTheme} from "@material-ui/core";
import SingleTextInput from "../Input/SingleTextInput";
import {useDispatch, useSelector} from "react-redux";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from '@material-ui/icons/Delete';
import ConfirmationDialog from "../ConfirmationDialog";
import {CATEGORIES_STORE_NAME, deleteCategory, updateCategory} from "./redux/categoriesSlice";
import {API_CATEGORY, AVAILABLE_SERVICE_INTEGRATIONS, BINANCE_API_INTEGRATION, BITTREX_API_INTEGRATION, CUSTOM_CATEGORY, KRAKEN_API_INTEGRATION, STARLING_BANK_API_INTEGRATION} from "./CategoryType";
import SelectWithOneChoosableOption from "../Input/SelectWithOneChoosableOption";

export default function CategoryEditDialog({open, handleClose, category}) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const styles = globalStyles();
    const dispatch = useDispatch();

    const {updating: updatingCategory, deleting: deletingCategory} = useSelector(state => state[CATEGORIES_STORE_NAME]);

    const [showValidation, setShowValidation] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const [name, setName] = useState('');
    const [categoryType, setCategoryType] = useState('');

    const [integrationService, setIntegrationService] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [apiKeySecret, setApiKeySecret] = useState('');

    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

    const validationRes = {
        name: false,
        categoryType: false,
        apiKey: false,
        apiKeySecret: false,
        integrationService: false
    };

    useEffect(() => {
        if (!open) {
            setName('');
            setCategoryType('');
            setIntegrationService('');
            setApiKey('');
            setApiKeySecret('');
            setShowValidation(false);
            setInProgress(false);
        } else {
            if (category) {
                setName(category.name);
                setCategoryType(category.categoryType);

                if (category.categoryType === API_CATEGORY) {
                    setIntegrationService(category.integrationService);
                    setApiKey(category.apiKey);
                    setApiKeySecret(category.apiKeySecret);
                }
            }
        }
    }, [open, category]);

    useEffect(() => {
        if (inProgress && !updatingCategory && !deletingCategory) {
            handleClose();
        }
    }, [inProgress, updatingCategory, deletingCategory, handleClose]);

    const isFormValid = () => {
        if (categoryType === CUSTOM_CATEGORY) {
            return validationRes.name && validationRes.categoryType;
        } else {
            if (integrationService === STARLING_BANK_API_INTEGRATION) {
                return validationRes.name && validationRes.categoryType && validationRes.apiKey && validationRes.integrationService;
            }

            if (integrationService === BITTREX_API_INTEGRATION || integrationService === KRAKEN_API_INTEGRATION || integrationService === BINANCE_API_INTEGRATION) {
                return validationRes.name && validationRes.categoryType && validationRes.apiKey && validationRes.integrationService && validationRes.apiKeySecret;
            }
        }
    };

    const handleSaveButtonClick = () => {

        setShowValidation(true);

        if (isFormValid()) {
            setInProgress(true);

            let payload = {
                id: category.id,
                name: name,
                categoryType: categoryType,
                integrationService: integrationService
            }

            if (category.categoryType === API_CATEGORY) {
                if (apiKey !== category.apiKey) {
                    payload.apiKey = apiKey;
                }

                if (apiKeySecret !== category.apiKey) {
                    payload.apiKeySecret = apiKeySecret;
                }
            }

            dispatch(updateCategory({
                payload: payload
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
                        <Grid item xs={12}>
                            <SingleTextInput label="Name"
                                             id={'name'}
                                             value={name}
                                             setter={setName}
                                             validate={showValidation}
                                             validationRes={validationRes}
                                             validationFailText={'Please enter a category\'s name'}/>
                        </Grid>

                        {
                            categoryType === CUSTOM_CATEGORY &&
                            <Grid item xs={12}>
                                <SelectWithOneChoosableOption label={"Category type"}
                                                              id={'categoryType'}
                                                              options={[
                                                                  {
                                                                      id: CUSTOM_CATEGORY,
                                                                      name: "Custom category"
                                                                  }
                                                              ]}
                                                              value={categoryType}
                                                              validate={showValidation}
                                                              validationRes={validationRes}
                                                              setter={(val) => {
                                                                  setCategoryType(val);
                                                              }}
                                                              disabled
                                />
                            </Grid>
                        }

                        {
                            categoryType === API_CATEGORY &&
                            <Grid item xs={12}>
                                <SelectWithOneChoosableOption label={"Category type"}
                                                              id={'categoryType'}
                                                              options={[
                                                                  {
                                                                      id: API_CATEGORY,
                                                                      name: "Service integration"
                                                                  }
                                                              ]}
                                                              value={categoryType}
                                                              validate={showValidation}
                                                              validationRes={validationRes}
                                                              setter={(val) => {
                                                                  setCategoryType(val);
                                                              }}
                                                              disabled
                                />
                            </Grid>
                        }

                        {
                            categoryType === API_CATEGORY && <>
                                <Grid item xs={12}>
                                    <SelectWithOneChoosableOption label={"Service"}
                                                                  id={'integrationService'}
                                                                  options={AVAILABLE_SERVICE_INTEGRATIONS}
                                                                  value={integrationService}
                                                                  validate={showValidation}
                                                                  validationRes={validationRes}
                                                                  setter={(val) => {
                                                                      setIntegrationService(val);
                                                                  }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <SingleTextInput label="API key"
                                                     id={'apiKey'}
                                                     value={apiKey}
                                                     setter={setApiKey}
                                                     validate={showValidation}
                                                     validationRes={validationRes}
                                                     validationFailText={'Please enter an API key'}/>
                                </Grid>

                                {
                                    (integrationService === BITTREX_API_INTEGRATION ||
                                        integrationService === KRAKEN_API_INTEGRATION ||
                                            integrationService === BINANCE_API_INTEGRATION
                                    ) && <>

                                        <Grid item xs={12}>
                                            <SingleTextInput label="API key secret"
                                                             id={'apiKeySecret'}
                                                             value={apiKeySecret}
                                                             setter={setApiKeySecret}
                                                             validate={showValidation}
                                                             validationRes={validationRes}
                                                             validationFailText={'Please enter an API key secret'}/>
                                        </Grid>

                                        </>
                                }
                            </>
                        }

                        <Grid item xs={12}>
                            <Typography component="span" variant="body1">
                                No. of assets: {category.assets.length}
                            </Typography>
                        </Grid>

                    </Grid>
                </DialogContent>
                <DialogActions className={styles.dialogAction}>
                    <Grid container justify="space-between">
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