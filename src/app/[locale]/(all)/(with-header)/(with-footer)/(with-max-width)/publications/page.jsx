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
	return (
		<PublicationsPageComponent locale={locale} />
	)
}
