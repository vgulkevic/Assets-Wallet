import React, {useEffect} from 'react';
import {useDispatch} from "react-redux";
import Main from "./components/Main";
import theme from "./utils/theme";
import {ThemeProvider} from '@mui/material/styles';
import {styled} from "@mui/material/styles";
import {MaterialDesignContent, SnackbarProvider} from "notistack";
import configureAmplify from "./components/Authentication/AmplifyConfig";
import {restoreSession} from "./components/Authentication/redux/authSlice";
import {CssBaseline} from "@mui/material";

// square snackbars, as in the original design
const SquareSnackbar = styled(MaterialDesignContent)({
    '&.notistack-MuiContent': {
        borderRadius: 0,
    },
});

configureAmplify();

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(restoreSession());
    }, [dispatch]);

    return (
        <ThemeProvider theme={theme}>
            <SnackbarProvider maxSnack={5}
                              anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                              Components={{success: SquareSnackbar, error: SquareSnackbar}}>
                <CssBaseline/>
                <Main/>
            </SnackbarProvider>
        </ThemeProvider>
    );
}

export default App;
