import SoilsPageComponent from '@/components/pages-components/SoilsPage'

import { getTranslation } from '@/i18n'
import { Suspense } from 'react'

export async function generateMetadata({ params: { locale, type } }) {
	const { t } = await getTranslation(locale, 'seo')
	return {
		title: t(`${type}Page-title`),
		description: t(`${type}Page-description`)
	}
}

export default async function SoilsPage({ params: { locale, type } }) {
	const { t } = await getTranslation(locale, 'seo')
	return (
		<>
			{/* Скрытый текст для SEO */}
			<div className="sr-only">
				<h1>{t(`${type}Page-title`)}</h1>
				<p>{t(`${type}Page-description`)}</p>
			</div>

			<SoilsPageComponent
				type={type}
				locale={locale}
			/>
		</>

	)
}
