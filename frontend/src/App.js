import React, {useEffect} from 'react';
import Main from "./components/Main";
import theme from "./utils/theme";
import {MuiThemeProvider} from '@material-ui/core/styles';
import {SnackbarProvider} from "notistack";
import useGlobalStyles from "./assets/globalStyles";
import configureAmplify from "./components/Authentication/AmplifyConfig";
import {CssBaseline} from "@material-ui/core";

function App() {
    const classes = useGlobalStyles();

    useEffect(() => {
        configureAmplify();
    }, []);

    return (
        <MuiThemeProvider theme={theme}>
            <SnackbarProvider maxSnack={5}
                              anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                              classes={{variantSuccess: classes.success, variantError: classes.error}}>
                <CssBaseline/>
                <Main/>
            </SnackbarProvider>
        </MuiThemeProvider>
    );
}

export default App;
