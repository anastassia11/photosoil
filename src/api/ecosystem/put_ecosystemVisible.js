import axios from 'axios'

import { BASE_SERVER_URL } from '@/utils/constants'

import tokenVerification from '../account/token_verification'

export async function putEcosystemVisible(id, data) {
	await tokenVerification({ isRequired: true })
	const formData = new FormData()
	for (let key in data) {
		formData.append(key, data[key])
	}
	try {
		const response = await axios.put(
			`${BASE_SERVER_URL}/api/Ecosystem/PutVisible/${id}`,
			formData,
			{
				headers: {
					'Content-Type': `multipart/form-data`,
					Authorization: `Bearer ${JSON.parse(localStorage.getItem('tokenData'))?.token}`
				}
			}
		)
		if (!response.data.error) {
			return { success: true, data: response.data.response }
		}
	} catch (error) {
		return { success: false, message: error.message }
	}
}
