import NewsAdminComponent from '@/components/pages-components/admin/NewsPage'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale)

	return {
		title: `${t('news')} | ${t('dashboard')} | PhotoSOIL`
	}
}

export default function NewsAdminPage() {
	return <NewsAdminComponent />
}
