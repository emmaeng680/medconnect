import React, { Suspense, lazy } from 'react';
import MediaQuery from 'react-responsive';
import { Route, Switch } from 'react-router-dom';
import { Col, FluidContainer, Row } from '../../components/layout';
import { Loader } from '../../components/loaders';

import SideBar, { ModalSideBar } from './sideBar';
const DashboardApp = lazy(() => import('../dashboard'));
const UserApp = lazy(() => import('../users'));
const AppointmentApp = lazy(() => import('../appointments'));
const ChatApp = lazy(() => import('../chats'));
const SettingsApp = lazy(() => import('../settings'));



function ContentSection(props) {
    const routes = [
        {
            path: "/",
            exact: true,
            component: DashboardApp
        },
        {
            path: "/users",
            component: UserApp
        },
        {
            path: "/appointments",
            component: AppointmentApp
        },
        {
            path: "/chats",
            component: ChatApp
        },
        {
            path: "/settings",
            component: SettingsApp
        },
    ];

    return (
        <Suspense fallback={<Loader isLoading={true} />}>
        <Switch>
            {routes.map((route, index) => (
            <Route
                key={index}
                path={route.path}
                exact={route.exact}
                render={(props) => (
                <route.component {...props} />
                )}
            />
            ))}
        </Switch>
        </Suspense>

    );
}


export default function HomeApp(props) {

    async function autoRemoveModal(matches) {
        if (!matches) return; // exit early if matches is falsy
    
        const body = document.body;
        if (!body) throw new Error('Document body is null or undefined');
    
        body.classList.remove('modal-open');
    
        const modalBackdrops = document.querySelectorAll('.modal-backdrop');
        if (!modalBackdrops) return; // exit early if there are no modal backdrops
    
        modalBackdrops.forEach((backdrop) => backdrop.remove());
      }
      

    return (
        <FluidContainer className="h-100">
            <Row className="h-100">
                <Col className="col-md-9 col-xl-10 h-100 overflow-y">
                    <ContentSection />
                </Col>
                <MediaQuery maxWidth={767}>
                    <ModalSideBar id="sideBar01" />
                </MediaQuery>
                <MediaQuery minWidth={768} onChange={autoRemoveModal} >
                    <SideBar className="col col-md-3 col-xl-2 h-100" />
                </MediaQuery>
                
            </Row>
        </FluidContainer>
    );
}