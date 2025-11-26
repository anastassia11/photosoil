import { Suspense } from 'react'

import NewsPageComponent from '@/components/pages-components/NewsPage'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')
	return {
		title: t(`newsPage-title`),
		description: t(`newsPage-description`)
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
