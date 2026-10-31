import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useColorScheme} from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsBrightnessOutlinedIcon from "@mui/icons-material/SettingsBrightnessOutlined";
import {logout, selectAuth} from "../auth/authSlice";

const NEXT_MODE = {system: "light", light: "dark", dark: "system"};
const MODE_ICONS = {
    system: <SettingsBrightnessOutlinedIcon/>,
    light: <LightModeOutlinedIcon/>,
    dark: <DarkModeOutlinedIcon/>
};

export default function TopBar() {
    const dispatch = useDispatch();
    const {user} = useSelector(selectAuth);
    const {mode, setMode} = useColorScheme();
    const [menuAnchor, setMenuAnchor] = useState(null);
    const currentMode = mode || "system";

    return (
        <AppBar position="sticky" color="inherit" elevation={0} sx={{borderBottom: 1, borderColor: "divider"}}>
            <Toolbar>
                <AccountBalanceWalletOutlinedIcon color="primary" sx={{mr: 1.5}}/>
                <Typography variant="h6" component="h1" sx={{flexGrow: 1}}>Assets Wallet</Typography>

                <Tooltip title={`Theme: ${currentMode}`}>
                    <IconButton onClick={() => setMode(NEXT_MODE[currentMode])} aria-label={`Theme: ${currentMode}, click to change`}>
                        {MODE_ICONS[currentMode]}
                    </IconButton>
                </Tooltip>

                <Tooltip title="Account">
                    <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Account menu" edge="end">
                        <AccountCircleOutlinedIcon/>
                    </IconButton>
                </Tooltip>
                <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
                      anchorOrigin={{vertical: "bottom", horizontal: "right"}} transformOrigin={{vertical: "top", horizontal: "right"}}>
                    <Box sx={{px: 2, py: 1}}>
                        <Typography variant="caption" color="textSecondary">Signed in as</Typography>
                        <Typography variant="body2" sx={{fontWeight: 600}}>{user?.username}</Typography>
                    </Box>
                    <Divider/>
                    <MenuItem onClick={() => dispatch(logout())}>
                        <ListItemIcon><LogoutIcon fontSize="small"/></ListItemIcon>
                        Sign out
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}
