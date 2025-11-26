import Authors from '@/components/Authors'
import AuthorsPageComponent from '@/components/pages-components/AuthorsPage'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')
	return {
		title: t(`authorsPage-title`),
		description: t(`authorsPage-description`)
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
