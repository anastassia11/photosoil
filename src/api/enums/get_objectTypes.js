import axios from 'axios'

import { BASE_SERVER_URL } from '@/utils/constants'

export async function getObjectTypes() {
	try {
		const response = await axios.get(`${BASE_SERVER_URL}/api/Enum/SoilObjects`)
		if (!response.data.error) {
			return { success: true, data: response.data }
		}
	} catch (error) {
		return { success: false, message: error.message }
	}
}
