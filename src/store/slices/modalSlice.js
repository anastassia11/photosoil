import { createSlice } from '@reduxjs/toolkit'

const modalSlice = createSlice({
    name: 'modal',
    initialState: {
        isOpen: false,
        isConfirm: false,
        isDecline: false,
        modalProps: {
            title: null,
            message: null,
            buttonText: null,
        },
    },

    reducers: {
        openModal(state, action) {
            state.isOpen = true;
            state.isDecline = false;
            state.isConfirm = false;
            state.modalProps = action.payload
        },
        closeModal(state) {
            state.isOpen = false;
            state.isDecline = true;
            state.modalProps = {}
        },
        setConfirm(state) {
            state.isConfirm = true;
            state.isOpen = false;
            state.modalProps = {}
        },
    }

})
export const { openModal, closeModal, setConfirm } = modalSlice.actions;
export default modalSlice.reducer