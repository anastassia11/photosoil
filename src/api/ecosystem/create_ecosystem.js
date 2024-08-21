import { BASE_SERVER_URL } from '@/utils/constants'
import axios from 'axios'
import tokenVerification from '../account/token_verification';

export async function createEcosystem(dataArray) {
    await tokenVerification({ isRequired: true });
    // const formData = new FormData();
    // for (let key in data) {
    //     if (Array.isArray(data[key])) {
    //         data[key].forEach(value => {
    //             formData.append(`${key}[]`, value);
    //         });
    //     } else formData.append(key, data[key])
    // }
    try {
        const response = await axios.post(`${BASE_SERVER_URL}/api/Ecosystem/Post`,
            dataArray,
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
        return { success: false, message: error.message, status: error.response.status }
    }
}