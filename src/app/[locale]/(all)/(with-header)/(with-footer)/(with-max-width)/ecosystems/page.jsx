import { getTranslation } from '@/i18n'
import EcosystemsPageComponent from '@/components/pages-components/EcosystemsPage'
import { Suspense } from 'react'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')
	return {
		title: t(`ecosystemsPage-title`),
		description: t(`ecosystemsPage-description`)
	}
}

export default async function EcosystemsPage({ params: { locale } }) {
	return (
		<Suspense>
			<EcosystemsPageComponent locale={locale} />
		</Suspense>
	)
}
