import { BASE_SERVER_URL } from '@/utils/constants'
import axios from 'axios'

export async function getPhoto(Id) {
    try {
        const response = await axios.get(`${BASE_SERVER_URL}/api/Photo/GetById?Id=${Id}`,)
        if (!response.data.error) {
            return { success: true, data: response.data.response }
        }
    } catch (error) {
        return { success: false, message: error.message }
    }
}