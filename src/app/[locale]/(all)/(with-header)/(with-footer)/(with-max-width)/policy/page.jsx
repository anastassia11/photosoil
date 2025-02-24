import PolicyPageComponent from '@/components/pages-components/PolicyPageComponent'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale)
	return {
		title: `${t('rules_service')} | PhotoSOIL`
	}
}

export default function PolicyPage() {
	return <PolicyPageComponent />
}
