import AboutPageComponent from '@/components/pages-components/AboutPage'

import { getTranslation } from '@/i18n'
import { BASE_URL } from '@/utils/constants'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')

	return {
		title: t('aboutPage-title'),
		description: t('aboutPage-description'),
		alternates: {
			canonical: `${BASE_URL}/${locale}}/about`,
			languages: {
				'ru': `${BASE_URL}/ru/about`,
				'en': `${BASE_URL}/en/about`,
				'x-default': `${BASE_URL}/ru/about`
			}
		}
	}
}

export default async function AboutPage({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')
	return (
		<>
			{/* Скрытый текст для SEO */}
			<div className="sr-only">
				<h1>{t(`aboutPage-title`)}</h1>
				<p>{t(`aboutPage-description`)}</p>
			</div>
			<AboutPageComponent locale={locale} />
		</>
	)
}
