import SoilPageComponent from '@/components/pages-components/SoilPage'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale)
	return {
		title: `${t('soil')} | PhotoSOIL`
	}
}

export default function SoilPage({ params: { id } }) {
	return <SoilPageComponent id={id} />
}
