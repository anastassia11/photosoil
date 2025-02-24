import UsersPageComponent from '@/components/pages-components/admin/UsersPage'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale)

	return {
		title: `${t('users')} | ${t('dashboard')} | PhotoSOIL`
	}
}

export default function UsersAdminPage() {
	return <UsersPageComponent />
}
