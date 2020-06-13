import makeStyles from "@material-ui/core/styles/makeStyles";

const useGlobalStyles = makeStyles(theme => ({
    success: {
        borderRadius: 0,
    },
    error: {
        borderRadius: 0,
    },
    closeDialogButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
    dialogContent: {
        padding: theme.spacing(1, 5),
    },
    dialogTitle: {
        padding: theme.spacing(5, 5, 0),
    },
    dialogAction: {
        padding: theme.spacing(1, 5, 8),
    }
}));

export default useGlobalStyles;