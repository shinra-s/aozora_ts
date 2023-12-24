import React  from "react";
import { PulseLoader } from "react-spinners";
import '../App.css';

export const Loading = ({
    statusNovelUrl,
    inverted = true,
    content = 'Loading...'
}) => {
    if (statusNovelUrl !== '小説取得中') return (<div></div>);
    return (
        <div class="spinner">
            <PulseLoader color="#36d7b7" />
        </div>
    );
};
