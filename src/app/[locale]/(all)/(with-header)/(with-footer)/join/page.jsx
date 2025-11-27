import JoinForm from '@/components/JoinForm'

import { getTranslation } from '@/i18n'
import { BASE_URL } from '@/utils/constants'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')

	return {
		title: t('joinPage-title'),
		description: t('joinPage-description'),
		alternates: {
			canonical: `${BASE_URL}/${locale}}/join`,
			languages: {
				'ru': `${BASE_URL}/ru/join`,
				'en': `${BASE_URL}/en/join`,
				'x-default': `${BASE_URL}/ru/join`
			}
		}
	}
}

export default function JoinPage() {
	return <JoinForm />
}
