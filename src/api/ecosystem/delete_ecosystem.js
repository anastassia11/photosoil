import { BASE_SERVER_URL } from '@/utils/constants'
import axios from 'axios'
import tokenVerification from '../account/token_verification';

export async function deleteEcosystemById(id) {
    await tokenVerification({ isRequired: true });
    try {
        const response = await axios.delete(`${BASE_SERVER_URL}/api/EcoSystem/Delete?TranslationId=${id}`,
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