import { configureStore } from '@reduxjs/toolkit'

import alertReducer from './slices/alertSlice'
import formReducer from './slices/formSlice'
import generalReducer from './slices/generalSlice'
import modalReducer from './slices/modalSlice'

function createStore() {
	const thunkArguments = {}

	const store = configureStore({
		reducer: {
			general: generalReducer,
			modal: modalReducer,
			alert: alertReducer,
			form: formReducer
		},
		middleware: getDefaultMiddleware =>
			getDefaultMiddleware({
				thunk: {
					extraArgument: thunkArguments
				}
			})
	})

	thunkArguments.store = store

	return store
}
export default createStore()
