'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import AuthorForm from '@/components/admin-panel/AuthorForm'

import { openAlert } from '@/store/slices/alertSlice'
import { setDirty } from '@/store/slices/formSlice'

import { getAuthor } from '@/api/author/get_author'
import { putAuthor } from '@/api/author/put_author'
import { deletePhotoById } from '@/api/photo/delete_photo'

import { getTranslation } from '@/i18n/client'

export default function AuthorEditComponent({ id }) {
	const dispatch = useDispatch()
	const [author, setAuthor] = useState({})
	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const router = useRouter()

	useEffect(() => {
		fetchAuthor()
	}, [])

	useEffect(() => {
		if (typeof document !== 'undefined' && Object.keys(author).length) {
			const title =
				locale === 'en'
					? author.dataEng.name || author.dataRu.name
					: author.dataRu.name || author.dataEng.name
			if (title) {
				document.title = `${title} | ${t('edit')} | PhotoSOIL`
			}
		}
	}, [author])

	const fetchAuthor = async () => {
		const result = await getAuthor(id)
		if (result.success) {
			setAuthor(result.data)
		}
	}

	const handleEditAuthor = async data => {
		const result = await putAuthor(id, data)
		if (result.success) {
			if (author.photoId !== data.photoId) {
				await deletePhotoById(author.photoId)
			}
			dispatch(setDirty(false))
			dispatch(
				openAlert({
					title: t('success'),
					message: t('success_edit'),
					type: 'success'
				})
			)
			router.push(`/${locale}/admin/authors`)
		} else {
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
		<AuthorForm
			_author={author}
			purpose='edit'
			onFormSubmit={handleEditAuthor}
			btnText={t('save')}
			title={t('edit_author')}
		/>
	)
}
