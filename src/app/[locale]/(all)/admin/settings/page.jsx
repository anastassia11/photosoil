import SettingsPage from '@/components/pages-components/admin/SettingsPage'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale)

	return {
		title: `${t('user_preferences')} | ${t('dashboard')} | PhotoSOIL`
	}
}

export default function SettingsAdminPage() {
	return <SettingsPage />
}
