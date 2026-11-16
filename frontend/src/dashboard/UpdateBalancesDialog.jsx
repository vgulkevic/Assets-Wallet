import React, {Fragment, useMemo, useRef, useState} from "react";
import {enqueueSnackbar} from "notistack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import {useUpdateAssetsMutation} from "../api/assetManagerApi";
import ConfirmDialog from "../common/ConfirmDialog";
import {convertCurrency, sum} from "../utils/money";
import {isStale, timeAgo} from "../utils/time";
import {useBalancesVisibility} from "./balancesVisibility";

const isValidAmount = (value) => /^-?\d+(\.\d+)?$/.test(value.trim());

// "1500" and "1500.00" are the same balance
const isSameAmount = (value, amount) => isValidAmount(value) && parseFloat(value) === parseFloat(amount);

function UpdatedCaption({updatedAt}) {
    if (!updatedAt) {
        return <Typography variant="caption" color="textSecondary">Updated before Nov 2026</Typography>;
    }
    return (
        <Typography variant="caption" sx={{color: isStale(updatedAt) ? "warning.main" : "text.secondary"}}>
            Updated {timeAgo(updatedAt)}
        </Typography>
    );
}

// Every asset on one screen, for the regular "go through all my accounts" update.
// Assets whose amount was changed are saved; ticking an unchanged one saves it as checked, which resets its "updated" date.
// Rendered only while open, so it always starts from the current amounts.
export default function UpdateBalancesDialog({categories, currencies, rates, onClose}) {
    const fullScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
    const {format} = useBalancesVisibility();
    const [updateAssets, {isLoading: saving}] = useUpdateAssetsMutation();

    const [values, setValues] = useState(() => Object.fromEntries(categories.flatMap((category) =>
        category.assets.map((asset) => [asset.id, asset.amount]))));
    const [checked, setChecked] = useState(() => new Set());
    const [confirmDiscard, setConfirmDiscard] = useState(false);
    const inputs = useRef([]);

    const assets = useMemo(() => categories.flatMap((category) =>
        category.assets.map((asset) => ({...asset, categoryId: category.id}))), [categories]);

    // after a partly failed save the categories refetch, so a saved asset no longer counts as changed
    const changed = assets.filter((asset) => values[asset.id].trim() !== asset.amount && !isSameAmount(values[asset.id], asset.amount));
    const invalid = changed.filter((asset) => !isValidAmount(values[asset.id]));
    const confirmed = assets.filter((asset) => checked.has(asset.id) && !changed.includes(asset));
    const toSave = [...changed, ...confirmed];

    const difference = invalid.length ? null : sum(changed.map((asset) =>
        convertCurrency(values[asset.id], rates, asset.currency, currencies.main) - asset.amountInMain));

    const toggleChecked = (assetId) => setChecked((current) => {
        const next = new Set(current);
        next.has(assetId) ? next.delete(assetId) : next.add(assetId);
        return next;
    });

    // Enter moves on to the next amount, like a spreadsheet; the last one submits
    const focusNext = (e, index) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const next = inputs.current[index + 1];
            if (next) {
                next.focus();
                next.select();
            } else {
                e.currentTarget.form?.requestSubmit();
            }
        }
    };

    const close = () => toSave.length && !saving ? setConfirmDiscard(true) : onClose();

    const save = async (e) => {
        e.preventDefault();
        if (!toSave.length || invalid.length) {
            return;
        }
        const updates = toSave.map((asset) => ({
            categoryId: asset.categoryId,
            asset: {id: asset.id, name: asset.name, currency: asset.currency, amount: values[asset.id].trim()}
        }));
        try {
            await updateAssets(updates).unwrap();
            enqueueSnackbar(`${updates.length} ${updates.length === 1 ? "asset" : "assets"} updated`, {variant: "success"});
            onClose();
        } catch (error) {
            // the API error middleware shows the message; keep what's left so it can be saved again
            const savedIds = new Set(error?.savedIds ?? []);
            setChecked((current) => new Set([...current].filter((id) => !savedIds.has(id))));
        }
    };

    return (
        <>
            <Dialog open onClose={close} fullScreen={fullScreen} fullWidth maxWidth="sm"
                    slotProps={{paper: {component: "form", onSubmit: save, noValidate: true}}}>
                <DialogTitle sx={{pb: 0.5}}>Update balances</DialogTitle>
                <Typography variant="body2" color="textSecondary" sx={{px: 3, pb: 1.5}}>
                    Type the new amounts; Enter moves to the next one. Tick a balance that hasn't changed to mark it as checked.
                </Typography>
                <Divider/>
                <DialogContent sx={{pt: 1}}>
                    {categories.map((category) =>
                        <Fragment key={category.id}>
                            <Typography variant="overline" color="textSecondary" component="h3" sx={{display: "block", mt: 1.5}}>
                                {category.name}
                            </Typography>
                            {category.assets.length === 0 &&
                                <Typography variant="body2" color="textSecondary" sx={{py: 1}}>No assets</Typography>}
                            {category.assets.map((asset) => {
                                const position = assets.findIndex((a) => a.id === asset.id);
                                const value = values[asset.id];
                                const isChanged = changed.some((a) => a.id === asset.id);
                                const isInvalid = isChanged && !isValidAmount(value);
                                const isChecked = !isChanged && checked.has(asset.id);
                                return (
                                    <Stack key={asset.id} direction="row" spacing={1.5} sx={{alignItems: "center", py: 0.75}}>
                                        <Box sx={{flexGrow: 1, minWidth: 0}}>
                                            <Typography variant="body2" noWrap sx={{fontWeight: isChanged ? 600 : undefined}}>{asset.name}</Typography>
                                            {isChecked
                                                ? <Typography variant="caption" sx={{color: "success.main"}}>Will be marked as checked</Typography>
                                                : <UpdatedCaption updatedAt={asset.updatedAt}/>}
                                        </Box>
                                        <TextField size="small" value={value} error={isInvalid}
                                                   onChange={(e) => setValues((current) => ({...current, [asset.id]: e.target.value}))}
                                                   onKeyDown={(e) => focusNext(e, position)}
                                                   onFocus={(e) => e.target.select()}
                                                   inputRef={(element) => (inputs.current[position] = element)}
                                                   sx={{width: {xs: 150, sm: 190}, flexShrink: 0, "& .MuiOutlinedInput-root": isChanged && !isInvalid ? {bgcolor: "action.selected"} : undefined}}
                                                   slotProps={{
                                                       htmlInput: {inputMode: "decimal", "aria-label": `${asset.name} amount`, sx: {textAlign: "right", fontVariantNumeric: "tabular-nums"}},
                                                       input: {endAdornment: <InputAdornment position="end">{asset.currency}</InputAdornment>}
                                                   }}/>
                                        <Tooltip title={isChanged ? "Changed amounts are saved anyway" : isChecked ? "Undo" : "Still correct: mark as checked"}>
                                            <span>
                                                <IconButton size="small" onClick={() => toggleChecked(asset.id)} disabled={isChanged}
                                                            aria-pressed={isChecked} aria-label={`Mark ${asset.name} as checked`}
                                                            sx={{color: isChecked || isChanged ? "success.main" : undefined}}>
                                                    {isChecked || isChanged ? <CheckCircleIcon fontSize="small"/> : <CheckCircleOutlineIcon fontSize="small"/>}
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Stack>
                                );
                            })}
                        </Fragment>)}
                </DialogContent>
                <Divider/>
                <DialogActions sx={{px: 3, py: 1.5, gap: 1, flexWrap: "wrap"}}>
                    <Typography variant="body2" color="textSecondary" sx={{mr: "auto"}}>
                        {invalid.length
                            ? <Box component="span" sx={{color: "error.main"}}>Enter numbers, e.g. 1250.50</Box>
                            : <>
                                {changed.length} changed{confirmed.length ? `, ${confirmed.length} checked` : ""}
                                {changed.length > 0 && difference !== null &&
                                    <Box component="span" sx={{ml: 1, fontWeight: 600, color: difference >= 0 ? "success.main" : "error.main"}}>
                                        {difference >= 0 ? "+" : "−"}{format(Math.abs(difference), currencies.main)}
                                    </Box>}
                            </>}
                    </Typography>
                    <Button onClick={close}>Cancel</Button>
                    <Button type="submit" variant="contained" loading={saving} disabled={!toSave.length || invalid.length > 0}>
                        Save{toSave.length ? ` ${toSave.length}` : ""}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog open={confirmDiscard} title="Discard changes?" confirmLabel="Discard"
                           description={`${toSave.length} ${toSave.length === 1 ? "balance hasn't" : "balances haven't"} been saved.`}
                           onConfirm={onClose} onCancel={() => setConfirmDiscard(false)}/>
        </>
    );
}
