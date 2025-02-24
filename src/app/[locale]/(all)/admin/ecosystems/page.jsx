import EcosystemsAdminComponent from '@/components/pages-components/admin/EcosystemsPage'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale)

	return {
		title: `${t('ecosystems')} | ${t('dashboard')} | PhotoSOIL`
	}
}

export default function EcosystemsAdminPage() {
	return <EcosystemsAdminComponent />
}
