import axios from 'axios'

import { BASE_SERVER_URL } from '@/utils/constants'

export async function auth(data) {
	const time = Date.now()
	try {
		const response = await axios.post(
			`${BASE_SERVER_URL}/api/account/Login`,
			data
		)
		if (!response.data.error) {
			const tokenData = { ...response.data.response, time }
			localStorage.setItem('tokenData', JSON.stringify(tokenData))
			return { success: true, data: response.data.response }
		}
	} catch (error) {
		return { success: false, message: error.message }
	}
}
