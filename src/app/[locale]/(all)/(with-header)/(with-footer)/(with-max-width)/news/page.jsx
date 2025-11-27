import { Suspense } from 'react'

import NewsPageComponent from '@/components/pages-components/NewsPage'

import { getTranslation } from '@/i18n'
import { BASE_URL } from '@/utils/constants'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')
	return {
		title: t(`newsPage-title`),
		description: t(`newsPage-description`),
		alternates: {
			canonical: `${BASE_URL}/${locale}}/news`,
			languages: {
				'ru': `${BASE_URL}/ru/news`,
				'en': `${BASE_URL}/en/news`,
				'x-default': `${BASE_URL}/ru/news`
			}
		}
	}
}

export default async function NewsPage({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')
	return (
		<>
			{/* Скрытый текст для SEO */}
			<div className="sr-only">
				<h1>{t(`newsPage-title`)}</h1>
				<p>{t(`newsPage-description`)}</p>
			</div>
			<NewsPageComponent />
		</>
	)
}
