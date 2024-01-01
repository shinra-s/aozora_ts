import React  from "react";
import { PulseLoader } from "react-spinners";
import { Box } from "@mui/material";

export const Loading = ({
    statusNovelUrl,
}) => {
    if (statusNovelUrl !== '小説取得中') return (<Box></Box>);
    return (
        <Box>
            <PulseLoader color="#36d7b7" />
        </Box>
    );
};
