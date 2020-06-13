import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
    backgroundColor: "#ECEFF1",
  },
  container: {
    overflow: 'auto',
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: theme.spacing(5),
  },
  logo: {
    width: 70,
  },
  form: {
    margin: theme.spacing(2, 0),
    maxWidth: 320,
    width:"100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  input: {
    width: "100%",
    backgroundColor: theme.palette.common.white,
  },
  forgotPass: {
    marginBottom: theme.spacing(1),
    "&:hover":{
      textDecoration: "underline",
    },
  },
}));

export default useStyles;