import ForgotPasswordPageComponent from '@/components/pages-components/ForgotPasswordPage'

import { getTranslation } from '@/i18n'
import { BASE_URL } from '@/utils/constants'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')

	return {
		title: t('forgot-passwordPage-title'),
		description: t('forgot-passwordPage-description'),
		alternates: {
			canonical: `${BASE_URL}/${locale}}/forgot-password`,
			languages: {
				'ru': `${BASE_URL}/ru/forgot-password`,
				'en': `${BASE_URL}/en/forgot-password`,
				'x-default': `${BASE_URL}/ru/forgot-password`
			}
		}
	}
}

export default function LoginPage() {
	return <ForgotPasswordPageComponent />
}
