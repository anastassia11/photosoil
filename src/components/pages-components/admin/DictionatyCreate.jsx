'use client'

import { useParams, useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'

import DictionaryForm from '@/components/admin-panel/DictionaryForm'

import { openAlert } from '@/store/slices/alertSlice'
import { setDirty } from '@/store/slices/formSlice'

import { createClassification } from '@/api/classification/create_classification'

import { getTranslation } from '@/i18n/client'

export default function DictionatyCreatePageComponent() {
	const dispatch = useDispatch()
	const router = useRouter()
	const { locale } = useParams()
	const { t } = getTranslation(locale)

	const createDictionary = async data => {
		const result = await createClassification(data)
		if (result.success) {
			router.push(`/${locale}/admin/dictionary`)
			dispatch(setDirty(false))
			dispatch(
				openAlert({
					title: t('success'),
					message: t('created_dictionary'),
					type: 'success'
				})
			)
		} else {
			dispatch(
				openAlert({
					title: t('error'),
					message: t('error_dictionary'),
					type: 'error'
				})
			)
		}
	}

	return (
		<DictionaryForm
			title={t('creation_dictionary')}
			onFormSubmit={createDictionary}
			btnTitle={t('create_dictionary')}
		/>
	)
}
