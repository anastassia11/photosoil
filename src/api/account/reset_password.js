import axios from 'axios'

import { BASE_SERVER_URL } from '@/utils/constants'

export async function resetPassword(data) {
    try {
        const response = await axios.post(
            `${BASE_SERVER_URL}/api/account/ResetPassword`,
            data
        )
        if (!response.data.error) {
            return { success: true, data: response.data.response }
        }
    } catch (error) {
        return { success: false, message: error.response.data.message }
    }
}
