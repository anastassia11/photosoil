import { BASE_SERVER_URL } from '@/utils/constants'
import axios from 'axios'

export async function getClassifications() {
    try {
        const response = await axios.get(`${BASE_SERVER_URL}/api/Classification/GetAll`)
        if (!response.data.error) {
            return { success: true, data: response.data.response }
        }
    } catch (error) {
        return { success: false, message: error.message }
    }
}