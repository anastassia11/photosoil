import DictionatyCreatePageComponent from '@/components/pages-components/admin/DictionatyCreate'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale)

	return {
		title: `${t('creation_dictionary')} | ${t('dashboard')} | PhotoSOIL`
	}
}

export default function DictionatyCreatePage() {
	return <DictionatyCreatePageComponent />
}
