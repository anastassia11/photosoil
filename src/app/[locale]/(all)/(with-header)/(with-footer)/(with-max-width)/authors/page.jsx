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
	return (
		<AuthorsPageComponent locale={locale} />
	)
}
