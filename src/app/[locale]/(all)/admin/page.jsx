import AdminPageComponent from '@/components/pages-components/AdminPage'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale)

	return {
		title: `${t('dashboard')} | PhotoSOIL`
	}
}

export default function AdminPage() {
	return <AdminPageComponent />
}
