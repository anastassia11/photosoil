import LoginPageComponent from '@/components/pages-components/LoginPage'

import { getTranslation } from '@/i18n'
import { BASE_URL } from '@/utils/constants'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')

	return {
		title: t('loginPage-title'),
		description: t('loginPage-description'),
		alternates: {
			canonical: `${BASE_URL}/${locale}}/login`,
			languages: {
				'ru': `${BASE_URL}/ru/login`,
				'en': `${BASE_URL}/en/login`,
				'x-default': `${BASE_URL}/ru/login`
			}
		}
	}
}

export default function LoginPage() {
	return <LoginPageComponent />
}
