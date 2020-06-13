import React, {useState} from 'react';

import {FormControl, TextField} from "@material-ui/core";

import CustomButton from "../../components/CustomButton";
import useStyles from "./LogInStyles";
import {useDispatch, useSelector} from 'react-redux';
import {AUTH_STORE_NAME, login} from "./redux/authSlice";
import {Redirect} from "react-router-dom";


const LogInForm = () => {
    const {loading, changePassRequired} = useSelector(state => state[AUTH_STORE_NAME]);

    const classes = useStyles();
    const dispatch = useDispatch();

    const [logIn, setLogIn] = useState({username: "", password: ""});

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(login(logIn));
    };

    return (
        <>
            {changePassRequired ? <Redirect to={"/set-pass"}/> :
                <FormControl style={{width: "100%"}} className={classes.form} component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        className={classes.input}
                        variant="outlined"
                        size="small"
                        label="Login"
                        type="text"
                        name={"login"}
                        value={logIn.username}
                        onChange={(e) => setLogIn({...logIn, username: e.target.value})}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        className={classes.input}
                        variant="outlined"
                        size="small"
                        label="Password"
                        type="password"
                        name={"password"}
                        value={logIn.password}
                        onChange={(e) => setLogIn({...logIn, password: e.target.value})}
                        margin="normal"
                    />
                    <CustomButton type="submit"
                                  fullWidth
                                  variant="contained"
                                  color="primary"
                                  style={{marginTop: 16, marginBottom: 16}}
                                  loading={loading}
                    >
                        Sign in
                    </CustomButton>
                </FormControl>
            }
        </>
    );
};

export default LogInForm;
