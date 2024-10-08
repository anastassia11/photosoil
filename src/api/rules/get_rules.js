import { BASE_SERVER_URL } from '@/utils/constants'
import axios from 'axios'

export async function getRules() {
    try {
        const response = await axios.get(`${BASE_SERVER_URL}/api/Rules/Get`)
        if (!response.data.error) {
            return { success: true, data: response.data.response }
        }
    } catch (error) {
        return { success: false, message: error.message }
    }
}