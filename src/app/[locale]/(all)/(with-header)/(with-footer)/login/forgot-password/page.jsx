import ForgotPasswordPageComponent from '@/components/pages-components/ForgotPasswordPage'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')

	return {
		title: t('forgot-passwordPage-title'),
		description: t('forgot-passwordPage-description')
	}
}

export default function LoginPage() {
	return <ForgotPasswordPageComponent />
}
