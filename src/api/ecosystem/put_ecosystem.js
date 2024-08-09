import { BASE_SERVER_URL } from '@/utils/constants'
import axios from 'axios'
import tokenVerification from '../account/token_verification';

export async function putEcosystem(id, data) {
    await tokenVerification({ isRequired: true });

    try {
        const response = await axios.put(`${BASE_SERVER_URL}/api/Ecosystem/Put/${id}`,
            data,
            {
                headers: {
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('tokenData'))?.token}`
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