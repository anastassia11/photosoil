import axios from 'axios'

import { BASE_SERVER_URL } from '@/utils/constants'

import tokenVerification from './token_verification'

export async function changePassword(data) {
    await tokenVerification({ isRequired: true })
    try {
        const response = await axios.post(
            `${BASE_SERVER_URL}/api/account/ChangePassword`,
            data,
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
        console.log(error)
        return { success: false, message: error.response.data.message }
    }
}
