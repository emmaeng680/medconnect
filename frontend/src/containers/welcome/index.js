import React from 'react';
import { FluidContainer } from "../../components/layout.js";
import ContentBar from "./content.js";



export default function WelcomeApp(props) {
    return (
        <FluidContainer className="h-100 md-bg-0 d-flex flex-column">
            <ContentBar />
        </FluidContainer>
    );
}