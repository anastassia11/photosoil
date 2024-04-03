import { BASE_SERVER_URL } from '@/utils/constants'
import axios from 'axios'

export async function getSoilForPut(Id) {
    try {
        const response = await axios.get(`${BASE_SERVER_URL}/api/SoilObject/GetForUpdate?Id=${Id}`,
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