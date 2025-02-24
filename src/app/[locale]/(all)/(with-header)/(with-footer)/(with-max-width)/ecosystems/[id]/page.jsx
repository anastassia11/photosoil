import EcosystemPageComponent from '@/components/pages-components/EcosystemPage'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale)
	return {
		title: `${t('ecosystem')} | PhotoSOIL`
	}
}

export default function EcosystemPage({ params: { id } }) {
	return <EcosystemPageComponent id={id} />
}
