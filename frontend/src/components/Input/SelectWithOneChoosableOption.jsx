import React, {useState} from 'react';
import {CircularProgress, TextField} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";


const SelectWithOneChoosableOption = ({label, value, options, setter, validate, validationFailText, validationRes, id, isLoading, ...props}) => {
    const [open, setOpen] = useState(false);

    const handleChange = (option) => {
        setter(option.id);
    };

    let isShowValidationError = false;
    if (validationRes && id) {
        const isInputValid = value && value !== '';
        validationRes[id] = isInputValid;

        if (validate) {
            isShowValidationError = !isInputValid;
        } else {
            isShowValidationError = false;
        }
    }

    const getVal = (val) => {
        if (isLoading)
            return null;

        if (!options)
            return null;
        let selectedOption = options.find(option => option.id === val);
        return selectedOption || null;
    };

    return (
        <Autocomplete
            {...props}
            disableClearable
            loading={isLoading}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            options={isLoading ? [] : options}
            value={getVal(value)}
            isOptionEqualToValue={(option, value) => {return option.id === value.id;}}
            onChange={(e, option) => handleChange(option)}
            getOptionLabel={option => option.name || ""}
            renderOption={({key, ...optionProps}, option) => <li key={key} {...optionProps}>{option.name}</li>}
            renderInput={params => (
                <TextField
                    {...params}
                    fullWidth
                    label={label}
                    variant="standard"
                    margin="normal"
                    error={isShowValidationError}
                    helperText={isShowValidationError ? validationFailText : null}
                    slotProps={{
                        ...params.slotProps,
                        input: {
                            ...params.slotProps.input,
                            endAdornment: (
                                <>
                                    {isLoading ? <CircularProgress color="inherit" size={20}/> : null}
                                    {params.slotProps.input.endAdornment}
                                </>
                            ),
                        },
                    }}
                />
            )}
        />
    );
};

export default SelectWithOneChoosableOption;
