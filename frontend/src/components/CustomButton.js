import React from 'react';

import Button from '@material-ui/core/Button';
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import {blue} from "@material-ui/core/colors";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(theme => ({
    buttonBorder: {
        border: '2px solid currentColor',
        "&:hover": {
            border: '2px solid currentColor',
        },
    },
    wrapper: {
        margin: theme.spacing(1),
        position: 'relative',
    },
    buttonProgress: {
        color: blue[500],
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12
    }
}));

const CustomButton = ({children, variant, loading, disabled, ...props}) => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Button variant={variant}
                    className={variant === "outlined" ? classes.buttonBorder : ""}
                    disabled={loading || disabled}
                    {...props} >
                {children}
            </Button>
            {loading && <CircularProgress size={24} className={classes.buttonProgress}/>}
        </div>
    );
};

export default CustomButton;
