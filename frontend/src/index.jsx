import React from "react";
import {createRoot} from "react-dom/client";
import {Provider} from "react-redux";
import {ThemeProvider} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {SnackbarProvider} from "notistack";
import App from "./App";
import {store} from "./store";
import theme from "./theme";

createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemeProvider theme={theme} defaultMode="system">
                <CssBaseline enableColorScheme/>
                <SnackbarProvider maxSnack={4} autoHideDuration={4000} anchorOrigin={{vertical: "bottom", horizontal: "center"}}>
                    <App/>
                </SnackbarProvider>
            </ThemeProvider>
        </Provider>
    </React.StrictMode>
);
