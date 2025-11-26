import AboutPageComponent from '@/components/pages-components/AboutPage'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')

	return {
		title: t('aboutPage-title'),
		description: t('aboutPage-description')
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
