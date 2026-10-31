import {createTheme} from "@mui/material/styles";
import {responsiveFontSizes as responsiveFontSizes} from "@mui/material/styles";
import {blue as blue} from "@mui/material/colors";
import {red as red} from "@mui/material/colors";
import {green} from "@mui/material/colors";


let theme = createTheme({
    palette: {
        primary: blue,
        green: green[400],
        red: red[400],
        background: {
            default: "#ECEFF1",
        },
    },
    typography: {
        button: {
            fontFamily: "'Open Sans', 'Roboto', 'Helvetica', 'Arial', sans-serif",
            textTransform: "none",
            fontWeight: 500,
        }
    },
});

theme = responsiveFontSizes(theme);

export default theme;