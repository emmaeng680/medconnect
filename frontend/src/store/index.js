import { configureStore } from '@reduxjs/toolkit';

import { saveSession } from "./sessionStorage.js";
import sessionSlice from './slices/sessionSlice';

export const store = configureStore({
    reducer: {
        session: sessionSlice,
    },
});

export const unsubscribe = store.subscribe(() => {
    const currentSession = store.getState().session;
    saveSession(currentSession);
});
