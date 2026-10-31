import React from "react";
import {useDispatch, useSelector} from "react-redux";
import Button from "@mui/material/Button";
import LogoutIcon from "@mui/icons-material/Logout";
import {AUTH_STORE_NAME, logout} from "./redux/authSlice";

export default function LogOutButton() {
    const {user} = useSelector(state => state[AUTH_STORE_NAME]);
    const dispatch = useDispatch();

    return (
        <Button color="inherit" startIcon={<LogoutIcon/>} onClick={() => dispatch(logout())}>
            Sign out{user ? ` (${user.username})` : ""}
        </Button>
    );
}
