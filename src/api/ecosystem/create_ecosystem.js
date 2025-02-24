import axios from 'axios'

import { BASE_SERVER_URL } from '@/utils/constants'

import tokenVerification from '../account/token_verification'

export async function createEcosystem(dataArray) {
	await tokenVerification({ isRequired: true })
	try {
		const response = await axios.post(
			`${BASE_SERVER_URL}/api/Ecosystem/Post`,
			dataArray,
			{
				headers: {
					Authorization: `Bearer ${JSON.parse(localStorage.getItem('tokenData'))?.token}`
				}
			}
		)
		if (!response.data.error) {
			return { success: true, data: response.data.response }
		}
	} catch (error) {
		return {
			success: false,
			message: error.message,
			status: error.response.status
		}
	}
}
