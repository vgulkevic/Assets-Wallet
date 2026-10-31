import {createSlice} from "@reduxjs/toolkit";

// // Example:
// const yourMessage = "Error";
// // Optional key if you want to add an option for the user to Dismiss the snackbar
// const key = new Date().getTime() + Math.random();
// // Use asyncDispatch middleware in slice's reducer that is included in the `action` arg
// action.asyncDispatch(enqueueSnackbar(
//     {
//         message: yourMessage,
//         options: {
//             key: key,
//             variant: 'error',
//             // Optional
//             action: key => (
//                 <Button onClick={() => action.asyncDispatch(notifierSlice.actions.closeSnackbar({key: key}))}>dismiss me</Button>
//             ),
//         }
//     }
// ));

const notifierSlice = createSlice({
    name: 'notifier',
    initialState: {
        notifications: []
    },
    reducers: {
        enqueueSnackbar: (state, action) => {
            const payload = action.payload;

            const key = payload.options && payload.options.key;
            const notification = {
                ...payload,
                key: key || new Date().getTime() + Math.random(),
            };

            state.notifications = [...state.notifications, notification];
        },

        closeSnackbar: (state, action) => {
            const payload = action.payload;
            const key = payload.key;
            const dismissAll = payload.key;

            state.notifications = state.notifications.map(notification => (
                (dismissAll || notification.key === key)
                    ? {...notification, dismissed: true}
                    : {...notification}
            ));
        },

        removeSnackbar: (state, action) => {
            const payload = action.payload;
            const key = payload.key;

            state.notifications = state.notifications.filter(
                notification => notification.key !== key
            );
        }
    }
});

const NOTIFIER_STORE_NAME = "notifications";
const {enqueueSnackbar} = notifierSlice.actions
const notifierReducer = notifierSlice.reducer;

export {NOTIFIER_STORE_NAME, notifierReducer, notifierSlice, enqueueSnackbar};
