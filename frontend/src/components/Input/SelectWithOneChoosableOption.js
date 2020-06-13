import React, {useState} from 'react';
import {CircularProgress, TextField} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";


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
            return '';

        if (!options)
            return '';
        let selectedOption = options.find(option => option.id === val);
        return selectedOption || '';
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
            getOptionSelected={(option, value) => {return option.id === value.id;}}
            onChange={(e, option) => handleChange(option)}
            getOptionLabel={option => option.name || ""}
            renderOption={option => option.name}
            renderInput={params => (
                <TextField
                    {...params}
                    fullWidth
                    label={label}
                    variant="standard"
                    margin="normal"
                    error={isShowValidationError}
                    helperText={isShowValidationError ? validationFailText : null}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {isLoading ? <CircularProgress color="inherit" size={20}/> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    );
};

export default SelectWithOneChoosableOption;
