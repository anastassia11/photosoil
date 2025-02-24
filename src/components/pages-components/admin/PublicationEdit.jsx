'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import PublicationForm from '@/components/admin-panel/PublicationForm'

import { openAlert } from '@/store/slices/alertSlice'
import { setDirty } from '@/store/slices/formSlice'

import { deletePhotoById } from '@/api/photo/delete_photo'
import { getPublication } from '@/api/publication/get_publication'
import { putPublication } from '@/api/publication/put_publication'

import { getTranslation } from '@/i18n/client'

export default function PublicationEditComponent({ id }) {
	const dispatch = useDispatch()
	const searchParams = useSearchParams()
	const [publication, setPublication] = useState({})
	const [oldTwoLang, setOldTwoLang] = useState(false)
	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const router = useRouter()

	useEffect(() => {
		fetchPublication()
	}, [])

	useEffect(() => {
		if (typeof document !== 'undefined' && Object.keys(publication).length) {
			const title = publication.translations?.find(
				({ isEnglish }) => isEnglish === (searchParams.get('lang') === 'eng')
			)?.name
			if (title) {
				document.title = `${title} | ${t('edit')} | PhotoSOIL`
			}
		}
	}, [publication])

	const fetchPublication = async () => {
		const result = await getPublication(id)
		if (result.success) {
			setPublication(result.data)
			let createTwoLang = result.data.translations?.length > 1
			setOldTwoLang(createTwoLang)
		}
	}

	const handleSubmit = async ({ createTwoLang, isEng, updatedPublication }) => {
		try {
			const langPublication = {
				...updatedPublication,
				translations: updatedPublication.translations.filter(
					({ isEnglish }) => isEnglish === isEng
				)
			}
			const result = await putPublication(
				id,
				createTwoLang ? updatedPublication : langPublication
			)
			if (result.success) {
				if (publication.file?.id !== updatedPublication.fileId) {
					await deletePhotoById(publication.file.id)
				}
				dispatch(setDirty(false))
				dispatch(
					openAlert({
						title: t('success'),
						message: t('success_edit'),
						type: 'success'
					})
				)
				router.push(`/${locale}/admin/publications`)
			} else {
				dispatch(
					openAlert({
						title: t('error'),
						message: t('error_edit'),
						type: 'error'
					})
				)
			}
		} catch (error) {
			dispatch(
				openAlert({
					title: t('error'),
					message: t('error_edit'),
					type: 'error'
				})
			)
		}
	}

	return (
		<PublicationForm
			_publication={publication}
			title={t('edit_publication')}
			pathname='edit'
			oldTwoLang={oldTwoLang}
			oldIsEng={searchParams.get('lang') === 'eng'}
			onPublicationSubmit={handleSubmit}
			btnText={t('save')}
		/>
	)
}
