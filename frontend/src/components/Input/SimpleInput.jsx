import React from 'react';
import {TextField} from "@mui/material";

const SimpleInput = ({label, type, value, setter, ...props}) => {

    return (
        <TextField
            fullWidth
            margin="normal"
            variant="standard"
            type={type}
            label={label}
            value={value}
            onChange={(e) => {setter(e.target.value);}}
            {...props}
        />
    );
};

export default SimpleInput;