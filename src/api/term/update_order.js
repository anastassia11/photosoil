import tokenVerification from '../account/token_verification'

export async function updateTermOrder(data) {
	await tokenVerification({ isRequired: true })
	try {
		const response = await axios.post(
			`${BASE_SERVER_URL}/api/Terms/UpdateOrder`,
			data,
			{
				headers: {
					Authorization: `Bearer ${JSON.parse(localStorage.getItem('tokenData'))?.token}`
				}
			}
		)
		if (!response.data.error) {
			return { success: true }
		}
	} catch (error) {
		return { success: false, message: error.message }
	}
}
