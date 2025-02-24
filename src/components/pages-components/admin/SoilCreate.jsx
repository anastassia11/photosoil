'use client'

import { useParams } from 'next/navigation'

import CreateObject from '@/components/admin-panel/CreateObject'

import { createSoil } from '@/api/soil/create_soil'

import { getTranslation } from '@/i18n/client'

export default function SoilCreateComponent() {
	const { locale } = useParams()
	const { t } = getTranslation(locale)

	const fetchCreateSoil = async data => {
		const result = await createSoil(data)
		if (result.success) {
			return { success: true }
		} else return { success: false, status: result.status }
	}

	return (
		<CreateObject
			title={t('creation_soils')}
			onCreate={fetchCreateSoil}
			type='soil'
		/>
	)
}
