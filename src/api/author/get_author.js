import axios from 'axios'

import { BASE_SERVER_URL } from '@/utils/constants'

export async function getAuthor(Id) {
	try {
		const response = await axios.get(
			`${BASE_SERVER_URL}/api/Author/GetById?Id=${Id}`
		)
		if (!response.data.error) {
			return { success: true, data: response.data.response }
		}
	} catch (error) {
		return { success: false, message: error.message }
	}
}
