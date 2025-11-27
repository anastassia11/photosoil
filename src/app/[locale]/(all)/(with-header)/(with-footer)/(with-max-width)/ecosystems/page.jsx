import { getTranslation } from '@/i18n'
import EcosystemsPageComponent from '@/components/pages-components/EcosystemsPage'
import { Suspense } from 'react'
import { BASE_URL } from '@/utils/constants'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')
	return {
		title: t(`ecosystemsPage-title`),
		description: t(`ecosystemsPage-description`),
		alternates: {
			canonical: `${BASE_URL}/${locale}}/ecosystems`,
			languages: {
				'ru': `${BASE_URL}/ru/ecosystems`,
				'en': `${BASE_URL}/en/ecosystems`,
				'x-default': `${BASE_URL}/ru/ecosystems`
			}
		}
	}
}

export default async function EcosystemsPage({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')
	return (
		<>
			{/* Скрытый текст для SEO */}
			<div className="sr-only">
				<h1>{t(`ecosystemsPage-title`)}</h1>
				<p>{t(`ecosystemsPage-description`)}</p>
			</div>
			<Suspense>
				<EcosystemsPageComponent locale={locale} />
			</Suspense>
		</>
	)
}
