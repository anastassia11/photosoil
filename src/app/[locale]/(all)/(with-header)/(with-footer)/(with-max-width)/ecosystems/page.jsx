import { Suspense } from 'react'

import Soils from '@/components/soils/Soils'

import { getTranslation } from '@/i18n'
import EcosystemsPageComponent from '@/components/pages-components/EcosystemsPage'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')
	return {
		title: t(`ecosystemsPage-title`),
		description: t(`ecosystemsPage-description`)
	}
}

export default async function EcosystemsPage({ params: { locale } }) {
	return (
		<EcosystemsPageComponent locale={locale} />
	)
}
