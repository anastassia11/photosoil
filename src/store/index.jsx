import { configureStore } from '@reduxjs/toolkit';
import dataReducer from './slices/dataSlice';
import generalReducer from './slices/generalSlice';
import modalReducer from './slices/modalSlice';
import alertReducer from './slices/alertSlice'

function createStore() {
    const thunkArguments = {};

    const store = configureStore({
        reducer: {
            data: dataReducer,
            general: generalReducer,
            modal: modalReducer,
            alert: alertReducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                thunk: {
                    extraArgument: thunkArguments,
                },
            }),
    });

    thunkArguments.store = store;

    return store;
}
export default createStore();


