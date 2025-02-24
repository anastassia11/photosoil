import axios from 'axios'

import { BASE_SERVER_URL } from '@/utils/constants'

import tokenVerification from './token_verification'

export async function changeRole(id, isAdmin) {
	await tokenVerification({ isRequired: true })
	try {
		const response = await axios.post(
			`${BASE_SERVER_URL}/api/account/ChangeRole?Id=${id}&isAdmin=${isAdmin}`,
			{
				headers: {
					'Content-Type': 'application/json',
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
