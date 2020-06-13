import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import React, {useEffect, useState} from "react";
import DialogContent from "@material-ui/core/DialogContent";
import Grid from "@material-ui/core/Grid";
import DialogActions from "@material-ui/core/DialogActions";
import CloudOutlinedIcon from '@material-ui/icons/CloudOutlined';
import useMediaQuery from "@material-ui/core/useMediaQuery";
import CloseIcon from '@material-ui/icons/Close';
import {useTheme} from "@material-ui/core";
import {useDispatch, useSelector} from "react-redux";
import globalStyles from "../../assets/globalStyles";
import SingleTextInput from "../Input/SingleTextInput";
import CustomButton from "../CustomButton";
import SelectWithOneChoosableOption from "../Input/SelectWithOneChoosableOption";
import {CATEGORIES_STORE_NAME, createCategory} from "../AssetCategory/redux/categoriesSlice";
import {API_CATEGORY, AVAILABLE_CATEGORY_TYPES, AVAILABLE_SERVICE_INTEGRATIONS, BINANCE_API_INTEGRATION, BITTREX_API_INTEGRATION, KRAKEN_API_INTEGRATION, STARLING_BANK_API_INTEGRATION} from "../AssetCategory/CategoryType";


export default function AddNewCategoryDialog({open, handleClose}) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const styles = globalStyles();
    const dispatch = useDispatch();

    const {creating: creatingNewCategory} = useSelector(state => state[CATEGORIES_STORE_NAME]);

    const [showValidation, setShowValidation] = useState(false);
    const [inProgress, setInProgress] = useState(false);
    const [name, setName] = useState('');
    const [categoryType, setCategoryType] = useState('CUSTOM_CATEGORY');

    const [integrationService, setIntegrationService] = useState('');
    const [apiKey, setApiKey] = useState("");
    const [apiKeySecret, setApiKeySecret] = useState("");

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
            setCategoryType('CUSTOM_CATEGORY');
            setIntegrationService('');
            setApiKey('');
            setApiKeySecret('');
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
        if (categoryType === 'CUSTOM_CATEGORY') {
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
            dispatch(createCategory({
                payload: {
                    name: name,
                    categoryType: categoryType,
                    integrationService: integrationService,
                    apiKey: apiKey,
                    apiKeySecret: apiKeySecret
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
                        <Grid item xs={12}>
                            <SingleTextInput label="Name"
                                             id={'name'}
                                             value={name}
                                             setter={setName}
                                             validate={showValidation}
                                             validationRes={validationRes}
                                             validationFailText={'Please enter a category\'s name'}/>
                        </Grid>

                        <Grid item xs={12}>
                            <SelectWithOneChoosableOption label={"Category type"}
                                                          id={'categoryType'}
                                                          options={AVAILABLE_CATEGORY_TYPES}
                                                          value={categoryType}
                                                          validate={showValidation}
                                                          validationRes={validationRes}
                                                          setter={(val) => {
                                                              setCategoryType(val);
                                                          }}
                            />
                        </Grid>

                        {
                            categoryType === API_CATEGORY &&
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
                        }

                        {
                            categoryType === API_CATEGORY &&
                            <Grid item xs={12}>
                                <SingleTextInput label="API key"
                                                 id={'apiKey'}
                                                 value={apiKey}
                                                 setter={setApiKey}
                                                 validate={showValidation}
                                                 validationRes={validationRes}
                                                 validationFailText={'Please enter an API key'}/>
                            </Grid>
                        }

                        {
                            categoryType === API_CATEGORY && (integrationService === BITTREX_API_INTEGRATION || integrationService === KRAKEN_API_INTEGRATION || integrationService === BINANCE_API_INTEGRATION) &&
                            <Grid item xs={12}>
                                <SingleTextInput label="API key secret"
                                                 id={'apiKeySecret'}
                                                 value={apiKeySecret}
                                                 setter={setApiKeySecret}
                                                 validate={showValidation}
                                                 validationRes={validationRes}
                                                 validationFailText={'Please enter an API key secret'}/>
                            </Grid>
                        }

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