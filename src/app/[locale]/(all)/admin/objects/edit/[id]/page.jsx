import EditObject from '@/components/admin-panel/EditObject'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale)
	return {
		title: `${t('edit_soil')} | ${t('dashboard')} | PhotoSOIL`
	}
}

export default async function SoilEditPage({ params: { id, locale } }) {
	const { t } = await getTranslation(locale)

	return (
		<EditObject
			id={id}
			type='soil'
			title={t('edit_soil')}
		/>
	)
}
