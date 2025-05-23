import axios from 'axios'

import { BASE_SERVER_URL } from '@/utils/constants'

import tokenVerification from '../account/token_verification'

export async function getNewsById(Id) {
	await tokenVerification({ isRequired: false })
	try {
		const response = await axios.get(
			`${BASE_SERVER_URL}/api/News/GetById?Id=${Id}`,
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
		return { success: false, message: error.message }
	}
}
