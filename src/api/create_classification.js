import { BASE_SERVER_URL } from '@/utils/constants'
import axios from 'axios'

export async function createClassification(data) {
    const formData = new FormData();
    for (let key in data) {
        if (Array.isArray(data[key])) {
            data[key].forEach(value => {
                formData.append(`${key}[]`, value);
            });
        } else formData.append(key, data[key])
    }
    try {
        const response = await axios.post(`${BASE_SERVER_URL}/api/Classification/Post`,
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