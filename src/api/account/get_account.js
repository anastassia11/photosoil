import { BASE_SERVER_URL } from '@/utils/constants'
import axios from 'axios'
import tokenVerification from './token_verification';

export async function getAccount(Id) {
    await tokenVerification({ isRequired: true });
    try {
        const response = await axios.get(`${BASE_SERVER_URL}/api/account/GetById/${Id}`,
            {
                headers: {
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('tokenData'))?.token}`
                }
            })
        if (!response.data.error) {
            return { success: true, data: response.data.response }
        }
    } catch (error) {
        return { success: false, message: error.message }
    }
}