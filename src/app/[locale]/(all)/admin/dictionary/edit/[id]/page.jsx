import DictionaryEditPageComponent from '@/components/pages-components/admin/DictionaryEdit'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale)
	return {
		title: `${t('edit_dictionary')} | ${t('dashboard')} | PhotoSOIL`
	}
}

export default function DictionaryEditPage({ params: { id } }) {
	return <DictionaryEditPageComponent id={id} />
}
