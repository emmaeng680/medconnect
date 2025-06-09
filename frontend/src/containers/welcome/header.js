import React from 'react';

export function AppLogo() {
    return (
        //logo yet to be designed
        <h5>Group #1 -mediconnection</h5>
    );
}


export default function HeaderBar(props) {
    return (
        <header className="padding-bottom: 100px">
                    <AppLogo />
        </header>
    );
}
