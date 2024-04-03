import { BASE_SERVER_URL } from '@/utils/constants'
import axios from 'axios'

export async function sendPhoto(file) {
    const formData = new FormData()
    formData.append('Photo', file)
    try {
        const response = await axios.post(`${BASE_SERVER_URL}/api/Photo/Post`,
            formData
            // {
            //     headers: {
            //         'Authorization': `Bearer ${JSON.parse(localStorage.getItem('tokenData')).token}`
            //     }
            // }
        )
        if (!response.data.error) {
            return { success: true, data: response.data.response }
        }
    } catch (error) {
        return { success: false, message: error.message }
    }
}