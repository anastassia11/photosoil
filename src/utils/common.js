import axios from 'axios'

import tokenVerification from '@/api/account/token_verification'

import { ADMIN_SORTS, BASE_SERVER_URL, PAGINATION_DATA } from './constants'

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

export const recoveryItemsPerPage = ({ isChild = false, key, pathname }) => {
	const defaultData = JSON.parse(localStorage.getItem('itemsPerPage')) ?? PAGINATION_DATA
	if (!isChild) {
		return defaultData[key].num
	} else {
		const _pathname = pathname.split('/')[2]
		return defaultData[_pathname].children[key]
	}
}

export const recoveryAdminSort = (key) => {
	const defaultData = JSON.parse(localStorage.getItem('adminSorts')) ?? ADMIN_SORTS
	return defaultData[key]
}
