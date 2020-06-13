import {makeStyles} from "@material-ui/core/styles";
import {darken} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  rowHover : {},
  rowGrey: {},
  rowWhite: {},
  table: {
    border: "none",
    "& tbody":{
      "& $rowGrey": {backgroundColor: "rgba(236, 236, 236, .5)"},
      "& $rowHover, $rowWhite": {
        position: "relative",
        transition: "all .3s ease-in-out",
        "&:hover": {
          background: darken("#F2F9FF", 0.05),
          boxShadow: "0px 10px 20px -7px #000",
        },
      },
      "& tr": {
        backgroundColor: "rgba(255, 255, 255, .5)",
        cursor: "pointer",
        "& td":{
          borderBottom: "none",
        },
      },
    }
  },
  footer: {
    position: "absolute",
    padding: theme.spacing(0, 9),
    bottom: 0,
    right: 0,
    left: 240,
    backgroundColor: theme.palette.common.white,
    boxShadow: "0px 2px 20px rgba(68, 72, 79, 0.1)",
    [theme.breakpoints.down("xs")]: {
      left: 0,
    },
  },
  spacer: { flex: 0},
  tableCellFirst:{
    paddingLeft: theme.spacing(5),
  },
  tableCell: {
    borderBottom: "none"
  },
  sortLabel: {
    color: "rgba(0, 0, 0, 0.54)",
    "&:hover": {
      color: "rgba(0, 0, 0, 0.87)",
    },
    "& $icon": {
      opacity: 1,
    },
  },
  icon: {},
  root: {
    display: "flex",
    flex: 1,
    justifyContent: "flex-end",
    marginLeft: theme.spacing(2.5),
  },
  paginat: {
    listStyle: "none",
    display: "flex",
    alignItems: "center",
    padding: 0,
    margin: 0,
  },
  pageItem: {
    cursor: "pointer",
    textAlign: "center",
    borderRadius: "50%",
    margin: theme.spacing(0, .5),
    "& a": {
      lineHeight: "initial",
      padding: theme.spacing(1, .9),
      "&:focus": {
        outline: "none",
      },
    }
  },
  active: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  }
}));

export default useStyles;