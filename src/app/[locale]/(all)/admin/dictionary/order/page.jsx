import DictionaryOrderComponent from '@/components/pages-components/admin/DictionaryOrder'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale)

	return {
		title: `${t('dictionaries')} | ${t('dashboard')} | PhotoSOIL`
	}
}

export default function DictionaryOrderPage() {
	return <DictionaryOrderComponent />
}
