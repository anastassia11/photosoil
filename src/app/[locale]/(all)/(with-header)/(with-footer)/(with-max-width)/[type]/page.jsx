import SoilsPageComponent from '@/components/pages-components/SoilsPage'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale, type } }) {
	const { t } = await getTranslation(locale, 'seo')
	return {
		title: t(`${type}Page-title`),
		description: t(`${type}Page-description`)
	}
}

export default function SoilsPage({ params: { locale, type } }) {
	return (
		<SoilsPageComponent
			type={type}
			locale={locale}
		/>
	)
}
