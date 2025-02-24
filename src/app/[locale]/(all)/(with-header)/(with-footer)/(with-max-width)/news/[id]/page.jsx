import NewsItemPageComponent from '@/components/pages-components/NewsItemPage'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale)
	return {
		title: `${t('news_one')} | PhotoSOIL`
	}
}

export default function NewsItemPage({ params: { id } }) {
	return <NewsItemPageComponent id={id} />
}
