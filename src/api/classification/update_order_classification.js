import { BASE_SERVER_URL } from '@/utils/constants'
import axios from 'axios'
import tokenVerification from '../account/token_verification';

export async function updateOrderClassification(data) {
    await tokenVerification({ isRequired: true });
    try {
        const response = await axios.post(`${BASE_SERVER_URL}/api/Classification/UpdateOrder`,
            data,
            {
                headers: {
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('tokenData'))?.token}`
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