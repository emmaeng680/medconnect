import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader } from './components/loaders';

const WelcomeApp = lazy(() => import("./containers/welcome"));
const HomeApp = lazy(() => import("./containers/home"));


export default function App() {
    const session = useSelector(state => state.session);
    const [isAuthenticated, setIsAuthenticated] = React.useState();

    React.useEffect(()=>{
        // console.log("Guess who came here! Damn")
        // console.log(session)
        const checkAuth = (session.authToken && session.authToken.length !== 0) ? true: false;

        setIsAuthenticated(checkAuth);
    }, [session])

    
    return (
        <Router>
            <Suspense fallback={<Loader isLoading={true} />}>
                <Switch>
                    <Route exact path="/auth" render={(props) => {
                        if (isAuthenticated) {
                            return (
                                <Redirect to="/" />
                            );
                        } else {
                            return (
                                <WelcomeApp {...props} />
                            );
                        }
                    }} />
                    <Route path="/" render={(props) => {
                        if (!isAuthenticated) {
                            return (
                                <Redirect to="/auth" exact={true} />
                            );
                        } else {
                            return (
                                <HomeApp {...props} />
                            );
                        }
                    }} />
                </Switch>
            </Suspense>
        </Router>
    );
}