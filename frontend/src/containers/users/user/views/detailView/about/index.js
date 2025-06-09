import React from 'react';

import AboutWidget from './about';


export default function AboutSection(props) {

    return (
        <>
            <AboutWidget
                session={props.session}
                user={props.user}
                disableEdit={props.disableEdit}
            />
        </>
    );
}