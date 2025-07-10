// src/store/rtk/index.js
import { configureStore } from '@reduxjs/toolkit';
import userSlice from './userSlice';

// 🚀 RTK Store Configuration (Much simpler!)
const store = configureStore({
    reducer: {
        users: userSlice
    },
    // RTK includes redux-thunk and redux-devtools automatically!
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
            }
        })
});

export default store;

// Export RootState and AppDispatch types for TypeScript (optional)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;