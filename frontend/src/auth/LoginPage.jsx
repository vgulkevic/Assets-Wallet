import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {enqueueSnackbar} from "notistack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import {login, selectAuth, setNewPassword} from "./authSlice";

export default function LoginPage() {
    const {changePassRequired} = useSelector(selectAuth);

    return (
        <Box sx={{display: "grid", placeItems: "center", minHeight: "100vh", px: 2}}>
            <Card sx={{width: "100%", maxWidth: 400}}>
                <CardContent sx={{p: 4}}>
                    <Stack spacing={1} sx={{alignItems: "center", mb: 3}}>
                        <AccountBalanceWalletOutlinedIcon color="primary" sx={{fontSize: 44}}/>
                        <Typography variant="h5" component="h1" sx={{fontWeight: 700}}>Assets Wallet</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {changePassRequired ? "Choose a new password to finish signing in" : "Sign in to see your assets"}
                        </Typography>
                    </Stack>
                    {changePassRequired ? <NewPasswordForm/> : <SignInForm/>}
                </CardContent>
            </Card>
        </Box>
    );
}

function useSubmit(action) {
    const dispatch = useDispatch();
    const [busy, setBusy] = useState(false);

    const submit = async (arg) => {
        setBusy(true);
        try {
            await dispatch(action(arg)).unwrap();
        } catch (e) {
            enqueueSnackbar(e.message, {variant: "error"});
        } finally {
            setBusy(false);
        }
    };

    return [submit, busy];
}

function SignInForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [submit, busy] = useSubmit(login);

    return (
        <Stack component="form" spacing={2} onSubmit={(e) => {
            e.preventDefault();
            submit({username, password});
        }}>
            <TextField label="Username" autoComplete="username" autoFocus required fullWidth
                       value={username} onChange={(e) => setUsername(e.target.value)}/>
            <TextField label="Password" type="password" autoComplete="current-password" required fullWidth
                       value={password} onChange={(e) => setPassword(e.target.value)}/>
            <Button type="submit" variant="contained" size="large" loading={busy}>Sign in</Button>
        </Stack>
    );
}

function NewPasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [submit, busy] = useSubmit(setNewPassword);
    const mismatch = confirmation !== "" && password !== confirmation;

    return (
        <Stack component="form" spacing={2} onSubmit={(e) => {
            e.preventDefault();
            if (!mismatch) {
                submit(password);
            }
        }}>
            <TextField label="New password" type="password" autoComplete="new-password" autoFocus required fullWidth
                       value={password} onChange={(e) => setPassword(e.target.value)}/>
            <TextField label="Confirm new password" type="password" autoComplete="new-password" required fullWidth
                       value={confirmation} onChange={(e) => setConfirmation(e.target.value)}
                       error={mismatch} helperText={mismatch ? "Passwords don't match" : " "}/>
            <Button type="submit" variant="contained" size="large" loading={busy} disabled={mismatch}>Set password</Button>
        </Stack>
    );
}
