import {createMuiTheme} from "@material-ui/core/styles";
import responsiveFontSizes from "@material-ui/core/styles/responsiveFontSizes";
import blue from '@material-ui/core/colors/blue';
import red from "@material-ui/core/colors/red";
import {green} from "@material-ui/core/colors";


let theme = createMuiTheme({
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