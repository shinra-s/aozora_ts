import React from "react";
import { TextField } from "@mui/material";

export function DefaultField ({
    disabled=false,
    onChange=null,
    value,
    label,
}) {
    return (
        <TextField
            variant='outlined'
            value={value}
            disabled={disabled}
            onChange={onChange}
            type='text'
            size='small'
            label={label}
            sx={{
                bgcolor: 'background.paper',
                mx: '5px',
            }}
        />
    );
};

export function NumberField ({
    disabled=false,
    onChange=null,
    value,
    label,
    helperText=null,
}) {
    return (
        <TextField
            variant='outlined'
            value={value}
            disabled={disabled}
            onChange={onChange}
            type='number'
            size='small'
            label={label}
            helperText={helperText}
            sx={{
                bgcolor: 'background.paper',
                mx: '5px',
            }}
        />
    );
};