import SoilsPageComponent from '@/components/pages-components/SoilsPage'

import { getTranslation } from '@/i18n'
import { BASE_URL } from '@/utils/constants'
import { Suspense } from 'react'

export async function generateMetadata({ params: { locale, type } }) {
	const { t } = await getTranslation(locale, 'seo')
	const path = type ? `/${type}` : ''

	return {
		title: t(`${type}Page-title`),
		description: t(`${type}Page-description`),
		alternates: {
			canonical: `${BASE_URL}/${locale}}${path}`,
			languages: {
				'ru': `${BASE_URL}/ru}${path}`,
				'en': `${BASE_URL}/en}${path}`,
				'x-default': `${BASE_URL}/ru}${path}`
			}
		}
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
