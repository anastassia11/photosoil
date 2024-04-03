import { BASE_SERVER_URL } from '@/utils/constants'
import axios from 'axios'

export async function deleteSoilById(id) {
    try {
        const response = await axios.delete(`${BASE_SERVER_URL}/api/SoilObject/Delete?Id=${id}`,
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