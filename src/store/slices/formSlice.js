import { createSlice } from '@reduxjs/toolkit'

const formSlice = createSlice({
    name: 'form',
    initialState: {
        isDirty: false,
    },

    reducers: {
        setDirty(state, action) {
            state.isDirty = action.payload;
        },
    }

})
export const { setDirty } = formSlice.actions;
export default formSlice.reducer