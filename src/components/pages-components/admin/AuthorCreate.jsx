'use client'

import { useParams, useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'

import AuthorForm from '@/components/admin-panel/AuthorForm'

import { openAlert } from '@/store/slices/alertSlice'
import { setDirty } from '@/store/slices/formSlice'

import { createAuthor } from '@/api/author/create_author'

import { getTranslation } from '@/i18n/client'

export default function AuthorCreateComponent() {
	const dispatch = useDispatch()
	const router = useRouter()
	const { locale } = useParams()
	const { t } = getTranslation(locale)

	const handleCreateAuthor = async data => {
		const _data = {
			...data, contacts: data.contacts.filter(c => c.length),
			otherProfiles: data.otherProfiles.filter(c => c.length)
		}
		const result = await createAuthor(_data)
		if (result.success) {
			router.push('/admin/authors')
			dispatch(setDirty(false))
			dispatch(
				openAlert({
					title: t('success'),
					message: t('created_author'),
					type: 'success'
				})
			)
		} else {
			dispatch(
				openAlert({
					title: t('error'),
					message: t('error_author'),
					type: 'error'
				})
			)
		}
	}

	return (
		<AuthorForm
			purpose='create'
			title={t('creation_author')}
			onFormSubmit={handleCreateAuthor}
			btnText={t('create_author')}
		/>
	)
}
