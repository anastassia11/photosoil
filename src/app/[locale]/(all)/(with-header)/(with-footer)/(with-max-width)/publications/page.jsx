import PublicationsPageComponent from '@/components/pages-components/PublicationsPage'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')
	return {
		title: t(`publicationsPage-title`),
		description: t(`publicationsPage-description`)
	}
}

export default async function PublicationsPage({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')
	return (
		<>
			{/* Скрытый текст для SEO */}
			<div className="sr-only">
				<h1>{t(`publicationsPage-title`)}</h1>
				<p>{t(`publicationsPage-description`)}</p>
			</div>
			<PublicationsPageComponent locale={locale} />
		</>
	)
}
