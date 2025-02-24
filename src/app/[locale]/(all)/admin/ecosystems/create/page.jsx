import CreateEcosystemComponent from '@/components/pages-components/admin/CreateEcosystem'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale)

	return {
		title: `${t('creation_ecosystems')} | ${t('dashboard')} | PhotoSOIL`
	}
}

export default function CreateEcosystemPage() {
	return <CreateEcosystemComponent />
}
