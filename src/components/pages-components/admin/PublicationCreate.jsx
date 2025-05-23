'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useDispatch } from 'react-redux'

import PublicationForm from '@/components/admin-panel/PublicationForm'

import { openAlert } from '@/store/slices/alertSlice'
import { setDirty } from '@/store/slices/formSlice'

import { createPublication } from '@/api/publication/create_publication'

import { getTranslation } from '@/i18n/client'

export default function PublicationCreateComponent() {
	const dispatch = useDispatch()
	const router = useRouter()
	const [createTwoLang, setCreateTwoLang] = useState(false)
	const { locale } = useParams()
	const { t } = getTranslation(locale)

	const fetchCreatePublication = async data => {
		const result = await createPublication(data)
		if (result.success) {
			router.push(`/admin/publications`)
			dispatch(setDirty(false))
			dispatch(
				openAlert({
					title: t('success'),
					message: t('created_publication'),
					type: 'success'
				})
			)
		} else {
			dispatch(
				openAlert({
					title: t('error'),
					message: t('error_publication'),
					type: 'error'
				})
			)
		}
	}

	const handleCreatePublication = async ({
		createTwoLang,
		isEng,
		updatedPublication
	}) => {
		try {
			const langPublication = {
				...updatedPublication,
				translations: updatedPublication.translations.filter(
					({ isEnglish }) => isEnglish === isEng
				)
			}
			await fetchCreatePublication(
				createTwoLang ? updatedPublication : langPublication
			)
		} catch (error) {
			dispatch(
				openAlert({
					title: t('error'),
					message: t('error_publication'),
					type: 'error'
				})
			)
		}
	}

	return (
		<PublicationForm
			onPublicationSubmit={handleCreatePublication}
			createTwoLang={createTwoLang}
			setCreateTwoLang={setCreateTwoLang}
			btnText={t('create_publication')}
			title={t('creation_publication')}
		/>
	)
}
