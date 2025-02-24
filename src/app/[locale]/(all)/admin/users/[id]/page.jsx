import AccountPageComponent from '@/components/pages-components/admin/AccountPage'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale)
	return {
		title: `${t('user_objects')} | ${t('dashboard')} | PhotoSOIL`
	}
}

export default function AccountPage({ params: { id } }) {
	return <AccountPageComponent id={id} />
}
