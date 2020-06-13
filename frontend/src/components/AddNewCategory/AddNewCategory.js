import CustomButton from "../CustomButton";
import React, {useState} from "react";
import Grid from "@material-ui/core/Grid";
import AddNewCategoryDialog from "./AddNewCategoryDialog";
import AddIcon from "@material-ui/icons/Add";

export default function AddNewCategory() {
    const [addNewCategoryDialogOpen, setAddNewCategoryDialogOpen] = useState(false);
    const creatingNewCategory = false;

    const handleSaveButtonClick = (e) => {
        e.currentTarget.blur();
        setAddNewCategoryDialogOpen(true);
    };

    return (
        <>
            <Grid item>
                <CustomButton
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon/>}
                    onClick={handleSaveButtonClick}
                    loading={creatingNewCategory}
                >
                    Add new category
                </CustomButton>
            </Grid>
            <AddNewCategoryDialog open={addNewCategoryDialogOpen} handleClose={() => setAddNewCategoryDialogOpen(false)}/>
        </>
    );
}