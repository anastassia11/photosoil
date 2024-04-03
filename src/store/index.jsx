import { configureStore } from '@reduxjs/toolkit';
import dataReducer from './slices/dataSlice';
import generalReducer from './slices/generalSlice';
import modalReducer from './slices/modalSlice';
import alertReducer from './slices/alertSlice'

export default configureStore({
    reducer: {
        data: dataReducer,
        general: generalReducer,
        modal: modalReducer,
        alert: alertReducer,
    }
})