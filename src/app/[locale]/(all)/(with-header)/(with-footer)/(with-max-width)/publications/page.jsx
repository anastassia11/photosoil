import PublicationsPageComponent from '@/components/pages-components/PublicationsPage'

import { getTranslation } from '@/i18n'
import { BASE_URL } from '@/utils/constants'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')
	return {
		title: t(`publicationsPage-title`),
		description: t(`publicationsPage-description`),
		alternates: {
			canonical: `${BASE_URL}/${locale}}/publications`,
			languages: {
				'ru': `${BASE_URL}/ru/publications`,
				'en': `${BASE_URL}/en/publications`,
				'x-default': `${BASE_URL}/ru/publications`
			}
		}
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
