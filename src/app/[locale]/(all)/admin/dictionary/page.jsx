import DictionaryAdminPageComponent from '@/components/pages-components/admin/DictionaryPage'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale)

	return {
		title: `${t('dictionaries')} | ${t('dashboard')} | PhotoSOIL`
	}
}

export default function DictionaryAdminPage() {
	return <DictionaryAdminPageComponent />
}
