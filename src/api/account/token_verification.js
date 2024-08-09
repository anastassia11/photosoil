import { BASE_SERVER_URL } from '@/utils/constants'
import axios from 'axios'

export default async function tokenVerification({ isRequired }) {
    const loginUrl = '/login'
    let tokenData = localStorage.getItem('tokenData') ? JSON.parse(localStorage.getItem('tokenData')) : null
    const refreshToken = async (token) => {
        const formData = new FormData();
        formData.append('refreshToken', token)
        try {
            const response = await axios.post(`${BASE_SERVER_URL}/api/account/RefreshToken`,
                formData,
                {
                    headers: {
                        'Content-Type': `multipart/form-data`,
                    }
                }
            )
            if (response.status === 200) {
                const tokenData = { ...response.data.response, time: Date.now() }
                localStorage.setItem('tokenData', JSON.stringify(tokenData))
                return { success: true, status: response.status, data: response.data.response }
            } else {
                return { success: false, message: `Error refreshing token ${response.status}` }
            }
        } catch (error) {
            return { success: false, message: error.message }
        }
    }
    if (tokenData) {
        // if (tokenData.time + tokenData.deadTime * 1000 < Date.now()) {
        if (true) {
            try {
                const response = await refreshToken(tokenData.refreshToken)
                if (response.status === 200) {
                    return { success: true }
                } else {
                    window.location.replace(loginUrl);
                    throw new Error('Error');
                }
            } catch (error) {

            }
        }
    } else {
        return isRequired && window.location.replace(loginUrl)
    }
}