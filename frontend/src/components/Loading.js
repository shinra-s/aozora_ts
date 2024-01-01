import React  from "react";
import { PulseLoader } from "react-spinners";
import { DefaultBox } from "./MyBox";

export const Loading = ({
    statusNovelUrl,
}) => {
    if (statusNovelUrl !== '小説取得中') return (<DefaultBox></DefaultBox>);
    return (
        <DefaultBox>
            <PulseLoader color="#36d7b7" />
        </DefaultBox>
    );
};
