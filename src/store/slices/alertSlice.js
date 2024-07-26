import { createSlice } from '@reduxjs/toolkit'

const alertSlice = createSlice({
    name: 'alert',
    initialState: {
        isOpen: false,
        props: {
            title: null,
            message: null,
            type: null,
        },
    },

    reducers: {
        openAlert(state, action) {
            state.isOpen = true;
            state.props = action.payload;
        },
        closeAlert(state) {
            state.isOpen = false;
        },
    }

})
export const { openAlert, closeAlert } = alertSlice.actions;
export default alertSlice.reducer