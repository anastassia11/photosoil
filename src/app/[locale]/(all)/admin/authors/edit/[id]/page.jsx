import AuthorEditComponent from '@/components/pages-components/admin/AuthorEdit'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale)
	return {
		title: `${t('edit_author')} | ${t('dashboard')} | PhotoSOIL`
	}
}

export default function AuthorEditPage({ params: { id } }) {
	return <AuthorEditComponent id={id} />
}
