import { BASE_SERVER_URL } from '@/utils/constants'
import axios from 'axios'

export async function deletePhotoById(id) {
    try {
        const response = await axios.delete(`${BASE_SERVER_URL}/api/Photo/Delete?photoId=${id}`,
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