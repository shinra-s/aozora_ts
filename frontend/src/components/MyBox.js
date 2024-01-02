import React from "react";
import { Box } from "@mui/material";

export function DefaultBox ({ children }) {
    return (
        <Box
            sx={{
                my: '5px',
            }}
        >
            {children}
        </Box>
    );
};

export function SaveBox ({ children }) {
    return (
        <Box
            sx={{
                my: '5px',
                overflowWrap: 'anywhere',
            }}
        >
            {children}
        </Box>
    );
};

export function NoWrapBox ({ children }) {
    return (
        <Box
            sx={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}
        >
            {children}
        </Box>
    );
};

export function DefaultHandlerBox ({ children }) {
    return (
        <Box
            sx={{
                p: 2,
            }}
        >
            {children}
        </Box>
    );
};

export function HalfBox ({ children }) {
    return (
        <Box
            sx={{
                m: '5px',
                width: {
                    xs: '100%',
                    md: '50%',
                },
            }}
        >
            {children}
        </Box>
    );
};

export function FlexBox ({ children }) {
    return (
        <Box
            sx={{
                my: '5px',
                display: 'flex',
            }}
        >
            {children}
        </Box>
    );
};

export function FlexMdBox ({ children }) {
    return (
        <Box
            sx={{
                my: '5px',
                display: {
                    xs: 'block',
                    md: 'flex',
                },
            }}
        >
            {children}
        </Box>
    );
};

export function ViewerBox ({ children }) {
    return (
        <Box
            sx={{
                my: '5px',
                display: {
                    xs: 'block',
                    md: 'flex',
                }
            }}
        >
            {children}
        </Box>
    );
};

export function FlexHandlerBox ({ children }) {
    return (
        <Box
            sx={{
                display: 'flex',
                p: 2,
                alignItems: 'center',
            }}
        >
            {children}
        </Box>
    );
};

export function FlexLgHandlerBox ({ children }) {
    return (
        <Box
            sx={{
                display: {
                    xs: 'block',
                    lg: 'flex',
                },
                p: 2,
                alignItems: 'center',
            }}
        >
            {children}
        </Box>
    );
};

export function FlexMdHandlerBox ({ children }) {
    return (
        <Box
            sx={{
                display: {
                    xs: 'block',
                    md: 'flex',
                },
                p: 2,
                alignItems: 'center',
            }}
        >
            {children}
        </Box>
    );
};

export function PaperBox ({ children }) {
    return (
        <Box
            sx={{
                my: '5px',
                bgcolor: 'background.paper',
                boxShadow: 1,
                borderRadius: 2,
                height: 200,
                overflow: 'hidden',
                overflowY: 'scroll',
                px: '5px',
            }}
        >
            {children}
        </Box>
    );
};

export function ListItemBox ({ children }) {
    return (
        <Box
            sx={{
                width: '95%',
                height: '95%',
                border: 1,
                borderColor: 'background.default',
                borderRadius: 2,
                m: 1,
                pt: 1,
                pl: 1,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}
        >
            {children}
        </Box>
    );
};