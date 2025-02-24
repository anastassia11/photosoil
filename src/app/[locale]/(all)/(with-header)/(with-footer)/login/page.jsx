import LoginPageComponent from '@/components/pages-components/LoginPage'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')

	return {
		title: t('loginPage-title'),
		description: t('loginPage-description')
	}
}

export default function LoginPage() {
	return <LoginPageComponent />
}
