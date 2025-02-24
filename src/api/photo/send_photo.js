import axios from 'axios'

import { BASE_SERVER_URL } from '@/utils/constants'

import tokenVerification from '../account/token_verification'

export async function sendPhoto(file) {
	await tokenVerification({ isRequired: true })
	const formData = new FormData()
	formData.append('Photo', file)
	try {
		const response = await axios.post(
			`${BASE_SERVER_URL}/api/Photo/Post`,
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
