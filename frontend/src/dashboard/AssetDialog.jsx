import React, {useState} from "react";
import {enqueueSnackbar} from "notistack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import {useCreateAssetMutation, useDeleteAssetMutation, useUpdateAssetMutation} from "../api/assetManagerApi";
import {isSupportedCurrency, SUPPORTED_CURRENCIES} from "../utils/currencies";
import ConfirmDialog from "../common/ConfirmDialog";
import AssetHistoryPanel from "./AssetHistoryPanel";

const isValidAmount = (value) => /^-?\d+(\.\d+)?$/.test(value.trim());

// Rendered only while open (see CategoryCard), so the form starts from `asset` every time.
export default function AssetDialog({categoryId, asset, defaultCurrency, onClose}) {
    const isEdit = Boolean(asset);
    const fullScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));

    const [name, setName] = useState(asset?.name ?? "");
    const [amount, setAmount] = useState(asset?.amount ?? "");
    const [currency, setCurrency] = useState(asset && isSupportedCurrency(asset.currency) ? asset.currency : defaultCurrency);
    const [submitted, setSubmitted] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [tab, setTab] = useState("details");

    const [createAsset, {isLoading: creating}] = useCreateAssetMutation();
    const [updateAsset, {isLoading: updating}] = useUpdateAssetMutation();
    const [deleteAsset, {isLoading: deleting}] = useDeleteAssetMutation();

    const nameError = submitted && !name.trim();
    const amountError = submitted && !isValidAmount(String(amount));

    const save = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        if (!name.trim() || !isValidAmount(String(amount))) {
            return;
        }

        const values = {name: name.trim(), amount: String(amount).trim(), currency};
        try {
            if (isEdit) {
                await updateAsset({categoryId, asset: {...values, id: asset.id}}).unwrap();
            } else {
                await createAsset({categoryId, asset: values}).unwrap();
            }
            enqueueSnackbar(isEdit ? "Asset updated" : "Asset added", {variant: "success"});
            onClose();
        } catch {
            // the API error middleware already shows a snackbar
        }
    };

    const remove = async () => {
        try {
            await deleteAsset({categoryId, assetId: asset.id}).unwrap();
            enqueueSnackbar("Asset deleted", {variant: "success"});
            onClose();
        } catch {
            setConfirmDelete(false);
        }
    };

    return (
        <>
            <Dialog open onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth={isEdit ? "sm" : "xs"}
                    slotProps={{paper: {component: "form", onSubmit: save, noValidate: true}}}>
                <DialogTitle sx={isEdit ? {pb: 0} : undefined}>{isEdit ? asset.name : "Add asset"}</DialogTitle>
                {isEdit &&
                    <Tabs value={tab} onChange={(e, value) => setTab(value)} sx={{px: 3, borderBottom: 1, borderColor: "divider"}}>
                        <Tab value="details" label="Details"/>
                        <Tab value="history" label="History"/>
                    </Tabs>}
                <DialogContent sx={isEdit ? {minHeight: 320} : undefined}>
                    {tab === "history" && <Box sx={{pt: 2}}><AssetHistoryPanel assetId={asset.id}/></Box>}
                    <Stack spacing={2} sx={{pt: isEdit ? 3 : 1, display: tab === "details" ? undefined : "none"}}>
                        <TextField label="Name" autoFocus fullWidth value={name} onChange={(e) => setName(e.target.value)}
                                   error={nameError} helperText={nameError ? "Enter a name" : " "}/>
                        <Stack direction="row" spacing={1.5}>
                            <TextField label="Amount" fullWidth value={amount} onChange={(e) => setAmount(e.target.value)}
                                       error={amountError} helperText={amountError ? "Enter a number, e.g. 1250.50" : " "}
                                       slotProps={{htmlInput: {inputMode: "decimal"}}}/>
                            <TextField select label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)}
                                       sx={{minWidth: 120}} helperText=" ">
                                {SUPPORTED_CURRENCIES.map((option) => <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>)}
                            </TextField>
                        </Stack>
                        {asset && !isSupportedCurrency(asset.currency) &&
                            <Typography variant="caption" sx={{color: "warning.main"}}>
                                This asset was saved in {asset.currency}, which is no longer offered. Pick a currency to save it.
                            </Typography>}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{px: 3, pb: 2}}>
                    {isEdit && <Button color="error" onClick={() => setConfirmDelete(true)} sx={{mr: "auto"}}>Delete</Button>}
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" loading={creating || updating} disabled={tab !== "details"}>Save</Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog open={confirmDelete} title="Delete asset?" busy={deleting}
                           description={`"${asset?.name}" will be removed from this category.`}
                           onConfirm={remove} onCancel={() => setConfirmDelete(false)}/>
        </>
    );
}
