import { createAsyncThunk } from '@reduxjs/toolkit';

const modalThunkActions = {
    open: createAsyncThunk(
        'modal',
        async (_, { extra }) => {
            const store = extra.store;
            return new Promise((resolve) => {
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
};

export default modalThunkActions;