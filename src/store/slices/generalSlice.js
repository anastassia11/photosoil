import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const modalAction = createAsyncThunk(
	'general/modalAction',
	function (_, { customAction }) {
		return customAction()
	}
)

const generalSlice = createSlice({
	name: 'general',
	initialState: {
		dropdown: { isActive: false, key: null }
	},

	reducers: {
		setDropdown(state, action) {
			state.dropdown = action.payload
		}
	}
})
export const { setDropdown, setModal } = generalSlice.actions
export default generalSlice.reducer
