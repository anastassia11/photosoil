import axios from 'axios'

import tokenVerification from '@/api/account/token_verification'

import { BASE_SERVER_URL } from './constants'

export const request = async ({
	method,
	url,
	params = {},
	contentType,
	tokenRequired
}) => {
	await tokenVerification({ isRequired: tokenRequired })
	const formData = new FormData()

	for (let key in data) {
		if (Array.isArray(data[key])) {
			data[key].forEach(value => {
				formData.append(`${key}[]`, value)
			})
		} else formData.append(key, data[key])
	}

	const options = {
		method: method,
		url: `${BASE_SERVER_URL}/${url}`,
		params:
			contentType === 'formData'
				? formData
				: {
						...params
					},
		headers: {
			Authorization: `Bearer ${JSON.parse(localStorage.getItem('tokenData'))?.token}`
		}
	}
	const response = await axios.request(options)
	return response
}

export const generateFileName = title => {
	let safeName = title
		.replace(/[\/\\:*?"<>|#%&$\+@=]/g, '')
		.replace(/\s+/g, '_')
		.toLowerCase()

	return safeName.substring(0, 100)
}
