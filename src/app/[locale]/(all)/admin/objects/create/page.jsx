import SoilCreateComponent from '@/components/pages-components/admin/SoilCreate'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale)

	return {
		title: `${t('creation_soils')} | ${t('dashboard')} | PhotoSOIL`
	}
}

export default function SoilCreatePage() {
	return <SoilCreateComponent />
}
