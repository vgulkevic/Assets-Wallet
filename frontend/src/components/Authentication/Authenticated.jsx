import React from 'react';
import {Navigate, Route, Routes} from "react-router";

import Assets from "../Assets";

export default function Authenticated() {

    return (
        <>
            <Routes>
                <Route path="/" element={<Assets/>}/>
                <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>
        </>
    );
}
