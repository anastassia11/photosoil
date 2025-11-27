import Authors from '@/components/Authors'
import AuthorsPageComponent from '@/components/pages-components/AuthorsPage'

import { getTranslation } from '@/i18n'
import { BASE_URL } from '@/utils/constants'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')
	return {
		title: t(`authorsPage-title`),
		description: t(`authorsPage-description`),
		alternates: {
			canonical: `${BASE_URL}/${locale}}/authors`,
			languages: {
				'ru': `${BASE_URL}/ru/authors`,
				'en': `${BASE_URL}/en/authors`,
				'x-default': `${BASE_URL}/ru/authors`
			}
		}
	}
}

export default async function AuthorsPage({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')
	return (
		<>
			{/* Скрытый текст для SEO */}
			<div className="sr-only">
				<h1>{t(`authorsPage-title`)}</h1>
				<p>{t(`authorsPage-description`)}</p>
			</div>
			<AuthorsPageComponent locale={locale} />
		</>
	)
}
