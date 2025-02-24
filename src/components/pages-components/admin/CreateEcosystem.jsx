'use client'

import { useParams } from 'next/navigation'

import CreateObject from '@/components/admin-panel/CreateObject'

import { createEcosystem } from '@/api/ecosystem/create_ecosystem'

import { getTranslation } from '@/i18n/client'

export default function CreateEcosystemComponent() {
	const { locale } = useParams()
	const { t } = getTranslation(locale)

	const fetchCreateEcosystem = async data => {
		const result = await createEcosystem(data)
		if (result.success) {
			return { success: true }
		} else return { success: false, status: result.status }
	}

	return (
		<CreateObject
			title={t('creation_ecosystems')}
			onCreate={fetchCreateEcosystem}
			type='ecosystem'
		/>
	)
}
