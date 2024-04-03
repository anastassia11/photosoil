import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import store from '..';


export const confirmationModal = createAsyncThunk(
    'modal/confirmationModal',
    async () => {
        return new Promise(resolve => {
            const unsubscribe = store.subscribe(() => {
                const state = store.getState();
                if (state.modal.isConfirm) {
                    unsubscribe();
                    resolve(true);
                }
                if (state.modal.isDecline) {
                    unsubscribe();
                    resolve(false);
                }
            });
        });
    }
)

const modalSlice = createSlice({
    name: 'modal',
    initialState: {
        isOpen: false,
        isConfirm: false,
        isDecline: false,
        props: {
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
            state.props = action.payload
        },
        closeModal(state) {
            state.isOpen = false;
            state.isDecline = true;
            state.isConfirm = false;
            state.props = {}
        },
        setConfirm(state, action) {
            state.isConfirm = true;
            state.isDecline = false;
            state.isOpen = false;
            state.props = {}
        },
    }

})
export const { openModal, closeModal, setConfirm } = modalSlice.actions;
export default modalSlice.reducer