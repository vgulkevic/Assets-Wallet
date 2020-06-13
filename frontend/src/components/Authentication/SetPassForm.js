import React, {useState} from 'react';

import {FormControl} from "@material-ui/core";

import CustomButton from "../../components/CustomButton";
import useStyles from "./LogInStyles";
import {useDispatch, useSelector} from 'react-redux';
import {AUTH_STORE_NAME, changePass} from "./redux/authSlice";
import SingleTextInput from "../Input/SingleTextInput";
import {enqueueSnackbar} from "../Notifier/notifierSlice";
import {Redirect} from "react-router-dom";


const SetPassForm = () => {
    const classes = useStyles();
    const dispatch = useDispatch();

    const {user, loading} = useSelector(state => state[AUTH_STORE_NAME]);
    const [showValidation, setShowValidation] = useState(false);

    const [pass, setPass] = useState("");
    const [passConfirm, setPassConfirm] = useState("");

    const validationRes = {
        pass: false,
        passConfirm: false
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setShowValidation(true);

        if (isFormValid()) {
            dispatch(changePass({user: user, password: pass}));
        }
    };

    const isFormValid = () => {
        const res = validationRes.pass && validationRes.passConfirm;

        if (res) {
            if (pass === passConfirm) {
                return true;
            } else {
                dispatch(enqueueSnackbar(
                    {
                        message: "Password doesn't match",
                        options: {
                            variant: 'error'
                        }
                    }
                ));
            }
        } else {
            return false;
        }
    }

    return (
        <>
            {!user ? <Redirect to={"/"}/> :
                <FormControl style={{width: "100%"}} className={classes.form} component="form" onSubmit={handleSubmit}>
                    <SingleTextInput
                        fullWidth
                        className={classes.input}
                        variant="outlined"
                        size="small"
                        label="Password"
                        type="password"
                        name={"password"}
                        margin="normal"
                        id={'pass'}
                        value={pass}
                        setter={setPass}
                        validate={showValidation}
                        validationRes={validationRes}
                        validationFailText={'Please enter your new password'}/>

                    <SingleTextInput
                        fullWidth
                        className={classes.input}
                        variant="outlined"
                        size="small"
                        label="Confirm Password"
                        type="password"
                        name={"password"}
                        margin="normal"
                        id={'passConfirm'}
                        value={passConfirm}
                        setter={setPassConfirm}
                        validate={showValidation}
                        validationRes={validationRes}
                        validationFailText={'Please confirm your new password'}/>

                    <CustomButton type="submit"
                                  fullWidth
                                  variant="contained"
                                  color="primary"
                                  style={{marginTop: 16, marginBottom: 16}}
                                  loading={loading}
                    >
                        Confirm
                    </CustomButton>
                </FormControl>
            }
        </>
    );
};

export default SetPassForm;
