import React from "react";
import { Button } from "@mui/material";

export function DefaultButton ({
    disabled=false,
    onClick=null,
    endIcon=null,
    startIcon=null,
    children,
}) {
    return (
        <Button
            startIcon={startIcon}
            variant='contained'
            disabled={disabled}
            onClick={onClick}
            sx={{
                mx: '5px',
            }}
            size='small'
            endIcon={endIcon}
        >
            {children}
        </Button>
    );
};

export function LinkButton ({
    disabled=false,
    href=null,
    endIcon=null,
    startIcon=null,
    children,
}) {
    return (
        <Button
            startIcon={startIcon}
            variant='contained'
            disabled={disabled}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
                mx: '5px',
            }}
            size='small'
            endIcon={endIcon}
        >
            {children}
        </Button>
    );
};