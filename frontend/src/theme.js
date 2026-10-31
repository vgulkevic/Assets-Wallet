import {createTheme} from "@mui/material/styles";

const theme = createTheme({
    // light/dark/system choice is stored in localStorage by MUI
    cssVariables: {colorSchemeSelector: "class"},
    colorSchemes: {
        light: {
            palette: {
                primary: {main: "#1565c0"},
                background: {default: "#f4f6f9", paper: "#ffffff"}
            }
        },
        dark: {
            palette: {
                primary: {main: "#64b5f6"},
                background: {default: "#0f1318", paper: "#171c23"}
            }
        }
    },
    shape: {borderRadius: 12},
    typography: {
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        button: {textTransform: "none", fontWeight: 600},
        h4: {fontWeight: 700},
        h6: {fontWeight: 600}
    },
    components: {
        MuiCard: {
            defaultProps: {variant: "outlined"}
        },
        MuiTableCell: {
            styleOverrides: {
                root: {fontVariantNumeric: "tabular-nums"}
            }
        }
    }
});

export default theme;
