import React, {useState} from "react";
import {enqueueSnackbar} from "notistack";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import {useCreateCategoryMutation, useRenameCategoryMutation} from "../api/assetManagerApi";

// Create a category, or rename `category`. Rendered only while open.
export default function CategoryDialog({category, onClose}) {
    const isRename = Boolean(category);
    const [name, setName] = useState(category?.name ?? "");
    const [submitted, setSubmitted] = useState(false);
    const [createCategory, {isLoading: creating}] = useCreateCategoryMutation();
    const [renameCategory, {isLoading: renaming}] = useRenameCategoryMutation();
    const nameError = submitted && !name.trim();

    const save = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        if (!name.trim()) {
            return;
        }

        try {
            if (isRename) {
                await renameCategory({id: category.id, name: name.trim()}).unwrap();
            } else {
                await createCategory(name.trim()).unwrap();
            }
            enqueueSnackbar(isRename ? "Category renamed" : "Category added", {variant: "success"});
            onClose();
        } catch {
            // the API error middleware already shows a snackbar
        }
    };

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="xs" slotProps={{paper: {component: "form", onSubmit: save, noValidate: true}}}>
            <DialogTitle>{isRename ? "Rename category" : "New category"}</DialogTitle>
            <DialogContent>
                <TextField label="Name" autoFocus fullWidth margin="dense" value={name} onChange={(e) => setName(e.target.value)}
                           error={nameError} helperText={nameError ? "Enter a name" : " "}
                           placeholder={isRename ? undefined : "e.g. Savings, Crypto, Cash"}/>
            </DialogContent>
            <DialogActions sx={{px: 3, pb: 2}}>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="contained" loading={creating || renaming}>Save</Button>
            </DialogActions>
        </Dialog>
    );
}
